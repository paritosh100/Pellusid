"""
UserMemory — ChromaDB-backed semantic memory for InsightBridge.

Stores per-user journal entries and Bridge conversation history.
Uses vector search to retrieve semantically similar past entries.
"""

import json
import logging
import time
from typing import Optional

import chromadb

logger = logging.getLogger(__name__)

# ── Singleton client ──────────────────────────────────────────────────────────

_client: Optional[chromadb.ClientAPI] = None


def _get_client() -> chromadb.ClientAPI:
    """Lazy-init a PersistentClient so the DB is only opened once."""
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path="/tmp/insightbridge_memory")
        logger.info("[Memory] ChromaDB PersistentClient initialised at /tmp/insightbridge_memory")
    return _client


# ── Collection name helpers ───────────────────────────────────────────────────
# ChromaDB collection names must match [a-zA-Z0-9_-]{3,63}.
# We create one collection per user per feature to keep data isolated.

def _journal_collection_name(user_id: str) -> str:
    safe_id = user_id.replace("-", "_")
    return f"journal_{safe_id}"


def _bridge_collection_name(user_id: str) -> str:
    safe_id = user_id.replace("-", "_")
    return f"bridge_{safe_id}"


# ══════════════════════════════════════════════════════════════════════════════
#  UserMemory
# ══════════════════════════════════════════════════════════════════════════════


class UserMemory:
    """Per-user semantic memory backed by ChromaDB.

    Public API
    ----------
    Journal entries
        add_journal_entry(text, reading_id?, metadata?)
        search_journal(query, n_results=5) -> list[dict]

    Bridge conversations
        save_bridge_message(role, content, session_id?, metadata?)
        get_bridge_history(session_id?, limit=50) -> list[dict]
        search_bridge_history(query, n_results=5) -> list[dict]
    """

    def __init__(self, user_id: str) -> None:
        self.user_id = user_id
        self._client = _get_client()

        # Get-or-create the two collections for this user
        self._journal = self._client.get_or_create_collection(
            name=_journal_collection_name(user_id),
            metadata={"hnsw:space": "cosine"},  # cosine similarity
        )
        self._bridge = self._client.get_or_create_collection(
            name=_bridge_collection_name(user_id),
            metadata={"hnsw:space": "cosine"},
        )

    # ── Journal entries ───────────────────────────────────────────────────

    def add_journal_entry(
        self,
        text: str,
        reading_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> str:
        """Store a journal entry.  Returns the generated document ID."""
        doc_id = f"journal_{self.user_id}_{int(time.time() * 1000)}"
        meta = {
            "user_id": self.user_id,
            "type": "journal",
            "timestamp": int(time.time()),
            **({"reading_id": reading_id} if reading_id else {}),
            **(metadata or {}),
        }

        self._journal.add(
            ids=[doc_id],
            documents=[text],
            metadatas=[meta],
        )
        logger.info(f"[Memory] Stored journal entry {doc_id} for user {self.user_id}")
        return doc_id

    def search_journal(
        self,
        query: str,
        n_results: int = 5,
    ) -> list[dict]:
        """Search journal entries by semantic similarity.

        Returns a list of dicts, each with keys:
            id, text, metadata, distance
        """
        count = self._journal.count()
        if count == 0:
            return []

        # Clamp to the number of documents available
        n = min(n_results, count)
        results = self._journal.query(
            query_texts=[query],
            n_results=n,
        )

        return _unpack_query_results(results)

    # ── Bridge conversation history ───────────────────────────────────────

    def save_bridge_message(
        self,
        role: str,
        content: str,
        session_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> str:
        """Persist a single Bridge chat message.  Returns the doc ID."""
        doc_id = f"bridge_{self.user_id}_{int(time.time() * 1000)}"
        meta = {
            "user_id": self.user_id,
            "type": "bridge_chat",
            "role": role,
            "timestamp": int(time.time()),
            **({"session_id": session_id} if session_id else {}),
            **(metadata or {}),
        }

        self._bridge.add(
            ids=[doc_id],
            documents=[content],
            metadatas=[meta],
        )
        logger.debug(f"[Memory] Stored bridge message {doc_id} ({role})")
        return doc_id

    def get_bridge_history(
        self,
        session_id: Optional[str] = None,
        limit: int = 50,
    ) -> list[dict]:
        """Retrieve Bridge messages, optionally filtered by session_id.

        Returns messages sorted by timestamp ascending.
        """
        count = self._bridge.count()
        if count == 0:
            return []

        where_filter: Optional[dict] = None
        if session_id:
            where_filter = {"session_id": session_id}

        results = self._bridge.get(
            where=where_filter,
            limit=limit,
            include=["documents", "metadatas"],
        )

        entries = []
        if results and results["ids"]:
            for i, doc_id in enumerate(results["ids"]):
                entries.append({
                    "id": doc_id,
                    "role": results["metadatas"][i].get("role", "unknown"),
                    "text": results["documents"][i],
                    "metadata": results["metadatas"][i],
                })

        # Sort by timestamp ascending so conversation reads naturally
        entries.sort(key=lambda e: e["metadata"].get("timestamp", 0))
        return entries

    def search_bridge_history(
        self,
        query: str,
        n_results: int = 5,
    ) -> list[dict]:
        """Semantic search across all Bridge messages for this user."""
        count = self._bridge.count()
        if count == 0:
            return []

        n = min(n_results, count)
        results = self._bridge.query(
            query_texts=[query],
            n_results=n,
        )

        return _unpack_query_results(results)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _unpack_query_results(results: dict) -> list[dict]:
    """Flatten ChromaDB query results into a simple list of dicts."""
    entries: list[dict] = []
    if not results or not results.get("ids"):
        return entries

    ids = results["ids"][0]
    docs = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0] if results.get("distances") else [None] * len(ids)

    for i, doc_id in enumerate(ids):
        entries.append({
            "id": doc_id,
            "text": docs[i],
            "metadata": metadatas[i],
            "distance": distances[i],
        })

    return entries
