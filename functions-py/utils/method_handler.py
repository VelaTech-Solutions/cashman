
from pdf.pdf_parser import parse_pdf
from pdf.pdf_ocr import ocr_pdf



def handle_extraction_method(method, file_url):
    """
    Helper function to handle different methods.
    """
    # Call the appropriate function based on the selected method
    print(f"DEBUG: Starting text extraction with method: {method}")
    if method == "pdfparser":
        extracted_text = parse_pdf(file_url)
        print(f"DEBUG: Extracted text: {extracted_text[:500]}")
    elif method == "ocr":
        extracted_text = ocr_pdf(file_url)
        print(f"DEBUG: Extracted text: {extracted_text[:500]}")

