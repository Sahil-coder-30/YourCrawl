"""
RAG Engine — Regulatory Compliance Q&A Agent

Uses ChromaDB for vector storage and Gemini for generation.
Ingests DPDP Act, EU AI Act, and Consumer Protection Act documents,
plus user-specific audit reports for contextual Q&A.
"""

import os
import hashlib
import logging
from pathlib import Path
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────
KNOWLEDGE_DIR = Path(__file__).parent / "knowledge_base"
CHROMA_DIR = Path(__file__).parent / "chroma_store"
COLLECTION_NAME = "regulatory_compliance"
CHUNK_SIZE = 800       # characters per chunk
CHUNK_OVERLAP = 150    # overlap between chunks
TOP_K = 8              # number of chunks to retrieve


# ── Text Chunking ────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE,
               overlap: int = CHUNK_OVERLAP) -> list[dict]:
    """Split text into overlapping chunks, preserving section context."""
    chunks = []
    lines = text.split("\n")
    current_chunk = []
    current_length = 0
    current_section = ""

    for line in lines:
        # Track section headers for metadata
        if line.startswith("### "):
            current_section = line.strip("# ").strip()
        elif line.startswith("## ") and not current_section:
            current_section = line.strip("# ").strip()

        line_length = len(line) + 1  # +1 for newline
        if current_length + line_length > chunk_size and current_chunk:
            chunk_text_str = "\n".join(current_chunk)
            chunks.append({
                "text": chunk_text_str,
                "section": current_section,
            })
            # Keep overlap
            overlap_lines = []
            overlap_len = 0
            for prev_line in reversed(current_chunk):
                if overlap_len + len(prev_line) > overlap:
                    break
                overlap_lines.insert(0, prev_line)
                overlap_len += len(prev_line) + 1
            current_chunk = overlap_lines
            current_length = overlap_len

        current_chunk.append(line)
        current_length += line_length

    if current_chunk:
        chunks.append({
            "text": "\n".join(current_chunk),
            "section": current_section,
        })

    return chunks


# ── RAG Engine ────────────────────────────────────────────────────────
class RAGEngine:
    """
    Retrieval-Augmented Generation engine for regulatory compliance Q&A.

    Uses a lightweight in-memory vector store with Gemini embeddings
    to avoid heavy dependencies like ChromaDB.
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set in environment")

        genai.configure(api_key=api_key)

        self.embed_model = "models/gemini-embedding-001"
        self.gen_model = genai.GenerativeModel("gemini-2.5-flash")

        # In-memory vector store: list of {id, text, metadata, embedding}
        self._store: list[dict] = []
        self._is_initialized = False

        logger.info("RAG Engine created (not yet initialized)")

    def initialize(self):
        """Load knowledge base documents and build vector index."""
        if self._is_initialized:
            logger.info("RAG Engine already initialized, skipping")
            return

        logger.info("Initializing RAG Engine — loading knowledge base...")

        knowledge_files = list(KNOWLEDGE_DIR.glob("*.md"))
        if not knowledge_files:
            logger.warning(f"No .md files found in {KNOWLEDGE_DIR}")
            self._is_initialized = True
            return

        all_chunks = []
        for filepath in knowledge_files:
            logger.info(f"Processing: {filepath.name}")
            text = filepath.read_text(encoding="utf-8")
            doc_name = filepath.stem.replace("_", " ").title()

            chunks = chunk_text(text)
            for i, chunk in enumerate(chunks):
                chunk_id = hashlib.md5(
                    f"{filepath.name}:{i}".encode()
                ).hexdigest()
                all_chunks.append({
                    "id": chunk_id,
                    "text": chunk["text"],
                    "metadata": {
                        "source": filepath.name,
                        "document": doc_name,
                        "section": chunk["section"],
                        "chunk_index": i,
                    },
                })

        # Batch embed all chunks
        logger.info(f"Embedding {len(all_chunks)} chunks...")
        texts_to_embed = [c["text"] for c in all_chunks]

        # Embed in batches of 100 (API limit)
        batch_size = 100
        for batch_start in range(0, len(texts_to_embed), batch_size):
            batch = texts_to_embed[batch_start:batch_start + batch_size]
            result = genai.embed_content(
                model=self.embed_model,
                content=batch,
                task_type="RETRIEVAL_DOCUMENT",
            )
            embeddings = result["embedding"]
            for j, emb in enumerate(embeddings):
                all_chunks[batch_start + j]["embedding"] = emb

        self._store = all_chunks
        self._is_initialized = True
        logger.info(f"RAG Engine initialized with {len(self._store)} chunks "
                     f"from {len(knowledge_files)} documents")

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """Compute cosine similarity between two vectors."""
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x ** 2 for x in a) ** 0.5
        norm_b = sum(x ** 2 for x in b) ** 0.5
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def retrieve(self, query: str, top_k: int = TOP_K) -> list[dict]:
        """Retrieve the most relevant chunks for a query."""
        if not self._store:
            return []

        # Embed query
        result = genai.embed_content(
            model=self.embed_model,
            content=query,
            task_type="RETRIEVAL_QUERY",
        )
        query_embedding = result["embedding"]

        # Score all chunks
        scored = []
        for chunk in self._store:
            sim = self._cosine_similarity(query_embedding, chunk["embedding"])
            scored.append((sim, chunk))

        # Sort by similarity descending
        scored.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored[:top_k]:
            results.append({
                "text": chunk["text"],
                "metadata": chunk["metadata"],
                "score": round(score, 4),
            })

        return results

    def query(self, question: str,
              audit_context: Optional[str] = None,
              chat_history: Optional[list[dict]] = None) -> dict:
        """
        Answer a regulatory compliance question using RAG.

        Args:
            question: The user's question
            audit_context: Optional JSON string of the user's latest audit report
            chat_history: Optional list of {role, content} past messages

        Returns:
            dict with 'answer', 'sources', and 'follow_up_questions'
        """
        if not self._is_initialized:
            self.initialize()

        # Retrieve relevant chunks
        retrieved = self.retrieve(question)

        # Build context
        context_parts = []

        if audit_context:
            context_parts.append(
                "=== USER'S WEBSITE AUDIT REPORT ===\n"
                f"{audit_context}\n"
                "=== END AUDIT REPORT ===\n"
            )

        context_parts.append("=== REGULATORY KNOWLEDGE BASE ===\n")
        for i, chunk in enumerate(retrieved, 1):
            meta = chunk["metadata"]
            context_parts.append(
                f"[Source {i}: {meta['document']} — {meta['section']}]\n"
                f"{chunk['text']}\n"
            )
        context_parts.append("=== END KNOWLEDGE BASE ===\n")

        context_str = "\n".join(context_parts)

        # Build chat history string
        history_str = ""
        if chat_history:
            history_lines = []
            for msg in chat_history[-6:]:  # Last 6 messages for context window
                role = "User" if msg["role"] == "user" else "Assistant"
                history_lines.append(f"{role}: {msg['content']}")
            history_str = "\n".join(history_lines)

        # System prompt
        system_prompt = """You are a regulatory compliance expert AI assistant for YourCrawl — a dark pattern auditing platform. You help users understand regulatory compliance issues found in their website audits.

