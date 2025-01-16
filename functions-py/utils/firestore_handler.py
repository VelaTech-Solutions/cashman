# utils/firestore_handler.py

import firebase_admin
from firebase_admin import credentials, firestore

def handle_firestore():
    # Check if the default app is already initialized
    if not firebase_admin._apps:
        # Path to your Firebase Admin SDK private key JSON file
        cred = credentials.Certificate("firebase_credentials.json")
        firebase_admin.initialize_app(cred)

    return firestore.client()


# def store_bank_statement(client_id: str, raw_data: str) -> None:
#     """
#     Stores the extracted bank statement text under a document with ID equal to client_id.
#     Stores the text in a field 'rawData' and adds a timestamp for when the data was stored.
#     """
#     doc_ref = db.collection("bank_statements").document(client_id)
#     doc_ref.set({
#         "rawData": raw_data,
#         "lastUpdated": firestore.SERVER_TIMESTAMP
#     }, merge=True)

# def save_cleaned_data(client_id, bank_name, cleaned_data):
#     """
#     Helper function to save the cleaned data to Firestore.
#     Structured data.
#     Format and column names for all banks.
#     The Columns are:
#     - Dates
#     - Description
#     - Fees Amount
#     - Fees Type
#     - Debit Amount
#     - Credit Amount
#     - Balance Amount

#     Cleanning Functions must return a dictionary with the above format.

#     """
#     print("DEBUG: Saving cleaned data to Firestore")
#     db = firestore.client()
#     db.collection("clients").document(client_id).set({"cleanedData": cleaned_data}, merge=True)


# def save_raw_data(client_id, bank_name, extracted_text):
#     """
#     Helper function to save the extracted text to Firestore.
#     Unstructured data.
#     """
#     print("DEBUG: Saving raw data to Firestore")
#     db = firestore.client()
#     db.collection("clients").document(client_id).set({"rawData": extracted_text}, merge=True)


