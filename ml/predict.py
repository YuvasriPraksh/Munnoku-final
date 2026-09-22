import os
import sys
import joblib
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from feature_engineering import create_temporal_features, get_feature_columns
from explain import explain_prediction_with_shap

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best_model.pkl")
FEATURE_COLS_PATH = os.path.join(os.path.dirname(__file__), "models", "feature_columns.pkl")

class MastitisPredictionEngine:
    def __init__(self, model_path: str = MODEL_PATH, feature_cols_path: str = FEATURE_COLS_PATH):
        self.model = None
        self.feature_cols = []
        self._load_artifacts(model_path, feature_cols_path)
        
    def _load_artifacts(self, model_path, feature_cols_path):
        if os.path.exists(model_path) and os.path.exists(feature_cols_path):
            try:
                self.model = joblib.load(model_path)
                self.feature_cols = joblib.load(feature_cols_path)
            except Exception:
                self.feature_cols = get_feature_columns()
        else:
            self.feature_cols = get_feature_columns()
            
    def predict_animal_risk(self, animal_id: str, historical_df: pd.DataFrame) -> dict:
        """
        Executes prediction on historical sensor data for a specific animal.
        Handles unknown animal_id, insufficient history (<3 records), missing values safely.
        Returns standardized risk prediction contract.
        """
        # Safe check for input dataframe
        if historical_df is None or historical_df.empty:
            return self._build_insufficient_response(animal_id, "Empty historical dataset provided.")
            
        if "Animal_ID" not in historical_df.columns:
            return self._build_insufficient_response(animal_id, "Dataset missing 'Animal_ID' column.")
            
        animal_records = historical_df[historical_df["Animal_ID"] == animal_id].copy()
        
        # Edge Case 1: Unknown Animal
        if animal_records.empty:
            return self._build_insufficient_response(animal_id, f"Animal ID '{animal_id}' not found in database records.")
            
        history_length = len(animal_records)
        
        # Edge Case 2: Fewer than 3 historical records
        if history_length < 3:
            return self._build_insufficient_response(
                animal_id,
                f"Insufficient historical data ({history_length} record{'s' if history_length > 1 else ''} available; minimum 3 daily records required)."
            )
            
        # Fill missing numeric values safely
        numeric_cols = animal_records.select_dtypes(include=[np.number]).columns
        animal_records[numeric_cols] = animal_records[numeric_cols].fillna(animal_records[numeric_cols].mean()).fillna(0.0)
        
        # Feature Engineering on historical records
        featured_df = create_temporal_features(animal_records)
        latest_row = featured_df.iloc[-1:]
        
        # Calculate Data Confidence independently of Risk Level
        if history_length < 3:
            confidence = "INSUFFICIENT"
        elif history_length < 7:
            confidence = "LOW"
        elif history_length < 14:
            confidence = "MEDIUM"
        else:
            confidence = "HIGH"
            
        # Model Prediction
        if self.model is not None:
            X_latest = latest_row[self.feature_cols]
            risk_prob = float(self.model.predict_proba(X_latest)[0, 1])
        else:
            conv_score = float(latest_row.get("multi_signal_convergence_score", pd.Series([0.0])).values[0])
            risk_prob = min(0.95, conv_score * 0.9)
            
        # Categorize Risk Level (Configurable thresholds: HIGH >= 0.70, MODERATE >= 0.45, LOW >= 0.25)
        if risk_prob >= 0.70:
            risk_level = "HIGH"
        elif risk_prob >= 0.45:
            risk_level = "MODERATE"
        elif risk_prob >= 0.25:
            risk_level = "LOW"
        else:
            risk_level = "NO RISK"
            
        # Risk Trend (Comparing latest vs 3 days ago if available)
        if len(featured_df) >= 4 and self.model is not None:
            prev_row = featured_df.iloc[-4:-3][self.feature_cols]
            prev_prob = float(self.model.predict_proba(prev_row)[0, 1])
            diff = risk_prob - prev_prob
            if diff > 0.05:
                trend = "RISING"
            elif diff < -0.05:
                trend = "DECLINING"
            else:
                trend = "STABLE"
        elif len(featured_df) < 4:
            trend = "INSUFFICIENT_HISTORY"
        else:
            trend = "RISING" if risk_level in ["HIGH", "MODERATE"] else "STABLE"
            
        # Explainability (Top Factors via SHAP)
        top_factors = []
        if self.model is not None:
            top_factors = explain_prediction_with_shap(self.model, latest_row, self.feature_cols, top_k=3)
            
        # Non-prescriptive recommendation
        if risk_level == "HIGH":
            recommendation = "Perform CMT / SCC verification immediately. Isolate quarter if positive and consult veterinarian."
        elif risk_level == "MODERATE":
            recommendation = "Monitor milk yield and conductivity closely over next 48 hours. Schedule CMT verification."
        elif risk_level == "LOW":
            recommendation = "Maintain routine milking hygiene and baseline observation."
        else:
            recommendation = "No action required. All signals within normal animal baseline."
            
        return {
            "animal_id": animal_id,
            "risk_probability": round(risk_prob, 2),
            "risk_level": risk_level,
            "risk_trend": trend,
            "forecast_horizon": "7-14 days",
            "data_confidence": confidence,
            "top_factors": top_factors,
            "recommendation": recommendation,
            "dataset_notice": "SYNTHETIC / DEMONSTRATION DATA"
        }

    def _build_insufficient_response(self, animal_id: str, reason: str) -> dict:
        return {
            "animal_id": animal_id,
            "risk_probability": 0.0,
            "risk_level": "NO RISK",
            "risk_trend": "INSUFFICIENT_HISTORY",
            "forecast_horizon": "7-14 days",
            "data_confidence": "INSUFFICIENT",
            "top_factors": [],
            "recommendation": f"Insufficient data for reliable forecasting. {reason}",
            "dataset_notice": "SYNTHETIC / DEMONSTRATION DATA"
        }

_predictor = None

def get_prediction_engine():
    global _predictor
    if _predictor is None:
        _predictor = MastitisPredictionEngine()
    return _predictor
