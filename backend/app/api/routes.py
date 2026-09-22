from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
import datetime

from backend.app.database import get_db_connection
from backend.app.schemas.schemas import (
    AnimalSchema, PredictionSchema, SensorReadingSchema,
    AlertSchema, HerdSummarySchema, VerificationCreateSchema,
    UserSchema, UserRoleEnum
)
from backend.app.services.prediction_service import get_live_prediction_for_animal

router = APIRouter()

def require_roles(allowed_roles: List[UserRoleEnum]):
    """
    Role enforcement dependency foundation.
    Validates X-User-Role header if provided, throwing HTTP 403 Forbidden for unauthorized roles.
    """
    def role_checker(x_user_role: Optional[str] = Header(None)):
        if x_user_role:
            role_upper = x_user_role.upper()
            allowed_str = [r.value for r in allowed_roles]
            if role_upper not in allowed_str:
                raise HTTPException(
                    status_code=403,
                    detail=f"Access restricted for role '{x_user_role}'. Required roles: {allowed_str}"
                )
        return x_user_role
    return role_checker

@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MUNNOKKU Bovine Mastitis Early Forecasting API",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "dataset_type": "SYNTHETIC / DEMONSTRATION DATA"
    }

@router.get("/api/v1/auth/demo-users", response_model=List[UserSchema], tags=["Auth & Roles"])
def get_demo_users():
    """
    Returns list of seeded demo accounts for prototype Role-Based Access Control login.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, name, email, role, farm_id, active FROM users ORDER BY user_id")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        UserSchema(
            user_id=r["user_id"],
            name=r["name"],
            email=r["email"],
            role=UserRoleEnum(r["role"]),
            farm_id=r["farm_id"],
            active=bool(r["active"])
        ) for r in rows
    ]

@router.get("/api/v1/animals", response_model=List[AnimalSchema], tags=["Animals"])
def get_animals(risk_level: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT a.*, p.risk_probability, p.risk_level, p.risk_trend, p.forecast_horizon, p.data_confidence, p.recommendation
        FROM animals a
        LEFT JOIN predictions p ON a.animal_id = p.animal_id
        WHERE p.prediction_date = (SELECT MAX(prediction_date) FROM predictions)
    """
    params = []
    if risk_level:
        query += " AND p.risk_level = ?"
        params.append(risk_level.upper())
        
    query += " ORDER BY p.risk_probability DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        pred = None
        if r["risk_probability"] is not None:
            pred = PredictionSchema(
                animal_id=r["animal_id"],
                risk_probability=r["risk_probability"],
                risk_level=r["risk_level"],
                risk_trend=r["risk_trend"],
                forecast_horizon=r["forecast_horizon"],
                data_confidence=r["data_confidence"],
                top_factors=[],
                recommendation=r["recommendation"] or ""
            )
            
        results.append(AnimalSchema(
            animal_id=r["animal_id"],
            farm_id=r["farm_id"],
            breed=r["breed"],
            parity=r["parity"],
            days_in_milk=r["days_in_milk"],
            previous_mastitis_count=r["previous_mastitis_count"],
            status=r["status"],
            latest_prediction=pred
        ))
    return results

