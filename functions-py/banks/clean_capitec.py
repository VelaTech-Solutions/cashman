import re
import pandas as pd

# Refined regex for extracting transaction lines
transaction_regex = r"""
(\d{2}\/\d{2}\/\d{4})            # Group 1: Date 1 (dd/mm/yyyy)
\s?                              # Optional whitespace between dates
(\d{2}\/\d{2}\/\d{4})?           # Group 2: Date 2 (optional, dd/mm/yyyy)
.*?                              # Non-greedy match for description text
(-?\d*\s?\d*\.\d{2})             # Group 3: Amount (e.g., debit/credit amount, optional negative sign for debit)
\s?                              # Optional whitespace
(-?\d*\s?\d*\.\d{2})?            # Group 4: Optional second amount (e.g., balance)
"""

def clean_data(extracted_text):
    """
    Processes and cleans Capitec bank statement text.

    Args:
        extracted_text (str): Extracted text from the PDF.

    Returns:
        pd.DataFrame: Processed transactions as a DataFrame.
    """
    print("Processing Capitec bank statement...")
    cleaned_transactions = extract_transactions(extracted_text)

    print(f"Processed {len(cleaned_transactions)} transactions.")
    if not cleaned_transactions.empty:
        print(cleaned_transactions.head())  # Display first few rows for verification

    return cleaned_transactions


def extract_transactions(extracted_text):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (str): Extracted text from extracted_text.

    Returns:
        pd.DataFrame: Cleaned transaction data as a DataFrame.
    """
    # Clean text: remove commas and asterisks
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Compile regex with verbose flag
    pattern = re.compile(transaction_regex, re.VERBOSE)

    # Find matches
    matches = pattern.findall(extracted_text)
    print(f"Matches found: {len(matches)}")

    transactions = []
    for match in matches:
        try:
            # Handle tuple indexes safely
            date1 = match[0].strip() if len(match) > 0 and match[0] else None
            date2 = match[1].strip() if len(match) > 1 and match[1] else None
            debit_or_credit = match[2].strip() if len(match) > 2 and match[2] else None
            balance = match[3].strip() if len(match) > 3 and match[3] else None

            # Parse amounts safely
            debit_amount = None
            credit_amount = None
            if debit_or_credit:
                if "-" in debit_or_credit:
                    debit_amount = float(debit_or_credit.replace(" ", ""))
                else:
                    credit_amount = float(debit_or_credit.replace(" ", ""))

            balance_amount = float(balance.replace(" ", "")) if balance else None

            # Append transaction dictionary
            transactions.append({
                "date1": date1,
                "date2": date2,
                "debit_amount": debit_amount,
                "credit_amount": credit_amount,
                "balance_amount": balance_amount
            })
        except Exception as e:
            print(f"Error processing match: {match}, Error: {e}")

    # Convert to DataFrame
    if transactions:
        return pd.DataFrame(transactions)
    else:
        print("No valid transactions found.")
        return pd.DataFrame()

