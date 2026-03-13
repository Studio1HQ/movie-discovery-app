import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import weaviate
from weaviate.auth import AuthApiKey
from weaviate.agents.query import QueryAgent
from weaviate_agents.query.classes import QueryAgentCollectionConfig
from dotenv import load_dotenv

load_dotenv()

# ── Weaviate client (module-level, reused across requests) ────────────────────
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
    skip_init_checks=True,
)
collection   = client.collections.get("Movie")
_query_agent = None


def get_query_agent() -> QueryAgent:
    global _query_agent
    if _query_agent is None:
        _query_agent = QueryAgent(
            client=client,
            collections=[
                QueryAgentCollectionConfig(name="Movie", target_vector="text_vector")
            ],
        )
    return _query_agent


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Movie Discovery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / response models ─────────────────────────────────────────────────
class ExplainRequest(BaseModel):
    query: str
    limit: int = 3


class PlanRequest(BaseModel):
    query: str
    titles: list[str]
    limit: int = 3


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/search")
def search(q: str = Query(..., min_length=1), limit: int = Query(3, ge=1, le=10)):
    results = collection.query.near_text(
        query=q,
        target_vector="text_vector",
        limit=limit,
        return_properties=["title", "description", "release_year", "poster"],
    )
    movies = []
    for obj in results.objects:
        p = obj.properties
        movies.append({
            "id":           str(obj.uuid),
            "title":        p["title"],
            "description":  p.get("description", ""),
            "release_year": p.get("release_year"),
            "poster":       p.get("poster"),   # base64 string or None
        })
    return {"movies": movies}


@app.post("/ai/explain")
def ai_explain(req: ExplainRequest):
    prompt = (
        f"A user searched for: '{req.query}'. "
        "In 2-3 sentences explain why '{title}' ({release_year}) "
        "is a great match, referencing its themes: {description}"
    )
    resp = collection.generate.near_text(
        query=req.query,
        target_vector="text_vector",
        limit=req.limit,
        return_properties=["title", "release_year"],
        single_prompt=prompt,
    )
    explanations = []
    for obj in resp.objects:
        explanations.append({
            "title":        obj.properties.get("title", ""),
            "release_year": obj.properties.get("release_year"),
            "explanation":  obj.generated,
        })
    return {"explanations": explanations}


@app.post("/ai/plan")
def ai_plan(req: PlanRequest):
    task = (
        f"The user wanted: '{req.query}'. "
        f"The 3 recommended films are: {', '.join(req.titles)}. "
        "Write a fun movie-night plan with: "
        "1) The best viewing order with a one-line reason for each, "
        "2) A snack pairing for each film, "
        "3) A 2-sentence theme tying all three together."
    )
    resp = collection.generate.near_text(
        query=req.query,
        target_vector="text_vector",
        limit=req.limit,
        return_properties=["title"],
        grouped_task=task,
    )
    return {"plan": resp.generated}


@app.post("/chat")
def chat(req: ChatRequest):
    agent    = get_query_agent()
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    try:
        response = agent.ask(messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    answer  = getattr(response, "final_answer", "") or "I could not find an answer for that."
    sources = []
    if hasattr(response, "sources") and response.sources:
        for src in response.sources:
            sources.append({
                "collection": getattr(src, "collection", None),
                "object_id":  str(getattr(src, "object_id", None)),
            })
    return {"answer": answer, "sources": sources}
