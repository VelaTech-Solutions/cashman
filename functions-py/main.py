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
import re
import json
import requests
import tempfile

# Helper Functions
from utils.chunk import chunk_array

# Import PDF parsing functions
from pdf.pdf_parser import parse_pdf
from pdf.pdf_ocr import ocr_pdf

# Your custom CORS handler
from utils.cors_handler import handle_cors

# Bank statement cleaning functions
from banks.clean_absa import clean_data_absa
from banks.clean_capitec import clean_data_capitec
from banks.clean_fnb import clean_data_fnb
from banks.clean_ned import clean_data_ned
from banks.clean_standard import clean_data_standard
from banks.clean_tyme import clean_data_tyme

# Initialize Firebase Admin SDK
initialize_app()

# backend function to handle the extraction of transactions
@https_fn.on_request()
def handleExtractTransactions(req: https_fn.Request) -> https_fn.Response:
    response = https_fn.Response()

    # Handle CORS
    response = handle_cors(req, response)
    if req.method == "OPTIONS":
        return response

    try:
        # Parse incoming request data
        data = req.get_json(silent=True)
        if not data or "clientId" not in data or "bankName" not in data:
            return error_response(response, "Missing clientId or bankName in request.", 400)

        client_id = data["clientId"]
        bank_name = data["bankName"]
        print(client_id, bank_name)

        # Firestore initialization
        db = firestore.client()

        # Fetch client document
        doc_ref = db.collection("clients").document(client_id)
        doc_snapshot = doc_ref.get()

        if not doc_snapshot.exists:
            return error_response(response, f"Client with ID {client_id} does not exist.", 404)

        # Get filteredData from Firestore
        client_data = doc_snapshot.to_dict()
        filtered_text = client_data.get("filteredData", None)

        if not filtered_text:
            return error_response(response, "No filtered data available for this client.", 404)
  
 
        # Map the bank to its cleaning function
        cleaner_map = {
            "Absa Bank": clean_data_absa,
            "Capitec Bank": clean_data_capitec,
            "Fnb Bank": clean_data_fnb,
            "Ned Bank": clean_data_ned,
            "Standard Bank": clean_data_standard,
            "Tyme Bank": clean_data_tyme,
        }

        # Check if the bank name is valid
        if bank_name not in cleaner_map:
            return error_response(response, "Invalid bank name provided.", 400)

        # Clean the transactions using the relevant function
        cleaning_function = cleaner_map[bank_name]
        cleaned_transactions = cleaning_function(filtered_text, client_id)

        # Update Firestore with cleaned data
        doc_ref.update({
            "number_of_transactions": len(cleaned_transactions),
            "transactions": cleaned_transactions,
        })

        # Return a success response
        return success_response(response, "Transactions extracted and cleaned successfully.", 200)

    except Exception as e:
        print(f"ERROR: {e}")
        return error_response(response, f"An error occurred: {str(e)}", 500)

