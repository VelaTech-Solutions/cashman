# functions-py/utils/response_validator.py
import json
from firebase_functions import https_fn

def response_handler(body, status=200):
    return https_fn.Response(
        json.dumps(body),
        headers={
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://cashflowmanager.web.app",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        status=status
    )
