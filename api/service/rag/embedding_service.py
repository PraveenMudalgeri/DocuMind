from typing import List
from fastembed import TextEmbedding
from lib.config import settings
import logging
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        # Using BAAI/bge-base-en-v1.5 which provides better quality embeddings
        # Produces 768-dimensional vectors
        try:
            logger.info("Initializing FastEmbed with model: BAAI/bge-base-en-v1.5")
            self.model = TextEmbedding(model_name="BAAI/bge-base-en-v1.5")
            logger.info("FastEmbed initialized successfully.")
            
            # Thread pool for CPU-intensive embedding operations
            self.executor = ThreadPoolExecutor(max_workers=4)
        except Exception as e:
            logger.error(f"Failed to initialize FastEmbed: {e}")
            self.model = None
            self.executor = None

    async def get_embedding(self, text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> List[float]:
        """
        Generates a vector embedding for the given text using local FastEmbed model.
        Now runs in a thread pool to avoid blocking the event loop.
        """
        if not text or not isinstance(text, str):
            logger.warning("get_embedding called with empty or invalid text.")
            return []
        
        if not self.model or not self.executor:
            logger.error("Embedding model or executor not initialized.")
            return []

        try:
            # Run embedding generation in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            embedding = await loop.run_in_executor(
                self.executor, 
                self._generate_embedding_sync, 
                text
            )
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return []

    def _generate_embedding_sync(self, text: str) -> List[float]:
        """
        Synchronous embedding generation to be run in thread pool.
        """
        try:
            start_time = time.time()
            embeddings_generator = self.model.embed([text])
            embedding = list(embeddings_generator)[0].tolist()
            
            # Only log timing for debugging if needed
            # logger.debug(f"Generated embedding in {time.time() - start_time:.4f}s")
            return embedding
            
        except Exception as e:
            logger.error(f"Sync embedding generation failed: {e}")
            return []

    async def get_embeddings_batch(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        """
        Generate embeddings for multiple texts efficiently using batch processing.
        
        Args:
            texts: List of text strings to embed
            task_type: Type of embedding task
            
        Returns:
            List of embeddings corresponding to input texts
        """
        if not texts:
            return []
            
        if not self.model or not self.executor:
            logger.error("Embedding model or executor not initialized.")
            return []

        try:
            # Run batch embedding generation in thread pool
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                self.executor, 
                self._generate_embeddings_batch_sync, 
                texts
            )
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            return []

    def _generate_embeddings_batch_sync(self, texts: List[str]) -> List[List[float]]:
        """
        Synchronous batch embedding generation to be run in thread pool.
        """
        try:
            start_time = time.time()
            embeddings_generator = self.model.embed(texts)
            embeddings = [embedding.tolist() for embedding in embeddings_generator]
            
            logger.info(f"Generated {len(embeddings)} embeddings in {time.time() - start_time:.4f}s")
            return embeddings
            
        except Exception as e:
            logger.error(f"Sync batch embedding generation failed: {e}")
            return []

# Singleton instance
embedding_service = EmbeddingService()
