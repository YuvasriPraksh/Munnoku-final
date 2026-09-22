import os
import sys
import pytest
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from preprocessing import load_and_preprocess_raw_data, split_time_series_chronologically
from feature_engineering import create_temporal_features, get_feature_columns
from predict import MastitisPredictionEngine

DATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "synthetic_mastitis_data.csv")
)

@pytest.fixture
def raw_df():
    return load_and_preprocess_raw_data(DATA_PATH)

@pytest.fixture
def predictor():
    return MastitisPredictionEngine()

# Test 1: Valid Prediction
def test_valid_prediction(raw_df, predictor):
    res = predictor.predict_animal_risk("COW-027", raw_df)
    assert res["animal_id"] == "COW-027"
    assert "risk_probability" in res
    assert "risk_level" in res
    assert res["dataset_notice"] == "SYNTHETIC / DEMONSTRATION DATA"

# Test 2: Unknown Animal
def test_unknown_animal(raw_df, predictor):
    res = predictor.predict_animal_risk("COW-9999", raw_df)
    assert res["animal_id"] == "COW-9999"
    assert res["risk_level"] == "NO RISK"
    assert res["data_confidence"] == "INSUFFICIENT"
    assert res["risk_trend"] == "INSUFFICIENT_HISTORY"
    assert "Insufficient data" in res["recommendation"]

# Test 3: Insufficient History (< 3 records)
def test_insufficient_history(raw_df, predictor):
    short_df = raw_df[raw_df["Animal_ID"] == "COW-001"].iloc[:2].copy()
    res = predictor.predict_animal_risk("COW-001", short_df)
    assert res["data_confidence"] == "INSUFFICIENT"
    assert res["risk_trend"] == "INSUFFICIENT_HISTORY"
    assert "minimum 3 daily records required" in res["recommendation"]

# Test 4: Missing Values / NaNs in Payload
def test_missing_values_handling(raw_df, predictor):
    nan_df = raw_df[raw_df["Animal_ID"] == "COW-001"].copy()
    nan_df.loc[nan_df.index[5:10], "Milk_Yield_Kg"] = np.nan
    nan_df.loc[nan_df.index[5:10], "Electrical_Conductivity_mS_cm"] = np.nan
    
    res = predictor.predict_animal_risk("COW-001", nan_df)
    assert res["animal_id"] == "COW-001"
    assert 0.0 <= res["risk_probability"] <= 1.0

# Test 5: Probability Range
def test_probability_range(raw_df, predictor):
    for cow_id in ["COW-001", "COW-012", "COW-027"]:
        res = predictor.predict_animal_risk(cow_id, raw_df)
        assert 0.0 <= res["risk_probability"] <= 1.0

# Test 6: Risk-Level Mapping
def test_risk_level_mapping(raw_df, predictor):
    res = predictor.predict_animal_risk("COW-027", raw_df)
    assert res["risk_level"] in ["NO RISK", "LOW", "MODERATE", "HIGH"]

# Test 7: Risk Trend Calculation
def test_risk_trend_calculation(raw_df, predictor):
    res = predictor.predict_animal_risk("COW-027", raw_df)
    assert res["risk_trend"] in ["RISING", "STABLE", "DECLINING", "INSUFFICIENT_HISTORY"]

# Test 8: SHAP Factor Generation
def test_shap_factor_generation(raw_df, predictor):
    res = predictor.predict_animal_risk("COW-027", raw_df)
    assert isinstance(res["top_factors"], list)
    for factor in res["top_factors"]:
        assert "factor_code" in factor
        assert "description" in factor
        assert "impact_score" in factor
        assert "direction" in factor

# Test 9: Independent Data Confidence Calculation
def test_independent_data_confidence(raw_df, predictor):
    # 5 records -> LOW confidence
    df_5 = raw_df[raw_df["Animal_ID"] == "COW-027"].iloc[:5].copy()
    res_5 = predictor.predict_animal_risk("COW-027", df_5)
    assert res_5["data_confidence"] == "LOW"
    
    # 10 records -> MEDIUM confidence
    df_10 = raw_df[raw_df["Animal_ID"] == "COW-027"].iloc[:10].copy()
    res_10 = predictor.predict_animal_risk("COW-027", df_10)
    assert res_10["data_confidence"] == "MEDIUM"

# Test 10: Synthetic Data Disclaimer
def test_synthetic_data_disclaimer(raw_df, predictor):
    res = predictor.predict_animal_risk("COW-027", raw_df)
    assert res.get("dataset_notice") == "SYNTHETIC / DEMONSTRATION DATA"
