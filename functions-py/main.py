# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

# functions-py/main.py

# Import Firebase Admin SDK
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore, storage

# env variables
from config import API_KEY, PROJECT_ID, STORAGE_BUCKET
# print(API_KEY, PROJECT_ID, STORAGE_BUCKET)  # For debugging


# Import necessary libraries
import os
import json
import requests
import tempfile


# Import PDF parsing functions
from pdf.pdf_parser import parse_pdf
from pdf.pdf_ocr import ocr_pdf

# Your custom CORS handler
from utils.cors_handler import handle_cors

# Bank statement cleaning functions
from banks.clean_absa import clean_data as clean_absa
from banks.clean_capitec import clean_data as clean_capitec
from banks.clean_fnb import clean_data as clean_fnb
from banks.clean_ned import clean_data as clean_ned
from banks.clean_standard import clean_data as clean_standard
from banks.clean_tyme import clean_data as clean_tyme

# Initialize Firebase Admin SDK
initialize_app()

# From
# gcloud functions deploy handleExtractData --memory=256MB
# To
# gcloud functions deploy handleExtractData --memory=512MB

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
            extracted_text = parse_pdf(temp_file_path)
        elif normalized_method == "ocr":
            extracted_text = ocr_pdf(temp_file_path)
        else:
            response.set_data(json.dumps({"error": "Invalid method. Use 'Parser' or 'OCR'."}))
            response.status = 400
            response.headers["Content-Type"] = "application/json"
            return response
        
        # Save raw data to Firestore
        db = firestore.client()
        doc_ref = db.collection("clients").document(client_id)
        doc_ref.set({
            
            "number_of_transactions": 0, 
            "transactions": [],
            "rawData": extracted_text
        }, merge=True)

        # Clean statement based on bank name
        cleaner_map = {
            "Absa Bank": clean_absa,
            "Capitec Bank": clean_capitec,
            "Fnb Bank": clean_fnb,
            "Ned Bank": clean_ned,
            "Standard Bank": clean_standard,
            "Tyme Bank": clean_tyme,
        }

        if bank_name not in cleaner_map:
            os.unlink(temp_file_path)
            return error_response(response, "Invalid bank name.", 400)

        # Cleaned extracted text
        cleaned_transactions = cleaner_map[bank_name](extracted_text)

        # Prepare cleaned data
        number_of_transactions = len(cleaned_transactions)

        # Update Firestore with cleaned data
        doc_ref.update({
            "number_of_transactions": number_of_transactions,
            "transactions": [
                {
                    "date1": transaction.get("date1", None),
                    "date2": transaction.get("date2", None),
                    "description": transaction.get("description", None),
                    "fees_description": transaction.get("fees_description", None),
                    "fees_type": transaction.get("fees_type", None),
                    "fees_amount": transaction.get("fees_amount", 0.0),
                    "debit_amount": transaction.get("debit_amount", 0.0),
                    "credit_amount": transaction.get("credit_amount", 0.0),
                    "balance_amount": transaction.get("balance_amount", 0.0),
                }
                for transaction in cleaned_transactions
            ],
        })
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


def success_response(response, message, status_code):
    response.set_data(json.dumps({"message": message}))
    response.status = status_code
    response.headers["Content-Type"] = "application/json"
    return response



# # working 
# @https_fn.on_request()
# def fetchBankStatement(req: https_fn.Request) -> https_fn.Response:
#     # Create an empty response object
#     response = https_fn.Response()

#     # 1) Handle CORS (may return immediately if it's an OPTIONS request)
#     response = handle_cors(req, response)
#     if req.method == "OPTIONS":
#         return response  # Preflight response

#     try:
#         # 2) Parse incoming data
#         data = req.get_json(silent=True)
#         if not data or "clientId" not in data:
#             response.set_data(json.dumps({"error": "Missing clientId in request."}))
#             response.status = 400
#             response.headers["Content-Type"] = "application/json"
#             return response

#         client_id = data["clientId"]

#         # 3) Get the bank statement from Storage
#         bucket = storage.bucket()
#         folder_path = f"bank_statements/{client_id}/"
#         blobs = list(bucket.list_blobs(prefix=folder_path))

#         if not blobs:
#             response.set_data(json.dumps({"error": "No bank statement found for the given clientId."}))
#             response.status = 404
#             response.headers["Content-Type"] = "application/json"
#             return response

#         # Assume only one file
#         blob = blobs[0]

#         # 4) Download file to a temporary location (but DO NOT delete after)
#         temp_file = tempfile.NamedTemporaryFile(delete=False)
#         blob.download_to_filename(temp_file.name)
        
#         # If you want the path for later reference:
#         temp_file_path = temp_file.name
#         temp_file.close()  # Close the file, but do NOT unlink

#         # 5) Return a success response
#         response.set_data(json.dumps({"message": f"Bank statement {blob.name} fetched successfully."}))
#         response.status = 200
#         response.headers["Content-Type"] = "application/json"
#         return response

#     except Exception as e:
#         print(f"ERROR: {e}")
#         # 6) Return an error response with JSON
#         response.set_data(json.dumps({"error": "An error occurred while fetching the bank statement."}))
#         response.status = 500
#         response.headers["Content-Type"] = "application/json"
#         return response
