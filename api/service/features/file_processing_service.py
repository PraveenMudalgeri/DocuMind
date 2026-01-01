import io
import markdown
from pathlib import Path
from typing import Dict

from bs4 import BeautifulSoup
from docx import Document
from fastapi import UploadFile, HTTPException, status
from pypdf import PdfReader
import logging

import logging
import re

logger = logging.getLogger(__name__)

class FileProcessingService:
    """A service dedicated to extracting text content from various file formats."""

    async def extract_text_from_file(self, file: UploadFile) -> Dict[str, str]:
        """
        Extracts text content from an uploaded file based on its extension.
        Returns a dictionary containing the title and content.
        """
        contents = await file.read()
        filename = file.filename
        file_ext = Path(filename).suffix.lower()

        try:
            if file_ext == ".pdf":
                text = self._extract_from_pdf(contents)
            elif file_ext == ".docx":
                text = self._extract_from_docx(contents)
            elif file_ext == ".html":
                text = self._extract_from_html(contents)
            elif file_ext == ".md":
                text = self._extract_from_md(contents)
            elif file_ext == ".txt":
                text = self._extract_from_txt(contents)
            else:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported file type: {file_ext}",
                )
            
            # Use the filename (without extension) as the default title
            title = Path(filename).stem
            
            return {"title": title, "content": text}

        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process file: {filename}. Error: {str(e)}",
            )

    def _resolve_pdf_object(self, obj):
        """Resolves indirect objects to their actual value."""
        if hasattr(obj, "get_object"):
            return obj.get_object()
        return obj

    def _extract_from_pdf(self, contents: bytes) -> str:
        """Extracts text from PDF file contents, including embedded links."""
        with io.BytesIO(contents) as pdf_file:
            reader = PdfReader(pdf_file)
            full_text = []
            
            for page in reader.pages:
                text = page.extract_text()
                
                # Extract links from annotations
                links = []
                if "/Annots" in page:
                    for annot in page["/Annots"]:
                        try:
                            annot_obj = self._resolve_pdf_object(annot)
                            
                            # Ensure it's a Link annotation
                            if annot_obj.get("/Subtype") == "/Link":
                                # Check for Action (URL)
                                if "/A" in annot_obj:
                                    action = self._resolve_pdf_object(annot_obj["/A"])
                                    if "/URI" in action:
                                        links.append(action["/URI"])
                        except Exception as e:
                            logger.warning(f"Failed to process annotation: {e}")
                            continue
                
                # Append links to the bottom of the page text if found
                if links:
                    # Filter out non-string links and deduplicate
                    valid_links = {link for link in links if isinstance(link, str)}
                    
                    # Regex fallback: Find links in plain text that might not have annotations
                    text_links = set(re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text))
                    valid_links.update(text_links)
                    
                    if valid_links:
                        text += "\n\n**Links found on this page:**\n"
                        for link in valid_links:
                            text += f"- [{link}]({link})\n"
                
                full_text.append(text)
                
        return "\n".join(full_text)

    def _extract_from_docx(self, contents: bytes) -> str:
        """Extracts text from DOCX file contents, including embedded links."""
        from docx import Document as DocxDocument
        from docx.opc.constants import RELATIONSHIP_TYPE as RT
        
        with io.BytesIO(contents) as docx_file:
            doc = DocxDocument(docx_file)
            full_text = []

            # 1. Iterate paragraphs to find text and hyperlinks
            for para in doc.paragraphs:
                para_text = ""
                # We need to access the XML to find hyperlinks
                # python-docx doesn't provide a direct way to iterate runs AND hyperlinks in order
                # So we iterate the children of the paragraph element
                for child in para._element:
                    if child.tag.endswith('r'): # Run
                        if child.text:
                           para_text += child.text
                    elif child.tag.endswith('hyperlink'): # Hyperlink
                         # Extract relationship ID
                        r_id = child.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                        if r_id:
                            try:
                                rel = doc.part.rels[r_id]
                                if rel.target_mode == 'External':
                                    url = rel.target_ref
                                    # Extract display text from the hyperlink tag's children runs
                                    display_text = ""
                                    for subchild in child:
                                        if subchild.tag.endswith('r'):
                                            if subchild.text:
                                                display_text += subchild.text
                                    
                                    # Format as Markdown link
                                    para_text += f" [{display_text}]({url}) "
                            except Exception:
                                pass # Skip if relationship not found
                
                if para_text.strip():
                    full_text.append(para_text)
                    
        return "\n".join(full_text)

    def _extract_from_html(self, contents: bytes) -> str:
        """Extracts text from HTML file contents, preserving links as Markdown."""
        soup = BeautifulSoup(contents, "html.parser")
        
        # Convert tags to Markdown links: [text](href)
        for a in soup.find_all('a', href=True):
            markdown_link = f"[{a.get_text(strip=True)}]({a['href']})"
            a.replace_with(markdown_link)
            
        return soup.get_text(separator="\n", strip=True)

    def _extract_from_md(self, contents: bytes) -> str:
        """Extracts text from Markdown file contents by converting to HTML first."""
        html = markdown.markdown(contents.decode("utf-8"))
        return self._extract_from_html(html.encode("utf-8"))

    def _extract_from_txt(self, contents: bytes) -> str:
        """Extracts text from a plain text file."""
        return contents.decode("utf-8")


# Singleton instance
file_processing_service = FileProcessingService()