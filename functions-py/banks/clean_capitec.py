
import pandas as pd

def clean_data(extracted_text):
    """
    Processes and cleans Capitec bank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """




# Regex for extracting transaction lines
transaction_regex = r"(\d{2}\/\d{2}\/\d{4})\s(\d{2}\/\d{2}\/\d{4}).*?(\d*\s?\d*\.\d{2})\s(\d*\s?\d*\.\d{2})?"



def extract_transactions(extracted_text):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from extracted_text.
    Returns:
        dict:   "date1": date1,
                "date2": date2 if date2 else None,
                "description": description,
                "fees_type": "Fee" if fee_amount is not None else None,
                "fees_amount": fee_amount,
                "debit_amount": debit_amount,
                "credit_amount": credit_amount,
                "balance_amount": balance_amount,
    """




    return cleaned_transactions