<div align="center">

<img src="https://raw.githubusercontent.com/Studio1HQ/Studio1HQ/main/assets/banners/movie-discovery-app.webp" alt="Semantic Movie Discovery with Weaviate: Semantic movie search built with Claude Code and Weaviate Agent Skills" width="100%" />

<br />
<br />

# Semantic Movie Discovery with Weaviate

### Semantic movie search built with Claude Code and Weaviate Agent Skills

A FastAPI and Next.js movie discovery app that uses Weaviate for semantic search, RAG explanations, a movie night planner and a Query Agent chat. It was built with Claude Code and Weaviate Agent Skills.

<br />

[![Built by Studio1](https://img.shields.io/badge/Built_by_Studio1-f97316?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIiBmaWxsPSJub25lIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMzVDMCAxNi42ODA3IDE0LjA3NDQgMS42NDg0NCAzMiAwLjEyNjk1M1YxNDFINTEuMDUyM0M1Mi40MzA4IDEzNy4zNDQgNTQuNzQ0NiAxMzMuNjg5IDU3Ljk5MzggMTMwLjAzM0M2MS4xNDQ2IDEyNi41MDggNjQuNjg5MiAxMjMuNDQgNjguNjI3NyAxMjAuODI5QzcyLjU2NjIgMTE4LjM0OSA3Ni4zNTY5IDExNi43ODIgODAgMTE2LjEyOVY4Ni43NTQ0Qzc1LjQ3MDggODcuOTI5MiA3MS4zODQ2IDg5LjY5MTkgNjcuNzQxNSA5Mi4wNDE1QzY0IDk0LjUyMjUgNjAuNzUwOCA5Ny40NiA1Ny45OTM4IDEwMC44NTRDNTYuNTM0NSAxMDIuNzIgNTUuMjU0NSAxMDQuNjU5IDU0LjE1MzkgMTA2LjY3MVYwSDEyNUMxNDQuMzMgMCAxNjAgMTUuNjY5OSAxNjAgMzVWMTI1QzE2MCAxNDQuMzMgMTQ0LjMzIDE2MCAxMjUgMTYwSDEyNFYxOEgxMDQuOTQ4QzEwMy41NjkgMjEuNjgxNiAxMDEuMjU1IDI1LjM2MjggOTguMDA2MiAyOS4wNDQ0Qzk0Ljg1NTQgMzIuNTk0MiA5MS4zMTA4IDM1LjY4NDEgODcuMzcyMyAzOC4zMTRDODMuNDMzOCA0MC44MTIgNzkuNjQzMSA0Mi4zODk2IDc2IDQzLjA0NzRWNzIuNjMwNEM4MC41MjkyIDcxLjQ0NzMgODQuNjE1NCA2OS42NzI0IDg4LjI1ODUgNjcuMzA1N0M5MiA2NC44MDc2IDk1LjI0OTIgNjEuODQ5MSA5OC4wMDYyIDU4LjQzMDdDOTkuNDY1NSA1Ni41NTEzIDEwMC43NDUgNTQuNTk4NiAxMDEuODQ2IDUyLjU3MjNWMTYwSDM1QzE1LjY3IDE2MCAwIDE0NC4zMyAwIDEyNVYzNVoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4K)](https://studio1hq.com)
[![Built with Weaviate](https://img.shields.io/badge/Built_with_Weaviate-141414?style=for-the-badge)](https://weaviate.io)

[Weaviate docs](https://docs.weaviate.io) &nbsp;·&nbsp; [Weaviate](https://weaviate.io) &nbsp;·&nbsp; [More examples](https://github.com/Studio1HQ) &nbsp;·&nbsp; [studio1hq.com](https://studio1hq.com)

</div>

<br />

## Overview

Movie Discovery App is a semantic movie search application with a FastAPI backend and a Next.js frontend. [Weaviate](https://weaviate.io) stores 100 movies with two vectors each, one for the title text and one for the poster image, and OpenAI generates explanations and chat answers.

The project was built end to end with Claude Code, loaded with [Weaviate Agent Skills](https://github.com/weaviate/agent-skills). Those skill files describe correct Weaviate usage for schema creation, data import, vector search, RAG and the Query Agent, plus a [frontend cookbook](https://github.com/weaviate/agent-skills/blob/main/skills/weaviate-cookbooks/references/frontend_interface.md), so the agent used the right APIs from the start.

## Features

- **Semantic search**: describe a mood or theme and get matching movies through `near_text`.
- **AI explanations**: per-movie write-ups generated with `single_prompt` (RAG).
- **Movie Night Planner**: a viewing order, snack pairings and a theme summary through `grouped_task`.
- **Conversational chat**: ask about the collection and the Weaviate Query Agent answers with source citations.
- **Watchlist**: save movies during a session and export the list as a `.txt` file.

## Tech stack

| Layer | Tool |
| --- | --- |
| Vector database | [Weaviate Cloud](https://console.weaviate.cloud) with the v4 Python SDK |
| Agent skills | [Weaviate Agent Skills](https://github.com/weaviate/agent-skills) (Import and Cookbooks) |
| Coding agent | [Claude Code](https://www.anthropic.com/claude-code) |
| Query Agent | [weaviate-agents](https://docs.weaviate.io) |
| Generative AI | OpenAI through Weaviate's `generative-openai` module |
| Backend | [FastAPI](https://fastapi.tiangolo.com) and [Uvicorn](https://www.uvicorn.org) |
| Frontend | [Next.js](https://nextjs.org), TypeScript, [Tailwind CSS](https://tailwindcss.com), Framer Motion |
| Data source | [TMDB API](https://www.themoviedb.org/) |

## Getting started

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later and npm
- A [Weaviate Cloud](https://console.weaviate.cloud) cluster with `text2vec-weaviate`, `multi2multivec-weaviate` and `generative-openai` enabled
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [TMDB API key](https://www.themoviedb.org/), only needed to re-fetch movie data

### Installation

```bash
git clone https://github.com/Studio1HQ/movie-discovery-app.git
cd movie-discovery-app
python -m venv venv
source venv/bin/activate      # macOS and Linux
venv\Scripts\activate         # Windows
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

### Environment variables

Create a `.env` file in the project root:

| Variable | Description |
| --- | --- |
| `WEAVIATE_URL` | Cluster hostname from Weaviate Cloud, for example `your-cluster-host.weaviate.network`. No `https://` prefix. |
| `WEAVIATE_API_KEY` | Weaviate Cloud API key. |
| `OPENAI_API_KEY` | OpenAI key, sent to Weaviate as `X-OpenAI-Api-Key`. |
| `TMDB_API_KEY` | TMDB key, used by `fetch_movies.py`. |

### Run

Import the data once. `movies.json` is already in the repo.

```bash
python import_movies.py
```

To refresh `movies.json` with the top 100 rated movies from TMDB (5 pages of 20 results), run `python fetch_movies.py` first. It overwrites the file.

Start the backend on port 8000 and the frontend on port 3000:

```bash
uvicorn backend:app --reload --port 8000
```

```bash
cd frontend
npm run dev
```

Open <http://localhost:3000> for the app and <http://localhost:8000/docs> for the API docs.

## How it works

```text
movies.json -> import_movies.py -> Weaviate Cloud ("Movie" collection, 100 objects)

fetch_movies.py     optional: re-fetch 100 movies from TMDB
import_movies.py    create the collection and batch import
backend.py          FastAPI routes: /health, /search, /ai/explain, /ai/plan, /chat
frontend/
  app/page.tsx              view switching and watchlist state
  components/               AppSidebar, SearchView, ChatView, MovieCard
  lib/api.ts                fetch calls to the backend
  types/index.ts            shared interfaces
```

Weaviate features used:

| Feature | Role |
| --- | --- |
| Named vectors | Two vector spaces per object: `text_vector` (title) and `image_vector` (poster). |
| `text2vec-weaviate` | Embeds titles for semantic text search. |
| `multi2multivec-weaviate` | Embeds poster images with the multimodal module. |
| `generative-openai` | Connects OpenAI GPT to Weaviate for RAG. |
| `near_text` | Semantic similarity search over the text vector. |
| `single_prompt` | Per-movie explanation generated at query time. |
| `grouped_task` | One response across all results, used by the Movie Night Planner. |
| Query Agent | Conversational chat with source citations through `weaviate-agents`. |

Poster images are stored as base64 blobs in Weaviate and rendered inline.

## Resources

- [Weaviate Agent Skills](https://github.com/weaviate/agent-skills): skill definitions used by Claude Code.
- [Weaviate docs](https://docs.weaviate.io) and [site](https://weaviate.io).
- [TMDB](https://www.themoviedb.org/): movie metadata API.

<br />

---

<div align="center">

<a href="https://studio1hq.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-dark.svg" />
    <img src="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-light.svg" alt="Studio1" width="160" />
  </picture>
</a>

Built by **[Studio1](https://studio1hq.com)**, the technical content and DevRel partner for devtool teams. Made with [Weaviate](https://weaviate.io).<br />
Browse more open-source examples at [github.com/Studio1HQ](https://github.com/Studio1HQ).

[![Website](https://img.shields.io/badge/studio1hq.com-0b0807?style=for-the-badge&logo=googlechrome&logoColor=white)](https://studio1hq.com)
[![Book a call](https://img.shields.io/badge/Book_a_strategy_call-f97316?style=for-the-badge&logo=googlecalendar&logoColor=white)](https://cal.com/studio1/collab)
[![X](https://img.shields.io/badge/%40Studio1HQ-141414?style=for-the-badge&logo=x&logoColor=white)](https://x.com/Studio1HQ)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/studio1hq/)

<sub><a href="https://studio1hq.com">studio1hq.com</a> · Technical content, docs, video and DevRel for devtools</sub>

</div>
