import os
import sys
import sqlite3
import pandas as pd
from datetime import datetime

# Path setup to import ML prediction engine
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml")))
from predict import get_prediction_engine

DB_PATH = os.path.join(os.path.dirname(__file__), "munnokku.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")
CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_mastitis_data.csv"))

def init_and_seed_db():
    print(f"Initializing database at: {DB_PATH}")
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Execute Schema
    with open(SCHEMA_PATH, "r") as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    print("Schema applied successfully.")
    
    # 2. Seed Farms
    farms_data = [
        ("FARM-01", "Gokul Dairy Farm", "Anand, Gujarat", "Ramesh Patel", "+91 98765 43210"),
        ("FARM-02", "Surabhi Dairy Collective", "Coimbatore, Tamil Nadu", "K. Selvam", "+91 98123 45678"),
        ("FARM-03", "Nandini Milk Producer Co", "Mandya, Karnataka", "Suresh Gowda", "+91 97456 78901")
    ]
    cursor.executemany("INSERT INTO farms VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", farms_data)
    print(f"Seeded {len(farms_data)} farms.")
    
    # 2b. Seed Demo Users for Role-Based Access Control (RBAC)
    demo_users = [
        ("usr_farmer", "Demo Farmer", "farmer@munnokku.in", "FARMER", "FARM-01", 1, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        ("usr_vet", "Demo Veterinarian", "vet@munnokku.in", "VETERINARIAN", "FARM-01", 1, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        ("usr_field", "Demo Field Staff", "field@munnokku.in", "FIELD_STAFF", "FARM-01", 1, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        ("usr_admin", "Demo Admin", "admin@munnokku.in", "ADMIN", "ALL", 1, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", demo_users)
    print(f"Seeded {len(demo_users)} demo RBAC users.")
    
    # 3. Read CSV and Seed Animals & Sensor Readings
    df = pd.read_csv(CSV_PATH)
    
    # Extract unique animals
    animals_df = df.groupby("Animal_ID").first().reset_index()
    animal_rows = []
    for _, row in animals_df.iterrows():
        animal_rows.append((
            row["Animal_ID"],
            row["Farm_ID"],
            row["Breed"],
            "2021-03-15",
            int(row["Parity"]),
            int(row["Days_In_Milk"]),
            int(row["Previous_Mastitis_Count"]),
            "ACTIVE",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
    cursor.executemany(
        "INSERT INTO animals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        animal_rows
    )
    print(f"Seeded {len(animal_rows)} animals.")
    
    # Seed Sensor Readings
    sensor_rows = []
    for _, row in df.iterrows():
        sensor_rows.append((
            row["Animal_ID"],
            row["Date"],
            float(row["Milk_Yield_Kg"]),
            float(row["Electrical_Conductivity_mS_cm"]),
            float(row["Milk_Temperature_C"]),
            float(row["Body_Temperature_C"]),
            float(row["Rumination_Min_Day"]),
            float(row["Activity_Steps_Day"]),
            float(row["Ambient_Temp_C"]),
            float(row["Ambient_Humidity_Pct"]),
            int(row["Last_SCC_Cell_mL"]),
            row["CMT_Score"]
        ))
    cursor.executemany("""
        INSERT INTO sensor_readings (
            animal_id, reading_date, milk_yield_kg, electrical_conductivity,
            milk_temperature, body_temperature, rumination_min, activity_steps,
            ambient_temp, ambient_humidity, last_scc, cmt_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sensor_rows)
    print(f"Seeded {len(sensor_rows)} sensor readings.")
    
    # 4. Generate & Seed Predictions for Latest Date
    predictor = get_prediction_engine()
    latest_date = df["Date"].max()
    print(f"Generating predictions for latest date: {latest_date}...")
    
    pred_count = 0
    factor_count = 0
    
    for animal_id in df["Animal_ID"].unique():
        pred = predictor.predict_animal_risk(animal_id, df)
        
        cursor.execute("""
            INSERT INTO predictions (
                animal_id, prediction_date, risk_probability, risk_level,
                risk_trend, forecast_horizon, data_confidence, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pred["animal_id"],
            latest_date,
            pred["risk_probability"],
            pred["risk_level"],
            pred["risk_trend"],
            pred["forecast_horizon"],
            pred["data_confidence"],
            pred["recommendation"]
        ))
        pred_id = cursor.lastrowid
        pred_count += 1
        
        for factor in pred.get("top_factors", []):
            cursor.execute("""
                INSERT INTO risk_factors (
                    prediction_id, factor_code, description, impact_score, direction
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                pred_id,
                factor["factor_code"],
                factor["description"],
                factor["impact_score"],
                factor["direction"]
            ))
            factor_count += 1
            
    print(f"Seeded {pred_count} predictions and {factor_count} risk factors.")
    
    # 5. Seed Initial Sample Mastitis Verification Log
    cursor.execute("""
        INSERT INTO mastitis_verifications (
            animal_id, verification_date, verifier_type, cmt_result, scc_result,
            clinical_symptoms, veterinary_notes, is_mastitis_confirmed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "COW-027", latest_date, "VETERINARIAN", "2+", 650000,
        "Mild swelling in rear-left quarter, elevated conductivity",
        "Subclinical mastitis detected early. Advised quarter flushing and monitoring.",
        1
    ))
    
    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    init_and_seed_db()
