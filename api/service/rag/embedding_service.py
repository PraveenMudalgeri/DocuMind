from typing import List
from google import genai
from google.genai import types
from lib.config import settings
import logging
import time
import asyncio

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        """
        Initializes the Google Generative AI client for embeddings.
        Produces 768-dimensional vectors using gemini-embedding-001.
        """
        try:
            logger.info("Initializing Google Gemini Embedding Service...")
            self.client = genai.Client(api_key=settings.google_api_key)
            self.model_name = "gemini-embedding-001"
            self.output_dim = 768
            logger.info("Google Gemini Embedding Service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Google Gemini Embedding Service: {e}")
            self.client = None

    async def get_embedding(self, text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> List[float]:
        """
        Generates a 768-dimensional vector embedding for the given text using Google's gemini-embedding-001.
        """
        if not text or not isinstance(text, str):
            logger.warning("get_embedding called with empty or invalid text.")
            return []
        
        if not self.client:
            logger.error("Embedding client not initialized.")
            return []

        try:
            response = await self.client.aio.models.embed_content(
                model=self.model_name,
                contents=text,
                config=types.EmbedContentConfig(output_dimensionality=self.output_dim)
            )
            return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return []

    async def get_embeddings_batch(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        """
        Generate 768-dimensional embeddings for multiple texts efficiently using batch processing with Google's API.
        """
        if not texts:
            return []
            
        if not self.client:
            logger.error("Embedding client not initialized.")
            return []

        try:
            start_time = time.time()
            response = await self.client.aio.models.embed_content(
                model=self.model_name,
                contents=texts,
                config=types.EmbedContentConfig(output_dimensionality=self.output_dim)
            )
            embeddings = [item.values for item in response.embeddings]
            logger.info(f"Generated {len(embeddings)} embeddings using Google Gemini in {time.time() - start_time:.4f}s")
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            return []

# Singleton instance
embedding_service = EmbeddingService()
