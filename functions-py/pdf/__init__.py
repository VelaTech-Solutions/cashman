# pdf/__init__.py for the pdf module

# Export PDF parsing and OCR functions
from .pdf_parser import parse_pdf as parse_extract
from .pdf_ocr import ocr_pdf as ocr_extract


# Create a mapping for PDF parsing and OCR functions
EXTRACT_FUNCTIONS = {
    "pdf_parser": parse_extract,
    "pdf_ocr": ocr_extract,
}


# Optional: Provide a direct import for common utilities
__all__ = [
    "parse_extract",
    "ocr_extract",
]


