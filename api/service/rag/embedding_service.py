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
                config=types.EmbedContentConfig(
                    output_dimensionality=self.output_dim,
                    task_type=task_type
                )
            )
            return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return []

    async def get_embeddings_batch(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT", batch_size: int = 50) -> List[List[float]]:
        """
        Generate 768-dimensional embeddings for multiple texts with rate limiting.
        Processes in smaller batches to avoid hitting API quota limits (100 req/min for free tier).
        
        Args:
            texts: List of texts to embed
            task_type: Type of embedding task
            batch_size: Number of texts per batch (default 50 to stay under 100/min limit)
        
        Returns:
            List of embeddings, with empty list for failed items
        """
        if not texts:
            return []
            
        if not self.client:
            logger.error("Embedding client not initialized.")
            return []

        all_embeddings = []
        total_batches = (len(texts) + batch_size - 1) // batch_size
        
        logger.info(f"Processing {len(texts)} texts in {total_batches} batches of {batch_size}")
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            try:
                start_time = time.time()
                response = await self.client.aio.models.embed_content(
                    model=self.model_name,
                    contents=batch,
                    config=types.EmbedContentConfig(
                        output_dimensionality=self.output_dim,
                        task_type=task_type
                    )
                )
                embeddings = [item.values for item in response.embeddings]
                all_embeddings.extend(embeddings)
                
                elapsed = time.time() - start_time
                logger.info(f"Batch {batch_num}/{total_batches}: Generated {len(embeddings)} embeddings in {elapsed:.2f}s")
                
                # Rate limiting: Wait to avoid hitting 100 requests/minute
                # If we processed a batch in < 0.6s, wait to maintain ~100 req/min
                if batch_num < total_batches and elapsed < 0.6:
                    wait_time = 0.6 - elapsed
                    logger.debug(f"Rate limiting: waiting {wait_time:.2f}s before next batch")
                    await asyncio.sleep(wait_time)
                    
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Batch {batch_num}/{total_batches} failed: {error_msg}")
                
                # Check if it's a rate limit error
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    logger.warning(f"Rate limit hit, waiting 60s before retry...")
                    await asyncio.sleep(60)
                    
                    # Retry this batch once
                    try:
                        response = await self.client.aio.models.embed_content(
                            model=self.model_name,
                            contents=batch,
                            config=types.EmbedContentConfig(
                                output_dimensionality=self.output_dim,
                                task_type=task_type
                            )
                        )
                        embeddings = [item.values for item in response.embeddings]
                        all_embeddings.extend(embeddings)
                        logger.info(f"Batch {batch_num} retry succeeded: {len(embeddings)} embeddings")
                    except Exception as retry_error:
                        logger.error(f"Batch {batch_num} retry failed: {retry_error}")
                        # Add empty embeddings for failed batch
                        all_embeddings.extend([[] for _ in batch])
                else:
                    # Add empty embeddings for failed batch
                    all_embeddings.extend([[] for _ in batch])
        
        success_count = sum(1 for emb in all_embeddings if len(emb) > 0)
        logger.info(f"Batch processing complete: {success_count}/{len(texts)} embeddings generated successfully")
        return all_embeddings


# Singleton instance
embedding_service = EmbeddingService()
