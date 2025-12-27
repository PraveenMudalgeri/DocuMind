# Modular RAG System Architecture

## Overview

The Modular RAG (Retrieval-Augmented Generation) system is a full-stack web application designed for intelligent document querying and chat-based interactions. It combines vector search, large language models, and a modular architecture to provide efficient and accurate responses to user queries.

## System Components

### 1. Backend (FastAPI)

The backend is built with FastAPI and provides RESTful APIs for the frontend. It handles authentication, document management, chat sessions, and RAG queries.

#### Key Modules:

- **Main Application (`api/main.py`)**: Entry point for the FastAPI application, includes CORS setup and route inclusion.
- **Authentication Service (`api/service/auth_service.py`)**: Handles user registration, login, and JWT token management.
- **Chat Service (`api/service/chat_session_service.py`)**: Manages chat sessions and message history.
- **Document Service (`api/service/user_documents_service.py`)**: Handles document upload, processing, and storage.
- **RAG Modules Service (`api/service/rag_modules_service.py`)**: Core RAG logic including query processing, retrieval, and generation.
- **Vector Store Service (`api/service/pinecone_service.py`)**: Local FAISS-based vector storage and retrieval (simulates Pinecone).
- **Gemini Service (`api/service/gemini_service.py`)**: Integration with Google Gemini API for embeddings and text generation.
- **Database Service (`api/service/database_service.py`)**: SQLite-based user and session management.
- **File Processing Service (`api/service/file_processing_service.py`)**: PDF text extraction and chunking.
- **Speech Service (`api/service/speech_service.py`)**: Text-to-speech functionality.

#### Routes:

- **Auth Routes (`api/routes/auth.py`)**: `/auth/register`, `/auth/login`
- **Chat Routes (`api/routes/chat.py`)**: `/chat/sessions`, `/chat/messages`
- **Document Routes (`api/routes/documents.py`)**: `/documents/upload`, `/documents/list`
- **RAG Routes (`api/routes/rag.py`)**: `/rag/query`
- **Speech Routes (`api/routes/speech.py`)**: `/speech/generate`

### 2. Frontend (React)

The frontend is a React application built with Vite, providing a user interface for authentication, document management, chat, and RAG queries.

#### Key Components:

- **App (`frontend/src/App.jsx`)**: Main application component with routing.
- **Authentication (`frontend/src/components/auth/`)**: Login and signup forms.
- **Chat (`frontend/src/components/chat/`)**: Chat interface with message history.
- **Documents (`frontend/src/components/documents/`)**: Document upload and listing.
- **RAG (`frontend/src/components/rag/`)**: Query interface with document filtering.
- **Layout (`frontend/src/components/layout/`)**: Navigation and common UI elements.

#### Services:

- **API Service (`frontend/src/services/api.js`)**: Axios-based API client with timeout handling.
- **Auth Service (`frontend/src/services/authService.js`)**: Authentication logic.
- **Chat Service (`frontend/src/services/chatService.js`)**: Chat session management.
- **Document Service (`frontend/src/services/documentService.js`)**: Document operations.
- **RAG Service (`frontend/src/services/ragService.js`)**: RAG query handling.

### 3. Data Storage

#### Persistent Storage:

- **FAISS Index (`api/data/faiss_index.bin`)**: Vector embeddings for efficient similarity search.
- **Metadata Store (`api/data/metadata_store.json`)**: Mapping between FAISS IDs and document chunks, including metadata.
- **Parent Chunks (`api/data/parent_chunks.json`)**: Larger document chunks for context retrieval.
- **User Documents (`api/data/user_documents.json`)**: User-uploaded document metadata.
- **Chat Sessions (`api/data/chat_sessions.json`)**: Chat session data.
- **Users (`api/data/users.json`)**: User authentication data.
- **SQLite Database (`api/data/database.db`)**: Structured data for users and sessions.

#### In-Memory Structures:

- **FAISS IndexIDMap**: Loaded FAISS index with ID mapping.
- **Metadata Dictionary**: Child chunk metadata keyed by vector ID.
- **Parent Chunk Dictionary**: Parent chunks keyed by ID.

## Data Flow

### 1. Document Ingestion

1. User uploads PDF document via frontend.
2. Backend extracts text using PyPDF2.
3. Text is chunked into child chunks (small) and parent chunks (large).
4. Embeddings are generated for child chunks using Gemini.
5. Vectors are stored in FAISS index with unique IDs.
6. Metadata is persisted to JSON files.

### 2. Query Processing

1. User submits query with optional document filters.
2. Backend generates hypothetical document using HyDE (Hypothetical Document Embeddings).
3. Query embedding is created and used for FAISS similarity search.
4. Top-k similar child chunks are retrieved.
5. Parent chunks are fetched for additional context.
6. Results are reranked and passed to Gemini for generation.
7. Response is formatted in Claude/ChatGPT style and returned.

### 3. Chat Interaction

1. Chat sessions are created and managed.
2. Messages are stored and retrieved.
3. RAG queries can be integrated into chat flow.

## RAG Pipeline

### Stages:

1. **Pre-retrieval**:
   - HyDE: Generate hypothetical document from query.
   - Query expansion and filtering.

2. **Retrieval**:
   - FAISS similarity search on child chunks.
   - Optional document filtering.

3. **Post-retrieval**:
   - Fetch parent chunks for context.
   - Reranking of retrieved chunks.

4. **Generation**:
   - Adaptive prompts based on query type.
   - Gemini API call for response generation.
   - Markdown-rich, conversational output.

## Security and Authentication

- JWT-based authentication.
- Password hashing with bcrypt.
- Protected routes requiring valid tokens.
- User-specific data isolation.

## Deployment

- Backend: FastAPI server (uvicorn).
- Frontend: Vite development server or built static files.
- Local development with virtual environment.
- Production deployment possible with Docker or cloud services.

## Technologies Used

- **Backend**: Python, FastAPI, FAISS, Google Gemini API, SQLite, PyPDF2, NumPy.
- **Frontend**: React, Vite, Axios, Tailwind CSS.
- **Data**: JSON, FAISS index, SQLite.
- **Other**: JWT, bcrypt, CORS.

## Configuration

- Settings in `api/lib/config.py`.
- Environment variables for API keys and ports.
- Embedding dimensions, chunk sizes, and other parameters configurable.

This architecture provides a scalable, modular RAG system capable of handling complex document queries with high accuracy and efficiency.