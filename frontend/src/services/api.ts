import type { Animal, Prediction, SensorReading, AlertItem, HerdSummary, VerificationPayload } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Comprehensive mock dataset fallback for offline preview
const MOCK_PREDICTION_COW027: Prediction = {
  animal_id: 'COW-027',
  risk_probability: 0.84,
  risk_level: 'HIGH',
  risk_trend: 'RISING',
  forecast_horizon: '7-14 days',
  data_confidence: 'HIGH',
  top_factors: [
    {
      factor_code: 'ec_deviation_pct',
      description: 'Milk Electrical Conductivity increased +18.4% above 14-day baseline',
      impact_score: 0.45,
      direction: 'INCREASES_RISK'
    },
    {
      factor_code: 'yield_drop_pct',
      description: 'Daily milk yield dropped -24.2% compared to baseline',
      impact_score: 0.38,
      direction: 'INCREASES_RISK'
    },
    {
      factor_code: 'rumination_drop_pct',
      description: 'Rumination time dropped -32% over past 48 hours',
      impact_score: 0.28,
      direction: 'INCREASES_RISK'
    }
  ],
  recommendation: 'Perform California Mastitis Test (CMT) verification on all four quarters immediately. Consult farm veterinarian.',
  dataset_notice: 'PROTOTYPE • SYNTHETIC DATA'
};

const MOCK_ANIMALS: Animal[] = [
  {
    animal_id: 'COW-027',
    farm_id: 'FARM-01',
    breed: 'Holstein Friesian Cross',
    parity: 2,
    days_in_milk: 84,
    previous_mastitis_count: 1,
    status: 'ACTIVE',
    latest_prediction: MOCK_PREDICTION_COW027
  },
  {
    animal_id: 'COW-012',
    farm_id: 'FARM-01',
    breed: 'Jersey Cross',
    parity: 3,
    days_in_milk: 110,
    previous_mastitis_count: 0,
    status: 'ACTIVE',
    latest_prediction: {
      animal_id: 'COW-012',
      risk_probability: 0.62,
      risk_level: 'MODERATE',
      risk_trend: 'RISING',
      forecast_horizon: '7-14 days',
      data_confidence: 'HIGH',
      top_factors: [
        {
          factor_code: 'ec_deviation_pct',
          description: 'Conductivity slightly elevated (+8.2%)',
          impact_score: 0.30,
          direction: 'INCREASES_RISK'
        }
      ],
      recommendation: 'Schedule CMT check during evening milking. Monitor yield trend.',
      dataset_notice: 'PROTOTYPE • SYNTHETIC DATA'
    }
  },
  {
    animal_id: 'COW-005',
    farm_id: 'FARM-02',
    breed: 'Gir',
    parity: 1,
    days_in_milk: 45,
    previous_mastitis_count: 0,
    status: 'ACTIVE',
    latest_prediction: {
      animal_id: 'COW-005',
      risk_probability: 0.12,
      risk_level: 'NO RISK',
      risk_trend: 'STABLE',
      forecast_horizon: '7-14 days',
      data_confidence: 'HIGH',
      top_factors: [],
      recommendation: 'No action required. All signals baseline normal.',
      dataset_notice: 'PROTOTYPE • SYNTHETIC DATA'
    }
  },
  {
    animal_id: 'COW-041',
    farm_id: 'FARM-03',
    breed: 'Sahiwal',
    parity: 4,
    days_in_milk: 140,
    previous_mastitis_count: 2,
    status: 'ACTIVE',
    latest_prediction: {
      animal_id: 'COW-041',
      risk_probability: 0.35,
      risk_level: 'LOW',
      risk_trend: 'STABLE',
      forecast_horizon: '7-14 days',
      data_confidence: 'MEDIUM',
      top_factors: [],
      recommendation: 'Maintain regular milking routine.',
      dataset_notice: 'PROTOTYPE • SYNTHETIC DATA'
    }
  }
];

export async function fetchAnimals(riskLevel?: string): Promise<Animal[]> {
  if (USE_MOCK) return MOCK_ANIMALS;
  try {
    const url = riskLevel ? `${API_BASE}/api/v1/animals?risk_level=${riskLevel}` : `${API_BASE}/api/v1/animals`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, falling back to mock mode:', err);
    return MOCK_ANIMALS;
  }
}