Your knowledge covers:
1. **Digital Personal Data Protection Act, 2023 (India)** — DPDP Act
2. **EU Artificial Intelligence Act** — EU AI Act
3. **Consumer Protection Act, 2019 (India)** — CPA 2019
4. **CCPA Dark Pattern Guidelines, 2023 (India)**
5. **General Data Protection Regulation (EU)** — GDPR
6. **Digital Services Act (EU)** — DSA

RULES:
1. Answer ONLY based on the provided regulatory knowledge and audit report context. Do not fabricate regulations or sections.
2. When referencing a regulation, always cite the specific act name and section/article number.
3. If the user's audit report is available, connect your answers to their specific findings where relevant.
4. Be concise but thorough. Use bullet points for clarity.
5. If you don't know or the information is not in the context, say so honestly.
6. Always suggest practical remediation steps when discussing violations.
7. Suggest 2-3 follow-up questions the user might want to ask.

OUTPUT FORMAT:
Respond with a JSON object (no markdown fences, no extra text):
{
  "answer": "<your detailed answer in markdown format>",
  "sources": [
    {"document": "<act name>", "section": "<section/article>"}
  ],
  "follow_up_questions": [
    "<suggested question 1>",
    "<suggested question 2>",
    "<suggested question 3>"
  ]
}"""

        # Build the prompt
        user_prompt = f"""Context:
{context_str}

{"Previous conversation:" + chr(10) + history_str + chr(10) if history_str else ""}

User Question: {question}

Provide a comprehensive answer based on the regulatory context above."""

        try:
            response = self.gen_model.generate_content(
                [system_prompt, user_prompt],
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=2048,
                ),
            )

            raw = response.text.strip()

            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3].strip()
            if raw.startswith("json"):
                raw = raw[4:].strip()

            import json
            try:
                result = json.loads(raw)
            except json.JSONDecodeError:
                # Fallback: wrap raw text as answer
                result = {
                    "answer": raw,
                    "sources": [{"document": m["document"], "section": m["section"]}
                                for m in [c["metadata"] for c in retrieved[:3]]],
                    "follow_up_questions": [],
                }

            # Attach retrieval metadata
            result["retrieval_scores"] = [
                {"source": c["metadata"]["source"], "score": c["score"]}
                for c in retrieved[:5]
            ]

            return result

        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            return {
                "answer": f"I apologize, but I encountered an error processing your question: {str(e)}. Please try again.",
                "sources": [],
                "follow_up_questions": [
                    "Can you rephrase your question?",
                    "What specific regulation are you interested in?",
                ],
                "error": str(e),
            }


# ── Singleton ─────────────────────────────────────────────────────────
_engine: Optional[RAGEngine] = None


def get_rag_engine() -> RAGEngine:
    """Get or create the singleton RAG engine instance."""
    global _engine
    if _engine is None:
        _engine = RAGEngine()
    return _engine
