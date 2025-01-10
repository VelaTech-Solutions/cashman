

def clean_data(text):
    """
    Processes and cleans Absa bank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing Absa bank statement...")
    return {
        "bank": "Absa",
        "transactions": [
            {"date": "2025-01-01", "description": "Coffee Shop", "amount": -50.00},
            {"date": "2025-01-02", "description": "Grocery Store", "amount": -150.00},
        ],
    }