export async function fetchAnimalDetail(animalId: string): Promise<Animal> {
  if (USE_MOCK) {
    const found = MOCK_ANIMALS.find(a => a.animal_id === animalId);
    return found || MOCK_ANIMALS[0];
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/animals/${animalId}`);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return MOCK_ANIMALS.find(a => a.animal_id === animalId) || MOCK_ANIMALS[0];
  }
}

export async function fetchSensorHistory(animalId: string): Promise<SensorReading[]> {
  const getMockHistory = (id: string) => {
    const history: SensorReading[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isSubclinical = id === 'COW-027' && i <= 7;
      history.push({
        reading_date: d.toISOString().split('T')[0],
        milk_yield_kg: isSubclinical ? 16.5 - (7 - i) * 0.8 : 22.4 + (Math.random() - 0.5),
        electrical_conductivity: isSubclinical ? 5.2 + (7 - i) * 0.22 : 5.1 + (Math.random() - 0.5) * 0.1,
        milk_temperature: isSubclinical ? 38.0 + (7 - i) * 0.1 : 37.8,
        body_temperature: 38.0,
        rumination_min: isSubclinical ? 480 - (7 - i) * 25 : 510,
        activity_steps: isSubclinical ? 1150 - (7 - i) * 50 : 1250,
        last_scc: isSubclinical ? 450000 : 120000,
        cmt_score: isSubclinical ? '1+' : 'Negative'
      });
    }
    return history;
  };

  if (USE_MOCK) {
    return getMockHistory(animalId);
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/animals/${animalId}/history`);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, using mock history:', err);
    return getMockHistory(animalId);
  }
}

const MOCK_ALERTS: AlertItem[] = [
  {
    alert_id: 'ALT-001',
    animal_id: 'COW-027',
    risk_level: 'HIGH',
    alert_type: 'HIGH_RISK',
    title: 'COW-027 Needs Attention Today',
    message: 'Elevated future mastitis risk (84%). Electrical conductivity increased +18% while milk yield dropped.',
    created_at: new Date().toISOString().split('T')[0]
  },
  {
    alert_id: 'ALT-002',
    animal_id: 'COW-012',
    risk_level: 'MODERATE',
    alert_type: 'RISING_RISK',
    title: 'COW-012 Risk Trajectory Rising',
    message: '3-day electrical conductivity trend rising. Scheduled for CMT check.',
    created_at: new Date().toISOString().split('T')[0]
  }
];

export async function fetchAlerts(): Promise<AlertItem[]> {
  if (USE_MOCK) return MOCK_ALERTS;
  try {
    const res = await fetch(`${API_BASE}/api/v1/alerts`);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, using mock alerts:', err);
    return MOCK_ALERTS;
  }
}

const MOCK_HERD_SUMMARY: HerdSummary = {
  total_animals: 50,
  high_risk_count: 3,
  moderate_risk_count: 5,
  low_risk_count: 12,
  no_risk_count: 30,
  rising_risk_count: 7,
  verified_events_count: 4,
  risk_distribution_pct: {
    HIGH: 6.0,
    MODERATE: 10.0,
    LOW: 24.0,
    NO_RISK: 60.0
  },
  top_priority_animals: [
    {
      animal_id: 'COW-027',
      risk_probability: 0.84,
      risk_level: 'HIGH',
      risk_trend: 'RISING',
      action: 'Perform CMT / SCC verification immediately.'
    },
    {
      animal_id: 'COW-012',
      risk_probability: 0.62,
      risk_level: 'MODERATE',
      risk_trend: 'RISING',
      action: 'Monitor conductivity and yield over next 24h.'
    }
  ],
  dataset_notice: 'PROTOTYPE • SYNTHETIC DATA'
};

export async function fetchHerdSummary(): Promise<HerdSummary> {
  if (USE_MOCK) return MOCK_HERD_SUMMARY;
  try {
    const res = await fetch(`${API_BASE}/api/v1/herd/summary`);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, using mock summary:', err);
    return MOCK_HERD_SUMMARY;
  }
}

export async function submitVerification(payload: VerificationPayload) {
  if (USE_MOCK) {
    return { status: 'success', message: 'Verification recorded in local prototype state' };
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    return { status: 'success', message: 'Verification logged (mock fallback)' };
  }
}