@https_fn.on_request()
def handleExtractDataManual(req: https_fn.Request) -> https_fn.Response:
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

        try:
            # Save rawData and filteredData to Firestore as arrays
            db = firestore.client()
            doc_ref = db.collection("clients").document(client_id)
            doc_ref.set({
                "rawData": raw_data_array,       # Save as array
                "filteredData": None

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

# handleExtractData automatic
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
        if not raw_data_array:
            print("No data to process.")
            return error_response(response, "No data to process.", 400)

        # Define chunk size (e.g., 25 lines per chunk)
        chunk_size = 50

        # Split raw_data_array into chunks
        raw_data_chunks = chunk_array(raw_data_array, chunk_size)
        # debug print
        print(f"DEBUG: Split raw data into {len(raw_data_chunks)} chunks.")

        # Fetch removal lines for the bank
        removal_lines = fetch_removal_lines(bank_name)

        # Filter the extracted text using the removal lines
        filtered_lines = filter_extracted_text(raw_data_chunks, removal_lines)  # Process as array

        # Save rawData and filteredData to Firestore as arrays
        db = firestore.client()
        doc_ref = db.collection("clients").document(client_id)
        # Flatten raw_data_chunks into a single array
        flattened_raw_data = [line for chunk in raw_data_chunks for line in chunk]
        print(f"DEBUG: Flattened raw data into a single array of length {len(flattened_raw_data)}.")

        # Save to Firestore
        try:
            doc_ref.set({
                "rawData": flattened_raw_data,
                "rawDataMetadata": {
                    "chunk_size": chunk_size,
                    "total_chunks": len(raw_data_chunks)
                },
                "filteredData": filtered_lines  # Save as array
            }, merge=True)
            print(f"DEBUG: Successfully saved rawData for client {client_id}.")
        except Exception as e:
            print(f"ERROR: Failed to save rawData for client {client_id}: {e}")

        filtered_text = filtered_lines

        # Clean statement based on bank name
        cleaner_map = {
            "Absa Bank": clean_data_absa,
            "Capitec Bank": clean_data_capitec,
            "Fnb Bank": clean_data_fnb,
            "Ned Bank": clean_data_ned,
            "Standard Bank": clean_data_standard,
            "Tyme Bank": clean_data_tyme,
        }

        if bank_name not in cleaner_map:
            os.unlink(temp_file_path)
            return error_response(response, "Invalid bank name.", 400)

        # Cleaned transactions based on filtered text
        cleaned_transactions = cleaner_map[bank_name](filtered_text, client_id)

        # Update Firestore with cleaned data
        doc_ref.update({
            "number_of_transactions": len(cleaned_transactions),
            "transactions": cleaned_transactions,
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

# Helper Functions
def success_response(response, message, status_code):
    response.set_data(json.dumps({"message": message}))
    response.status = status_code
    response.headers["Content-Type"] = "application/json"
    return response

# Helper Functions
def fetch_removal_lines(bank_name):
    """
    Fetches the list of lines to remove for the given bank from Firestore.
    Args:
        bank_name (str): Name of the bank.
    Returns:
        list: List of lines to remove.
    """
    try:
        print(f"DEBUG: Starting to fetch removal lines for bank: {bank_name}")
        
        # Initialize Firestore client
        db = firestore.client()
        
        # Create document reference for the bank
        bank_doc_ref = db.collection("banks").document(bank_name)
        print(f"DEBUG: Firestore document reference created for bank: {bank_name}")
        
        # Fetch the document snapshot
        bank_snapshot = bank_doc_ref.get()
        print(f"DEBUG: Document snapshot fetched for bank: {bank_name}, exists: {bank_snapshot.exists}")

        # Check if the document exists
        if not bank_snapshot.exists:
            print(f"DEBUG: No document found for bank: {bank_name}")
            return []

        # Retrieve the "removalLines" field or return an empty list if not present
        removal_lines = bank_snapshot.get("removalLines") or []

        print(f"DEBUG: Fetched removal lines: {removal_lines}")

        return removal_lines

    except Exception as e:
        print(f"ERROR: Exception occurred while fetching removal lines for bank {bank_name}: {e}")
        return []


def filter_extracted_text(raw_data_chunks, removal_lines):
    """
    Filters out lines in the raw data chunks that match any of the removal lines.
    Args:
        raw_data_chunks (list of lists): The raw data split into chunks, each chunk is a list of lines.
        removal_lines (list): List of lines or keywords to remove.

    Returns:
        list: Filtered text as a single list of lines.
    """
    filtered_lines = []

    # Iterate over each chunk
    for chunk in raw_data_chunks:
        # Iterate over each line in the chunk
        for line in chunk:
            # Keep the line only if it doesn't contain any removal line
            if not any(removal_line in line for removal_line in removal_lines):
                filtered_lines.append(line)

    print(f"DEBUG: Filtered lines count: {len(filtered_lines)}")
    return filtered_lines
