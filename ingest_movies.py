import os
import time
import base64
import requests
import weaviate
from weaviate.auth import AuthApiKey
from dotenv import load_dotenv

load_dotenv()

# ── Credentials ───────────────────────────────────────────────────────────────
WEAVIATE_URL     = os.getenv("WEAVIATE_URL")
WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY")
TMDB_API_KEY     = os.getenv("TMDB_API_KEY")

TMDB_API_BASE = "https://api.themoviedb.org/3"
TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500"

TARGET_MOVIES = 100  # total movies to ingest


def fetch_tmdb_page(endpoint: str, page: int) -> list[dict]:
    """Fetch one page of movie stubs from a TMDB list endpoint."""
    resp = requests.get(
        f"{TMDB_API_BASE}/movie/{endpoint}",
        params={"api_key": TMDB_API_KEY, "page": page, "language": "en-US"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("results", [])


def collect_movie_ids(target: int) -> list[int]:
    """
    Gather unique movie IDs from top_rated and popular endpoints
    until we have at least `target` candidates.
    """
    seen = set()
    ids  = []
    # Alternate between top_rated and popular to get variety
    for page in range(1, 10):
        for endpoint in ("top_rated", "popular"):
            if len(ids) >= target:
                break
            for item in fetch_tmdb_page(endpoint, page):
                mid = item["id"]
                if mid not in seen:
                    seen.add(mid)
                    ids.append(mid)
        if len(ids) >= target:
            break
        time.sleep(0.2)
    return ids[:target]


def fetch_tmdb_movie(movie_id: int) -> dict:
    """Fetch full metadata for a single movie from TMDB."""
    resp = requests.get(
        f"{TMDB_API_BASE}/movie/{movie_id}",
        params={"api_key": TMDB_API_KEY},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    return {
        "title":        data["title"],
        "description":  data.get("overview", ""),
        "release_year": int(data["release_date"][:4]) if data.get("release_date") else 0,
        "poster_url":   f"{TMDB_IMG_BASE}{data['poster_path']}" if data.get("poster_path") else None,
    }


def fetch_poster_b64(url: str) -> str:
    """Download a poster image and return it as a base64 string."""
    resp = requests.get(
        url,
        headers={"User-Agent": "MovieDiscoveryApp/1.0 (educational demo)"},
        timeout=15,
    )
    resp.raise_for_status()
    return base64.b64encode(resp.content).decode("utf-8")


# ── Connect to Weaviate ───────────────────────────────────────────────────────
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=WEAVIATE_URL,
    auth_credentials=AuthApiKey(WEAVIATE_API_KEY),
    headers={"X-OpenAI-Api-Key": OPENAI_API_KEY},
    skip_init_checks=True,
)

try:
    collection = client.collections.get("Movie")

    print(f"Collecting {TARGET_MOVIES} movie IDs from TMDB...")
    movie_ids = collect_movie_ids(TARGET_MOVIES)
    print(f"Got {len(movie_ids)} IDs. Starting ingestion...\n")

    success_count = 0
    skip_count    = 0

    for i, movie_id in enumerate(movie_ids, 1):
        try:
            movie = fetch_tmdb_movie(movie_id)
            title = movie["title"]

            if not movie["poster_url"] or not movie["description"]:
                print(f"  [{i:>3}] {title} -- skipped (missing poster or description)")
                skip_count += 1
                continue

            print(f"  [{i:>3}] {title} ({movie['release_year']}) -- downloading poster...", end=" ", flush=True)
            poster_b64 = fetch_poster_b64(movie["poster_url"])
            print(f"inserting...", end=" ", flush=True)

            collection.data.insert(
                properties={
                    "title":        title,
                    "description":  movie["description"],
                    "release_year": movie["release_year"],
                    "poster":       poster_b64,
                }
            )
            print("OK")
            success_count += 1

        except Exception as e:
            print(f"FAILED -- {e}")

        time.sleep(0.3)

    print(f"\nDone. {success_count} ingested, {skip_count} skipped, {len(movie_ids) - success_count - skip_count} failed.")

    total = collection.aggregate.over_all(total_count=True).total_count
    print(f"Total objects in 'Movie' collection: {total}")

finally:
    client.close()