@router.get("/api/v1/animals/{animal_id}", response_model=AnimalSchema, tags=["Animals"])
def get_animal_detail(animal_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM animals WHERE animal_id = ?", (animal_id,))
    animal_row = cursor.fetchone()
    conn.close()
    
    if not animal_row:
        raise HTTPException(status_code=404, detail=f"Animal {animal_id} not found")
        
    # Get dynamic ML prediction
    pred_data = get_live_prediction_for_animal(animal_id)
    pred_schema = PredictionSchema(**pred_data)
    
    return AnimalSchema(
        animal_id=animal_row["animal_id"],
        farm_id=animal_row["farm_id"],
        breed=animal_row["breed"],
        parity=animal_row["parity"],
        days_in_milk=animal_row["days_in_milk"],
        previous_mastitis_count=animal_row["previous_mastitis_count"],
        status=animal_row["status"],
        latest_prediction=pred_schema
    )

@router.get("/api/v1/animals/{animal_id}/history", response_model=List[SensorReadingSchema], tags=["History"])
def get_animal_sensor_history(animal_id: str, limit: int = 30):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT reading_date, milk_yield_kg, electrical_conductivity, milk_temperature,
               body_temperature, rumination_min, activity_steps, last_scc, cmt_score
        FROM sensor_readings
        WHERE animal_id = ?
        ORDER BY reading_date DESC
        LIMIT ?
    """, (animal_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail=f"No sensor history found for {animal_id}")
        
    return [
        SensorReadingSchema(
            reading_date=r["reading_date"],
            milk_yield_kg=r["milk_yield_kg"],
            electrical_conductivity=r["electrical_conductivity"],
            milk_temperature=r["milk_temperature"],
            body_temperature=r["body_temperature"],
            rumination_min=r["rumination_min"],
            activity_steps=r["activity_steps"],
            last_scc=r["last_scc"],
            cmt_score=r["cmt_score"]
        ) for r in reversed(rows) # Chronological order
    ]

@router.get("/api/v1/animals/{animal_id}/prediction", response_model=PredictionSchema, tags=["Predictions"])
def get_animal_prediction(animal_id: str):
    pred_data = get_live_prediction_for_animal(animal_id)
    return PredictionSchema(**pred_data)

@router.get("/api/v1/alerts", response_model=List[AlertSchema], tags=["Alerts"])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.animal_id, p.risk_level, p.risk_trend, p.prediction_date, p.risk_probability
        FROM predictions p
        WHERE p.risk_level IN ('HIGH', 'MODERATE') OR p.risk_trend = 'RISING'
        ORDER BY p.risk_probability DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    alerts = []
    idx = 1
    for r in rows:
        if r["risk_level"] == "HIGH":
            atype = "HIGH_RISK"
            title = f"{r['animal_id']} Needs Immediate Attention"
            msg = f"Elevated future mastitis risk ({int(r['risk_probability']*100)}%). Perform CMT verification."
        elif r["risk_level"] == "MODERATE":
            atype = "MODERATE_RISK"
            title = f"{r['animal_id']} Moderate Risk Alert"
            msg = f"Future mastitis risk is moderate ({int(r['risk_probability']*100)}%). Monitor daily parameters."
        else:
            atype = "RISING_RISK"
            title = f"{r['animal_id']} Risk Trend Rising"
            msg = "Sensor signals indicate early upward shift in risk trajectory."
            
        alerts.append(AlertSchema(
            alert_id=f"ALT-{idx:03d}",
            animal_id=r["animal_id"],
            risk_level=r["risk_level"],
            alert_type=atype,
            title=title,
            message=msg,
            created_at=r["prediction_date"]
        ))
        idx += 1
        
    return alerts

@router.get("/api/v1/herd/summary", response_model=HerdSummarySchema, tags=["Herd"])
def get_herd_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM animals")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT risk_level, COUNT(*) FROM predictions GROUP BY risk_level")
    risk_counts = dict(cursor.fetchall())
    
    high = risk_counts.get("HIGH", 0)
    moderate = risk_counts.get("MODERATE", 0)
    low = risk_counts.get("LOW", 0)
    no_risk = risk_counts.get("NO RISK", 0)
    
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE risk_trend = 'RISING'")
    rising = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM mastitis_verifications WHERE is_mastitis_confirmed = 1")
    verified = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT animal_id, risk_probability, risk_level, risk_trend, recommendation
        FROM predictions
        ORDER BY risk_probability DESC
        LIMIT 5
    """)
    priority_rows = cursor.fetchall()
    conn.close()
    
    priority_animals = [
        {
            "animal_id": p["animal_id"],
            "risk_probability": p["risk_probability"],
            "risk_level": p["risk_level"],
            "risk_trend": p["risk_trend"],
            "action": p["recommendation"]
        } for p in priority_rows
    ]
    
    dist_pct = {
        "HIGH": round((high / total) * 100, 1) if total > 0 else 0,
        "MODERATE": round((moderate / total) * 100, 1) if total > 0 else 0,
        "LOW": round((low / total) * 100, 1) if total > 0 else 0,
        "NO_RISK": round((no_risk / total) * 100, 1) if total > 0 else 0,
    }
    
    return HerdSummarySchema(
        total_animals=total,
        high_risk_count=high,
        moderate_risk_count=moderate,
        low_risk_count=low,
        no_risk_count=no_risk,
        rising_risk_count=rising,
        verified_events_count=verified,
        risk_distribution_pct=dist_pct,
        top_priority_animals=priority_animals,
        dataset_notice="SYNTHETIC / DEMONSTRATION DATA"
    )

@router.post("/api/v1/verification", tags=["Verification"])
def submit_verification(payload: VerificationCreateSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO mastitis_verifications (
            animal_id, verification_date, verifier_type, cmt_result, scc_result,
            clinical_symptoms, veterinary_notes, is_mastitis_confirmed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.animal_id,
        datetime.date.today().strftime("%Y-%m-%d"),
        payload.verifier_type,
        payload.cmt_result,
        payload.scc_result,
        payload.clinical_symptoms,
        payload.veterinary_notes,
        1 if payload.is_mastitis_confirmed else 0
    ))
    conn.commit()
    verif_id = cursor.lastrowid
    conn.close()
    
    return {
        "status": "success",
        "message": f"Verification outcome logged for {payload.animal_id}",
        "verification_id": verif_id,
        "feedback_logged": True
    }
