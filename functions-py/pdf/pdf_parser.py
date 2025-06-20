# functions-py/pdf_parser.py
import requests
import pdfplumber
from io import BytesIO



def parse_pdf(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"  # Add newline to separate pages
            return text
    except Exception as e:
        print(f"Error while parsing PDF with pdfplumber: {e}")
        return None