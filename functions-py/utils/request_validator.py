# functions-py/utils/request_validator.py

# Import Firebase Admin SDK
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore


# Import necessary libraries
import os
import json

from utils.response_validator import validate_response

def validate_request(req):
    """
    Validate the incoming request and ensure all required fields are present.
    """
    if req.method != "POST":
        raise ValueError("Invalid request method. Only POST allowed.")

    data = req.get_json(silent=True)
    if not data:
        raise ValueError("Missing request body.")

    # Extract required parameters
    client_id = data.get("clientId")
    file_url = data.get("fileUrl")
    bank_name = data.get("bankName")
    method = data.get("method")

    # Check for missing parameters
    missing_params = [
        key for key, value in {
            "clientId": client_id,
            "fileUrl": file_url,
            "bankName": bank_name,
            "method": method,
        }.items() if not value
    ]
    if missing_params:
        raise ValueError(f"Missing parameters: {', '.join(missing_params)}")

    # Return parsed data if valid
    return client_id, file_url, bank_name, method
