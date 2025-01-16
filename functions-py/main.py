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


# Import PDF parsing functions
from pdf.pdf_parser import parse_pdf
from pdf.pdf_ocr import ocr_pdf

# Your custom CORS handler
from utils.cors_handler import handle_cors

# Bank statement cleaning functions
from banks.clean_absa import clean_data as clean_absa
from banks.clean_capitec import clean_data as clean_capitec
from banks.clean_fnb import clean_data as clean_fnb
from banks.clean_ned import clean_data as clean_ned
from banks.clean_standard import clean_data as clean_standard
from banks.clean_tyme import clean_data as clean_tyme

# Initialize Firebase Admin SDK
initialize_app()

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
            extracted_text = parse_pdf(temp_file_path)
        elif normalized_method == "ocr":
            extracted_text = ocr_pdf(temp_file_path)
        else:
            response.set_data(json.dumps({"error": "Invalid method. Use 'Parser' or 'OCR'."}))
            response.status = 400
            response.headers["Content-Type"] = "application/json"
            return response
        
        # Save raw data to Firestore
        db = firestore.client()
        doc_ref = db.collection("clients").document(client_id)
        doc_ref.set({
            
            # "number_of_transactions": 0, 
            # "transactions": [],
            "rawData": extracted_text
        }, merge=True)

        # Clean statement based on bank name
        cleaner_map = {
            "Absa Bank": clean_data_absa,
            "Capitec Bank": clean_data_capitec,
            "Fnb Bank": clean_data_fnb,
            "Ned Bank": clean_data_ned,
            "Standard Bank": clean_data_standard,
            "Tyme Bank": clean_tyme,
        }

        if bank_name not in cleaner_map:
            os.unlink(temp_file_path)
            return error_response(response, "Invalid bank name.", 400)

        # Cleaned extracted text
        cleaned_transactions = cleaner_map[bank_name](extracted_text, client_id)

        # Prepare cleaned data
        number_of_transactions = len(cleaned_transactions)

        # Update Firestore with cleaned data
        # doc_ref.update({
        #     "number_of_transactions": number_of_transactions,
        #     "transactions": [
        #         {
        #             "date1": transaction.get("date1", None),
        #             "date2": transaction.get("date2", None),
        #             "description": transaction.get("description", None),
        #             "fees_description": transaction.get("fees_description", None),
        #             "fees_type": transaction.get("fees_type", None),
        #             "fees_amount": transaction.get("fees_amount", 0.0),
        #             "debit_amount": transaction.get("debit_amount", 0.0),
        #             "credit_amount": transaction.get("credit_amount", 0.0),
        #             "balance_amount": transaction.get("balance_amount", 0.0),
        #         }
        #         for transaction in cleaned_transactions
        #     ],
        # })
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

###################### ( Cleaning Functions ) Start ###############################

############ Absa Bank Statement ############

# Regex for extracting transaction details
transaction_regex_absa = r"(\d{2}/\d{2}/\d{4})(.*?)(?=\s\d{2}/\d{2}/\d{4}|$)"

