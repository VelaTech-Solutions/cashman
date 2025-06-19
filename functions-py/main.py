import os
import re
import json
import requests
import tempfile

from pdf.pdf_parser import parse_pdf
from pdf.pdf_ocr import ocr_pdf

# Your custom CORS handler
from utils.cors_handler import handle_cors

# Import Firebase Admin SDK
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore, storage

# env variables
from config import API_KEY, PROJECT_ID, STORAGE_BUCKET


# Initialize Firebase Admin SDK
initialize_app()

@https_fn.on_request()
def handleExtractData(req: https_fn.Request) -> https_fn.Response:
    response = https_fn.Response()

    # Handle CORS
    response = handle_cors(req, response)
    if req.method == "OPTIONS":
        return response

    try:
        # Parse incoming data
        data = req.get_json(silent=True)
        if not data or "clientId" not in data:
            return error_response(response, "Missing clientId in request.", 400)

        client_id = data["clientId"]
        bank_name = data["bankName"]
        method = data["method"]

        print(f"Client ID: {client_id}, Bank Name: {bank_name}, Method: {method}")

        # Get the bank statement from Storage
        bucket = storage.bucket()
        folder_path = f"bank_statements/{client_id}/"
        blobs = list(bucket.list_blobs(prefix=folder_path))

        if not blobs:
            return error_response(response, "No bank statement found for the given clientId.", 404)

        # Download the bank statement
        blob = blobs[0]
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        blob.download_to_filename(temp_file.name)
        temp_file_path = temp_file.name
        temp_file.close()

        # Normalize method input
        normalized_method = method.lower()
        if normalized_method in ["parser", "pdfparser"]:
            extracted_text = parse_pdf(temp_file_path)  # Extracted as a single string
        elif normalized_method == "ocr":
            extracted_text = ocr_pdf(temp_file_path)  # Extracted as a single string
        else:
            response.set_data(json.dumps({"error": "Invalid method. Use 'Parser' or 'OCR'."}))
            response.status = 400
            response.headers["Content-Type"] = "application/json"
            return response
        
        # Convert rawData to Array
        raw_data_array = extracted_text.split("\n")  # Convert the string into an array of lines

        # before saving the date to firestore lowercase all the lines
        raw_data_array = [line.lower() for line in raw_data_array]

        try:
            # Save rawData and filteredData to Firestore as arrays
            db = firestore.client()
            doc_ref = db.collection("clients").document(client_id)
            doc_ref.set({
                "rawData": raw_data_array,       # Save as array
                "filteredData": raw_data_array

            }, merge=True)
            print(f"DEBUG: Successfully saved rawData for client {client_id}.")
        except Exception as e:
            print(f"ERROR: Failed to save rawData for client {client_id}: {e}")

        # Delete temporary file
        os.unlink(temp_file_path)

        # Return success response
        return success_response(response, "Data cleaned and saved successfully.", 200)

    except Exception as e:
        print(f"ERROR: {e}")
        return error_response(response, "An error occurred while processing the bank statement.", 500)

# Helper Functions
def error_response(response, message, status_code):
    response.set_data(json.dumps({"error": message}))
    response.status = status_code
    response.headers["Content-Type"] = "application/json"
    return response

# Helper Functions
def success_response(response, message, status_code):
    response.set_data(json.dumps({"message": message}))
    response.status = status_code
    response.headers["Content-Type"] = "application/json"
    return response

@https_fn.on_request()
def getBudgetTemplate(req: https_fn.Request) -> https_fn.Response:
    response = https_fn.Response()

    # Handle CORS
    response = handle_cors(req, response)
    if req.method == "OPTIONS":
        return response

    try:
        bucket = storage.bucket()
        template_path = "template/template_budget_updated.xlsx"
        template_blob = bucket.blob(template_path)

        # Download template file into memory
        template_data = template_blob.download_as_bytes()

        # Set response headers for XLSX file download
        response.set_data(template_data)
        response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        response.headers["Content-Disposition"] = f'attachment; filename="template_budget_updated.xlsx"'

        return response

    except Exception as e:
        print(f"ERROR: {e}")
        return error_response(response, f"Failed to fetch template: {str(e)}", 500)
