import re
from utils.chunk import chunk_array


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

    # # Update Firestore with the number of transactions and transaction data
    # db = firestore.client()
    # doc_ref = db.collection("clients").document(client_id)

    # # Use merge=True to avoid overwriting other fields if necessary
    # doc_ref.update({
    #     "number_of_transactions": len(matches),
    #     "transactions": transactions
    # })

    # print(f"Updated Firestore with {len(matches)} transactions.")

    return transactions

############ Standard Bank Statement ############

############################################################### 