# DocuMind - Intelligent Document Chat

DocuMind is an advanced RAG (Retrieval-Augmented Generation) application that allows users to seamlessly interact with their documents using AI. By leveraging the power of Google's Gemini models and vector search, DocuMind provides accurate, context-aware answers from your uploaded files.

## Live Demo

- **Frontend Application:** [https://documind-mrag.vercel.app](https://documind-mrag.vercel.app)
- **Backend API:** [https://documind-p046.onrender.com](https://documind-p046.onrender.com)

## Modular RAG Architecture

DocuMind is built upon a highly scalable Modular RAG framework, ensuring precise context retrieval and coherent responses. The system comprises **6 Main Components**:

1.  **Orchestrator (RAG Service):** Coordinations the entire workflow, managing the flow of data between user input, retrieval, and generation.
2.  **Document Ingestion Engine:** Handles the parsing, cleaning, and segmentation of various file formats (PDF, DOCX, TXT).
3.  **Embedding Service:** Transforms text chunks into high-dimensional vector embeddings for semantic understanding.
4.  **Vector Store (Pinecone):** Manages high-performance similarity search and retrieval of context.
5.  **Parent-Child Indexing Service:** Implements advanced indexing strategies (see below) to maximize retrieval quality.
6.  **Generation Service (Gemini):** leverages Google's state-of-the-art LLMs to synthesize answers using the retrieved context.

### Vector Storing Methods: Parent & Child Indexing

To overcome the limitations of standard chunking (where context can be lost), DocuMind employs a **Parent-Child Indexing** strategy:

- **Child Chunks:** Small, dense text segments responsible for high-accuracy semantic search and matching.
- **Parent Documents:** Larger context blocks linked to the child chunks.
- **Retrieval Logic:** When a child chunk matches a user's query, the system retrieves its corresponding **Parent Document**. This ensures the LLM receives full, coherent context rather than fragmented snippets, significantly improving answer quality.

## Key Features

- **Chat with Documents:** Upload PDFs, DOCX, or text files and ask questions in natural language.
- **Advanced RAG Engine:** Uses Gemini AI + Pinecone/Vector DB for high-precision context retrieval.
- **Secure Authentication:** Robust user management with unique user IDs and secure session handling.
- **Smart History:** Persistent chat sessions allowing you to revisit previous conversations.
- **Database Chat:** Special capability to query structured data using natural language (Text-to-SQL).
- **Responsive UI:** A modern, mobile-friendly interface built with React and Tailwind CSS.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, FastAPI
- **AI/LLM:** Google Gemini
- **Database:** MongoDB Atlas (Cloud)
- **Deployment:** Vercel (Frontend), Render (Backend)
