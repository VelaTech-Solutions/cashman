
import re
from utils.chunk import chunk_array
from utils.data_cleaner import clean_list 

############ Ned Bank Statement ############

# Regex for extracting transaction details

transaction_regex_ned = r"(\d{2}/\d{2}/\d{4})\s+(.*?)\s+(-?\d*\s?\d*\.\d{2})?\s+(-?\d*\s?\d*\.\d{2})\s+(-?\d*\s?\d*\.\d{2})"

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
    Extracts transactions from the raw text using regex.

    Args:
        extracted_text (str): Raw extracted text from the bank statement.
        client_id (str): Client identifier for Firestore.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """



    # Clean data before processing
    cleaned_lines = clean_list(extracted_text) 

    # Define chunk size
    chunk_size = 50
    raw_data_chunks = chunk_array(cleaned_lines, chunk_size)

    print(f"DEBUG: Split raw data into {len(raw_data_chunks)} chunks.")

    transactions = []
    invalid_transactions = []

    for chunk in raw_data_chunks:
        for line in chunk:
            match = re.match(transaction_regex_ned, line)

            if match:
                try:
                    date1 = match.group(1).strip()
                    description = match.group(2).strip()
                    fees_amount = match.group(3).strip() if match.group(3) else None
                    debit_or_credit = match.group(4).strip() if match.group(4) else None
                    balance = match.group(5).strip() if match.group(5) else None

                    debit_amount = float(debit_or_credit) if debit_or_credit and '-' in debit_or_credit else None
                    credit_amount = float(debit_or_credit) if debit_or_credit and '-' not in debit_or_credit else None
                    balance_amount = float(balance) if balance else None

                    transaction = {
                        "date1": date1,
                        "date2": None,
                        "description": description,
                        "fees_description": None,
                        "fees_type": None,
                        "fees_amount": fees_amount,
                        "debit_amount": debit_amount,
                        "credit_amount": credit_amount,
                        "balance_amount": balance_amount,
                    }

                    transactions.append(transaction)

                    print(f"✅ MATCHED TRANSACTION: {transaction}")

                except Exception as e:
                    print(f"❌ ERROR processing line: {line}, Error: {e}")

            else:
                invalid_transactions.append(line)

    print(f"✅ TOTAL MATCHED TRANSACTIONS: {len(transactions)}")
    print(f"❌ TOTAL INVALID TRANSACTIONS: {len(invalid_transactions)}")

    if len(invalid_transactions) > 0:
        print("❌ INVALID TRANSACTIONS (Showing first 10):")
        for inv in invalid_transactions[:10]:
            print(f"❌ {inv}")

    return transactions

############ Ned Bank Statement ############

############################################################### 


# def extract_transactions_ned(extracted_text, client_id):
#     """
#     Extracts transactions from the provided text using regex.

#     Args:
#         extracted_text (str): Extracted text from the bank statement.
#         client_id (str): Client identifier for Firestore.

#     Returns:
#         list: Processed transaction data in the form of dictionaries.
#     """
#     # Clean text: remove commas and asterisks
#     extracted_text = extracted_text.replace(",", "").replace("*", "")

#     # Match all transactions with regex
#     transaction_regex_ned = r"(\d{2}/\d{2}/\d{4})(.*?)(?=\s\d{2}/\d{2}/\d{4}|$)"
#     matches = re.findall(transaction_regex_ned, extracted_text, re.DOTALL)
#     print(f"Initial Matches Found: {len(matches)}")
#     print(f"First few matches: {matches[:3]}")

#     # Define the detailed regex
#     detailed_regex = r"(\d{2}/\d{2}/\d{4})\s+(.*?)\s+(-?\d*\s?\d*\.\d{2})?\s+(-?\d*\s?\d*\.\d{2})\s+(-?\d*\s?\d*\.\d{2})"

#     transactions = []

#     # Process each match using the detailed regex
#     for match in matches:
#         # Extract `date1` from the initial regex
#         date1 = match[0].strip() if match[0] else None

#         # Use the detailed regex on the description part of the match
#         details = re.match(detailed_regex, match[1], re.DOTALL)
#         if details:
#             date2 = details.group(1).strip() if details.group(1) else None
#             description = details.group(2).strip() if details.group(2) else "No description"
#             fees_amount = float(details.group(3).replace(" ", "")) if details.group(3) else None
#             balance_amount = float(details.group(5).replace(" ", "")) if details.group(5) else None

