from typing import List, Dict, Any, Optional
from lib.config import settings
import logging
import pinecone
from pinecone import Pinecone, ServerlessSpec
import os
import os

logger = logging.getLogger(__name__)

class PineconeService:
    """
    Service for interacting with Pinecone Vector Database.
    """
    def __init__(self):
        self.index = None
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "rag-index-384")
        self.dimension = settings.embedding_dim
        self.pc = None
        
        # Parent chunks are now managed by ParentChunksService (MongoDB)
        
    def initialize(self):
        """Initialize Pinecone client and connect to index."""
        try:
            api_key = settings.pinecone_api_key
            if not api_key:
                logger.warning("Pinecone API Key not found. Vector operations will fail.")
                return False

            self.pc = Pinecone(api_key=api_key)
            
            # Check if index exists, if not create it
            try:
                existing_indexes = [i.name for i in self.pc.list_indexes()]
            except Exception as e:
                logger.error(f"Failed to list Pinecone indexes: {e}")
                return False
            
            if self.index_name not in existing_indexes:
                logger.info(f"Index '{self.index_name}' not found. Creating new index...")
                try:
                    self.pc.create_index(
                        name=self.index_name,
                        dimension=self.dimension,
                        metric="cosine",
                        spec=ServerlessSpec(
                            cloud="aws",
                            region="us-east-1"
                        )
                    )
                    logger.info(f"Created Pinecone index: {self.index_name}")
                except Exception as e:
                    logger.error(f"Failed to create index: {e}")
                    return False

            self.index = self.pc.Index(self.index_name)
            logger.info(f"Successfully connected to Pinecone index: {self.index_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone client: {e}")
            return False

    async def upsert_vectors(self, vectors: List[Dict[str, Any]]) -> bool:
        """
        Upserts vectors to Pinecone.
        vectors format: [{'id': 'vec1', 'values': [0.1, ...], 'metadata': {...}}, ...]
        """
        if not self.index:
            logger.error("Pinecone index not initialized.")
            return False
            
        try:
            # Pinecone upsert accepts list of tuples or dicts
            # We already have the correct structure, but let's be safe via batching
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)
            
            logger.info(f"Upserted {len(vectors)} vectors to Pinecone.")
            return True
        except Exception as e:
            logger.error(f"Failed to upsert vectors to Pinecone: {e}")
            return False

    async def query_vectors(self, query_vector: List[float], top_k: int = 5, username: str = None, documents: List[str] = None) -> List[Dict[str, Any]]:
        """
        Query Pinecone index.
        """
        if not self.index:
            logger.warning("Pinecone index not initialized.")
            return []
            
        try:
            # Build filter
            filter_dict = {}
            if username:
                filter_dict['username'] = username
            if documents:
                filter_dict['source_filename'] = {"$in": documents}
            
            # If no filters, pass None (Pinecone client handles empty dict, but explicit is better)
            metadata_filter = filter_dict if filter_dict else None

            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                filter=metadata_filter
            )
            
            # Identify matches
            matches = results.get('matches', [])
            
            # Format results to match our internal schema
            formatted_results = []
            for match in matches:
                formatted_results.append({
                    'id': match['id'],
                    'score': match['score'],
                    'metadata': match.get('metadata', {})
                })
                
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to query Pinecone: {e}")
            return []

    async def get_parent_ids_from_chunks(self, chunk_ids: list) -> list:
        """Fetch parent IDs from chunk vectors before deletion."""
        if not self.index:
            return []
        
        if not chunk_ids:
            return []
        
        try:
            parent_ids = set()
            # Fetch vectors in batches to get their metadata
            batch_size = 100
            for i in range(0, len(chunk_ids), batch_size):
                batch = chunk_ids[i:i + batch_size]
                
                # Fetch vectors by ID
                fetch_response = self.index.fetch(ids=batch)
                
                # Extract parent_id from metadata
                for vector_id, vector_data in fetch_response.get('vectors', {}).items():
                    metadata = vector_data.get('metadata', {})
                    parent_id = metadata.get('parent_id')
                    if parent_id:
                        parent_ids.add(parent_id)
            
            logger.info(f"Found {len(parent_ids)} unique parent IDs from {len(chunk_ids)} chunks")
            return list(parent_ids)
        except Exception as e:
            logger.error(f"Failed to fetch parent IDs from Pinecone: {e}")
            return []

    async def delete_vectors_by_chunk_ids(self, chunk_ids: list) -> int:
        """Delete vectors by their IDs."""
        if not self.index:
            return 0
        
        if not chunk_ids:
            return 0
            
        try:
            # Pinecone delete by ids
            # Batching deletes if necessary (Pinecone handles large lists well, but 1000 limit is safe)
            batch_size = 1000
            for i in range(0, len(chunk_ids), batch_size):
                batch = chunk_ids[i:i + batch_size]
                self.index.delete(ids=batch)
                
            logger.info(f"Deleted {len(chunk_ids)} vectors from Pinecone.")
            return len(chunk_ids)
        except Exception as e:
            logger.error(f"Failed to delete vectors from Pinecone: {e}")
            return 0

# Singleton instance
pinecone_service = PineconeService()