import re
import firebase_admin
from firebase_admin import firestore, initialize_app
from config import PROJECT_ID
from datetime import datetime

# env variables
from config import API_KEY, PROJECT_ID, STORAGE_BUCKET
# print(API_KEY, PROJECT_ID, STORAGE_BUCKET)  # For debugging

try:
    # Initialize Firebase Admin SDK
    initialize_app(options={"projectId": PROJECT_ID})
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")


# Regex for extracting transaction details
transaction_regex = r"""
(\d{2}\/\d{2}\/\d{4})            # Group 1: Date 1 (dd/mm/yyyy)
\s?                                  # Optional whitespace
(\d{2}\/\d{2}\/\d{4})?           # Group 2: Date 2 (optional)
.*?                                  # Non-greedy match for description
(-?\d*\s?\d*\.\d{2})             # Group 3: Debit or Credit Amount
\s?                                  # Optional whitespace
(-?\d*\s?\d*\.\d{2})?            # Group 4: Balance Amount
"""

def clean_data(extracted_text, client_id):
    """
    Cleans Capitec bank statement text and inserts transactions into Firestore.

    Args:
        extracted_text (str): Extracted text from the bank statement.
        client_id (str): Client ID for Firestore document reference.

    Returns:
        dict: Response indicating success and transaction count.
    """
    print("Processing Capitec bank statement...")

    # Split text into lines
    lines = extracted_text.splitlines()
    transactions = []

    # Compile regex
    pattern = re.compile(transaction_regex, re.VERBOSE)

    for line in lines:
        match = pattern.search(line)
        if match:
            try:
                # Extract transaction details
                date1 = match.group(1).strip() if match.group(1) else None
                date2 = match.group(2).strip() if match.group(2) else None
                debit_or_credit = match.group(3).strip() if match.group(3) else None
                balance = match.group(4).strip() if match.group(4) else None

                debit_amount, credit_amount = None, None
                if debit_or_credit:
                    if "-" in debit_or_credit:
                        debit_amount = float(debit_or_credit.replace(" ", ""))
                    else:
                        credit_amount = float(debit_or_credit.replace(" ", ""))

                balance_amount = float(balance.replace(" ", "")) if balance else None

                # Append to transactions list
                transactions.append({
                    "date1": date1,
                    "date2": date2,
                    "description": None,  # Placeholder, can be populated later
                    "fees_description": None,  # Placeholder
                    "fees_type": None,  # Placeholder
                    "fees_amount": 0.0,  # Default 0 if not available
                    "debit_amount": debit_amount,
                    "credit_amount": credit_amount,
                    "balance_amount": balance_amount,
                })
            except Exception as e:
                print(f"Error processing line: {line}, Error: {e}")

    # Insert transactions into Firestore
    try:
        doc_ref = db.collection("clients").document(client_id)
        doc_ref.update({
            "transactions": firestore.ArrayUnion(transactions),
            "number_of_transactions": firestore.Increment(len(transactions)),
            "last_updated": datetime.utcnow().isoformat()
        })
        print(f"Inserted {len(transactions)} transactions into Firestore for client {client_id}.")
        return {"status": "success", "message": f"Inserted {len(transactions)} transactions."}
    except Exception as e:
        print(f"Error inserting into Firestore: {e}")
        return {"status": "error", "message": str(e)}
