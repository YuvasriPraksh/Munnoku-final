import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "database", "munnokku.db"))

def get_db_connection():
    """
    Returns a SQLite connection with dict-like row factory.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
