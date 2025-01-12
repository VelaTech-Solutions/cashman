# functions-py/config.py

"""
Load environment variables from .env and make them accessible within Python code.
Place this file in the 'functions-py' folder and import wherever needed.
"""

import os
from dotenv import load_dotenv

# Determine the path to the project root (parent of functions-py)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Construct the path to the .env file in the root
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Load .env file
load_dotenv(dotenv_path=ENV_PATH)

# Retrieve variables from environment
API_KEY = os.getenv("API_KEY")
AUTH_DOMAIN = os.getenv("AUTH_DOMAIN")
PROJECT_ID = os.getenv("PROJECT_ID")
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET")
MESSAGING_SENDER_ID = os.getenv("MESSAGING_SENDER_ID")
APP_ID = os.getenv("APP_ID")
MEASUREMENT_ID = os.getenv("MEASUREMENT_ID")

# You can add any other variables you need below
# DB_URL = os.getenv("DB_URL", default="fallback_value")



# Debugging
# print("API_KEY:", API_KEY)
# print("AUTH_DOMAIN:", AUTH_DOMAIN)
# print("PROJECT_ID:", PROJECT_ID)
# print("STORAGE_BUCKET:", STORAGE_BUCKET)
# print("MESSAGING_SENDER_ID:", MESSAGING_SENDER_ID)
# print("APP_ID:", APP_ID)
# print("MEASUREMENT_ID:", MEASUREMENT_ID)
