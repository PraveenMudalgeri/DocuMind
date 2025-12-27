import logging
from typing import List, Dict, Any, Optional
from service.infrastructure.database_service import database_service

logger = logging.getLogger(__name__)

class ParentChunksService:
    """Service for managing parent chunks using MongoDB."""
    
    def __init__(self):
        pass

    async def get_collection(self):
        if database_service.db is None:
            await database_service.connect()
        return database_service.db.parent_chunks
    
    async def store_parent_chunks(self, parent_chunks: List[Dict[str, Any]]) -> bool:
        """Store parent chunks in MongoDB."""
        try:
            if not parent_chunks:
                return True
                
            collection = await self.get_collection()
            
            # Use chunks id as _id for deduplication
            ops = []
            for chunk in parent_chunks:
                # Ensure we don't duplicate
                chunk_data = chunk.copy()
                chunk_id = chunk_data.get("id")
                if not chunk_id:
                    continue
                    
                # We can use update_one with upsert=True to avoid duplicates
                # Or insert_many with ordered=False and ignore duplicate key errors
                # Given the scale, loop with explicit upsert is safer for now.
                # For bulk performance, we could use bulk_write, but let's keep it simple for now.
                
                # Check if exists first? No, upsert is better.
                await collection.update_one(
                    {"id": chunk_id},
                    {"$set": chunk_data},
                    upsert=True
                )
                
            logger.info(f"Stored {len(parent_chunks)} parent chunks in MongoDB")
            return True
        except Exception as e:
            logger.error(f"Error storing parent chunks: {e}")
            return False

    async def fetch_parent_chunks(self, parent_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Retrieve parent chunks from MongoDB by their IDs."""
        try:
            if not parent_ids:
                return {}
                
            collection = await self.get_collection()
            cursor = collection.find({"id": {"$in": parent_ids}})
            
            chunks = {}
            async for chunk in cursor:
                chunk.pop("_id", None)
                chunks[chunk["id"]] = chunk
            
            return chunks
        except Exception as e:
            logger.error(f"Error fetching parent chunks: {e}")
            return {}
    
    async def delete_parent_chunks(self, parent_ids: List[str]) -> int:
        """Delete parent chunks from MongoDB by their IDs."""
        try:
            if not parent_ids:
                return 0
                
            collection = await self.get_collection()
            result = await collection.delete_many({"id": {"$in": parent_ids}})
            
            deleted_count = result.deleted_count
            logger.info(f"Deleted {deleted_count} parent chunks from MongoDB")
            return deleted_count
        except Exception as e:
            logger.error(f"Error deleting parent chunks: {e}")
            return 0

# Singleton instance
parent_chunks_service = ParentChunksService()