#             # Determine debit or credit amount
#             debit_amount, credit_amount = None, None
#             if details.group(4):
#                 if details.group(4).startswith("-"):
#                     debit_amount = float(details.group(4).replace("-", "").replace(" ", ""))
#                 else:
#                     credit_amount = float(details.group(4).replace(" ", ""))

#             # Append a complete transaction to the list
#             transactions.append({
#                 "date1": date1,
#                 "date2": date2,
#                 "description": description,
#                 "fees_description": None,
#                 "fees_type": None,
#                 "fees_amount": fees_amount,
#                 "debit_amount": debit_amount,
#                 "credit_amount": credit_amount,
#                 "balance_amount": balance_amount
#             })
#         else:
#             # Append a placeholder transaction if details regex fails
#             transactions.append({
#                 "date1": date1,
#                 "date2": None,
#                 "description": None,
#                 "fees_description": None,
#                 "fees_type": None,
#                 "fees_amount": None,
#                 "debit_amount": None,
#                 "credit_amount": None,
#                 "balance_amount": None
#             })

#     print(f"Processed {len(transactions)} transactions successfully.")

#     # Update Firestore with the number of transactions and transaction data
#     db = firestore.Client()
#     doc_ref = db.collection("clients").document(client_id)
#     doc_ref.update({
#         "number_of_transactions": len(transactions),
#         "transactions": transactions
#     })

#     print(f"Updated Firestore with {len(transactions)} transactions.")
#     return transactions

# def extract_transactions_ned(extracted_text, client_id):
#     """
#     Extracts transactions from the provided text using regex.

#     Args:
#         extracted_text (str): Extracted text from the bank statement.

#     Returns:
#         list: Processed transaction data in the form of dictionaries.
#     """
#     # Clean text: remove commas and asterisks to reduce memory usage
#     extracted_text = extracted_text.replace(",", "").replace("*", "")

#     # Match all transactions with regex
#     matches = re.findall(transaction_regex_ned, extracted_text, re.DOTALL)
#     print(f"Found {len(matches)} transactions.")

#     # Group Matches
#     # (\d{2}\/\d{2}\/\d{4})            # Group Date 1 (dd/mm/yyyy)
#     # \s                               # whitespace
#     # (.*?)                            # match for description
#     # (-?\d*\s?\d*\.\d{2})?            # Group Fees Amount if three dots
#     # \s                               # whitespace
#     # (-?\d*\s?\d*\.\d{2})             # Group Debit or Credit Amount
#     # \s                               # whitespace
#     # (-?\d*\s?\d*\.\d{2})             # Group Balance Amount If two dots or three dots

#     # Group Regex ?

#     detailed_regex = r"(\d{2}/\d{2}/\d{4})\s+(.*?)\s+(-?\d*\s?\d*\.\d{2})?\s+(-?\d*\s?\d*\.\d{2})\s+(-?\d*\s?\d*\.\d{2}) "
#     # Process matches without reusing the variable incorrectly
#     matches = re.findall(detailed_regex, extracted_text, re.DOTALL)
#     print(f"Found {len(matches)} transactions.")
#     print(f"Type of matches: {type(matches)}")



    

#     transactions = []
#     for match in matches:
#         date1 = match[0].strip() if len(match) > 0 and match[0] else None
#         description = match[1].strip() if len(match) > 1 and match[1] else "No description"
#         fees_amount = float(match[2].replace(" ", "")) if len(match) > 2 and match[2] else 0.0
#         debit_amount = None
#         credit_amount = None
#         balance_amount = float(match[4].replace(" ", "")) if len(match) > 4 and match[4] else None

#         # Determine if amount is debit or credit
#         if len(match) > 3 and match[3]:
#             if match[3].startswith("-"):
#                 debit_amount = float(match[3].replace("-", "").replace(" ", ""))
#             else:
#                 credit_amount = float(match[3].replace(" ", ""))

#         # Append the processed transaction to the list
#         transactions.append({
#             "date1": date1,
#             "date2": None,  # Always include `date2` even if not used
#             "description": description,
#             "fees_description": None,
#             "fees_type": None,
#             "fees_amount": fees_amount,
#             "debit_amount": debit_amount,
#             "credit_amount": credit_amount,
#             "balance_amount": balance_amount
#         })

#     # Update Firestore with the number of transactions and transaction data
#     db = firestore.client()
#     doc_ref = db.collection("clients").document(client_id)

#     # Use merge=True to avoid overwriting other fields if necessary
#     doc_ref.update({
#         "number_of_transactions": len(matches),
#         "transactions": transactions
#     })

#     print(f"Updated Firestore with {len(matches)} transactions.")
#     return transactions

############ Ned Bank Statement ############

############################################################### 