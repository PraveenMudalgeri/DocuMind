from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any
from pydantic import BaseModel
from typing import List, Optional

from service.infrastructure.auth_service import get_current_user
from service.features.pdf_export_service import pdf_export_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/export", tags=["export"])

class ExportPDFRequest(BaseModel):
    query: str
    answer: str
    sources: List[Dict[str, Any]] = []

@router.post("/pdf")
async def export_to_pdf(
    request: ExportPDFRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Export a chat response (query, answer, and sources) to a PDF file.
    """
    try:
        username = current_user.get('username', 'Unknown')
        logger.info(f"User '{username}' requested PDF export")
        
        # Generate PDF
        pdf_buffer = pdf_export_service.generate_chat_pdf(
            query=request.query,
            answer=request.answer,
            sources=request.sources,
            username=username
        )
        
        # Create filename
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"rag_response_{timestamp}.pdf"
        
        # Return as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        logger.error(f"Error exporting PDF for user '{current_user.get('username')}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF. Please try again."
        )
