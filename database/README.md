# MUNNOKKU — Database Subsystem

Relational SQLite database structure storing farm, animal, sensor, prediction, and verification records for MUNNOKKU.

## Schema Tables

- `farms`: Dairy farm locations, owners, contact details.
- `animals`: Cow profiles, breed, parity, days in milk, mastitis history.
- `sensor_readings`: Daily sensor measurements (yield, EC, temperature, rumination, activity, SCC, CMT).
- `predictions`: Stored ML risk forecasting outputs (`risk_probability`, `risk_level`, `risk_trend`, `data_confidence`).
- `risk_factors`: SHAP-derived top contributing factors per prediction.
- `mastitis_verifications`: Field verification records (CMT score, SCC, vet notes, confirmation status).
- `mastitis_events`: Historical clinical event records.

## Usage

Seed the SQLite database:
```bash
python database/seed.py
```
Outputs `database/munnokku.db`.
