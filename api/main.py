import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Import routers and services ---
from routes.auth import router as auth_router
from routes.rag import router as rag_router
from routes.chat import router as chat_router
from routes.export import router as export_router
from routes.speech import router as speech_router
from routes.query_routes import router as query_router
from service.infrastructure.database_service import database_service

# --- Logging configuration ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# --- Lifespan context manager for startup/shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events.
    Only connects to database on startup to avoid serverless cold-start failures.
    """
    logger.info("Starting DocuMind API...")
    
    # Connect to MongoDB
    try:
        await database_service.connect()
        logger.info("Connected to MongoDB.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}. Check DATABASE_URL environment variable.")

    yield  # Application is running

    # Shutdown
    logger.info("Shutting down DocuMind API...")
    await database_service.close()
    logger.info("MongoDB connection closed.")

# --- FastAPI application ---
app = FastAPI(
    title="DocuMind API",
    description="Modular RAG backend with JWT auth, MongoDB, and Pinecone",
    version="1.0.0",
    lifespan=lifespan
)

# --- CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health check endpoints ---
@app.get("/")
async def root():
    return {"message": "DocuMind API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "DocuMind API"}

# --- Include API routers ---
app.include_router(auth_router)
app.include_router(rag_router)
app.include_router(chat_router)
app.include_router(export_router)
app.include_router(speech_router)
app.include_router(query_router)

# --- Main entry point for local development ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
