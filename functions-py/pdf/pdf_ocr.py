# functions-py/pdf_ocr.py

from pdf2image import convert_from_path
import pytesseract

def ocr_pdf(file_path):
    """
    Extracts text from a PDF file using OCR for image-based PDFs.

    Args:
        file_path (str): Path to the PDF file.

    Returns:
        str: Extracted text from the PDF.
    """
    text = ""
    try:
        # Convert PDF pages to images
        images = convert_from_path(file_path, dpi=300)
        
        # Extract text from each image using Tesseract OCR
        for i, image in enumerate(images):
            print(f"Processing page {i + 1} with OCR...")
            text += pytesseract.image_to_string(image) + "\n"

    except Exception as e:
        print(f"Error during OCR processing: {e}")
        raise
    
    return text
