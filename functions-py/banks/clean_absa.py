
import re
from utils.chunk import chunk_array

############ Absa Bank Statement ############

# Regex for extracting transaction details
transaction_regex_absa = (
    r"(\d{2}/\d{2}/\d{4})\s+"       # Group 1: Date (dd/mm/yyyy)
    r"([A-Za-z\s]+.*?)\s+"          # Group 2: Description
    r"([\d\s]*\.\d{2})?\s*"         # Group 3: Fees/Debit/Credit (optional)
    r"([A-Za-z]?)\s*"               # Group 4: Fees Type (optional, e.g., 'A', 'T')
    r"([\d\s]*\.\d{2})?\s+"         # Group 5: Debit or Credit Amount (optional)
    r"([\d\s]*\.\d{2})"             # Group 6: Balance Amount
)

def clean_data_absa(extracted_text, client_id):
    """
    Processes and cleans Absa bank statement text.

    Args:
        extracted_text (list): List of extracted text lines from the PDF.
        client_id (str): ID of the client in Firestore.

    Returns:
        list: Processed transaction data.
    """
    print("Processing Absa bank statement...")
    cleaned_transactions = extract_transactions_absa(extracted_text, client_id)
    return cleaned_transactions

def extract_transactions_absa(extracted_text, client_id):
    """
    Extracts transactions from the provided text using regex.

    Args:
        extracted_text (list): List of extracted text lines from the bank statement.
        client_id (str): ID of the client in Firestore.

    Returns:
        list: Processed transaction data in the form of dictionaries.
    """

    # Clean the extracted text
    raw_data_array = extracted_text

    # Define chunk size (e.g., 50 lines per chunk)
    chunk_size = 50

    # Split raw_data_array into chunks
    raw_data_chunks = chunk_array(raw_data_array, chunk_size)

    # Debug print for the number of chunks
    # print(f"DEBUG: Split raw data into {len(raw_data_chunks)} chunks.")

    transactions = []

    for chunk_index, chunk in enumerate(raw_data_chunks):
        print(f"DEBUG: Processing chunk {chunk_index + 1} of {len(raw_data_chunks)}...")

        # Initialize a variable to track the previous balance
        previous_balance = None

        for line in chunk:
            cleaned_line = line.strip()
            match = re.match(transaction_regex_absa, cleaned_line)
            
            if not match:
                print(f"Skipping unprocessable line: {cleaned_line}")
                continue

            try:
                # Extract the amounts and balance from the regex match
                debit_or_credit = float(match.group(5).replace(" ", "")) if match.group(5) else None
                balance_amount = float(match.group(6).replace(" ", "")) if match.group(6) else None

                # Determine if the amount is a debit or credit
                debit_amount = None
                credit_amount = None

                if previous_balance is not None and balance_amount is not None:
                    # Calculate the difference between the current and previous balance
                    balance_difference = round(balance_amount - previous_balance, 2)

                    if balance_difference < 0:
                        debit_amount = abs(balance_difference)
                    elif balance_difference > 0:
                        credit_amount = abs(balance_difference)
                    else:
                        # If no difference, assume debit_or_credit value is unknown or zero
                        debit_amount = 0.00
                        credit_amount = 0.00

                # Update the previous balance for the next iteration
                previous_balance = balance_amount

                # Append the transaction to the list
                transactions.append({
                    "date1": match.group(1).strip(),
                    "date2": None,  # Assuming `date2` is not part of this regex
                    "description": match.group(2).strip(),
                    "fees_amount": float(match.group(3).replace(" ", "")) if match.group(3) else None,
                    "fees_type": match.group(4).strip() if match.group(4) else None,
                    "debit_amount": debit_amount,
                    "credit_amount": credit_amount,
                    "balance_amount": balance_amount,
                })

            except ValueError as e:
                print(f"Error processing line: {line}, Error: {e}")

    # Update Firestore with list data only if transactions are found
    # if transactions:
    #     try:
    #         db = firestore.client()
    #         doc_ref = db.collection("clients").document(client_id)
    #         doc_ref.update({
    #             "number_of_transactions": len(transactions),
    #             "transactions": transactions,
    #         })
    #         print(f"Updated Firestore with {len(transactions)} transactions for client {client_id}.")
    #     except Exception as e:
    #         print(f"Error updating Firestore: {e}")
    # else:
    #     print(f"No valid transactions found for client {client_id}. Skipping Firestore update.")

    return transactions


# Regex for extracting transaction details
# transaction_regex_absa = r"(\d{2}/\d{2}/\d{4})(.*?)(?=\s\d{2}/\d{2}/\d{4}|$)"

# def clean_data_absa(extracted_text, client_id):
#     """
#     Processes and cleans Absa bank statement text.

