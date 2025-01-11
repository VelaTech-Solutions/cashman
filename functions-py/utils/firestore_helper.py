
# Import Firebase Admin SDK
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore


def save_cleaned_data(client_id, bank_name, cleaned_data):
    """
    Helper function to save the cleaned data to Firestore.
    Structured data.
    Format and column names for all banks.
    The Columns are:
    - Dates
    - Description
    - Fees Amount
    - Fees Type
    - Debit Amount
    - Credit Amount
    - Balance Amount

    Cleanning Functions must return a dictionary with the above format.

    """
    print("DEBUG: Saving cleaned data to Firestore")
    db = firestore.client()
    db.collection("clients").document(client_id).set({"cleanedData": cleaned_data}, merge=True)


def save_raw_data(client_id, bank_name, extracted_text):
    """
    Helper function to save the extracted text to Firestore.
    Unstructured data.
    """
    print("DEBUG: Saving raw data to Firestore")
    db = firestore.client()
    db.collection("clients").document(client_id).set({"rawData": extracted_text}, merge=True)

