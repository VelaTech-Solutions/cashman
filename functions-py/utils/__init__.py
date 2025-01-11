# utils/__init__.py

# Import utility functions from individual files
from .response_validator import validate_response
from .request_validator import validate_request
from .firestore_helper import save_raw_data, save_cleaned_data
from .method_handler import handle_extraction_method
# from .cleaning_router import route_cleaning

# Organize utilities into categories for easy access
UTILS_FUNCTIONS = {
    "response_validator": validate_response,
    "request_validator": validate_request,
    "firestore_helper": {
        "save_raw_data": save_raw_data,
        "save_cleaned_data": save_cleaned_data,
    },
    "method_handler": handle_extraction_method,
    # "cleaning_router": route_cleaning,
}

# Optional: Provide a direct import for common utilities
__all__ = [
    "validate_response",
    "validate_request",
    "save_raw_data",
    "save_cleaned_data",
    "handle_extraction_method",
    # "route_cleaning",
]
