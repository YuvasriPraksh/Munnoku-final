-- =========================================================
-- MUNNOKKU — RELATIONAL DATABASE SCHEMA (SQLite / PostgreSQL Compatible)
-- =========================================================

CREATE TABLE IF NOT EXISTS farms (
    farm_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animals (
    animal_id VARCHAR(50) PRIMARY KEY,
    farm_id VARCHAR(50) NOT NULL,
    breed VARCHAR(50) NOT NULL,
    birth_date DATE,
    parity INTEGER NOT NULL DEFAULT 1,
    days_in_milk INTEGER NOT NULL DEFAULT 0,
    previous_mastitis_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id VARCHAR(50) NOT NULL,
    reading_date DATE NOT NULL,
    milk_yield_kg REAL,
    electrical_conductivity REAL,
    milk_temperature REAL,
    body_temperature REAL,
    rumination_min REAL,
    activity_steps REAL,
    ambient_temp REAL,
    ambient_humidity REAL,
    last_scc INTEGER,
    cmt_score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id VARCHAR(50) NOT NULL,
    prediction_date DATE NOT NULL,
    risk_probability REAL NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- NO RISK, LOW, MODERATE, HIGH
    risk_trend VARCHAR(20) NOT NULL, -- RISING, STABLE, DECLINING
    forecast_horizon VARCHAR(50) NOT NULL DEFAULT '7-14 days',
    data_confidence VARCHAR(20) NOT NULL, -- INSUFFICIENT, LOW, MEDIUM, HIGH
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
);

CREATE TABLE IF NOT EXISTS risk_factors (
    factor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id INTEGER NOT NULL,
    factor_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    impact_score REAL NOT NULL,
    direction VARCHAR(20) NOT NULL, -- INCREASES_RISK, REDUCES_RISK
    FOREIGN KEY (prediction_id) REFERENCES predictions(prediction_id)
);

CREATE TABLE IF NOT EXISTS mastitis_verifications (
    verification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id VARCHAR(50) NOT NULL,
    verification_date DATE NOT NULL,
    verifier_type VARCHAR(50) NOT NULL, -- FARMER, VETERINARIAN, FIELD_OFFICER
    cmt_result VARCHAR(20), -- NEGATIVE, TRACE, 1+, 2+, 3+
    scc_result INTEGER,
    clinical_symptoms TEXT,
    veterinary_notes TEXT,
    is_mastitis_confirmed INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
);

CREATE TABLE IF NOT EXISTS mastitis_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id VARCHAR(50) NOT NULL,
    onset_date DATE NOT NULL,
    resolved_date DATE,
    severity VARCHAR(20) DEFAULT 'SUBCLINICAL', -- SUBCLINICAL, CLINICAL, SEVERE
    quarter_affected VARCHAR(20), -- LF, LR, RF, RR
    treatment_given TEXT,
    outcome VARCHAR(50) DEFAULT 'RESOLVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
);

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL, -- FARMER, VETERINARIAN, FIELD_STAFF, ADMIN
    farm_id VARCHAR(50) NOT NULL DEFAULT 'FARM-01',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_animal_date ON sensor_readings(animal_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_predictions_animal_date ON predictions(animal_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
