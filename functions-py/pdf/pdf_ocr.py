from pdf2image import convert_from_path
import pytesseract
import os
import tempfile

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
        # Ensure the file path exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # Use a temporary directory to store images
        with tempfile.TemporaryDirectory() as temp_dir:
            # Convert PDF pages to images, save them to the temporary directory
            images = convert_from_path(file_path, dpi=300, output_folder=temp_dir)

            # Extract text from each image using Tesseract OCR
            for i, image in enumerate(images):
                print(f"Processing page {i + 1} with OCR...")
                # Specify the OCR language and configuration for better accuracy
                page_text = pytesseract.image_to_string(image, lang="eng", config="--psm 6")
                text += page_text + "\n"
                
    except Exception as e:
        print(f"Error during OCR processing: {e}")
        raise
    
    return text
# 2025-06-26T09:27:02.244992Z ? handleextractdata: Client ID: 6304230220089, Bank Name: Fnb Bank, Method: OCR
# 2025-06-26T09:27:02.332908Z ? handleextractdata: Error during OCR processing: Unable to get page count. Is poppler installed and in PATH?
# 2025-06-26T09:27:02.333041Z ? handleextractdata: ERROR: Unable to get page count. Is poppler installed and in PATH?


#  im in the python folder with the functions-py folder and venv is activated yerts fix