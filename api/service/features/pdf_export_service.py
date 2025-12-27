from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class PDFExportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the PDF"""
        # Custom style for title
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor='#1f2937',
            spaceAfter=12,
            leftIndent=0
        ))
        
        # Custom style for query
        self.styles.add(ParagraphStyle(
            name='Query',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor='#374151',
            spaceAfter=8,
            leftIndent=10,
            rightIndent=10,
            backColor='#f3f4f6',
            borderPadding=8
        ))
        
        # Custom style for answer
        self.styles.add(ParagraphStyle(
            name='Answer',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor='#1f2937',
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            leading=14
        ))
        
        # Custom style for sources header
        self.styles.add(ParagraphStyle(
            name='SourcesHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor='#4b5563',
            spaceAfter=8
        ))
        
        # Custom style for source content
        self.styles.add(ParagraphStyle(
            name='SourceContent',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor='#6b7280',
            spaceAfter=6,
            leftIndent=15,
            leading=12
        ))
    
    def generate_chat_pdf(self, query: str, answer: str, sources: List[Dict[str, Any]], username: str) -> BytesIO:
        """
        Generate a PDF document containing the query, answer, and sources.
        
        Args:
            query: The user's question
            answer: The AI-generated answer
            sources: List of source documents
            username: Username of the person who made the query
            
        Returns:
            BytesIO: PDF file as bytes
        """
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            story = []
            
            # Title
            title = Paragraph("RAG Query Response", self.styles['CustomTitle'])
            story.append(title)
            story.append(Spacer(1, 0.2 * inch))
            
            # Metadata
            timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
            metadata = Paragraph(
                f"<b>User:</b> {username}<br/><b>Date:</b> {timestamp}",
                self.styles['Normal']
            )
            story.append(metadata)
            story.append(Spacer(1, 0.3 * inch))
            
            # Query section
            query_header = Paragraph("<b>Question:</b>", self.styles['Heading2'])
            story.append(query_header)
            story.append(Spacer(1, 0.1 * inch))
            
            query_text = Paragraph(self._escape_html(query), self.styles['Query'])
            story.append(query_text)
            story.append(Spacer(1, 0.3 * inch))
            
            # Answer section
            answer_header = Paragraph("<b>Answer:</b>", self.styles['Heading2'])
            story.append(answer_header)
            story.append(Spacer(1, 0.1 * inch))
            
            # Split answer into paragraphs for better formatting
            answer_paragraphs = answer.split('\n\n')
            for para in answer_paragraphs:
                if para.strip():
                    answer_para = Paragraph(self._escape_html(para.strip()), self.styles['Answer'])
                    story.append(answer_para)
                    story.append(Spacer(1, 0.1 * inch))
            
            # Sources section
            if sources and len(sources) > 0:
                story.append(Spacer(1, 0.2 * inch))
                sources_header = Paragraph(
                    f"<b>Sources ({len(sources)} document{'' if len(sources) == 1 else 's'}):</b>",
                    self.styles['SourcesHeader']
                )
                story.append(sources_header)
                story.append(Spacer(1, 0.1 * inch))
                
                for idx, source in enumerate(sources, 1):
                    # Source number and title
                    source_title = source.get('title', 'Untitled')
                    source_header = Paragraph(
                        f"<b>Source {idx}: {self._escape_html(source_title)}</b>",
                        self.styles['Normal']
                    )
                    story.append(source_header)
                    
                    # Source content - clean and truncate intelligently
                    content = source.get('content', '')
                    content = self._clean_text(content)  # Clean first
                    
                    # Truncate at sentence boundary if too long
                    if len(content) > 800:
                        content = self._truncate_at_sentence(content, 800)
                    
                    source_content = Paragraph(
                        self._escape_html(content),
                        self.styles['SourceContent']
                    )
                    story.append(source_content)
                    story.append(Spacer(1, 0.15 * inch))
            
            # Footer
            story.append(Spacer(1, 0.3 * inch))
            footer = Paragraph(
                "<i>Generated by Modular RAG System</i>",
                self.styles['Normal']
            )
            story.append(footer)
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            logger.info(f"Generated PDF for user '{username}' with query: '{query[:50]}...'")
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating PDF: {e}")
            raise
    
    def _escape_html(self, text: str) -> str:
        """Escape HTML special characters for reportlab and clean the text"""
        if not text:
            return ""
        
        text = str(text)
        
        # First, clean the text from unwanted characters and emojis
        text = self._clean_text(text)
        
        # Then escape HTML special characters
        replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def _clean_text(self, text: str) -> str:
        """Clean text from emojis, special unicode characters, and extra whitespace"""
        if not text:
            return ""
        
        import re
        
        # Remove emojis and special unicode characters (keep only printable ASCII and basic punctuation)
        # This regex keeps letters, numbers, basic punctuation, and whitespace
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def _truncate_at_sentence(self, text: str, max_length: int) -> str:
        """Truncate text at the nearest sentence boundary before max_length"""
        if not text or len(text) <= max_length:
            return text
        
        import re
        
        # Truncate to max_length first
        truncated = text[:max_length]
        
        # Find the last sentence-ending punctuation (., !, ?)
        # Look for these followed by space or end of string
        sentence_endings = re.finditer(r'[.!?]\s', truncated)
        last_ending = None
        
        for match in sentence_endings:
            last_ending = match.end()
        
        if last_ending and last_ending > max_length * 0.5:  # At least 50% of max_length
            return truncated[:last_ending].strip() + "..."
        
        # If no good sentence boundary found, truncate at last space
        last_space = truncated.rfind(' ')
        if last_space > max_length * 0.5:
            return truncated[:last_space].strip() + "..."
        
        # Fallback: just truncate
        return truncated.strip() + "..."

# Singleton instance
pdf_export_service = PDFExportService()
