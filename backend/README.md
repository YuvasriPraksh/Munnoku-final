# MUNNOKKU — Backend Subsystem & API Contract

FastAPI RESTful web service connecting the React frontend to the SQLite database and the ML prediction engine.

## Frozen Prediction API Contract Schema

All prediction endpoints (`GET /api/v1/animals/{animal_id}/prediction`, `GET /api/v1/animals/{animal_id}`) return the following standardized prediction payload:

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

## Available Endpoints

- `GET /health`: Health status & synthetic dataset notice.
- `GET /api/v1/animals`: Herd animals list with latest risk prediction status.
- `GET /api/v1/animals/{animal_id}`: Single animal record & live prediction payload.
- `GET /api/v1/animals/{animal_id}/history`: Chronological 30-day sensor readings.
- `GET /api/v1/animals/{animal_id}/prediction`: Dynamic ML risk prediction.
- `GET /api/v1/alerts`: Active farm risk alert notifications.
- `GET /api/v1/herd/summary`: Aggregate herd distribution & top priority list.
- `POST /api/v1/verification`: Field CMT / SCC / Vet outcome logging.

## Run Tests

```bash
python -m pytest backend/tests/
```
