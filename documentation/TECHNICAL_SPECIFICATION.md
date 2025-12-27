# Modular RAG System - Technical Specification

## 1. Overview
The Modular RAG (Retrieval-Augmented Generation) system is a production-grade framework designed for intelligent document querying and natural language database interactions. It decomposes the RAG pipeline into specialized, independently configurable modules.

## 2. System Architecture
The system follows a modular full-stack architecture:
- **Frontend (React)**: Built with Vite and Tailwind CSS. Provides a Claude-inspired UI for chat, document management, and database querying.
- **Backend (FastAPI)**: RESTful API handling authentication (JWT), document processing, RAG logic, and DB query orchestration.
- **Data Layers**: 
  - **Vector Store**: FAISS-based local vector storage with id-to-metadata mapping.
  - **Relational DB**: SQLite for user sessions; support for PostgreSQL/MySQL for external querying.
  - **File Store**: JSON-based persistence for metadata and parent chunks.

---

## 3. Core RAG Pipeline (The Five Modules)
### 1. Indexing (Small-to-Big)
- **Parent Chunks**: Large chunks (1000 chars) for rich contextual generation.
- **Child Chunks**: Small chunks (300 chars) for precise semantic retrieval.
- **Mechanism**: Only child chunks are embedded; they link back to parent chunks.

### 2. Pre-Retrieval (HyDE)
- **HyDE (Hypothetical Document Embeddings)**: Generates a hypothetical answer to the user query to bridge the semantic gap between questions and document content.

### 3. Retrieval (Vector Search)
- **Vector Search**: FAISS similarity search using Gemini-generated embeddings.
- **Filtering**: Multi-level filtering by user and specific document IDs.

### 4. Post-Retrieval (Reranking)
- **Reranker**: Uses Gemini as a cross-encoder to assess the relevance of retrieved chunks relative to the query, improving the final top-k selection.

### 5. Generation (Adaptive)
- **Context-Grounded**: Combines reranked chunks with conversation history.
- **Style-Aware**: Produces responses based on user preference (Concise, Balanced, Detailed).

---

## 4. Database Query Feature (Text-to-SQL)
- **Purpose**: Natural language interface for querying SQL databases (PostgreSQL, MySQL, SQLite).
- **Mechanism**: Automated schema extraction -> Prompt engineering with 13 security requirements -> Gemini SQL generation -> Multi-layer validation (SELECT-only, keyword blocking).
- **Security**: Defense-in-depth with syntax validation, quote matching, and connection isolation.

---

## 5. Performance Optimizations
### Asynchronous Batch Processing
- **Batch Embeddings**: Generates multiple embeddings in a single API call with retry fallsbacks.
- **Concurrent Execution**: Uses semaphores and thread pools to prevent event loop blocking during CPU-intensive tasks.
- **Speech Service**: Concurrent audio chunk generation for 3-5x faster TTS.

---

## 6. Security & Infrastructure
- **JWT Auth**: Secure, session-based access control.
- **Data Isolation**: Multi-tenancy achieved through user-specific vector and metadata filtering.
- **Logging**: Comprehensive monitoring of API usage, quota tracking, and error states.

---
*Created: December 2025*