def clean_data_absa(extracted_text, client_id):
    """
    Processes and cleans Absa bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.
        client_id (str): ID of the client in Firestore.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Absa bank statement...")
    cleaned_transactions = extract_transactions_absa(extracted_text, client_id)
    return cleaned_transactions

def extract_transactions_absa(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from the bank statement.
        client_id (str): ID of the client in Firestore.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """

    # Clean text: remove commas and asterisks to reduce memory usage
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Remove "(Effective dd/mm/yyyy)"
    extracted_text = re.sub(r'\(Effective (\d{2}/\d{2}/\d{4})\)', '', extracted_text)

    # Pad single-digit day or month with a leading zero
    extracted_text = re.sub(r'(?<!\d)(\d{1})/(\d{2})/(\d{4})', r'0\1/\2/\3', extracted_text)
    extracted_text = re.sub(r'(?<!\d)(\d{2})/(\d{1})/(\d{4})', r'\1/0\2/\3', extracted_text)

    # Match all transactions using regex
    matches = re.findall(transaction_regex_absa, extracted_text, re.DOTALL)
    print(f"Found {len(matches)} transactions.")

    # Convert matches to a string for further processing
    matches_string = "\n".join(" ".join(match).strip() for match in matches)

    # Clean matches string with specific patterns
    matches_string = re.sub(r'(\n.*REFER TO BRANCH.*)', '', matches_string)
    matches_string = re.sub(r'(.*)YOUR PRICING PLAN.*', r'\1', matches_string)
    matches_string = re.sub(r'(.*)Page\s\d+\s?of\s?\d+', r'\1', matches_string)
    matches_string = re.sub(r'(.*)Absa Bank.*', r'\1', matches_string)
    matches_string = re.sub(r'(.*)Our Privacy Notice.*', r'\1', matches_string)
    matches_string = re.sub(r'(\n.*eStamp.*)', '', matches_string)
    matches_string = re.sub(r'(\n.*General Enquiries.*)', '', matches_string)
    matches_string = re.sub(r'(.*)ABSA Bank Limited.*', r'\1', matches_string)
    matches_string = re.sub(r'^\d{2}/\d{2}/\d{4}\s*$', '', matches_string, flags=re.MULTILINE)

    # Extract transactions using detailed regex
    detailed_regex = (
        r"(\d{2}/\d{2}/\d{4})\s+"          # Group 1: Date (dd/mm/yyyy)
        r"(.*?)\s+"                        # Group 2: Description
        r"(\d*?\s?\d*\.\d{2})?\s+"         # Group 3: Fees Amount (optional)
        r"(\w{1})?\s+"                     # Group 4: Fees Type (optional, e.g., 'F' or 'C')
        r"(\d*\s?\d*\.\d{2})\s+"           # Group 5: Debit or Credit Amount
        r"(\d*\s?\d*\.\d{2})"              # Group 6: Balance Amount
    )
    matches = re.findall(detailed_regex, matches_string, re.DOTALL)

    # Parse and process transactions
    transactions = []
    for match in matches:
        date1 = match[0].strip()
        description = match[1].strip()
        fees_amount = float(match[2].replace(" ", "")) if match[2] else None
        fees_type = match[3].strip() if match[3] else None
        debit_or_credit = float(match[4].replace(" ", "")) if match[4] else None
        balance_amount = float(match[5].replace(" ", "")) if match[5] else None

        transactions.append({
            "date1": date1,
            "description": description,
            "fees_amount": fees_amount,
            "fees_type": fees_type,
            "debit_or_credit": debit_or_credit,
            "balance_amount": balance_amount,
        })

    # Update Firestore with the number of transactions and transaction data
    db = firestore.client()
    doc_ref = db.collection("clients").document(client_id)

    # Use merge=True to avoid overwriting other fields
    doc_ref.update({
        "number_of_transactions": len(transactions),
        "transactions": transactions
    })

    print(f"Updated Firestore with {len(transactions)} transactions.")

    return transactions

###############################################################

############ Capitec Bank Statement ############

# Regex for extracting transaction details

transaction_regex_capitec = r"(\d{2}\/\d{2}\/\d{4})\s(\d{2}\/\d{2}\/\d{4})(.*?)(\-?\d*\s?\d*\.\d{2})\s(\-?\d*\s?\d*\.\d{2})"

# (\d{2}\/\d{2}\/\d{4})             # Group Date 1 (dd/mm/yyyy)
# \s                                # whitespace
# (\d{2}\/\d{2}\/\d{4})             # Group Date 2 (dd/mm/yyyy)
# (.*?)                             # match for description
# (\-?\d*\s?\d*\.\d{2})             # Group Debit or Credit Amount
# \s                                # whitespace
# (\-?\d*\s?\d*\.\d{2})             # Group Balance Amount

