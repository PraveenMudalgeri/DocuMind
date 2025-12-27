from typing import List, Dict, Any
from lib.config import settings
import logging
import asyncio
import time
from datetime import datetime, timedelta
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)

# Constants for model names
GENERATIVE_MODEL_NAME = "gemini-2.5-flash"  # A fast and capable model for generation/reranking
EMBEDDING_MODEL_NAME = "models/embedding-001" # The standard text embedding model

class GeminiService:
    def __init__(self):
        self.generative_model = None
        # Safety settings to configure what content is blocked.
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        # Rate limiting
        self.last_embedding_call = 0
        self.embedding_call_count = 0
        self.daily_call_count = 0
        self.last_reset_date = datetime.now().date()
        self.quota_exceeded = False
        self.quota_reset_time = None

    async def generate_description(self, content: str, title: str = None) -> str:
        """
        Generates a short description or summary for a document using Gemini.
        """
        if not content or not isinstance(content, str):
            return "No description available."
        prompt = (
            f"Summarize the following document in 1-2 sentences for a user-facing description. "
            f"Be concise and clear.\n\n"
            f"Title: {title or ''}\n"
            f"Content: {content[:2000]}"
        )
        try:
            desc = await self.generate_answer(prompt)
            return desc.strip()
        except Exception as e:
            logger.error(f"Failed to generate description: {e}")
            return "No description available."
        
    async def initialize_gemini(self):
        """Initializes the Google Generative AI client."""
        try:
            genai.configure(api_key=settings.google_api_key)
            self.generative_model = genai.GenerativeModel(
                model_name=GENERATIVE_MODEL_NAME,
                safety_settings=self.safety_settings
            )
            logger.info("Google Gemini service initialized successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            return False
    
    async def get_embedding(self, text: str, task_type="RETRIEVAL_DOCUMENT") -> List[float]:
        """
        Generates a vector embedding for the given text with rate limiting and quota handling.
        task_type can be: "RETRIEVAL_QUERY", "RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", etc.
        """
        if not text or not isinstance(text, str):
            logger.warning("get_embedding called with empty or invalid text.")
            return []
        
        # Check if quota is exceeded and if we should try again
        if self.quota_exceeded:
            if self.quota_reset_time and datetime.now() < self.quota_reset_time:
                logger.warning(f"Quota exceeded. Skipping embedding until {self.quota_reset_time}")
                return self._get_fallback_embedding(text)
            else:
                # Reset quota flag after 24 hours
                self.quota_exceeded = False
                self.quota_reset_time = None
        
        # Reset daily counter if it's a new day
        today = datetime.now().date()
        if today != self.last_reset_date:
            self.daily_call_count = 0
            self.embedding_call_count = 0
            self.last_reset_date = today
            
        # Rate limiting: Max 15 calls per minute (conservative)
        current_time = time.time()
        if current_time - self.last_embedding_call < 4:  # 4 seconds between calls
            logger.info("Rate limiting: waiting before next embedding call")
            await asyncio.sleep(4 - (current_time - self.last_embedding_call))
            
        try:
            # The genai library's async support is still developing,
            # so we run the synchronous SDK call in a thread pool to avoid blocking.
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(
                None,  # Use the default thread pool executor
                lambda: genai.embed_content(
                    model=EMBEDDING_MODEL_NAME,
                    content=text,
                    task_type=task_type
                )
            )
            
            self.last_embedding_call = time.time()
            self.embedding_call_count += 1
            self.daily_call_count += 1
            
            return result.get('embedding', [])
            
        except Exception as e:
            error_str = str(e)
            if "quota" in error_str.lower() or "429" in error_str:
                logger.error(f"Quota exceeded for Gemini embeddings. Setting quota flag for 1 hour.")
                self.quota_exceeded = True
                # Set reset time to 1 hour from now for safety, or next day
                self.quota_reset_time = datetime.now() + timedelta(hours=1)
                return self._get_fallback_embedding(text)
            else:
                logger.error(f"Failed to get embedding for text: '{text[:100]}...': {e}")
                return []
    
    def _get_fallback_embedding(self, text: str) -> List[float]:
        """
        Generate a simple fallback embedding when API is unavailable.
        This is a basic hash-based approach for development purposes.
        """
        import hashlib
        
        try:
            # Simple hash-based embedding (768 dimensions to match Google's model)
            hash_obj = hashlib.sha256(text.encode())
            hash_bytes = hash_obj.digest()
            
            # Convert to 768-dimensional vector
            embedding = []
            for i in range(768):
                byte_index = i % len(hash_bytes)
                # Normalize to [-1, 1] range
                normalized_value = (hash_bytes[byte_index] / 255.0) * 2 - 1
                embedding.append(normalized_value)
                
            logger.info(f"Using fallback embedding for text: '{text[:50]}...'")
            return embedding
        except Exception as e:
            logger.error(f"Failed to generate fallback embedding: {e}")
            # Return a basic zero vector as last resort
            return [0.0] * 768
    
    async def generate_answer(self, prompt: str) -> str:
        """Generates a text response based on a prompt using an async call."""
        if not self.generative_model:
            logger.error("Gemini model not initialized.")
            return "Sorry, the generation service is not available."
            
        try:
            response = await self.generative_model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            return "Sorry, I couldn't generate an answer at this time."

    async def rerank_documents(self, query: str, documents: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Enhanced document reranking with relevance scoring.
        Uses the LLM to assess semantic relevance and provide numerical scores.
        Returns documents sorted by relevance with attached scores.
        """
        if not documents:
            return []
        
        # Limit to reasonable number for reranking (LLM context limits)
        docs_to_rank = documents[:20]  # Only rerank top 20 to avoid context overload
        
        # Create a numbered list of document contents
        doc_texts = []
        for i, doc in enumerate(docs_to_rank, 1):
            content = doc.get("metadata", {}).get("content", "")
            # Truncate very long documents to fit in context
            if len(content) > 500:
                content = content[:500] + "..."
            doc_texts.append(f"[{i}] {content}")
        
        # Enhanced prompt for scoring and ranking
        prompt = f"""You are an expert at evaluating document relevance. Rate each document's relevance to the query on a scale of 0-100.

Query: "{query}"

Documents:
{chr(10).join(doc_texts)}

For each document, provide:
1. Document number
2. Relevance score (0-100)
3. Brief reason (one line)

Format: [doc_number]: [score] - [reason]

Example:
[3]: 95 - Directly answers the question with specific details
[1]: 70 - Provides related context but not the main answer
[2]: 30 - Only tangentially related

Your assessment:"""

        try:
            response_text = await self.generate_answer(prompt)
            
            # Parse the response to extract scores
            scored_docs = []
            for line in response_text.strip().split('\n'):
                line = line.strip()
                if not line or not line.startswith('['):
                    continue
                
                try:
                    # Parse format: [3]: 95 - Reason
                    parts = line.split(']:', 1)
                    if len(parts) != 2:
                        continue
                    
                    doc_num = int(parts[0].strip('[').strip())
                    score_part = parts[1].strip().split('-', 1)[0].strip()
                    score = int(score_part)
                    
                    # Validate
                    if 1 <= doc_num <= len(docs_to_rank) and 0 <= score <= 100:
                        scored_docs.append((doc_num - 1, score))  # Convert to 0-based index
                except (ValueError, IndexError) as e:
                    logger.debug(f"Skipping unparseable line: {line}")
                    continue
            
            # If parsing succeeded, sort by scores
            if scored_docs:
                # Sort by score (descending)
                scored_docs.sort(key=lambda x: x[1], reverse=True)
                
                # Build reranked list with scores
                reranked = []
                for doc_idx, score in scored_docs[:top_n]:
                    if 0 <= doc_idx < len(docs_to_rank):
                        doc = dict(docs_to_rank[doc_idx])
                        # Normalize score to 0-1 range
                        doc['score'] = score / 100.0
                        reranked.append(doc)
                
                # Add any remaining docs not scored (shouldn't happen, but safety)
                scored_indices = {idx for idx, _ in scored_docs}
                for i, doc in enumerate(docs_to_rank):
                    if i not in scored_indices:
                        doc_copy = dict(doc)
                        doc_copy['score'] = 0.3  # Low default score
                        reranked.append(doc_copy)
                
                logger.info(f"Successfully reranked {len(scored_docs)} documents with scores")
                return reranked[:top_n]
            else:
                # Fallback: if parsing failed, try simple ordering
                logger.warning("Score parsing failed, attempting simple ordering fallback")
                return await self._fallback_rerank(query, docs_to_rank, response_text, top_n)

        except Exception as e:
            logger.error(f"Failed to rerank documents: {e}. Returning original order with default scores.")
            # Return original order with neutral scores
            return [dict(doc, score=0.5) for doc in docs_to_rank[:top_n]]
    
    async def _fallback_rerank(self, query: str, documents: List[Dict[str, Any]], llm_response: str, top_n: int) -> List[Dict[str, Any]]:
        """
        Fallback reranking when score parsing fails.
        Tries to extract document ordering from LLM response.
        """
        try:
            # Try to find numbers in the response
            import re
            numbers = re.findall(r'\[(\d+)\]', llm_response)
            if numbers:
                ordered_indices = [int(n) - 1 for n in numbers if n.isdigit()]
                
                reranked = []
                for idx in ordered_indices:
                    if 0 <= idx < len(documents):
                        doc = dict(documents[idx])
                        # Assign scores based on position (first = highest)
                        position_score = 1.0 - (len(reranked) * 0.1)
                        doc['score'] = max(0.3, position_score)
                        reranked.append(doc)
                
                # Add missing docs
                seen_indices = set(ordered_indices)
                for i, doc in enumerate(documents):
                    if i not in seen_indices:
                        doc_copy = dict(doc)
                        doc_copy['score'] = 0.3
                        reranked.append(doc_copy)
                
                logger.info(f"Fallback reranking extracted {len(ordered_indices)} ordered documents")
                return reranked[:top_n]
        except Exception as e:
            logger.error(f"Fallback reranking also failed: {e}")
        
        # Ultimate fallback: original order with decreasing scores
        return [dict(doc, score=max(0.3, 0.9 - i*0.1)) for i, doc in enumerate(documents[:top_n])]

# Singleton instance
gemini_service = GeminiService()