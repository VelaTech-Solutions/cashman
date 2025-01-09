

def clean_data(text):
    """
    Processes and cleans Standard Bank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing Standard Bank statement...")
    return {
        "bank": "Standard Bank",
        "transactions": [
            {"date": "2025-01-09", "description": "Water Bill", "amount": -300.00},
            {"date": "2025-01-10", "description": "Savings Transfer", "amount": 1000.00},
        ],
    }
