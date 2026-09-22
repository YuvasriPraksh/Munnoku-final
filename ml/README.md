# MUNNOKKU — ML Subsystem & Validation Hardening

Machine learning prediction engine for **MUNNOKKU — AI-Based Early Forecasting of Bovine Mastitis**.

## Components

- `preprocessing.py`: Chronological train/val/test splitting per animal.
- `feature_engineering.py`: Rolling statistics (3d/7d/14d), individual animal baselines, and **Multi-Signal Temporal Convergence**.
- `train.py`: Model benchmarking script comparing Logistic Regression, Random Forest, XGBoost, and LightGBM.
- `harden_ml.py`: Phase 2 validation hardening (Stronger temporal split, Heuristic baselines A/B/C comparison, Feature-group ablation A through H, Probability calibration, Lead-time audit).
- `evaluate.py`: Performance metrics and lead-time evaluation.
- `explain.py`: SHAP TreeExplainer factor importance layer.
- `predict.py`: Hardened prediction interface with edge case handling (unknown animal, insufficient history, missing NaNs).

## Frozen ML Service Output Schema

```json
{
  "animal_id": "COW-027",
  "risk_probability": 0.84,
  "risk_level": "NO RISK | LOW | MODERATE | HIGH",
  "risk_trend": "RISING | STABLE | DECLINING | INSUFFICIENT_HISTORY",
  "forecast_horizon": "7-14 days",
  "data_confidence": "INSUFFICIENT | LOW | MEDIUM | HIGH",
  "top_factors": [
    {
      "factor_code": "ec_deviation_pct",
      "description": "Milk Electrical Conductivity elevated relative to 14-day baseline",
      "impact_score": 0.45,
      "direction": "INCREASES_RISK | REDUCES_RISK"
    }
  ],
  "recommendation": "Perform CMT / SCC verification immediately.",
  "dataset_notice": "SYNTHETIC / DEMONSTRATION DATA"
}
```

## Run Validation & Test Suite

```bash
# Execute ML Hardening
python ml/harden_ml.py

# Run Pytest ML Suite
python -m pytest ml/tests/
```
