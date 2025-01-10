

def clean_data(text):
    """
    Processes and cleans FNB bank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing FNB bank statement...")
    return {
        "bank": "FNB",
        "transactions": [
            {"date": "2025-01-05", "description": "Restaurant", "amount": -120.00},
            {"date": "2025-01-06", "description": "Electricity Bill", "amount": -400.00},
        ],
    }
