# __init__.py for the bank module

# Import cleaning functions from each bank script
from .clean_absa import clean_data as clean_absa
from .clean_capitec import clean_data as clean_capitec
from .clean_fnb import clean_data as clean_fnb
from .clean_ned import clean_data as clean_ned
from .clean_standard import clean_data as clean_standard
from .clean_tyme import clean_data as clean_tyme

# Create a mapping for bank-specific cleaning functions
CLEAN_FUNCTIONS = {
    "Absa Bank": clean_absa,
    "Capitec Bank": clean_capitec,
    "Fnb Bank": clean_fnb,
    "Ned Bank": clean_ned,
    "Standard Bank": clean_standard,
    "Tyme Bank": clean_tyme,
}


# Function to route cleaning based on bank name
def clean_text_by_bank(bank_name, raw_data):
    if bank_name not in CLEAN_FUNCTIONS:
        raise ValueError(f"Unsupported bank: {bank_name}")
    return CLEAN_FUNCTIONS[bank_name](raw_data)
