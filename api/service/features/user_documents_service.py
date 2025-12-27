import logging
from typing import List, Dict, Any
from datetime import datetime
from service.infrastructure.database_service import database_service

logger = logging.getLogger(__name__)

class UserDocumentsService:
    """Service for managing user-specific documents using MongoDB."""
    
    def __init__(self):
        # We don't need to load anything into memory anymore
        pass

    async def get_collection(self):
        """Helper to get the user_documents collection."""
        if database_service.db is None:
            await database_service.connect()
        return database_service.db.user_documents

    async def delete_document(self, username: str, filename: str) -> bool:
        """Delete a document by filename for a specific user."""
        try:
            collection = await self.get_collection()
            result = await collection.delete_one({"username": username, "filename": filename})
            
            if result.deleted_count > 0:
                logger.info(f"Deleted document '{filename}' for user {username}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False

    async def delete_documents(self, username: str, filenames: list) -> int:
        """Delete multiple documents by filename. Returns number deleted."""
        try:
            collection = await self.get_collection()
            result = await collection.delete_many({
                "username": username,
                "filename": {"$in": filenames}
            })
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            return 0
    
    async def add_document(self, username: str, title: str, filename: str, chunk_ids: List[str], parent_ids: List[str] = None, description: str = None) -> Dict[str, Any]:
        """Add a document entry for a specific user."""
        try:
            collection = await self.get_collection()
            
            document = {
                "username": username,
                "title": title,
                "filename": filename,
                "chunk_ids": chunk_ids,
                "parent_ids": parent_ids or [],
                "chunks": len(chunk_ids),
                "uploaded_at": datetime.now().isoformat(),
                "indexed": True
            }
            if description:
                document["description"] = description

            await collection.insert_one(document)
            
            # Remove _id for return
            document.pop("_id", None)
            
            logger.info(f"Added document '{title}' for user {username} to MongoDB")
            return document
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return {}
    
    async def get_user_documents(self, username: str) -> List[Dict[str, Any]]:
        """Get all documents for a specific user."""
        try:
            collection = await self.get_collection()
            cursor = collection.find({"username": username}).sort("uploaded_at", -1)
            
            documents = []
            async for doc in cursor:
                doc.pop("_id", None)
                documents.append(doc)
                
            return documents
        except Exception as e:
            logger.error(f"Error getting documents for {username}: {e}")
            return []
    
    async def get_all_user_chunk_ids(self, username: str) -> List[str]:
        """Get all chunk IDs for a user's documents."""
        try:
            docs = await self.get_user_documents(username)
            all_chunk_ids = []
            for doc in docs:
                all_chunk_ids.extend(doc.get("chunk_ids", []))
            return all_chunk_ids
        except Exception as e:
            logger.error(f"Error getting chunk IDs for {username}: {e}")
            return []

# Singleton instance
user_documents_service = UserDocumentsService()
