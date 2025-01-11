# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

# functions-py/main.py

# Import Firebase Admin SDK
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore

# Import necessary libraries
import os
import json
import requests
from dotenv import load_dotenv

# Import PDF parsing functions
from pdf.pdf_parser import parse_pdf
from pdf.pdf_ocr import extract_text_with_ocr

# import 
from utils.request_validator import validate_request
from utils.response_validator import validate_response



# Load environment variables
load_dotenv()
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET")

# Initialize Firebase Admin SDK
initialize_app()



@https_fn.on_request()
def extractData(req: https_fn.Request) -> https_fn.Response:
    """
    Handle data extraction requests. This version tests both request validation and response handling.
    """
    try:
        # Step 1: Validate the request
        client_id, file_url, bank_name, method = validate_request(req)

        # Step 2: Log success for debugging
        print(f"DEBUG: Request validation successful")
        print(f"DEBUG: clientId={client_id}, fileUrl={file_url}, bankName={bank_name}, method={method}")

        # Step 3: Return success response using response_handler
        return validate_response({
            "message": "Request validated successfully",
            "status": "ok",
            "clientId": client_id,
            "fileUrl": file_url,
            "bankName": bank_name,
            "method": method,
        })

    except ValueError as e:
        # Step 4: Handle validation errors
        print(f"VALIDATION ERROR: {e}")
        return validate_response({"error": str(e)}, status=400)

    except Exception as e:
        # Step 5: Handle unexpected errors
        print(f"ERROR: {e}")
        return validate_response({"error": "An unexpected error occurred."}, status=500)





























































# @https_fn.on_request()
# def extractData(req: https_fn.Request) -> https_fn.Response:
#     """
#     Handle data extraction requests from the frontend.
#     Spliting the Functions into small functions.

#     """
#     try:
#         if not verify_request(req):
#             return response_handler({"error": "Invalid request."}, status=400)

#         # Extract parameters
#         client_id = req.get_json(silent=True).get("clientId")
#         file_url = req.get_json(silent=True).get("fileUrl")
#         bank_name = req.get_json(silent=True).get("bankName")
#         method = req.get_json(silent=True).get("method")

#         extracted_text = method_handler(method, file_url)

#         # Save raw data to Firestore
#         raw_data = save_raw_data(client_id, bank_name, extracted_text)


#         # Clean the extracted text
#         cleaned_data = clean_text_by_bank(bank_name, raw_data)



#         # Log cleaned data
#         print("DEBUG: Cleaned data:")

#         # Save cleaned data to Firestore under the client's rawData field
#         db = firestore.client()
#         client_ref = db.collection("clients").document(client_id)
#         client_ref.set({"rawData": cleaned_data}, merge=True)

#         # Return a successful response
#         return response_handler({
#             "message": "Data extracted and saved successfully",
#             "status": "ok",
#             "cleanedDataPreview": cleaned_data[:500],  # Send a preview of the cleaned data
#         })

#     except Exception as e:
#         # Log the error
#         print(f"ERROR: {str(e)}")
#         return response_handler({"error": str(e)}, status=500)

















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
