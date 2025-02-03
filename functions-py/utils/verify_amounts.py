

# Banks

# Absa
# Capitec debit/credit banalce 
# Fnb  debit/credit banalce Fee amount
# Ned Fee amount debit/credit banalce
# Standard
# Tyme




# ========================
# Amount Verification Function
# ========================
# def verify_amounts(transaction, previous_balance):
#     """
#     Verify the transaction's amounts using the following interpretation:
#       - balance_amount comes from Group 4.
#       - credit_amount comes from Group 5.
#       - fee_amount comes from Group 6.
#     The expected balance is computed as:
#          Expected Balance = Previous Balance + Credit - Debit - Fee
#     (Debit is inferred if balance < credit.)
#     Returns a tuple (isValid, expected_balance, error_message).
#     """
#     balance = transaction["balance_amount"]
#     credit = transaction["credit_amount"] or 0.0
#     debit = transaction["debit_amount"] or 0.0
#     fee = transaction["fees_amount"] or 0.0

#     expected_balance = previous_balance + credit - debit - fee

#     if balance is not None and abs(balance - expected_balance) > 0.01:
#         return False, expected_balance, "Balance mismatch"
#     return True, expected_balance, None


# Mapping for each bank's amount verification logic
def verify_amounts(transaction, previous_balance, bank_name):
    bank_verification_map = {
        "Absa": verify_amounts_absa,
        "Capitec": verify_amounts_capitec,
        "FNB": verify_amounts_fnb,
        "Nedbank": verify_amounts_nedbank,
        "Standard": verify_amounts_standard,
        "Tyme": verify_amounts_tyme
    }
    
    # Select the correct function for the bank
    verify_function = bank_verification_map.get(bank_name, verify_amounts_generic)
    return verify_function(transaction, previous_balance)


# ========================
# Absa Amount Verification (Assumed similar to FNB for now)
# ========================
def verify_amounts_absa(transaction, previous_balance):
    return verify_amounts_fnb(transaction, previous_balance)

# ========================
# Capitec Amount Verification
# ========================
def verify_amounts_capitec(transaction, previous_balance):
    balance = transaction["balance_amount"]
    credit = transaction["credit_amount"] or 0.0
    debit = transaction["debit_amount"] or 0.0
    
    expected_balance = previous_balance + credit - debit
    return validate_balance(balance, expected_balance)

# ========================
# FNB Amount Verification (Debit/Credit, Balance in the middle, Fee last)
# ========================
def verify_amounts_fnb(transaction, previous_balance):
    balance = transaction["balance_amount"]
    credit = transaction["credit_amount"] or 0.0
    debit = transaction["debit_amount"] or 0.0
    fee = transaction["fees_amount"] or 0.0
    
    expected_balance = previous_balance + credit - debit - fee
    return validate_balance(balance, expected_balance)


# ========================
# Nedbank Amount Verification (Fee first, then Debit/Credit, then Balance)
# ========================
def verify_amounts_nedbank(transaction, previous_balance):
    balance = transaction["balance_amount"]
    credit = transaction["credit_amount"] or 0.0
    debit = transaction["debit_amount"] or 0.0
    fee = transaction["fees_amount"] or 0.0
    
    expected_balance = previous_balance - fee + credit - debit
    return validate_balance(balance, expected_balance)

# ========================
# Standard Bank Amount Verification (Placeholder for now)
# ========================
def verify_amounts_standard(transaction, previous_balance):
    return verify_amounts_fnb(transaction, previous_balance)

# ========================
# Tyme Bank Amount Verification (Placeholder for now)
# ========================
def verify_amounts_tyme(transaction, previous_balance):
    return verify_amounts_fnb(transaction, previous_balance)

# ========================
# Generic Verification (Fallback)
# ========================
def verify_amounts_generic(transaction, previous_balance):
    return verify_amounts_fnb(transaction, previous_balance)

# ========================
# Common Validation Function
# ========================
def validate_balance(actual_balance, expected_balance):
    if actual_balance is not None and abs(actual_balance - expected_balance) > 0.01:
        return False, expected_balance, f"Balance mismatch. Expected: {expected_balance}, Found: {actual_balance}"
    return True, expected_balance, None
