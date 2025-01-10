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
    "Absa": clean_absa,
    "Capitec": clean_capitec,
    "FNB": clean_fnb,
    "Nedbank": clean_ned,
    "Standard Bank": clean_standard,
    "TymeBank": clean_tyme,
}

# Function to route cleaning based on bank name
def clean_text_by_bank(bank_name, text):
    if bank_name not in CLEAN_FUNCTIONS:
        raise ValueError(f"Unsupported bank: {bank_name}")
    return CLEAN_FUNCTIONS[bank_name](text)
