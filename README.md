# Movie Discovery App

A Streamlit web app that lets you find films using natural language, powered by [Weaviate](https://weaviate.io) (vector database) and OpenAI. The entire project was built with **Claude Code** — Anthropic's AI coding agent — assisted by **Weaviate Agent Skills**, a set of structured skill definitions that guide the agent to produce correct, production-ready Weaviate code from the first attempt.

## How It Was Built

This project was developed end-to-end using **agentic coding**:

- **Claude Code** (AI coding agent) wrote, ran, and debugged every script in this project — the schema, ingestion pipeline, and Streamlit app — based on natural language prompts.
- **Weaviate Agent Skills** were loaded into Claude Code at session start. These skill files encode correct usage patterns for Weaviate operations (schema creation, vector search, RAG, Query Agent), eliminating guesswork and ensuring the agent used the right APIs from the start.
- **TMDB API** was used to dynamically fetch movie metadata (titles, descriptions, release years, poster images) rather than hardcoding data. The ingestion script pages through TMDB's `top_rated` and `popular` endpoints to collect movies at scale.
- **100 movies** are embedded in the Weaviate collection — each with a text vector (title) and an image vector (poster) stored as a base64 blob.

## Features

- **Semantic search** — describe a mood or theme and get matching movies via `near_text`
- **AI explanations** — per-movie write-ups generated with `single_prompt` (RAG)
- **Movie Night Planner** — a viewing order, snack pairings, and theme summary via `grouped_task`
- **Conversational chat** — ask anything about the collection; the Weaviate Query Agent answers with source citations
- **Watchlist** — save movies during your session and export the list as a `.txt` file
- **Poster download** — download any movie poster as a JPEG

## Weaviate Concepts Demonstrated

| Feature | Role |
|---|---|
| Named Vectors | Two vector spaces per object: `text_vector` (title) and `image_vector` (poster) |
| `text2vec-weaviate` | Embeds movie titles for semantic text search |
| `multi2multivec-weaviate` | Embeds poster images using ModernVBERT / colmodernvbert |
| `generative-openai` | Connects OpenAI GPT to Weaviate for RAG |
| `near_text` | Semantic similarity search over the text vector |
| `single_prompt` | Per-movie AI explanation generated at query time |
| `grouped_task` | One cohesive AI response across all results |
| Query Agent | Conversational AI chat with source citations via `weaviate-agents` |
| Agent Skills | Skill YAML files loaded into Claude Code to guide correct Weaviate API usage |

## Project Structure

```
movie-discovery-app/
├── app.py              # Streamlit UI (search, chat, watchlist)
├── create_schema.py    # Creates the Movie collection via Weaviate REST API
├── ingest_movies.py    # Fetches 100 movies from TMDB API and ingests with poster blobs
├── check_modules.py    # Lists enabled modules on the Weaviate cluster
├── requirements.txt    # Python dependencies
└── .env                # API keys (not committed)
```

## Prerequisites

- Python 3.10+
- A [Weaviate Cloud](https://console.weaviate.cloud) cluster with these modules enabled:
  - `text2vec-weaviate`
  - `multi2multivec-weaviate`
  - `generative-openai`
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free) — used to fetch movie metadata and posters dynamically

## Setup

### 1. Clone and create a virtual environment

```bash
git clone <repo-url>
cd movie-discovery-app
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
WEAVIATE_URL=your-cluster-host.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=your-openai-api-key
TMDB_API_KEY=your-tmdb-api-key
```

> **Note:** `WEAVIATE_URL` should be the bare hostname — no `https://` prefix.

### 4. Create the Weaviate schema

```bash
python create_schema.py
```

Creates a `Movie` collection with two named vectors (`text_vector` and `image_vector`) and enables RAG via `generative-openai`.

### 5. Ingest movies

```bash
python ingest_movies.py
```

Fetches 100 movies from the TMDB API (`top_rated` + `popular` endpoints), downloads each poster, encodes it as a base64 blob, and inserts everything into the Weaviate collection. Each object is automatically dual-vectorized server-side — title via `text2vec-weaviate`, poster via `multi2multivec-weaviate`.

### 6. Run the app

```bash
streamlit run app.py
```

Opens at `http://localhost:8501`.

## Dataset

**100 movies** sourced dynamically from the TMDB API, spanning genres including drama, thriller, sci-fi, crime, and animation. Metadata per movie:

| Field | Source |
|---|---|
| Title | TMDB API |
| Description | TMDB API (overview field) |
| Release year | TMDB API (release_date) |
| Poster | TMDB CDN (`image.tmdb.org/t/p/w500/`) as base64 blob |

## Tech Stack

| Component | Technology |
|---|---|
| Vector database | Weaviate Cloud (v4 SDK) |
| AI coding agent | Claude Code (Anthropic) |
| Agent skill guidance | Weaviate Agent Skills |
| Movie data source | TMDB API |
| AI agents | weaviate-agents 1.3.0 (Query Agent) |
| Generative AI | OpenAI (via Weaviate's `generative-openai` module) |
| Frontend | Streamlit |
| Image handling | base64 + TMDB public CDN |
