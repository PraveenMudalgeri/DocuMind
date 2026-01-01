from typing import List, Dict, Any, Optional
from lib.config import settings
import logging
import asyncio
from datetime import datetime

from groq import AsyncGroq
from service.monitoring.usage_tracker import usage_tracker

logger = logging.getLogger(__name__)

# Constants for model names
GENERATIVE_MODEL_NAME = "llama-3.3-70b-versatile"

class GroqService:
    def __init__(self):
        self._client: Optional[AsyncGroq] = None

    def _get_client(self, api_key: str = None) -> Optional[AsyncGroq]:
        """
        Get a Groq client instance. 
        Prioritizes the provided api_key, falls back to settings.groq_api_key.
        """
        key = api_key or settings.groq_api_key
        if not key:
            logger.warning("No Groq API key provided or found in settings.")
            return None
        
        # In a real scenario, we might want to cache the client if the key is the same.
        # But for request-scoped keys, creating a new client is safer.
        return AsyncGroq(api_key=key)

    async def generate_description(self, content: str, title: str = None, api_key: str = None) -> str:
        """
        Generates a short description or summary for a document using Groq.
        """
        if not content or not isinstance(content, str):
            return "No description available."
            
        client = self._get_client(api_key)
        if not client:
             return "No description available (API Key missing)."

        prompt = (
            f"Summarize the following document in 1-2 sentences for a user-facing description. "
            f"Be concise and clear.\n\n"
            f"Title: {title or ''}\n"
            f"Content: {content[:2000]}"
        )
        try:
            usage_tracker.increment()
            response = await client.chat.completions.create(
                model=GENERATIVE_MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes documents concisely."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Failed to generate description: {e}")
            return "No description available."
            
    async def generate_chat_title(self, query: str, api_key: str = None) -> str:
        """
        Generates a simple, short title for a chat session based on the first query.
        """
        if not query or not isinstance(query, str):
            return "New Chat"
            
        client = self._get_client(api_key)
        if not client:
            return "New Chat"
        
        # Use Groq to generate a creative and concise title
        prompt = (
            f"Generate a very short, concise title (max 4-5 words) for a chat session that starts with this user query: "
            f"'{query}'\n\n"
            f"Title:"
        )
        try:
            usage_tracker.increment()
            response = await client.chat.completions.create(
                model=GENERATIVE_MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates short titles."},
                    {"role": "user", "content": prompt}
                ]
            )
            title = response.choices[0].message.content.strip()
            # Clean up the title (remove quotes, extra whitespace)
            title = title.strip().strip('"').strip("'")
            return title if len(title) <= 50 else title[:47] + "..."
        except Exception as e:
            logger.error(f"Failed to generate chat title: {e}")
            return "New Chat"
        
    async def generate_answer(self, prompt: str, api_key: str = None) -> str:
        """Generates a text response based on a prompt using an async call."""
        client = self._get_client(api_key)
        if not client:
            logger.error("Groq client could not be initialized (Missing Key).")
            return "Sorry, the generation service is not available (Missing API Key)."
            
        try:
            usage_tracker.increment()
            response = await client.chat.completions.create(
                model=GENERATIVE_MODEL_NAME,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            return "Sorry, I couldn't generate an answer at this time."

# Singleton instance
groq_service = GroqService()
