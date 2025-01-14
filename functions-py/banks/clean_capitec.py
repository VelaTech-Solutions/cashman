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
    transactions_file = "transactions.csv"  # File for incremental saving
    first_write = True

    for transactions in extract_transactions_in_chunks(extracted_text):
        df = pd.DataFrame(transactions)
        # Save to file incrementally
        df.to_csv(transactions_file, mode="a", header=first_write, index=False)
        first_write = False

    print("Transaction processing completed.")
    return pd.read_csv(transactions_file)  # Read the final file back into a DataFrame


def extract_transactions_in_chunks(extracted_text, chunk_size=100):
    """
    Extracts transactions in smaller chunks to optimize memory usage.

    Args:
        extracted_text (str): Extracted text from extracted_text.
        chunk_size (int): Number of transactions per chunk.

    Yields:
        List[Dict]: Chunk of transactions.
    """
    # Clean text: remove commas and asterisks
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Compile regex with verbose flag
    pattern = re.compile(transaction_regex, re.VERBOSE)

    # Find matches
    matches = pattern.finditer(extracted_text)
    print("Processing matches in chunks...")

    transactions = []
    for match in matches:
        try:
            # Handle tuple indexes safely
            date1 = match.group(1).strip() if match.group(1) else None
            date2 = match.group(2).strip() if match.group(2) else None
            debit_or_credit = match.group(3).strip() if match.group(3) else None
            balance = match.group(4).strip() if match.group(4) else None

            # Parse amounts safely
            debit_amount, credit_amount = None, None
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
                "balance_amount": balance_amount,
            })

            # Yield transactions in chunks
            if len(transactions) >= chunk_size:
                yield transactions
                transactions = []  # Reset the chunk
        except Exception as e:
            print(f"Error processing match: {match.groups()}, Error: {e}")

    # Yield remaining transactions
    if transactions:
        yield transactions
