# YourCrawl - RAG Agent Info & Status

## Overview

The `rag` folder contains a retrieval-augmented generation (RAG) legal AI agent for dark pattern compliance. It uses ChromaDB to store legal document embeddings and Google Gemini to answer questions grounded in legislation.

## Main Components

- `api.py`
  - FastAPI server exposing the RAG service.
  - Endpoints include `/health`, `/query`, `/query-with-audit`, `/compliance-check`, and `/compliance-check/simple`.
  - Uses API key authentication via `X-API-Key`.

- `ingest.py`
  - Builds the ChromaDB vector store from legal documents in `data/`.
  - Splits law text into chunks, embeds them using `all-MiniLM-L6-v2`, and stores them in `./chroma_db`.
  - Documents ingested:
    - `dpdp_act.txt` (DPDP Act 2023)
    - `eu_ai_act.txt` (EU AI Act 2024)
    - `consumer_protection.txt` (Consumer Protection Act 2019 + CCPA Guidelines 2023)

- `rag_agent.py`
  - Loads the vector store and performs retrieval + Gemini generation.
  - Supports:
    - free-form legal Q&A
    - compliance checks for detected dark patterns
    - audit-grounded question answering
  - Handles Gemini model/key rotation across `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, and `GEMINI_API_KEY_3`.

## Key Behavior

- Legal text is retrieved from ChromaDB and compiled into context for Gemini prompts.
- `rag_agent.py` enforces structured responses and attempts JSON parsing for compliance reports.
- If legal context is insufficient, the agent is designed to respond that the information is not available rather than hallucinating.

## Setup & Usage

1. Install dependencies: `pip install -r requirements.txt`
2. Populate `rag/.env` with:
   - `RAG_API_KEY`
   - `GEMINI_API_KEY` (and optionally `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`)
3. Run ingestion once:
   - `python ingest.py`
4. Start the API server:
   - `python api.py`
   - or `uvicorn api:app --host 0.0.0.0 --port 8002 --reload`

## Status

- Functional legal RAG service for compliance-focused Q&A and pattern analysis.
- Built for local ChromaDB and Gemini-powered generation with support for multi-key failover.
- Recommended improvement: tighten CORS origins and secure API key usage in production.
