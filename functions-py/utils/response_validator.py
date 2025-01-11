

# Import Firebase Admin SDK
from firebase_functions import https_fn

# Import necessary libraries
import os
import json



def validate_response(body, status=200):
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
