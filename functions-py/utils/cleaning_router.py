

# Import cleaning functions
from banks.clean_absa import clean_data as clean_absa
from banks.clean_capitec import clean_data as clean_capitec
from banks.clean_fnb import clean_data as clean_fnb
from banks.clean_ned import clean_data as clean_ned
from banks.clean_standard import clean_data as clean_standard
from banks.clean_tyme import clean_data as clean_tyme



def clean_text_by_bank(bank_name, raw_data):
    """Route extracted text to the appropriate cleaning function."""
    clean_function_map = {
        "Absa Bank": clean_absa,
        "Capitec Bank": clean_capitec,
        "Fnb Bank": clean_fnb,
        "Ned Bank": clean_ned,
        "Standard Bank": clean_standard,
        "Tyme Bank": clean_tyme,
    }
    if bank_name not in clean_function_map:
        raise ValueError(f"Unsupported bank: {bank_name}")
    
    return clean_function_map[bank_name](raw_data)










