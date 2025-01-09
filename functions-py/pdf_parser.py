# functions-py/pdf_parser.py

import fitz  # PyMuPDF for extracting text

def extract_text(file_path):
    """
    Extracts text from a PDF file with selectable text.

    Args:
        file_path (str): Path to the PDF file.

    Returns:
        str: Extracted text from the PDF.
    """
    text = ""
    try:
        with fitz.open(file_path) as pdf:
            for page in pdf:
                page_text = page.get_text()  # Extract text from each page
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        raise
    return text
