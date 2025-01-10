# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

# functions-py/main.py
from firebase_functions import https_fn
from firebase_admin import initialize_app

# Import necessary libraries
import os
import json
import requests
from dotenv import load_dotenv

# Import PDF parsing functions
from pdf.pdf_parser import extract_text as parse_pdf
from pdf.pdf_ocr import extract_text_with_ocr

# Import cleaning functions
from banks.clean_absa import clean_data as clean_absa
from banks.clean_capitec import clean_data as clean_capitec
from banks.clean_fnb import clean_data as clean_fnb
from banks.clean_ned import clean_data as clean_ned
from banks.clean_standard import clean_data as clean_standard
from banks.clean_tyme import clean_data as clean_tyme

# Load environment variables
load_dotenv()
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET")

# Initialize Firebase Admin SDK
initialize_app()

def handle_cors(req):
    """Handle CORS preflight requests."""
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )

def clean_text_by_bank(bank_name, text):
    """Route extracted text to the appropriate cleaning function."""
    clean_function_map = {
        "Absa": clean_absa,
        "Capitec": clean_capitec,
        "FNB": clean_fnb,
        "Nedbank": clean_ned,
        "Standard Bank": clean_standard,
        "TymeBank": clean_tyme,
    }
    if bank_name not in clean_function_map:
        raise ValueError(f"Unsupported bank: {bank_name}")
    return clean_function_map[bank_name](text)

@https_fn.on_request()
def process_file(req: https_fn.Request) -> https_fn.Response:
    """Handles user selection of either OCR or Parser for text extraction."""
    try:
        # Handle CORS
        cors_response = handle_cors(req)
        if cors_response:
            return cors_response

        # Only handle POST requests
        if req.method != "POST":
            return https_fn.Response(
                json.dumps({"error": "Method not allowed."}),
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                status=405,
            )

        # Parse JSON body
        data = req.get_json(silent=True)
        if not data or "fileUrl" not in data or "bankName" not in data or "method" not in data:
            return https_fn.Response(
                json.dumps({"error": "Missing 'fileUrl', 'bankName', or 'method' in request body."}),
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                status=400,
            )

        file_url = data["fileUrl"]
        bank_name = data["bankName"]
        method = data["method"]  # "OCR" or "Parser"

        # Download the file
        response = requests.get(file_url)
        if response.status_code != 200:
            return https_fn.Response(
                json.dumps({"error": "Failed to download the file."}),
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                status=500,
            )

        # Save the file temporarily
        local_file_path = "/tmp/bank_statement.pdf"
        with open(local_file_path, "wb") as file:
            file.write(response.content)

        # Extract text based on the selected method
        if method == "Parser":
            extracted_text = parse_pdf(local_file_path)
        elif method == "OCR":
            extracted_text = extract_text_with_ocr(local_file_path)
        else:
            return https_fn.Response(
                json.dumps({"error": "Invalid method. Use 'Parser' or 'OCR'."}),
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                status=400,
            )

        # Log extracted text and process it
        print(f"Extracted text (first 500 chars): {extracted_text[:500]}")
        cleaned_data = clean_text_by_bank(bank_name, extracted_text)

        # Clean up temporary file
        if os.path.exists(local_file_path):
            os.remove(local_file_path)

        # Return cleaned data
        return https_fn.Response(
            json.dumps({"message": "File processed successfully!", "data": cleaned_data}),
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            status=500,
        )
