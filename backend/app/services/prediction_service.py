import os
import sys
import pandas as pd

# Add ML directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml")))
from predict import get_prediction_engine

CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "synthetic_mastitis_data.csv"))

_df_cached = None

def get_cached_dataframe():
    global _df_cached
    if _df_cached is None:
        _df_cached = pd.read_csv(CSV_PATH)
    return _df_cached

def get_live_prediction_for_animal(animal_id: str) -> dict:
    """
    Retrieves dataset history for animal and runs ML Prediction Engine.
    """
    df = get_cached_dataframe()
    engine = get_prediction_engine()
    return engine.predict_animal_risk(animal_id, df)