#     Args:
#         extracted_text (str): Extracted text from the PDF.
#         client_id (str): ID of the client in Firestore.

#     Returns:
#         list: Processed transaction data.
#     """
#     print("Processing Absa bank statement...")
#     cleaned_transactions = extract_transactions_absa(extracted_text, client_id)
#     return cleaned_transactions

# def extract_transactions_absa(extracted_text, client_id):
#     """
#     Extracts transactions from the provided text using regex.

#     Args:
#         extracted_text (str): Extracted text from the bank statement.
#         client_id (str): ID of the client in Firestore.

#     Returns:
#         list: Processed transaction data in the form of dictionaries.
#     """

#     # Clean the extracted text
#     extracted_text = extracted_text.replace(",", "").replace("*", "").strip()
#     extracted_text = re.sub(r"\s+", " ", extracted_text)  # Replace multiple spaces with a single space

#     transactions = []

#     for line in extracted_text.splitlines():
#         cleaned_line = line.strip()
#         match = re.match(transaction_regex_absa, cleaned_line)
        
#         if not match:
#             print(f"Skipping unprocessable line: {cleaned_line}")
#             continue

#         try:
#             transactions.append({
#                 "date1": match.group(1).strip(),
#                 "description": match.group(2).strip(),
#                 "fees_amount": float(match.group(3).replace(" ", "")) if match.group(3) else None,
#                 "fees_type": match.group(4).strip() if match.group(4) else None,
#                 "debit_or_credit": float(match.group(5).replace(" ", "")) if match.group(5) else None,
#                 "balance_amount": float(match.group(6).replace(" ", "")) if match.group(6) else None,
#             })
#         except ValueError as e:
#             print(f"Error processing line: {line}, Error: {e}")

#     # Update Firestore with list data only if transactions are found
#     if transactions:
#         try:
#             db = firestore.client()
#             doc_ref = db.collection("clients").document(client_id)
#             doc_ref.update({
#                 "number_of_transactions": len(transactions),
#                 "transactions": transactions,
#             })
#             print(f"Updated Firestore with {len(transactions)} transactions for client {client_id}.")
#         except Exception as e:
#             print(f"Error updating Firestore: {e}")
#     else:
#         print(f"No valid transactions found for client {client_id}. Skipping Firestore update.")

#     return transactions

# def extract_transactions_absa(extracted_text, client_id):
#     """
#     Extracts transactions from the provided text using regex.

#     Args:
#         extracted_text (str): Extracted text from the bank statement.
#         client_id (str): ID of the client in Firestore.

#     Returns:
#         list: Processed transaction data in the form of dictionaries.
#     """

#     # # Clean text: remove commas and asterisks to reduce memory usage
#     # extracted_text = extracted_text.replace(",", "").replace("*", "")

#     # # Remove "(Effective dd/mm/yyyy)"
#     # extracted_text = re.sub(r'\(Effective (\d{2}/\d{2}/\d{4})\)', '', extracted_text)

#     # # Pad single-digit day or month with a leading zero
#     # extracted_text = re.sub(r'(?<!\d)(\d{1})/(\d{2})/(\d{4})', r'0\1/\2/\3', extracted_text)
#     # extracted_text = re.sub(r'(?<!\d)(\d{2})/(\d{1})/(\d{4})', r'\1/0\2/\3', extracted_text)

#     # # Match all transactions using regex
#     # matches = re.findall(transaction_regex_absa, extracted_text, re.DOTALL)
#     # print(f"Found {len(matches)} transactions.")

#     # # Convert matches to a string for further processing
#     # matches_string = "\n".join(" ".join(match).strip() for match in matches)

#     # # Clean matches string with specific patterns
#     # matches_string = re.sub(r'(\n.*REFER TO BRANCH.*)', '', matches_string)
#     # matches_string = re.sub(r'(.*)YOUR PRICING PLAN.*', r'\1', matches_string)
#     # matches_string = re.sub(r'(.*)Page\s\d+\s?of\s?\d+', r'\1', matches_string)
#     # matches_string = re.sub(r'(.*)Absa Bank.*', r'\1', matches_string)
#     # matches_string = re.sub(r'(.*)Our Privacy Notice.*', r'\1', matches_string)
#     # matches_string = re.sub(r'(\n.*eStamp.*)', '', matches_string)
#     # matches_string = re.sub(r'(\n.*General Enquiries.*)', '', matches_string)
#     # matches_string = re.sub(r'(.*)ABSA Bank Limited.*', r'\1', matches_string)
#     # matches_string = re.sub(r'^\d{2}/\d{2}/\d{4}\s*$', '', matches_string, flags=re.MULTILINE)

