# MUNNOKKU — Frontend Web Subsystem

Farmer-first Web Application for **MUNNOKKU — AI-Based Predictive Modelling for Early Forecasting of Bovine Mastitis**.

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Charts**: Recharts

## Screens & User Flow

1. **Farmer Home**: Immediate answer to *"Do I need to check any animal today?"* with high-contrast risk badges, watchlist filters, and featured `COW-027` DEMO SCENARIO.
2. **Animal Intelligence**: Detailed cow view with future risk gauge (7-14 days ahead), 30-day sensor trajectory chart, SHAP contributing factors, and non-prescriptive CMT verification advice.
3. **Alerts Center**: Categorized notifications (High Risk, Moderate Risk, Rising Risk, Data Quality) with direct `[Check Animal]` triggers.
4. **Herd Intelligence**: Herd analytics, risk distribution bar chart, animal risk matrix, top priority animals list, and multi-signal feature patterns.
5. **CMT & Vet Verification**: Ground-truth logging form to feed actual field outcomes back to the ML improvement loop.
6. **Model Info**: Empirical model performance metrics comparison (Logistic Regression, Random Forest, XGBoost, LightGBM) and lead-time evaluation disclaimers.

## Multi-Language Support

Includes seamless toggle between **English**, **Tamil (தமிழ்)**, and **Hindi (हिंदी)**.

## Commands

Development mode:
```bash
npm run dev
```

Type check & Build check:
```bash
npx tsc --noEmit
npm run build
```
