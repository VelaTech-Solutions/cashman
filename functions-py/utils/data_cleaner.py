# utils/data_cleaner.py

def clean_text(line):
    """
    Cleans a single line of text by removing unwanted characters.
    
    Args:
        line (str): A single line from extracted data.

    Returns:
        str: Cleaned text.
    """
    return line.replace(",", "").replace("*", " ").strip()

def clean_list(lines):
    """
    Cleans a list of transaction lines.

    Args:
        lines (list): List of transaction lines as strings.

    Returns:
        list: Cleaned transaction lines.
    """
    return [clean_text(line) for line in lines]
