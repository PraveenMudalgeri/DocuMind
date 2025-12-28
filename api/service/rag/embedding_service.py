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

        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries):
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
                error_msg = str(e)
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    if attempt < max_retries - 1:
                        wait_time = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limit hit in get_embedding. Waiting {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                
                logger.error(f"Failed to generate embedding (Attempt {attempt+1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    return []

    async def get_embeddings_batch(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT", batch_size: int = 20) -> List[List[float]]:
        """
        Generate 768-dimensional embeddings for multiple texts with robust rate limiting.
        Processes in batches to strictly adhere to API quota limits.
        
        Args:
            texts: List of texts to embed
            task_type: Type of embedding task
            batch_size: Number of texts per batch (default 20, adjusted for conservative rate limiting)
        
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
            
            # exponential backoff parameters
            max_retries = 5
            base_delay = 5
            
            batch_success = False
            
            for attempt in range(max_retries):
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
                    
                    # Verify we got the right number of embeddings
                    if len(embeddings) != len(batch):
                        logger.warning(f"Batch {batch_num} returned {len(embeddings)} embeddings, expected {len(batch)}. Retrying...")
                        raise ValueError("Incomplete batch response")

                    all_embeddings.extend(embeddings)
                    batch_success = True
                    
                    elapsed = time.time() - start_time
                    logger.info(f"Batch {batch_num}/{total_batches}: Generated {len(embeddings)} embeddings in {elapsed:.2f}s")
                    
                    # Rate limiting: Assume each ITEM counts as a request (worst case)
                    # Limit is 100 req/min => ~1.6 req/sec. Safe target: 1.5 req/sec.
                    # Time needed for N items = N / 1.5 seconds.
                    time_needed = len(batch) / 1.5
                    if elapsed < time_needed:
                        wait_time = time_needed - elapsed
                        logger.debug(f"Rate limiting: waiting {wait_time:.2f}s before next batch to maintain quota")
                        await asyncio.sleep(wait_time)
                    
                    break # Success, exit retry loop
                    
                except Exception as e:
                    error_msg = str(e)
                    
                    # Check if it's a rate limit error
                    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                        wait_time = base_delay * (2 ** attempt)  # 5, 10, 20, 40, 80
                        # Cap at 60s
                        if wait_time > 60: wait_time = 60
                        
                        logger.warning(f"Batch {batch_num} rate limited (Attempt {attempt+1}/{max_retries}). Waiting {wait_time}s...")
                        await asyncio.sleep(wait_time)
                    else:
                        logger.error(f"Batch {batch_num} failed (Attempt {attempt+1}/{max_retries}): {error_msg}")
                        await asyncio.sleep(2) # Short wait for other errors
            
            if not batch_success:
                logger.error(f"Batch {batch_num} failed after {max_retries} retries.")
                # Add empty embeddings for failed batch to keep alignment
                all_embeddings.extend([[] for _ in batch])
        
        success_count = sum(1 for emb in all_embeddings if len(emb) > 0)
        logger.info(f"Batch processing complete: {success_count}/{len(texts)} embeddings generated successfully")
        return all_embeddings


# Singleton instance
embedding_service = EmbeddingService()