#     # # Extract transactions using detailed regex
#     # detailed_regex = (
#     #     r"(\d{2}/\d{2}/\d{4})\s+"          # Group 1: Date (dd/mm/yyyy)
#     #     r"(.*?)\s+"                        # Group 2: Description
#     #     r"(\d*?\s?\d*\.\d{2})?\s+"         # Group 3: Fees Amount (optional)
#     #     r"(\w{1})?\s+"                     # Group 4: Fees Type (optional, e.g., 'F' or 'C')
#     #     r"(\d*\s?\d*\.\d{2})\s+"           # Group 5: Debit or Credit Amount
#     #     r"(\d*\s?\d*\.\d{2})"              # Group 6: Balance Amount
#     # )
#     # matches = re.findall(detailed_regex, matches_string, re.DOTALL)

#     transactions = []

#     for line in extracted_text:
#         # Clean each line
#         cleaned_line = line.replace(",", "").replace("*", "").strip()

#         # Apply regex to find matches
#         match = re.match(transaction_regex_absa, cleaned_line)
#         # print(f"Found {len(match)} transactions.")
#         if match:
#             try:
#                 date1 = match[0].strip()
#                 description = match[1].strip()
#                 fees_amount = float(match[2].replace(" ", "")) if match[2] else None
#                 fees_type = match[3].strip() if match[3] else None
#                 debit_or_credit = float(match[4].replace(" ", "")) if match[4] else None
#                 balance_amount = float(match[5].replace(" ", "")) if match[5] else None

#                 transactions.append({
#                     "date1": date1,
#                     "date2": None,
#                     "description": description,
#                     "fees_amount": fees_amount,
#                     "fees_type": fees_type,
#                     "debit_or_credit": debit_or_credit,
#                     "balance_amount": balance_amount,
#                 })
                
#             except Exception as e:
#                 print(f"Error processing line: {line}, Error: {e}")


#     # Update Firestore with list data
#     try:
#         db = firestore.client()
#         doc_ref = db.collection("clients").document(client_id)
#         doc_ref.update({
#             "number_of_transactions": len(transactions),
#             "transactions": transactions,
#         })
#         print(f"Updated Firestore with {len(transactions)} transactions for client {client_id}.")
#     except Exception as e:
#         print(f"Error updating Firestore: {e}")

#     return transactions

# the errors and log


