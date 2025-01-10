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
from pdf.pdf_parser import parse_pdf
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





def create_response(body, status=200):
    """
    Helper function to create a consistent response with CORS headers.
    """
    return https_fn.Response(
        json.dumps(body),
        headers={
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://cashflowmanager.web.app",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        status=status,
    )


from firebase_admin import firestore

@https_fn.on_request()
def extractData(req: https_fn.Request) -> https_fn.Response:
    """
    Handle data extraction requests from the frontend.
    """
    try:
        # Log incoming request
        print("DEBUG: Received request for extractData")

        # Handle CORS preflight requests
        if req.method == "OPTIONS":
            return create_response({})

        # Ensure the request is a POST
        if req.method != "POST":
            return create_response({"error": "Invalid request method. Only POST allowed."}, status=405)

        # Parse JSON body
        data = req.get_json(silent=True)
        print("DEBUG: Received data:", data)

        if not data:
            return create_response({"error": "Missing request body."}, status=400)

        # Extract parameters
        client_id = data.get("clientId")
        file_name = data.get("fileName")
        bank_name = data.get("bankName")
        method = data.get("method")

        # Validate parameters
        if not all([client_id, file_name, bank_name, method]):
            missing_params = [
                key
                for key, value in {
                    "clientId": client_id,
                    "fileName": file_name,
                    "bankName": bank_name,
                    "method": method,
                }.items()
                if not value
            ]
            return create_response({"error": f"Missing parameters: {', '.join(missing_params)}"}, status=400)

        # Log received parameters
        print(f"DEBUG: clientId={client_id}, fileName={file_name}, bankName={bank_name}, method={method}")

        # Call the appropriate function based on the selected method
        if method == "OCR":
            extracted_text = extract_text_with_ocr(file_name)
        elif method == "Parser":
            extracted_text = parse_pdf(file_name)
        else:
            return create_response({"error": "Invalid method. Only OCR or Parser allowed."}, status=400)

        # Clean the extracted text
        cleaned_data = clean_text_by_bank(bank_name, extracted_text)

        # Log cleaned data
        print("DEBUG: Cleaned data:", cleaned_data)

        # Save cleaned data to Firestore under the client's rawData field
        db = firestore.client()
        client_ref = db.collection("clients").document(client_id)
        client_ref.set({"rawData": cleaned_data}, merge=True)

        # Return a successful response
        return create_response({
            "message": "Data extracted and saved successfully",
            "status": "ok",
            "cleanedDataPreview": cleaned_data[:500],  # Send a preview of the cleaned data
        })

    except Exception as e:
        # Log the error
        print(f"ERROR: {str(e)}")
        return create_response({"error": str(e)}, status=500)



def clean_text_by_bank(bank_name, text):
    """Route extracted text to the appropriate cleaning function."""
    clean_function_map = {
        "Absa Bank": clean_absa,
        "Capitec Bank": clean_capitec,
        "Fnb Bank": clean_fnb,
        "Ned Bank": clean_ned,
        "Standard Bank": clean_standard,
        "Tyme Bank": clean_tyme,
    }
    if bank_name not in clean_function_map:
        raise ValueError(f"Unsupported bank: {bank_name}")
    return clean_function_map[bank_name](text)

# @https_fn.on_request()
# def process_file(req: https_fn.Request) -> https_fn.Response:
#     """Handles user selection of either OCR or Parser for text extraction."""
#     try:
#         # Handle CORS
#         cors_response = handle_cors(req)
#         if cors_response:
#             return cors_response

#         # Only handle POST requests
#         if req.method != "POST":
#             return https_fn.Response(
#                 json.dumps({"error": "Method not allowed."}),
#                 headers={
#                     "Content-Type": "application/json",
#                     "Access-Control-Allow-Origin": "*",
#                 },
#                 status=405,
#             )

#         # Parse JSON body
#         data = req.get_json(silent=True)
#         if not data or "fileUrl" not in data or "bankName" not in data or "method" not in data:
#             return https_fn.Response(
#                 json.dumps({"error": "Missing 'fileUrl', 'bankName', or 'method' in request body."}),
#                 headers={
#                     "Content-Type": "application/json",
#                     "Access-Control-Allow-Origin": "*",
#                 },
#                 status=400,
#             )

#         file_url = data["fileUrl"]
#         bank_name = data["bankName"]
#         method = data["method"]  # "OCR" or "Parser"

#         # Download the file
#         response = requests.get(file_url)
#         if response.status_code != 200:
#             return https_fn.Response(
#                 json.dumps({"error": "Failed to download the file."}),
#                 headers={
#                     "Content-Type": "application/json",
#                     "Access-Control-Allow-Origin": "*",
#                 },
#                 status=500,
#             )

#         # Save the file temporarily
#         local_file_path = "/tmp/bank_statement.pdf"
#         with open(local_file_path, "wb") as file:
#             file.write(response.content)

#         # Extract text based on the selected method
#         if method == "Parser":
#             extracted_text = parse_pdf(local_file_path)
#         elif method == "OCR":
#             extracted_text = extract_text_with_ocr(local_file_path)
#         else:
#             return https_fn.Response(
#                 json.dumps({"error": "Invalid method. Use 'Parser' or 'OCR'."}),
#                 headers={
#                     "Content-Type": "application/json",
#                     "Access-Control-Allow-Origin": "*",
#                 },
#                 status=400,
#             )

#         # Log extracted text and process it
#         print(f"Extracted text (first 500 chars): {extracted_text[:500]}")
#         cleaned_data = clean_text_by_bank(bank_name, extracted_text)

#         # Clean up temporary file
#         if os.path.exists(local_file_path):
#             os.remove(local_file_path)

#         # Return cleaned data
#         return https_fn.Response(
#             json.dumps({"message": "File processed successfully!", "data": cleaned_data}),
#             headers={
#                 "Content-Type": "application/json",
#                 "Access-Control-Allow-Origin": "*",
#             },
#         )

#     except Exception as e:
#         return https_fn.Response(
#             json.dumps({"error": str(e)}),
#             headers={
#                 "Content-Type": "application/json",
#                 "Access-Control-Allow-Origin": "*",
#             },
#             status=500,
#         )