def clean_data_capitec(extracted_text, client_id):
    """
    Processes and cleans Capitec bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.
        client_id (str): Client ID for Firestore document reference.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Capitec bank statement...")
    cleaned_transactions = extract_transactions_capitec(extracted_text, client_id)
    return cleaned_transactions

def extract_transactions_capitec(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from the bank statement.
        client_id (str): Client ID for Firestore document reference.

    Returns:
        list: Processed transaction data as dictionaries.
    """
    # Clean text Here
    extracted_text = extracted_text.replace(",", "").replace("*", "")
    
    # Match all transactions
    matches = re.findall(transaction_regex_capitec, extracted_text, re.VERBOSE | re.DOTALL)
    print(f"Found {len(matches)} transactions.")
    
    transactions = []
    for match in matches:
        try:
            date1 = match[0].strip() if match[0] else None
            date2 = match[1].strip() if match[1] else None
            description = match[2].strip() if match[2] else "No description"
            debit_or_credit = match[3].replace(" ", "").strip()
            balance = match[4].replace(" ", "").strip()

            debit_amount = float(debit_or_credit) if '-' in debit_or_credit else None
            credit_amount = float(debit_or_credit) if '-' not in debit_or_credit else None
            balance_amount = float(balance) if balance else None

            transactions.append({
                "date1": date1,
                "date2": date2,
                "description": description,
                "fees_description": None,
                "fees_type": None,
                "fees_amount": 0.0,
                "debit_amount": debit_amount,
                "credit_amount": credit_amount,
                "balance_amount": balance_amount,
            })
        except Exception as e:
            print(f"Error processing transaction: {match}, Error: {e}")

    # Update Firestore
    try:
        db = firestore.client()
        doc_ref = db.collection("clients").document(client_id)
        doc_ref.update({
            "number_of_transactions": len(transactions),
            "transactions": transactions,
        })
        print(f"Updated Firestore with {len(transactions)} transactions for client {client_id}.")
    except Exception as e:
        print(f"Error updating Firestore: {e}")

    return transactions

############ Capitec Bank Statement ############

###############################################################

############ Fnb Bank Statement ############

# Regex for extracting transaction details
# (\d{2}\s\w{3})(.*?)(\d{2}\s\w{3})?(.*?)(?=\s(\d{2}\s\w{3})|$)
transaction_regex_fnb = r"(\d{2}\s\w{3})(.*?)(\d{2}\s\w{3})?(.*?)(?=\s(\d{2}\s\w{3})|$)"
# (\d{2}\s\w{3})                    # Group  Date 1 ( dd mmm )
# \s                                # whitespace
# (.*?)                             # match for description
# (\d{2}\s\w{3})?                   # Group  Date 2 ( dd mmm ) Maybe
# \s                                # whitespace
# (\d*\s?\d*\.\d{2})                # Group Debit or Credit Amount
# \s                                # Optional whitespace
# (-?\d*\s?\d*\.\d{2})              # Group  Balance Amount

def clean_data_fnb(extracted_text, client_id):
    """
    Processes and cleans Fnb bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Fnb bank statement...")
    cleaned_transactions = extract_transactions_fnb(extracted_text, client_id)

    return cleaned_transactions

def extract_transactions_fnb(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from the bank statement.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """
    # Clean text: remove commas and asterisks to reduce memory usage
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Match all transactions with regex
    matches = re.findall(transaction_regex_fnb, extracted_text, re.DOTALL)
    print(f"Found {len(matches)} transactions.")
    print(matches)

    transactions = []
    for match in matches:
        date1 = match[0].strip() if match[0] else None
        date2 = match[1].strip() if match[1] else None
        description = match[2].strip() if match[2] else "No description"
        balance = match[3].strip() if match[3] else None

        # Parse amounts safely and minimize memory usage
        # Remove spaces before converting to float
        credit_amount = float(match[3].replace("-", "").replace(" ", "")) if match[3] else None
        balance_amount = float(balance.replace(" ", "")) if balance else None
        debit_amount = None

        # Remove " " in amounts (for debit_amount, if applicable)
        if debit_amount:
            debit_amount = debit_amount.replace(" ", "")

        # Append the processed transaction to the list
        transactions.append({
            "date1": date1,
            "date2": date2,
            "description": description,
            "fees_description": None,
            "fees_type": None,
            "fees_amount": 0.0,
            "debit_amount": debit_amount,
            "credit_amount": credit_amount,
            "balance_amount": balance_amount
        })

    # Update Firestore with the number of transactions and transaction data
    db = firestore.client()
    doc_ref = db.collection("clients").document(client_id)

    # Use merge=True to avoid overwriting other fields if necessary
    doc_ref.update({
        "number_of_transactions": len(matches),
        "transactions": transactions
    })

    print(f"Updated Firestore with {len(matches)} transactions.")

    return transactions

