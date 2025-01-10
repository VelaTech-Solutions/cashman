

def clean_data(text):
    """
    Processes and cleans Nedbank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing Nedbank statement...")
    return {
        "bank": "Nedbank",
        "transactions": [
            {"date": "2025-01-07", "description": "Online Shopping", "amount": -350.00},
            {"date": "2025-01-08", "description": "Gym Membership", "amount": -250.00},
        ],
    }

