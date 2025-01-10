

def clean_data(text):
    """
    Processes and cleans TymeBank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing TymeBank statement...")
    return {
        "bank": "TymeBank",
        "transactions": [
            {"date": "2025-01-11", "description": "Movie Tickets", "amount": -80.00},
            {"date": "2025-01-12", "description": "Groceries", "amount": -500.00},
        ],
    }