############ Fnb Bank Statement ############

###############################################################

############ Ned Bank Statement ############

# Regex for extracting transaction details

transaction_regex_ned = r"(\d{2}/\d{2}/\d{4})(.*?)(?=\s\d{2}/\d{2}/\d{4}|$)"

# (\d{2}\/\d{2}\/\d{4})            # Group Date 1 (dd/mm/yyyy)
# \s                               # whitespace
# (.*?)                            # match for description
# (-?\d*\s?\d*\.\d{2})?            # Group Fees Amount if three dots
# \s                               # whitespace
# (-?\d*\s?\d*\.\d{2})             # Group Debit or Credit Amount
# \s                               # whitespace
# (-?\d*\s?\d*\.\d{2})             # Group Balance Amount If two dots or three dots

def clean_data_ned(extracted_text, client_id):
    """
    Processes and cleans Ned bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Ned bank statement...")
    cleaned_transactions = extract_transactions_ned(extracted_text, client_id)

    return cleaned_transactions

def extract_transactions_ned(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from the bank statement.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """
    # Clean text: remove commas and asterisks to reduce memory usage
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Match all transactions with regex
    matches = re.findall(transaction_regex_ned, extracted_text, re.DOTALL)
    print(f"Found {len(matches)} transactions.")

    # Group Matches
    # (\d{2}\/\d{2}\/\d{4})            # Group Date 1 (dd/mm/yyyy)
    # \s                               # whitespace
    # (.*?)                            # match for description
    # (-?\d*\s?\d*\.\d{2})?            # Group Fees Amount if three dots
    # \s                               # whitespace
    # (-?\d*\s?\d*\.\d{2})             # Group Debit or Credit Amount
    # \s                               # whitespace
    # (-?\d*\s?\d*\.\d{2})             # Group Balance Amount If two dots or three dots

    # Group Regex ?

    detailed_regex = r"(\d{2}/\d{2}/\d{4})\s+(.*?)\s+(-?\d*\s?\d*\.\d{2})?\s+(-?\d*\s?\d*\.\d{2})\s+(-?\d*\s?\d*\.\d{2}) "
    matches = re.findall(detailed_regex, matches, re.DOTALL)
    

    transactions = []
    for match in matches:
        date1 = match[0].strip() if match[0] else None
        date2 = match[1].strip() if match[1] else None
        description = match[2].strip() if match[2] else "No description"
        balance = match[3].strip() if match[3] else None

        # Parse amounts safely and minimize memory usage
        # Remove spaces before converting to float
        credit_amount = float(match[3].replace("-", "").replace(" ", "")) if match[3] else None
        balance_amount = float(balance.replace(" ", "")) if balance else None
        debit_amount = None

        # Remove " " in amounts (for debit_amount, if applicable)
        if debit_amount:
            debit_amount = debit_amount.replace(" ", "")

        # Append the processed transaction to the list
        transactions.append({
            "date1": date1,
            "date2": date2,
            "description": description,
            "fees_description": None,
            "fees_type": None,
            "fees_amount": 0.0,
            "debit_amount": debit_amount,
            "credit_amount": credit_amount,
            "balance_amount": balance_amount
        })

    # Update Firestore with the number of transactions and transaction data
    db = firestore.client()
    doc_ref = db.collection("clients").document(client_id)

    # Use merge=True to avoid overwriting other fields if necessary
    doc_ref.update({
        "number_of_transactions": len(matches),
        "transactions": transactions
    })

    print(f"Updated Firestore with {len(matches)} transactions.")

    return transactions

