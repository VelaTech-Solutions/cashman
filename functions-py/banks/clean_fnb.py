# functions-py/banks/clean_fnb.py

import re
import os

def clean_data(raw_data):
    """
    Processes and cleans FNB bank statement text.

    The Columns are:
    - Dates
    - Description
    - Fees Amount
    - Fees Type
    - Debit Amount
    - Credit Amount
    - Balance Amount

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing FNB bank statement...")
    extracted_transactions = extract_transactions(raw_data)

    if not extracted_transactions:
        return None
    
    # Return as Columns     
    # - Dates
    # - Description
    # - Fees Amount
    # - Fees Type
    # - Debit Amount
    # - Credit Amount
    # - Balance Amount

    return extracted_transactions



def is_date_line(line):
    # Define pattern (fnb) to identify lines that start with either 21Jan or 21 Jan
    return re.match(r"\d{1,2}[A-Za-z]{3}", line) is not None or re.match(r"\d{1,3}\s[A-Za-z]{3}", line) is not None

def extract_transactions(extracted_text):
    """
    Extracts transactions from the provided text.

    """
    try:
        data = extracted_text.split('\n')
        
    except Exception as e:
        print(f"Error reading the file: {str(e)}")
        return None, None


    extracted_transactions = []
    current_transaction = []

    for i, line in enumerate(data):
        if is_date_line(line):
            # If the current transaction has data, save it
            if current_transaction:
                # Filter and extract valid transaction (if possible)
                transaction = ' '.join(current_transaction).strip()
                extracted_transactions.append(transaction)
                current_transaction = []

            # Start a new transaction
            current_transaction.append(line.strip())  # Date as first part of the transaction

        else:
            # If it's not a date line, add it to the current transaction
            current_transaction.append(line.strip())

    # Save the last transaction
    if current_transaction:
        transaction = ' '.join(current_transaction).strip()
        extracted_transactions.append(transaction)

    if extracted_transactions:
        print(f"Transactions extracted successfully")
        return extracted_transactions
    else:
        print("No transactions found.")
        return None
