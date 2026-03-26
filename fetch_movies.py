import os
import json
import urllib.request
import urllib.error

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p"
OUTPUT_FILE = "movies.json"
PAGES_TO_FETCH = 5  # 20 movies per page = 100 total


def fetch(url):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())


def main():
    if not TMDB_API_KEY:
        raise EnvironmentError("TMDB_API_KEY is not set. Add it to your .env file or environment.")

    print("Fetching genres...")
    genres_data = fetch(f"{BASE_URL}/genre/movie/list?api_key={TMDB_API_KEY}&language=en-US")
    genres = {str(g["id"]): g["name"] for g in genres_data["genres"]}

    movies = []
    for page in range(1, PAGES_TO_FETCH + 1):
        print(f"Fetching top-rated movies page {page}/{PAGES_TO_FETCH}...")
        data = fetch(f"{BASE_URL}/movie/top_rated?api_key={TMDB_API_KEY}&language=en-US&page={page}")
        for m in data["results"]:
            movies.append({
                "id": m["id"],
                "title": m["title"],
                "overview": m["overview"],
                "release_date": m["release_date"],
                "vote_average": m["vote_average"],
                "vote_count": m["vote_count"],
                "popularity": m["popularity"],
                "genre_ids": m["genre_ids"],
                "original_language": m["original_language"],
                "poster_url": f"{IMAGE_BASE}/w500{m['poster_path']}" if m.get("poster_path") else None,
                "backdrop_url": f"{IMAGE_BASE}/original{m['backdrop_path']}" if m.get("backdrop_path") else None,
            })

    output = {"genres": genres, "movies": movies}
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Done. {len(movies)} movies saved to {OUTPUT_FILE}.")


if __name__ == "__main__":
    main()