############ Ned Bank Statement ############

############################################################### 

############ Standard Bank Statement ############

# Regex for extracting transaction details
# (\d{2}\s\w{3})(.*?)(\d{2}\s\w{3})?(.*?)(?=\s(\d{2}\s\w{3})|$)
transaction_regex_standard = r"(\d{2}\s\w{3})(.*?)(\d{2}\s\w{3})?(.*?)(?=\s(\d{2}\s\w{3})|$)"
# (\d{2}\s\w{3})                    # Group  Date 1 ( dd mmm )
# \s                                # whitespace
# (.*?)                             # match for description
# (\d{2}\s\w{3})?                    # Group  Date 2 ( dd mmm ) Maybe
# \s                                # whitespace
# (\d*\s?\d*\.\d{2})                # Group Debit or Credit Amount
# \s                               # Optional whitespace
# (-?\d*\s?\d*\.\d{2})             # Group  Balance Amount

def clean_data_standard(extracted_text, client_id):
    """
    Processes and cleans Standard bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Standard bank statement...")
    cleaned_transactions = extract_transactions_standard(extracted_text, client_id)

    return cleaned_transactions

def extract_transactions_standard(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from the bank statement.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """
    # Clean text: remove commas and asterisks to reduce memory usage
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Match all transactions with regex
    matches = re.findall(transaction_regex_standard, extracted_text, re.DOTALL)
    print(f"Found {len(matches)} transactions.")
    print(matches)

    transactions = []
    for match in matches:
        date1 = match[0].strip() if match[0] else None
        date2 = match[1].strip() if match[1] else None
        description = match[2].strip() if match[2] else "No description"
        balance = match[3].strip() if match[3] else None

        # Parse amounts safely and minimize memory usage
        # Remove spaces before converting to float
        credit_amount = float(match[3].replace("-", "").replace(" ", "")) if match[3] else None
        balance_amount = float(balance.replace(" ", "")) if balance else None
        debit_amount = None

        # Remove " " in amounts (for debit_amount, if applicable)
        if debit_amount:
            debit_amount = debit_amount.replace(" ", "")

        # Append the processed transaction to the list
        transactions.append({
            "date1": date1,
            "date2": date2,
            "description": description,
            "fees_description": None,
            "fees_type": None,
            "fees_amount": 0.0,
            "debit_amount": debit_amount,
            "credit_amount": credit_amount,
            "balance_amount": balance_amount
        })

    # Update Firestore with the number of transactions and transaction data
    db = firestore.client()
    doc_ref = db.collection("clients").document(client_id)

    # Use merge=True to avoid overwriting other fields if necessary
    doc_ref.update({
        "number_of_transactions": len(matches),
        "transactions": transactions
    })

    print(f"Updated Firestore with {len(matches)} transactions.")

    return transactions

############ Standard Bank Statement ############

############################################################### 

############ Tyme Bank Statement ############

# Regex for extracting transaction details
# (\d{2}\s\w{3})(.*?)(\d{2}\s\w{3})?(.*?)(?=\s(\d{2}\s\w{3})|$)
transaction_regex_tyme = r"(\d{2}\s\w{3})(.*?)(\d{2}\s\w{3})?(.*?)(?=\s(\d{2}\s\w{3})|$)"
# (\d{2}\s\w{3})                    # Group  Date 1 ( dd mmm )
# \s                                # whitespace
# (.*?)                             # match for description
# (\d{2}\s\w{3})?                    # Group  Date 2 ( dd mmm ) Maybe
# \s                                # whitespace
# (\d*\s?\d*\.\d{2})                # Group Debit or Credit Amount
# \s                               # Optional whitespace
# (-?\d*\s?\d*\.\d{2})             # Group  Balance Amount

