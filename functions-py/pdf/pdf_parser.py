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
            return text.strip()  # Remove trailing whitespace
    except Exception as e:
        print(f"Error while parsing PDF with pdfplumber: {e}")
        return None



# def parse_pdf(file_url):
#     """
#     Extract text from a PDF file provided via a URL using pdfplumber.
#     """
#     try:

#         # Debugging 
#         print(f"DEBUG: Parsing PDF from URL: {file_url}")
#         # Fetch the PDF file from the given URL
#         response = requests.get(file_url)
#         response.raise_for_status()

#         # Open the PDF file from the response content
#         pdf_file = BytesIO(response.content)
        
#         # Extract text using pdfplumber
#         extracted_text = ""
#         with pdfplumber.open(pdf_file) as pdf:
#             for page in pdf.pages:
#                 extracted_text += page.extract_text()

#         # Ensure the extracted text is returned clean
#         return extracted_text.strip()

#     except Exception as e:
#         print(f"ERROR: Failed to parse PDF: {str(e)}")
#         raise ValueError(f"Failed to parse PDF: {str(e)}")
