# Movie Discovery App

A semantic movie search application built with a **FastAPI backend** and a **Next.js frontend**, powered by [Weaviate Agent Skills](https://github.com/weaviate/agent-skills) (vector database) and OpenAI. The entire project was built with **Claude Code** — Anthropic's AI coding agent — assisted by **Weaviate Agent Skills**, a set of structured skill definitions that guide the agent to produce correct, production-ready Weaviate code from the first attempt.

## How It Was Built

This project was developed end-to-end using **agentic coding**:

- **Claude Code** wrote, ran, and debugged every script and component in this project — the schema, ingestion pipeline, FastAPI backend, and Next.js frontend — based on natural language prompts.
- **[Weaviate Agent Skills](https://github.com/weaviate/agent-skills)** were loaded into Claude Code at session start. These skill files encode correct usage patterns for Weaviate operations (schema creation, [create collection](https://github.com/weaviate/agent-skills/blob/main/skills/weaviate/references/import_data.md), ingest data, vector search, RAG, Query Agent), eliminating guesswork, define [the frontend app](https://github.com/weaviate/agent-skills/blob/main/skills/weaviate-cookbooks/references/frontend_interface.md), and ensuring the agent used the right APIs from the start.
- **[TMDB API key](https://www.themoviedb.org/)** – Used to fetch movie metadata
- **100 movies** are embedded in the Weaviate collection.

## Features

- **Semantic search** — describe a mood or theme and get matching movies via `near_text`
- **AI explanations** — per-movie write-ups generated with `single_prompt` (RAG)
- **Movie Night Planner** — a viewing order, snack pairings, and theme summary via `grouped_task`
- **Conversational chat** — ask anything about the collection; the Weaviate Query Agent answers with source citations
- **Watchlist** — save movies during your session and export the list as a `.txt` file

## Weaviate Concepts Demonstrated

| Feature | Role |
|---|---|
| Named Vectors | Two vector spaces per object: `text_vector` (title) and `image_vector` (poster) |
| Weaviate Cookbooks | For frontend definition |
| Weaviate Import Skill | For creating collection and ingesting data |
| `text2vec-weaviate` | Embeds movie titles for semantic text search |
| `multi2multivec-weaviate` | Embeds poster images using the Weaviate multimodal module |
| `generative-openai` | Connects OpenAI GPT to Weaviate for RAG |
| `near_text` | Semantic similarity search over the text vector |
| `single_prompt` | Per-movie AI explanation generated at query time |
| `grouped_task` | One cohesive AI response across all results |
| Query Agent | Conversational AI chat with source citations via `weaviate-agents` |
| Agent Skills | Skill YAML files loaded into Claude Code to guide correct Weaviate API usage |

## Project Structure

```
movie-discovery/
├── .env                    # API keys and Weaviate cluster URL
├── movies.json             # Dataset with metadata and poster URLs (100 movies)
│
├── fetch_movies.py         # Optional — re-fetch 100 movies from TMDB API → movies.json
├── import_movies.py        # Step 1 — create Weaviate collection & batch import
├── backend.py              # FastAPI application (all API routes)
│
└── frontend/
    ├── app/
    │   ├── layout.tsx          # Root layout
    │   └── page.tsx            # Entry point — view switching + watchlist state
    ├── components/
    │   ├── AppSidebar.tsx      # Navigation sidebar + watchlist display
    │   ├── SearchView.tsx      # Search bar, Explain, Plan a Night
    │   ├── ChatView.tsx        # Multi-turn AI chat interface
    │   └── MovieCard.tsx       # Film card with poster, rating, genres, watchlist toggle
    ├── lib/
    │   └── api.ts              # All fetch calls to the FastAPI backend
    ├── types/
    │   └── index.ts            # Shared TypeScript interfaces
    ├── package.json
    └── tailwind.config.ts


```


## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A [Weaviate Cloud](https://console.weaviate.cloud) cluster with these modules enabled:
  - `text2vec-weaviate`
  - `multi2multivec-weaviate`
  - `generative-openai`
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [TMDB API key](https://www.themoviedb.org/)

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

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend && npm install && cd ..
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
WEAVIATE_URL=your-cluster-host.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=your-openai-api-key
TMDB_API_KEY=your-tmdb-api-key
```

> **Note:** `WEAVIATE_URL` should be the bare hostname — no `https://` prefix.

### 5. Import Data

`movies.json` is already included in the repository and ready to use. Run the import script once to populate Weaviate:

```bash
python import_movies.py
```

```
movies.json  ──►  import_movies.py  ──►  Weaviate Cloud ("Movie" collection, 100 objects)
```

> **Optional:** To refresh `movies.json` with the latest data from TMDB before importing, run:
> ```bash
> python fetch_movies.py
> ```
> This fetches the top 100 rated movies from the TMDB API (5 pages × 20 results) and overwrites `movies.json`.

### 6. Start the Servers

**Backend** (FastAPI on port 8000):
```bash
source .venv/Scripts/activate
uvicorn backend:app --reload --port 8000
```

**Frontend** (Next.js on port 3000):
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser for the backend API and [http://localhost:3000](http://localhost:3000) in your browser to view the app's frontend.


## Tech Stack

| Component | Technology |
|---|---|
| Vector database | Weaviate Cloud (v4 SDK) |
| AI coding agent | Claude Code (Anthropic) |
| Agent skill guidance | Weaviate Agent Skills (Import and Cookbooks)|
| Movie data source | TMDB API |
| Backend | FastAPI + Uvicorn |
| Frontend | Next.js 16 (TypeScript, Tailwind CSS, Framer Motion) |
| AI agents | weaviate-agents (Query Agent) |
| Generative AI | OpenAI via Weaviate's `generative-openai` module |
| Image handling | base64 blobs stored in Weaviate, rendered inline |
