# Modular RAG Implementation Guide

## Abstract

Retrieval-Augmented Generation (RAG) systems have emerged as a critical technique for enhancing Large Language Model (LLM) capabilities by integrating external knowledge sources to mitigate hallucinations and provide up-to-date, contextually relevant responses. However, traditional RAG implementations suffer from rigid, monolithic architectures that limit extensibility and fail to address complex real-world requirements involving heterogeneous data sources, multimodal interactions, and dynamic query processing. This project presents DocuMind, a production-grade Modular RAG framework that decomposes the retrieval-augmentation pipeline into five specialized, independently configurable modules while introducing complementary capabilities for natural language database querying and multimodal interaction. The core RAG pipeline comprises: (1) an Indexing module implementing Small-to-Big chunking strategy for optimized retrieval precision and contextual richness, (2) a Pre-Retrieval module utilizing Hypothetical Document Embeddings (HyDE) for enhanced query-document semantic alignment, (3) a Retrieval module employing FAISS-based vector search with user-specific and document-specific filtering, (4) a Post-Retrieval module featuring Gemini-powered cross-encoder reranking for improved relevance scoring, and (5) a Generation module producing context-grounded, TTS-optimized responses with conversation history awareness. Beyond document-based RAG, the system integrates an AI-powered Text-to-SQL module enabling natural language querying across PostgreSQL, MySQL, and SQLite databases through automated schema extraction and Gemini-based SQL generation with multi-layer security validation. Multimodal capabilities are provided through SarvamAI integration for bidirectional speech-text conversion, supporting voice-based interaction. The architecture implements session-based conversation management, multi-format document processing (PDF, DOCX, HTML, Markdown, TXT), persistent vector storage, and comprehensive authentication via JWT. A React-based frontend with Claude-inspired design provides an intuitive interface featuring dual chat modes (document and database), real-time query processing, export functionality (PDF, CSV, JSON), and responsive design. Experimental deployment demonstrates the framework's ability to deliver accurate, contextually relevant responses across diverse knowledge-intensive applications while maintaining modularity, scalability, and production-readiness for enterprise deployment scenarios.

## Overview

This document explains the implementation of a **Modular Retrieval-Augmented Generation (RAG)** system built with FastAPI, Google Gemini, and FAISS. The system implements advanced RAG techniques including Small-to-Big chunking, HyDE (Hypothetical Document Embeddings), and model-based reranking.

## Architecture Overview

The system follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Services      │
│   (React/Vue)   │◄──►│   (FastAPI)     │◄──►│   (Business)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Controllers   │    │   Data Layer    │
                       │   (Orchestrate) │    │   (FAISS/JSON)  │
                       └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. RAG Modules Service (`rag_modules_service.py`)

The heart of the system implementing five core RAG modules:

#### **Module 1: Indexing (Small-to-Big Strategy)**
- **Purpose**: Optimizes both retrieval accuracy and context quality
- **Implementation**:
  - Creates **Parent Chunks** (1000 chars) for rich context
  - Creates **Child Chunks** (300 chars) for precise retrieval
  - Embeds only child chunks for vector search
  - Links child chunks to their parent chunks

```python
# Example chunking strategy
parent_chunk_size = 1000  # Larger chunks for context
child_chunk_size = 300   # Smaller chunks for retrieval
chunk_overlap = 100      # Overlap for continuity
```

#### **Module 2: Pre-Retrieval (HyDE Enhancement)**
- **Purpose**: Improves query-document semantic matching
- **Implementation**:
  - Generates hypothetical answer to user query
  - Combines original query with hypothetical answer
  - Uses enhanced query for embedding and retrieval

```python
# HyDE prompt example
hyde_prompt = f"Please write a short, hypothetical passage that answers: {query}"
enhanced_query = f"{query}\n\n{hypothetical_answer}"
```

#### **Module 3: Retrieval (Vector Search)**
- **Purpose**: Finds relevant child chunks, returns parent chunks
- **Implementation**:
  - Embeds enhanced query using Google Gemini
  - Searches FAISS index for similar child chunks
  - Retrieves corresponding parent chunks for context
  - Supports user-specific and document-specific filtering

#### **Module 4: Post-Retrieval (Model-Based Reranking)**
- **Purpose**: Improves relevance ranking beyond vector similarity
- **Implementation**:
  - Uses Gemini as cross-encoder for query-document pairs
  - Reranks retrieved chunks by relevance
  - Returns top-k most relevant chunks

#### **Module 5: Generation (Context-Aware Answer)**
- **Purpose**: Generates accurate, context-based answers
- **Implementation**:
  - Combines reranked chunks into context
  - Uses structured prompt for answer generation
  - Removes markdown formatting for clean output

### 2. Vector Store Service (`pinecone_service.py`)

Local FAISS-based vector store simulating Pinecone:

- **FAISS Index**: Stores child chunk embeddings
- **Metadata Store**: Maps chunk IDs to metadata
- **Parent Chunk Store**: Stores full parent chunks
- **Persistence**: Saves/loads data to/from disk

### 3. LLM Service (`gemini_service.py`)

Google Gemini integration with:

- **Embedding Generation**: Creates 768-dimensional vectors

- HTML (using BeautifulSoup)
- Markdown (using markdown)
- Plain text

## Data Flow

### Document Indexing Flow

