
def clean_data(text):
    """
    Processes and cleans Capitec bank statement text.

    Args:
        text (str): Extracted text from the PDF.

    Returns:
        dict: Mock processed data for testing.
    """
    print("Processing Capitec bank statement...")
    return {
        "bank": "Capitec",
        "transactions": [
            {"date": "2025-01-03", "description": "Gas Station", "amount": -200.00},
            {"date": "2025-01-04", "description": "Salary", "amount": 3000.00},
        ],
    }
