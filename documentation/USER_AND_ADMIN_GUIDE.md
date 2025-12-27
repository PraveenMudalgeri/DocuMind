# Modular RAG System - User & Operations Guide

## 1. Getting Started
To run the application locally:
1. Ensure `bun` and `uv` are installed.
2. Run `./run_app.sh` from the project root.
3. Access the frontend at `http://localhost:5173`.

## 2. Response Styles
Customize how the AI answers your questions using the "Response Style" dropdown:
- ⚡ **Auto (Recommended)**: Automatically detects intent (e.g., "explain" vs "briefly").
- ≡ **Detailed**: Comprehensive 3-5 paragraph answers with examples.
- ≣ **Balanced**: Clear 2-3 paragraph explanations.
- ≡ **Concise**: Direct 1-2 paragraph answers for quick lookups.

## 3. Database Chat (Text-to-SQL)
Query your databases using natural language:
- **Connection**: Use the "Quick Templates" or enter a connection string (e.g., `sqlite:///../test_ecommerce.db`).
- **Schema**: View your table structures directly in the UI.
- **Export**: Results can be exported to **CSV** or **JSON**.

## 4. Document Management
- **Upload**: Supports PDF, DOCX, TXT, HTML, and Markdown.
- **Indexing**: Files are automatically chunked and indexed on upload.
- **Filtering**: You can specify which documents the AI should use as research material.

## 5. Troubleshooting: Resetting the Index
If the search index becomes corrupted (e.g., "Invalid index" error), follow these steps:
1. Stop the backend server (Ctrl+C).
2. Run: `rm -rf data/faiss_index.bin data/metadata_store.json data/parent_chunks.json`
3. Restart with `./run_app.sh` and re-upload your documents.

## 6. UI Enhancements
- **Markdown**: Answers feature bold headers, bullet points, and code blocks for readability.
- **Voice**: Built-in Text-to-Speech (TTS) for natural voice interaction.
- **Mobile**: Specialized mobile header with individual chat deletion.

---
*Created: December 2025*
