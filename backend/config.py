import os

# Get the absolute path of the current file (config.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Set the DB_PATH to point to the data folder within backend
DB_PATH = os.path.join(BASE_DIR, "data", "notes.db")
