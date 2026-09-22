from enum import Enum
from pydantic import BaseModel
from typing import List, Optional

class UserRoleEnum(str, Enum):
    FARMER = "FARMER"
    VETERINARIAN = "VETERINARIAN"
    FIELD_STAFF = "FIELD_STAFF"
    ADMIN = "ADMIN"

class UserSchema(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
    role: UserRoleEnum
    farm_id: str
    active: bool = True

class RiskFactorSchema(BaseModel):
    factor_code: str
    description: str
    impact_score: float
    direction: str

class PredictionSchema(BaseModel):
    animal_id: str
    risk_probability: float
    risk_level: str # NO RISK, LOW, MODERATE, HIGH
    risk_trend: str # RISING, STABLE, DECLINING
    forecast_horizon: str
    data_confidence: str # INSUFFICIENT, LOW, MEDIUM, HIGH
    top_factors: List[RiskFactorSchema]
    recommendation: str
    dataset_notice: Optional[str] = "SYNTHETIC / DEMONSTRATION DATA"

class AnimalSchema(BaseModel):
    animal_id: str
    farm_id: str
    breed: str
    parity: int
    days_in_milk: int
    previous_mastitis_count: int
    status: str
    latest_prediction: Optional[PredictionSchema] = None

class SensorReadingSchema(BaseModel):
    reading_date: str
    milk_yield_kg: float
    electrical_conductivity: float
    milk_temperature: float
    body_temperature: float
    rumination_min: float
    activity_steps: float
    last_scc: int
    cmt_score: str

class AlertSchema(BaseModel):
    alert_id: str
    animal_id: str
    risk_level: str
    alert_type: str # HIGH_RISK, MODERATE_RISK, RISING_RISK, DATA_QUALITY
    title: str
    message: str
    created_at: str

class HerdSummarySchema(BaseModel):
    total_animals: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    no_risk_count: int
    rising_risk_count: int
    verified_events_count: int
    risk_distribution_pct: dict
    top_priority_animals: List[dict]
    dataset_notice: str = "SYNTHETIC / DEMONSTRATION DATA"

class VerificationCreateSchema(BaseModel):
    animal_id: str
    verifier_type: str # FARMER, VETERINARIAN, FIELD_OFFICER
    cmt_result: str # NEGATIVE, TRACE, 1+, 2+, 3+
    scc_result: Optional[int] = None
    clinical_symptoms: Optional[str] = None
    veterinary_notes: Optional[str] = None
    is_mastitis_confirmed: bool
