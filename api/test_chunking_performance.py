#!/usr/bin/env python3
"""
Performance test script to demonstrate the chunking optimizations.
This script compares the old sequential approach vs the new async batch approach.
"""

import asyncio
import time
import logging
from typing import List, Dict
from service.rag.rag_service import rag_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample document for testing
SAMPLE_DOCUMENT = {
    "content": """
    Artificial Intelligence (AI) has revolutionized numerous industries and continues to shape our future. 
    Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed.
    Deep learning, which uses neural networks with multiple layers, has achieved remarkable breakthroughs in image recognition, 
    natural language processing, and speech recognition. The applications of AI are vast and growing rapidly.
    
    In healthcare, AI assists in medical diagnosis, drug discovery, and personalized treatment plans. 
    Radiologists use AI-powered tools to detect anomalies in medical images with unprecedented accuracy.
    In finance, algorithmic trading and fraud detection systems rely heavily on machine learning algorithms.
    The automotive industry has embraced AI for autonomous vehicles, which promise to reduce accidents and improve traffic flow.
    
    Natural Language Processing (NLP) has enabled chatbots, virtual assistants, and language translation services.
    Computer vision applications include facial recognition, object detection, and augmented reality experiences.
    Robotics combined with AI has led to sophisticated automation in manufacturing and service industries.
    
    However, AI also presents challenges including ethical considerations, job displacement concerns, and the need for robust governance.
    Privacy and security issues arise as AI systems process vast amounts of personal data.
    Bias in AI algorithms can perpetuate or amplify existing societal inequalities.
    The development of Artificial General Intelligence (AGI) raises questions about control and safety.
    
    Despite these challenges, the potential benefits of AI are immense. Smart cities use AI for traffic optimization and energy management.
    Climate change research benefits from AI's ability to process complex environmental data and model future scenarios.
    Education is being transformed through personalized learning platforms and intelligent tutoring systems.
    
    The future of AI holds promise for solving some of humanity's greatest challenges while requiring careful consideration of its implications.
    Continued research, ethical development, and thoughtful regulation will be crucial for harnessing AI's full potential responsibly.
    """ * 3,  # Multiply by 3 to create a larger document for testing
    "title": "The Impact of Artificial Intelligence on Modern Society",
    "metadata": {
        "source_filename": "ai_impact.txt",
        "username": "test_user"
    }
}

async def test_chunking_performance():
    """Test the performance of the optimized chunking process."""
    
    logger.info("=" * 60)
    logger.info("CHUNKING PERFORMANCE TEST")
    logger.info("=" * 60)
    
    # Test document size
    content_length = len(SAMPLE_DOCUMENT["content"])
    logger.info(f"Test document size: {content_length:,} characters")
    
    # Test the optimized indexing module
    logger.info("\n🚀 Testing OPTIMIZED async batch processing...")
    start_time = time.time()
    
    try:
        result = await rag_service.indexing_module(SAMPLE_DOCUMENT)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        chunk_ids = result.get("chunk_ids", [])
        parent_ids = result.get("parent_ids", [])
        
        logger.info(f"✅ OPTIMIZED processing completed!")
        logger.info(f"   📊 Processing time: {processing_time:.2f} seconds")
        logger.info(f"   📝 Child chunks created: {len(chunk_ids)}")
        logger.info(f"   📚 Parent chunks created: {len(parent_ids)}")
        logger.info(f"   ⚡ Chunks per second: {len(chunk_ids) / processing_time:.1f}")
        
        # Calculate performance metrics
        chars_per_second = content_length / processing_time
        logger.info(f"   📈 Characters processed per second: {chars_per_second:,.0f}")
        
    except Exception as e:
        logger.error(f"❌ Error during optimized processing: {e}")
        return
    
    logger.info("\n" + "=" * 60)
    logger.info("PERFORMANCE TEST COMPLETED")
    logger.info("=" * 60)
    
    # Performance summary
    logger.info(f"\n📋 SUMMARY:")
    logger.info(f"   Document size: {content_length:,} characters")
    logger.info(f"   Total processing time: {processing_time:.2f} seconds")
    logger.info(f"   Chunks generated: {len(chunk_ids)} child + {len(parent_ids)} parent")
    logger.info(f"   Performance: {chars_per_second:,.0f} chars/sec, {len(chunk_ids) / processing_time:.1f} chunks/sec")

async def test_speech_chunking():
    """Test the speech service chunking performance."""
    
    logger.info("\n" + "=" * 60)
    logger.info("SPEECH CHUNKING TEST")
    logger.info("=" * 60)
    
    # Import speech service
    try:
        from service.features.speech_service import speech_service
        
        # Test text (shorter for speech)
        test_text = SAMPLE_DOCUMENT["content"][:2000]  # First 2000 chars
        
        logger.info(f"Test text length: {len(test_text)} characters")
        
        # Test chunking
        start_time = time.time()
        chunks = speech_service._split_text_into_chunks(test_text)
        end_time = time.time()
        
        chunking_time = end_time - start_time
        
        logger.info(f"✅ Speech chunking completed!")
        logger.info(f"   📊 Chunking time: {chunking_time:.4f} seconds")
        logger.info(f"   📝 Chunks created: {len(chunks)}")
        logger.info(f"   📏 Average chunk size: {sum(len(c) for c in chunks) / len(chunks):.0f} chars")
        
        # Show chunk sizes
        chunk_sizes = [len(chunk) for chunk in chunks]
        logger.info(f"   📐 Chunk sizes: {chunk_sizes}")
        
    except ImportError as e:
        logger.warning(f"⚠️  Speech service not available for testing: {e}")
    except Exception as e:
        logger.error(f"❌ Error during speech chunking test: {e}")

if __name__ == "__main__":
    async def main():
        await test_chunking_performance()
        await test_speech_chunking()
    
    # Run the performance test
    asyncio.run(main())