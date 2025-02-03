import re
from utils.chunk import chunk_array
from utils.data_cleaner import clean_list 
from utils.verify_amounts import verify_amounts

############ Capitec Bank Statement ############
bank_name = "Capitec"

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
    Extracts transactions from the provided text using regex and stores them as lists.

    Args:
        extracted_text (str): Extracted text from the bank statement.
        client_id (str): Client ID for Firestore document reference.

    Returns:
        list: Processed transaction data as lists.
    """

    # Clean data before processing
    cleaned_lines = clean_list(extracted_text) 

    # Define chunk size
    chunk_size = 50
    raw_data_chunks = chunk_array(cleaned_lines, chunk_size)

    print(f"DEBUG: Split raw data into {len(raw_data_chunks)} chunks.")

    transactions = []
    previous_balance = None  # Track previous balance for verification

    for chunk in raw_data_chunks:  # Loop through chunks
        for line in chunk:  # Loop through each line inside the chunk
            match = re.match(transaction_regex_capitec, line)  # Apply regex to each line
            
            if match:
                try:
                    # Extract values using regex groups
                    date1 = match.group(1).strip()
                    date2 = match.group(2).strip()
                    description = match.group(3).strip()
                    debit_or_credit = match.group(4).strip()
                    balance = match.group(5).strip()

                    debit_amount = float(debit_or_credit) if '-' in debit_or_credit else None
                    credit_amount = float(debit_or_credit) if '-' not in debit_or_credit else None
                    balance_amount = float(balance) if balance else None

                    # Create transaction dictionary
                    transaction = {
                        "date1": date1,
                        "date2": date2,
                        "description": description,
                        "fees_description": None,
                        "fees_type": None,
                        "fees_amount": 0.0,
                        "debit_amount": debit_amount,
                        "credit_amount": credit_amount,
                        "balance_amount": balance_amount,
                    }

                    # Perform amount verification
                    if previous_balance is not None:
                        is_valid, expected_balance, error_message = verify_amounts(transaction, previous_balance, bank_name)
                        if not is_valid:
                            print(f"WARNING: {error_message} for transaction on {date1}")

                    # Update previous balance
                    previous_balance = balance_amount

                    # Append transaction to list
                    transactions.append(transaction)

                except Exception as e:
                    print(f"Error processing line: {line}, Error: {e}")

    return transactions