def clean_data_tyme(extracted_text, client_id):
    """
    Processes and cleans Tyme bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Tyme bank statement...")
    cleaned_transactions = extract_transactions_tyme(extracted_text, client_id)

    return cleaned_transactions

def extract_transactions_tyme(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from the bank statement.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """
    # Clean text: remove commas and asterisks to reduce memory usage
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Match all transactions with regex
    matches = re.findall(transaction_regex_tyme, extracted_text, re.DOTALL)
    print(f"Found {len(matches)} transactions.")
    print(matches)

    transactions = []
    for match in matches:
        date1 = match[0].strip() if match[0] else None
        date2 = match[1].strip() if match[1] else None
        description = match[2].strip() if match[2] else "No description"
        balance = match[3].strip() if match[3] else None

        # Parse amounts safely and minimize memory usage
        # Remove spaces before converting to float
        credit_amount = float(match[3].replace("-", "").replace(" ", "")) if match[3] else None
        balance_amount = float(balance.replace(" ", "")) if balance else None
        debit_amount = None

        # Remove " " in amounts (for debit_amount, if applicable)
        if debit_amount:
            debit_amount = debit_amount.replace(" ", "")

        # Append the processed transaction to the list
        transactions.append({
            "date1": date1,
            "date2": date2,
            "description": description,
            "fees_description": None,
            "fees_type": None,
            "fees_amount": 0.0,
            "debit_amount": debit_amount,
            "credit_amount": credit_amount,
            "balance_amount": balance_amount
        })

    # Update Firestore with the number of transactions and transaction data
    db = firestore.client()
    doc_ref = db.collection("clients").document(client_id)

    # Use merge=True to avoid overwriting other fields if necessary
    doc_ref.update({
        "number_of_transactions": len(matches),
        "transactions": transactions
    })

    print(f"Updated Firestore with {len(matches)} transactions.")

    return transactions

############ Tyme Bank Statement ############

###################### ( Cleaning Functions ) End ###############################


















































# # working 
# @https_fn.on_request()
# def fetchBankStatement(req: https_fn.Request) -> https_fn.Response:
#     # Create an empty response object
#     response = https_fn.Response()

#     # 1) Handle CORS (may return immediately if it's an OPTIONS request)
#     response = handle_cors(req, response)
#     if req.method == "OPTIONS":
#         return response  # Preflight response

#     try:
#         # 2) Parse incoming data
#         data = req.get_json(silent=True)
#         if not data or "clientId" not in data:
#             response.set_data(json.dumps({"error": "Missing clientId in request."}))
#             response.status = 400
#             response.headers["Content-Type"] = "application/json"
#             return response

#         client_id = data["clientId"]

#         # 3) Get the bank statement from Storage
#         bucket = storage.bucket()
#         folder_path = f"bank_statements/{client_id}/"
#         blobs = list(bucket.list_blobs(prefix=folder_path))

#         if not blobs:
#             response.set_data(json.dumps({"error": "No bank statement found for the given clientId."}))
#             response.status = 404
#             response.headers["Content-Type"] = "application/json"
#             return response

#         # Assume only one file
#         blob = blobs[0]

#         # 4) Download file to a temporary location (but DO NOT delete after)
#         temp_file = tempfile.NamedTemporaryFile(delete=False)
#         blob.download_to_filename(temp_file.name)
        
#         # If you want the path for later reference:
#         temp_file_path = temp_file.name
#         temp_file.close()  # Close the file, but do NOT unlink

#         # 5) Return a success response
#         response.set_data(json.dumps({"message": f"Bank statement {blob.name} fetched successfully."}))
#         response.status = 200
#         response.headers["Content-Type"] = "application/json"
#         return response

#     except Exception as e:
#         print(f"ERROR: {e}")
#         # 6) Return an error response with JSON
#         response.set_data(json.dumps({"error": "An error occurred while fetching the bank statement."}))
#         response.status = 500
#         response.headers["Content-Type"] = "application/json"
#         return response