# 2025-01-28T21:11:51.311241Z ? handleextractdata: Error processing line: 26/07/2024 Digital Payment Dt Settlement 500.00 2 353.91, Error: could not convert string to float: 'DigitalPaymentDtSettlement500.002353.91'
# 2025-01-28T21:11:51.311270Z ? handleextractdata: Error processing line: 26/07/2024 Proof Of Paymt Sms Settlement 1.25 A 2 353.91, Error: could not convert string to float: 'ProofOfPaymtSmsSettlement1.25A2353.91'
# 2025-01-28T21:11:51.311293Z ? handleextractdata: Error processing line: 27/07/2024 Pos Purchase Settlement 74.00 2 279.91, Error: could not convert string to float: 'PosPurchaseSettlement74.002279.91'
# 2025-01-28T21:11:51.311321Z ? handleextractdata: Error processing line: 27/07/2024 Pos Purchase Settlement 30.98 2 248.93, Error: could not convert string to float: 'PosPurchaseSettlement30.982248.93'
# 2025-01-28T21:11:51.311343Z ? handleextractdata: Error processing line: 28/07/2024 Digital Transf Cr Settlement 1 000.00 3 248.93, Error: could not convert string to float: 'DigitalTransfCrSettlement1000.003248.93'
# 2025-01-28T21:11:51.311373Z ? handleextractdata: Error processing line: 28/07/2024 Digital Payment Cr Settlement 320.00 3 568.93, Error: could not convert string to float: 'DigitalPaymentCrSettlement320.003568.93'
# 2025-01-28T21:11:51.311395Z ? handleextractdata: Error processing line: 28/07/2024 Pos Purchase Settlement 153.40 3 415.53, Error: could not convert string to float: 'PosPurchaseSettlement153.403415.53'
# 2025-01-28T21:11:51.311437Z ? handleextractdata: Error processing line: 28/07/2024 Pos Purchase Settlement 80.00 3 335.53, Error: could not convert string to float: 'PosPurchaseSettlement80.003335.53'
# 2025-01-28T21:11:51.311454Z ? handleextractdata: Error processing line: 30/07/2024 Acb Credit Settlement 2 130.32 5 465.85, Error: could not convert string to float: 'AcbCreditSettlement2130.325465.85'
# 2025-01-28T21:11:51.311482Z ? handleextractdata: Error processing line: 09/10/2024, Error: no such group
# 2025-01-28T21:11:51.311524Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 80.00 5 385.85, Error: could not convert string to float: 'PosPurchaseSettlement80.005385.85'
# 2025-01-28T21:11:51.311543Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 36.00 5 349.85, Error: could not convert string to float: 'PosPurchaseSettlement36.005349.85'
# 2025-01-28T21:11:51.311566Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 24.99 5 324.86, Error: could not convert string to float: 'PosPurchaseSettlement24.995324.86'
# 2025-01-28T21:11:51.311591Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 1 099.00 4 225.86, Error: could not convert string to float: 'PosPurchaseSettlement1099.004225.86'
# 2025-01-28T21:11:51.311618Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 80.00 4 145.86, Error: could not convert string to float: 'PosPurchaseSettlement80.004145.86'
# 2025-01-28T21:11:51.311648Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 80.00 4 065.86, Error: could not convert string to float: 'PosPurchaseSettlement80.004065.86'
# 2025-01-28T21:11:51.311669Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 215.00 3 850.86, Error: could not convert string to float: 'PosPurchaseSettlement215.003850.86'
# 2025-01-28T21:11:51.311700Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 250.00 3 600.86, Error: could not convert string to float: 'PosPurchaseSettlement250.003600.86'
# 2025-01-28T21:11:51.311737Z ? handleextractdata: Error processing line: 30/07/2024 Pos Purchase Settlement 135.00 3 465.86, Error: could not convert string to float: 'PosPurchaseSettlement135.003465.86'
# 2025-01-28T21:11:51.311834Z ? handleextractdata: Error processing line: 31/07/2024 Acb Credit Settlement 4 208.91 7 674.77, Error: could not convert string to float: 'AcbCreditSettlement4208.917674.77'
# 2025-01-28T21:11:51.311838Z ? handleextractdata: Error processing line: 31/07/2024 Cashsend Digital Settlement 17.50 T 700.00 6 974.77, Error: could not convert string to float: 'CashsendDigitalSettlement17.50T700.006974.77'
# 2025-01-28T21:11:51.311842Z ? handleextractdata: Error processing line: 31/07/2024 Digital Payment Dt Settlement 400.00 6 574.77, Error: could not convert string to float: 'DigitalPaymentDtSettlement400.006574.77'
# 2025-01-28T21:11:51.311847Z ? handleextractdata: Error processing line: 31/07/2024 Proof Of Paymt Sms Settlement 1.25 A 6 574.77, Error: could not convert string to float: 'ProofOfPaymtSmsSettlement1.25A6574.77'
# 2025-01-28T21:11:51.311863Z ? handleextractdata: Error processing line: 31/07/2024 Cashsend Digital Settlement 22.50 T 850.00 5 724.77, Error: could not convert string to float: 'CashsendDigitalSettlement22.50T850.005724.77'
# 2025-01-28T21:11:51.311886Z ? handleextractdata: Error processing line: 31/07/2024 Pos Purchase Settlement 130.00 5 594.77, Error: could not convert string to float: 'PosPurchaseSettlement130.005594.77'
# 2025-01-28T21:11:51.311914Z ? handleextractdata: Error processing line: 31/07/2024 Pos Purchase Settlement 49.00 5 545.77, Error: could not convert string to float: 'PosPurchaseSettlement49.005545.77'
# 2025-01-28T21:11:51.311948Z ? handleextractdata: Error processing line: 31/07/2024 Pos Purchase Settlement 89.00 5 456.77, Error: could not convert string to float: 'PosPurchaseSettlement89.005456.77'
# 2025-01-28T21:11:51.311970Z ? handleextractdata: Error processing line: 31/07/2024 Pos Purchase Settlement 160.00 5 296.77, Error: could not convert string to float: 'PosPurchaseSettlement160.005296.77'
# 2025-01-28T21:11:51.311996Z ? handleextractdata: Error processing line: 09/10/2024, Error: no such group
# 2025-01-28T21:11:51.312034Z ? handleextractdata: Error processing line: 31/07/2024 Digital Payment Dt Settlement 350.00 4 946.77, Error: could not convert string to float: 'DigitalPaymentDtSettlement350.004946.77'
# 2025-01-28T21:11:51.312059Z ? handleextractdata: Error processing line: 31/07/2024 Proof Of Paymt Sms Settlement 1.25 A 4 946.77, Error: could not convert string to float: 'ProofOfPaymtSmsSettlement1.25A4946.77'
# 2025-01-28T21:11:51.312130Z ? handleextractdata: Error processing line: 09/10/2024, Error: no such group
# 2025-01-28T21:11:51.312206Z ? handleextractdata: Error processing line: 09/10/2024, Error: no such group
# 2025-01-28T21:11:51.312264Z ? handleextractdata: Error processing line: 09/10/2024, Error: no such group
# 2025-01-28T21:11:51.355441Z ? handleextractdata: Updated Firestore with 0 transactions for client 9709270047084.
# ubuntu@Echo:~/cashman$ 


############ Absa Bank Statement ############