```
File Upload → Text Extraction → Small-to-Big Chunking → Embedding Generation → Vector Storage
     │              │                    │                      │                   │
     ▼              ▼                    ▼                      ▼                   ▼
[PDF/DOCX]    [Clean Text]      [Parent + Child]        [768-dim vectors]    [FAISS Index]
                                   Chunks                                      [Metadata]
```

### Query Processing Flow

```
User Query → HyDE Enhancement → Vector Search → Reranking → Answer Generation
     │              │               │             │              │
     ▼              ▼               ▼             ▼              ▼
[Raw Question] [Enhanced Query] [Child Chunks] [Top Chunks] [Final Answer]
                                      ↓
                               [Parent Chunks]
```

## Key Features

### 1. User Isolation
- Each user's documents are stored separately
- Vector search filters by username
- Document access is user-specific

### 2. Document Filtering
- Query specific documents within user's collection
- Supports multi-document filtering
- Maintains document metadata

### 3. Chat Session Management
- Persistent conversation history
- Session-based context
- Message threading

### 4. Advanced Chunking Strategy

**Small-to-Big Benefits**:
- **Better Retrieval**: Small chunks capture specific concepts
- **Better Context**: Large chunks provide comprehensive information
- **Optimal Balance**: Precision in search, richness in generation

### 5. Multi-Stage Relevance Scoring

1. **Vector Similarity**: Initial semantic matching
2. **Model Reranking**: Deep relevance assessment
3. **Context Selection**: Top-k most relevant chunks

## API Endpoints

### Authentication Required Endpoints

```
POST /rag/upload-and-index    # Upload and index files
POST /rag/index              # Index text content
POST /rag/query              # Ask questions
GET  /rag/documents          # List user documents
```

### Query Parameters

```python
# Query with document filtering
POST /rag/query?documents=["doc1.pdf","doc2.docx"]&session_id=123

# Request body
{
    "query": "What is machine learning?",
    "top_k": 5
}
```

## Configuration

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_jwt_secret

# Optional
EMBEDDING_DIM=768
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
```

### Model Configuration

```python
# Gemini Models
GENERATIVE_MODEL = "gemini-2.5-flash"      # For generation/reranking
EMBEDDING_MODEL = "models/embedding-001"    # For embeddings

# Chunking Parameters
CHILD_CHUNK_SIZE = 300   # Retrieval chunks
PARENT_CHUNK_SIZE = 1000 # Context chunks
CHUNK_OVERLAP = 100      # Continuity overlap
```

## Performance Optimizations

### 1. Rate Limiting
- 4-second intervals between embedding calls
- Daily quota tracking
- Fallback embedding generation

### 2. Caching Strategy
- Persistent FAISS index storage
- Metadata caching in JSON files
- Parent chunk storage optimization

### 3. Async Processing
- Non-blocking file processing
- Concurrent embedding generation
- Async vector operations

## Error Handling

### 1. Graceful Degradation
- Fallback embeddings when API fails
- Original query when HyDE fails
- Top-k fallback when reranking fails

### 2. User Feedback
- Clear error messages
- Quota exceeded notifications
- Processing status updates

### 3. Logging Strategy
- Comprehensive operation logging
- Error tracking and debugging
- Performance monitoring

## Security Features

### 1. JWT Authentication
- Secure user sessions
- Token-based access control
- Configurable expiration

### 2. User Data Isolation
- Username-based filtering
- Private document collections
- Secure metadata storage

### 3. Input Validation
- Pydantic schema validation
- File type restrictions
- Query parameter sanitization

## Deployment Considerations

### 1. Scalability
- Stateless service design
- Horizontal scaling ready
- Database migration path

### 2. Production Setup
- Environment-specific configs
- Proper secret management
- Health check endpoints

### 3. Monitoring
- Comprehensive logging
- Performance metrics
- Error tracking

## Usage Examples

### 1. Document Upload and Indexing

```python
# Upload file
files = {'file': open('document.pdf', 'rb')}
response = requests.post('/rag/upload-and-index', files=files, headers=auth_headers)

# Index text directly
payload = {
    "title": "My Document",
    "content": "Document content here...",
    "metadata": {"source": "manual"}
}
response = requests.post('/rag/index', json=payload, headers=auth_headers)
```

### 2. Querying Documents

```python
# Basic query
query_data = {
    "query": "What is the main topic?",
    "top_k": 5
}
response = requests.post('/rag/query', json=query_data, headers=auth_headers)

# Filtered query
params = {"documents": ["doc1.pdf", "doc2.docx"]}
response = requests.post('/rag/query', json=query_data, params=params, headers=auth_headers)
```

### 3. Managing Documents

```python
# List user documents
response = requests.get('/rag/documents', headers=auth_headers)
documents = response.json()['documents']

# Filter by specific documents
doc_names = [doc['filename'] for doc in documents[:2]]
```

## Benefits of This Implementation

### 1. **Accuracy Improvements**
- Small-to-Big chunking improves retrieval precision
- HyDE enhancement bridges query-document gap
- Model-based reranking provides better relevance

### 2. **User Experience**
- Fast response times with local vector storage
- Comprehensive document support
- Clean, formatted answers

### 3. **Scalability**
- Modular architecture supports easy extensions
- User isolation enables multi-tenancy
- Async design handles concurrent requests

### 4. **Maintainability**
- Clear separation of concerns
- Comprehensive error handling
- Extensive logging and monitoring

This modular RAG implementation provides a robust, scalable, and user-friendly system for document-based question answering with advanced retrieval and generation capabilities.