export type RiskLevel = 'NO RISK' | 'LOW' | 'MODERATE' | 'HIGH';
export type RiskTrend = 'RISING' | 'STABLE' | 'DECLINING';
export type DataConfidence = 'INSUFFICIENT' | 'LOW' | 'MEDIUM' | 'HIGH';
export type Language = 'en' | 'ta' | 'hi';
export type UserRole = 'FARMER' | 'VETERINARIAN' | 'FIELD_STAFF' | 'ADMIN';

export interface UserAccount {
  user_id: string;
  name: string;
  email?: string;
  role: UserRole;
  farm_id: string;
  active: boolean;
}

export interface RiskFactor {
  factor_code: string;
  description: string;
  impact_score: number;
  direction: 'INCREASES_RISK' | 'REDUCES_RISK';
}

export interface Prediction {
  animal_id: string;
  risk_probability: number;
  risk_level: RiskLevel;
  risk_trend: RiskTrend;
  forecast_horizon: string;
  data_confidence: DataConfidence;
  top_factors: RiskFactor[];
  recommendation: string;
  dataset_notice?: string;
}

export interface Animal {
  animal_id: string;
  farm_id: string;
  breed: string;
  parity: number;
  days_in_milk: number;
  previous_mastitis_count: number;
  status: string;
  latest_prediction?: Prediction;
}

export interface SensorReading {
  reading_date: string;
  milk_yield_kg: number;
  electrical_conductivity: number;
  milk_temperature: number;
  body_temperature: number;
  rumination_min: number;
  activity_steps: number;
  last_scc: number;
  cmt_score: string;
}

export interface AlertItem {
  alert_id: string;
  animal_id: string;
  risk_level: RiskLevel;
  alert_type: 'HIGH_RISK' | 'MODERATE_RISK' | 'RISING_RISK' | 'DATA_QUALITY';
  title: string;
  message: string;
  created_at: string;
}

export interface HerdSummary {
  total_animals: number;
  high_risk_count: number;
  moderate_risk_count: number;
  low_risk_count: number;
  no_risk_count: number;
  rising_risk_count: number;
  verified_events_count: number;
  risk_distribution_pct: {
    HIGH: number;
    MODERATE: number;
    LOW: number;
    NO_RISK: number;
  };
  top_priority_animals: Array<{
    animal_id: string;
    risk_probability: number;
    risk_level: RiskLevel;
    risk_trend: RiskTrend;
    action: string;
  }>;
  dataset_notice: string;
}

export interface VerificationPayload {
  animal_id: string;
  verifier_type: 'FARMER' | 'VETERINARIAN' | 'FIELD_OFFICER';
  cmt_result: 'NEGATIVE' | 'TRACE' | '1+' | '2+' | '3+';
  scc_result?: number;
  clinical_symptoms?: string;
  veterinary_notes?: string;
  is_mastitis_confirmed: boolean;
}
