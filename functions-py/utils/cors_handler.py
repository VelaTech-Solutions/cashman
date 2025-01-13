# functions-py/utils/cors_handler.py

from config import AUTH_DOMAIN
from firebase_functions import https_fn

def handle_cors(request: https_fn.Request, response: https_fn.Response, allowed_origin="*") -> https_fn.Response:
    """
    Adds CORS headers to a Firebase Functions response.
    If the request is an OPTIONS (preflight) request, 
    returns early with appropriate headers.
    """
    # Always add the 'Access-Control-Allow-Origin' header.
    # If you only trust a specific domain, replace "*" with that domain.
    response.headers["Access-Control-Allow-Origin"] = allowed_origin
    
    # Typical CORS headers, customize as needed
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    
    # (Optional) If you need cookies or auth tokens across domains
    # response.headers["Access-Control-Allow-Credentials"] = "true"

    # If it's an OPTIONS (preflight) request, return immediately
    if request.method == "OPTIONS":
        # You could return 204 or 200
        response.status = 204
        return response

    # For all other methods (GET, POST, etc.), return the same response with CORS headers
    return response



# # Define the allowed origin dynamically from the auth domain
# def handle_cors(origin, headers=None):
#     """
#     Handle CORS for the given origin and additional headers.
#     """
#     default_headers = {
#         "Access-Control-Allow-Origin": origin,
#         "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
#         "Access-Control-Allow-Headers": "Content-Type, Authorization",
#     }

#     # Ensure headers is a valid dictionary
#     if headers is None:
#         headers = {}
#     elif not isinstance(headers, dict):
#         raise ValueError("The headers parameter must be a dictionary.")

#     # Update default headers with additional headers
#     default_headers.update(headers)

#     return default_headers


# # Define the allowed origin dynamically from the auth domain
# ALLOWED_ORIGINS = f"https://{AUTH_DOMAIN}"

# def handle_cors(headers=None):
#     """
#     CORS handler to add the necessary headers.
#     """
#     default_headers = {
#         "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
#         "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
#         "Access-Control-Allow-Headers": "Content-Type, Authorization",
#     }
#     if headers:
#         default_headers.update(headers)
#     return default_headers