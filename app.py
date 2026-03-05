import os
import base64
import streamlit as st
import weaviate
from weaviate.auth import AuthApiKey
from weaviate.agents.query import QueryAgent
from weaviate_agents.query.classes import QueryAgentCollectionConfig
from dotenv import load_dotenv

load_dotenv()

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Movie Discovery",
    page_icon="🎬",
    layout="wide",
)

# ── Weaviate client ───────────────────────────────────────────────────────────
@st.cache_resource
def get_client():
    return weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
        headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
        skip_init_checks=True,
    )

client     = get_client()
collection = client.collections.get("Movie")

# ── Session state ─────────────────────────────────────────────────────────────
defaults = {
    "watchlist":        [],    # [{title, year}]
    "txt_single":       None,  # per-movie AI explanations
    "txt_plan":         None,  # grouped movie-night plan
    "last_query":       "",    # used to clear AI cache on query change
    "chat_messages":    [],    # [{"role": "user"|"assistant", "content": str}]
    "chat_sources":     [],    # one entry per assistant turn: [{"sources": [...]}]
    "chat_agent":       None,  # QueryAgent instance, created lazily
    "chat_agent_error": None,  # last error string or None
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:

    # Weaviate logo
    st.image(
        "https://weaviate.io/img/site/weaviate-logo-light.png",
        use_container_width=True,
    )

    st.divider()

    # About this app
    st.markdown("### About This App")
    st.markdown(
        "**Movie Discovery** lets you find films using natural language — "
        "powered entirely by [Weaviate](https://weaviate.io), a vector database, "
        "and OpenAI for generative AI."
    )

    st.markdown("### Weaviate Features Used")
    st.markdown(
        """
| Feature | Role |
|---|---|
| **Named Vectors** | Two vector spaces per object: one for text, one for the poster image |
| **text2vec-weaviate** | Embeds movie titles into a semantic text vector |
| **multi2multivec-weaviate** | Embeds poster images using *ModernVBERT / colmodernvbert* |
| **generative-openai** | Connects OpenAI GPT to Weaviate for RAG |
| **near_text** | Semantic similarity search across the text vector |
| **single_prompt** | Per-movie AI explanation generated at query time |
| **grouped_task** | One cohesive AI response generated across all results |
| **Query Agent** | Conversational AI chat with source citations via `weaviate-agents` |
        """
    )

    st.divider()

    # Watchlist
    st.markdown("### My Watchlist")

    if st.session_state.watchlist:
        for i, item in enumerate(st.session_state.watchlist):
            c1, c2 = st.columns([5, 1])
            with c1:
                st.markdown(f"**{item['title']}** ({item['year']})")
            with c2:
                if st.button("✕", key=f"rm_{i}", help="Remove"):
                    st.session_state.watchlist.pop(i)
                    st.rerun()

        st.divider()

        # Export watchlist as .txt
        txt = "\n".join(
            f"- {m['title']} ({m['year']})" for m in st.session_state.watchlist
        )
        st.download_button(
            label="Export Watchlist (.txt)",
            data=txt,
            file_name="my_watchlist.txt",
            mime="text/plain",
        )
    else:
        st.info("Add movies from search results to build your list.")

# ── Header ────────────────────────────────────────────────────────────────────
st.title("Movie Discovery")
st.markdown("Describe what you're in the mood for and we'll find your next watch.")

tab_search, tab_chat = st.tabs(["Search", "Chat"])


# ── QueryAgent helper ─────────────────────────────────────────────────────────
def get_query_agent():
    if st.session_state["chat_agent"] is None:
        st.session_state["chat_agent"] = QueryAgent(
            client=client,
            collections=[
                QueryAgentCollectionConfig(name="Movie", target_vector="text_vector")
            ],
        )
    return st.session_state["chat_agent"]


# ════════════════════════════════════════════════════════════════════════════════
# Helper — renders a result grid and all AI/action buttons
# ════════════════════════════════════════════════════════════════════════════════
def show_results(objects, prefix: str, query_for_ai: str, search_fn):
    """
    objects      – list of Weaviate result objects
    prefix       – key namespace for widget keys
    query_for_ai – natural-language string forwarded to AI prompts
    search_fn    – callable(limit, **kwargs) that returns a generate response
    """
    cols = st.columns(len(objects), gap="large")

    for col, obj in zip(cols, objects):
        props = obj.properties
        safe  = props["title"].replace(" ", "_")

        with col:
            poster_bytes = None
            if props.get("poster"):
                poster_bytes = base64.b64decode(props["poster"])
                st.image(poster_bytes, use_container_width=True)

                # ── Download poster ───────────────────────────────────────────
                st.download_button(
                    label="Download Poster",
                    data=poster_bytes,
                    file_name=f"{safe}_poster.jpg",
                    mime="image/jpeg",
                    key=f"{prefix}_dl_{safe}",
                )

            st.markdown(f"### {props['title']}")
            st.markdown(f"**Year:** {props.get('release_year', 'N/A')}")
            st.caption(props.get("description", ""))

            # ── Add to watchlist ──────────────────────────────────────────────
            already = any(m["title"] == props["title"] for m in st.session_state.watchlist)
            btn_label = "Saved" if already else "+ Watchlist"
            if not already:
                if st.button(btn_label, key=f"{prefix}_wl_{safe}"):
                    st.session_state.watchlist.append({
                        "title": props["title"],
                        "year":  props.get("release_year", "N/A"),
                    })
                    st.rerun()
            else:
                st.button(btn_label, key=f"{prefix}_wl_{safe}", disabled=True)

    st.divider()

    # ── AI action buttons (side by side) ──────────────────────────────────────
    ai_col1, ai_col2 = st.columns(2)

    # ── Button 1: per-movie explanation (single_prompt) ───────────────────────
    with ai_col1:
        if st.button("Ask AI about these movies", type="primary", key=f"{prefix}_ask"):
            with st.spinner("Asking AI..."):
                prompt = (
                    f"A user searched for: '{query_for_ai}'. "
                    "In 2-3 sentences explain why '{title}' ({release_year}) "
                    "is a great match, referencing its themes: {description}"
                )
                resp = search_fn(limit=3, single_prompt=prompt,
                                 return_properties=["title", "release_year"])
            st.session_state[f"{prefix}_single"] = resp.objects
            st.session_state[f"{prefix}_plan"]   = None  # clear other AI output

    # ── Button 2: grouped movie-night plan ────────────────────────────────────
    with ai_col2:
        if st.button("Plan My Movie Night", type="secondary", key=f"{prefix}_plan_btn"):
            with st.spinner("Planning your movie night..."):
                titles = [obj.properties["title"] for obj in objects]
                task = (
                    f"The user wanted: '{query_for_ai}'. "
                    f"The 3 recommended films are: {', '.join(titles)}. "
                    "Write a fun movie-night plan with: "
                    "1) The best viewing order with a one-line reason for each, "
                    "2) A snack pairing for each film, "
                    "3) A 2-sentence theme tying all three together."
                )
                resp = search_fn(limit=3, grouped_task=task,
                                 return_properties=["title"])
            st.session_state[f"{prefix}_plan"]   = resp.generated
            st.session_state[f"{prefix}_single"] = None  # clear other AI output

    # ── Render whichever AI output is active ──────────────────────────────────
    single_key = f"{prefix}_single"
    plan_key   = f"{prefix}_plan"

    if st.session_state.get(single_key):
        st.subheader("AI Explanations")
        for obj in st.session_state[single_key]:
            title = obj.properties.get("title", "")
            year  = obj.properties.get("release_year", "")
            with st.expander(f"{title} ({year})", expanded=True):
                st.write(obj.generated)

    if st.session_state.get(plan_key):
        st.subheader("Movie Night Plan")
        st.markdown(st.session_state[plan_key])


# ════════════════════════════════════════════════════════════════════════════════
# Search Tab
# ════════════════════════════════════════════════════════════════════════════════
with tab_search:
    query = st.text_input(
        label="Describe a movie",
        placeholder="e.g. A movie about space travel and loneliness",
        label_visibility="collapsed",
        key="txt_query",
    )

    # Clear cached AI output when the query changes
    if query != st.session_state.last_query:
        st.session_state.txt_single = None
        st.session_state.txt_plan   = None
        st.session_state.last_query  = query

    if query:
        with st.spinner("Searching..."):
            results = collection.query.near_text(
                query=query,
                target_vector="text_vector",
                limit=3,
                return_properties=["title", "description", "release_year", "poster"],
            )

        if not results.objects:
            st.warning("No results found -- try a different query.")
        else:
            st.subheader(f'Top {len(results.objects)} matches for "{query}"')

            def text_search_fn(limit, return_properties, **kwargs):
                return collection.generate.near_text(
                    query=query,
                    target_vector="text_vector",
                    limit=limit,
                    return_properties=return_properties,
                    **kwargs,
                )

            show_results(results.objects, prefix="txt",
                         query_for_ai=query, search_fn=text_search_fn)


# ════════════════════════════════════════════════════════════════════════════════
# Chat Tab
# ════════════════════════════════════════════════════════════════════════════════
with tab_chat:
    st.subheader("Chat with Your Movie Collection")
    st.markdown(
        "Ask anything about the movies. "
        "The agent will search Weaviate and answer with source citations."
    )

    # Render message history
    for i, msg in enumerate(st.session_state["chat_messages"]):
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
            if msg["role"] == "assistant":
                asst_idx = sum(
                    1 for m in st.session_state["chat_messages"][:i+1]
                    if m["role"] == "assistant"
                ) - 1
                if asst_idx < len(st.session_state["chat_sources"]):
                    srcs = st.session_state["chat_sources"][asst_idx]["sources"]
                    if srcs:
                        with st.expander(f"Sources ({len(srcs)})"):
                            for j, s in enumerate(srcs, 1):
                                st.markdown(
                                    f"{j}. Collection: `{s['collection']}`"
                                    f" | ID: `{s['object_id']}`"
                                )
                    else:
                        st.caption("No source citations for this response.")

    # Error display
    if st.session_state["chat_agent_error"]:
        st.error(st.session_state["chat_agent_error"])

    # Clear button
    if st.session_state["chat_messages"]:
        if st.button("Clear Chat", key="chat_clear"):
            st.session_state["chat_messages"] = []
            st.session_state["chat_sources"]  = []
            st.session_state["chat_agent_error"] = None
            st.rerun()

    # Chat input
    user_input = st.chat_input("Ask about movies in the collection...")
    if user_input:
        st.session_state["chat_messages"].append(
            {"role": "user", "content": user_input}
        )
        st.session_state["chat_agent_error"] = None

        with st.spinner("Searching movies..."):
            try:
                agent    = get_query_agent()
                response = agent.ask(
                    [{"role": m["role"], "content": m["content"]}
                     for m in st.session_state["chat_messages"]]
                )
                answer = getattr(response, "final_answer", "") or \
                         "I could not find an answer for that."
                sources = []
                if hasattr(response, "sources") and response.sources:
                    for src in response.sources:
                        sources.append({
                            "collection": getattr(src, "collection", None),
                            "object_id":  getattr(src, "object_id", None),
                        })

                st.session_state["chat_messages"].append(
                    {"role": "assistant", "content": answer}
                )
                st.session_state["chat_sources"].append({"sources": sources})

            except Exception as e:
                st.session_state["chat_messages"].pop()
                st.session_state["chat_agent_error"] = f"Agent error: {e}"

        st.rerun()
