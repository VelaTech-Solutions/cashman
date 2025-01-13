import re
import pandas as pd

# ========================
# Predefined Lists/Formats
# ========================

# Days and months
day_formats = [f"{day:02}" for day in range(1, 32)]
month_formats1 = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Okt", "Nov", "Dec"
]
month_formats2 = [
    "Januarie", "Februarie", "Maart", "Mei", "Junie", "Juli", "Augustus", "Oktober", "November", "December",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
]
year_formats = [str(year) for year in range(2020, 2031)]

# Generate valid and invalid date sets
valid_dates = [f"{day} {month}" for day in day_formats for month in month_formats1]
invalid_dates = [f"{day} {month} {year}" for day in day_formats for month in month_formats2 for year in year_formats]
valid_date_set = set(valid_dates)

# ========================
# Regex for Transaction Extraction
# ========================
# Groups:
#   Group 1: date1 (e.g., "01 Jan")
#   Group 2: Description (non-greedy match)
#   Group 3: optional date2 (e.g., "02 Feb")
#   Group 4: first amount (interpreted as balance)
#   Group 5: second-to-last amount (interpreted as credit/debit)
#   Group 6: third amount (interpreted as fee)
transaction_regex = r"(\d{2}\s\w{3})\s+(.+?)\s+(\d{2}\s\w{3})?\s?(\d*\.\d{2})?\s?(\d*\.\d{2})\s?(\d*\.\d{2})?"


# ========================
# Data Cleaning Wrapper (Main Entrypoint)
# ========================
def clean_data(extracted_text):
    """
    Processes and cleans FNB bank statement text.
    Splits the text into transaction lines (by newlines, ignoring empty lines),
    then extracts and validates transactions.
    Returns a DataFrame of structured transactions.
    """
    # Split text by newlines and remove empty lines
    transaction_lines = [line.strip() for line in extracted_text.split("\n") if line.strip()]
    joined_text = "\n".join(transaction_lines)
    return extract_transactions(joined_text)


# ========================
# Amount Verification Function
# ========================
def verify_amounts(transaction, previous_balance):
    """
    Verify the transaction's amounts using the following interpretation:
      - balance_amount comes from Group 4.
      - credit_amount comes from Group 5.
      - fee_amount comes from Group 6.
    The expected balance is computed as:
         Expected Balance = Previous Balance + Credit - Debit - Fee
    (Debit is inferred if balance < credit.)
    Returns a tuple (isValid, expected_balance, error_message).
    """
    balance = transaction["balance_amount"]
    credit = transaction["credit_amount"] or 0.0
    debit = transaction["debit_amount"] or 0.0
    fee = transaction["fees_amount"] or 0.0

    expected_balance = previous_balance + credit - debit - fee

    if balance is not None and abs(balance - expected_balance) > 0.01:
        return False, expected_balance, "Balance mismatch"
    return True, expected_balance, None


# ========================
# Extraction Function
# ========================
def extract_transactions(extracted_text):
    """
    Extracts transactions from the provided text using regex.
    Validates dates against a valid set and verifies amounts.
    For transactions that fail validation, a placeholder row is added with
    a 'validation_error' message.
    Returns a DataFrame of structured transactions.
    """
    if not extracted_text.strip():
        return pd.DataFrame()

    # Clean text: remove commas and asterisks
    extracted_text = extracted_text.replace(",", "").replace("*", "")

    # Remove invalid date strings
    for date in invalid_dates:
        extracted_text = extracted_text.replace(date, "")

    # Match all transactions with regex
    matches = re.findall(transaction_regex, extracted_text, re.DOTALL)

    transactions = []
    previous_balance = 0.0  # Initialize previous balance

    for i, match in enumerate(matches, 1):
        date1 = match[0].strip() if match[0] else None
        description = match[1].strip() if match[1] else None
        date2 = match[2].strip() if match[2] else None
        balance_str = match[3].strip() if match[3] else None
        credit_debit_str = match[4].strip() if match[4] else None
        fee_str = match[5].strip() if match[5] else None

        # Validate dates
        is_date1_valid = date1 in valid_date_set
        is_date2_valid = (date2 in valid_date_set) if date2 else True

        validation_error = None
        if not is_date1_valid:
            validation_error = "Invalid Start Date"
        elif date2 and not is_date2_valid:
            validation_error = "Invalid End Date"

        # Parse amounts
        balance_amount = float(balance_str) if balance_str else None
        credit_amount = float(credit_debit_str) if credit_debit_str else None
        fee_amount = float(fee_str) if fee_str else None

        # Infer debit_amount: if both balance and credit are present and balance < credit,
        # set debit_amount as the difference.
        debit_amount = None
        if balance_amount is not None and credit_amount is not None:
            if balance_amount < credit_amount:
                debit_amount = credit_amount - balance_amount

        transaction = {
            "date1": date1,
            "date2": date2 if date2 else None,
            "description": description,
            "fees_type": "Fee" if fee_amount is not None else None,
            "fees_amount": fee_amount,
            "debit_amount": debit_amount,
            "credit_amount": credit_amount,
            "balance_amount": balance_amount,
            "validation_error": validation_error
        }

        # If no date error, verify amounts based on previous balance
        if not validation_error:
            is_valid, expected_balance, error_msg = verify_amounts(transaction, previous_balance)
            if not is_valid:
                validation_error = error_msg

        if validation_error:
            transaction["validation_error"] = validation_error
            # Add placeholder row to review this transaction later
            transactions.append(transaction)
            continue

        if balance_amount is not None:
            previous_balance = balance_amount

        transactions.append(transaction)

    return pd.DataFrame(transactions)




# ========================
# Cloud Function Entry Point
# ========================
def process_transactions(request):
    """
    HTTP Cloud Function entry point.
    Expects the raw FNB bank statement text in the HTTP request body.
    Returns the processed transactions as CSV.
    """
    try:
        # Get the request body as text
        extracted_text = request.get_data(as_text=True)
        df_transactions = clean_data(extracted_text)
        csv_output = df_transactions.to_csv(index=False)
        return (csv_output, 200, {"Content-Type": "text/csv"})
    except Exception as e:
        return (f"An error occurred: {str(e)}", 500)
