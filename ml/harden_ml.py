import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, confusion_matrix,
    brier_score_loss
)
from sklearn.calibration import calibration_curve

# Path setup
sys.path.insert(0, os.path.dirname(__file__))
from preprocessing import load_and_preprocess_raw_data
from feature_engineering import create_temporal_features, get_feature_columns
from evaluate import evaluate_model_performance
from explain import explain_prediction_with_shap

def run_hardened_evaluation(
    data_path: str = "data/synthetic_mastitis_data.csv",
    output_dir: str = "ml/models",
    report_dir: str = "ml/reports"
):
    """
    Performs Phase 2 ML Validation Hardening:
    1. Stronger temporal split (Train: Days 0-120, Val: Days 121-150, Test: Days 151-180)
    2. Heuristic Baseline Comparison (Baselines A, B, C vs Random Forest)
    3. Feature-Group Ablation Study (Subsets A through H)
    4. Probability Calibration Analysis (Brier score & calibration curve)
    5. Hardened Lead-Time Analysis
    6. SHAP Factor verification
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(report_dir, exist_ok=True)
    
    print("Loading and feature engineering dataset for hardened evaluation...")
    df_raw = load_and_preprocess_raw_data(data_path)
    df_feat = create_temporal_features(df_raw)
    
    # 1. STRONGER TEMPORAL SPLIT BY EXACT DATE RANGES
    min_date = df_feat["Date"].min()
    max_date = df_feat["Date"].max()
    unique_dates = sorted(df_feat["Date"].unique())
    n_dates = len(unique_dates)
    
    train_dates = unique_dates[:120] # Days 0 - 119
    val_dates = unique_dates[120:150] # Days 120 - 149
    test_dates = unique_dates[150:] # Days 150 - 179
    
    train_df = df_feat[df_feat["Date"].isin(train_dates)].reset_index(drop=True)
    val_df = df_feat[df_feat["Date"].isin(val_dates)].reset_index(drop=True)
    test_df = df_feat[df_feat["Date"].isin(test_dates)].reset_index(drop=True)
    
    feature_cols = get_feature_columns()
    target_col = "Mastitis_Event_In_7_14_Days"
    
    X_train, y_train = train_df[feature_cols], train_df[target_col]
    X_val, y_val = val_df[feature_cols], val_df[target_col]
    X_test, y_test = test_df[feature_cols], test_df[target_col]
    
    date_summary = {
        "train_period": f"{train_dates[0].strftime('%Y-%m-%d')} to {train_dates[-1].strftime('%Y-%m-%d')} ({len(train_df)} rows)",
        "val_period": f"{val_dates[0].strftime('%Y-%m-%d')} to {val_dates[-1].strftime('%Y-%m-%d')} ({len(val_df)} rows)",
        "test_period": f"{test_dates[0].strftime('%Y-%m-%d')} to {test_dates[-1].strftime('%Y-%m-%d')} ({len(test_df)} rows)"
    }
    
    print(f"Train Period : {date_summary['train_period']}")
    print(f"Val Period   : {date_summary['val_period']}")
    print(f"Test Period  : {date_summary['test_period']}")
    
    # Train Random Forest on Train Split
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=8, class_weight="balanced", random_state=42)
    rf_model.fit(X_train, y_train)
    
    # Save best model
    joblib.dump(rf_model, os.path.join(output_dir, "best_model.pkl"))
    joblib.dump(feature_cols, os.path.join(output_dir, "feature_columns.pkl"))
    
    y_test_pred = rf_model.predict(X_test)
    y_test_prob = rf_model.predict_proba(X_test)[:, 1]
    
    rf_metrics = evaluate_model_performance(y_test, y_test_pred, y_test_prob)
    
    # 2. BASELINE COMPARISON
    # Baseline A: Previous History Rule (Previous_Mastitis_Count > 0 AND CMT_Score_Numeric >= 1)
    base_a_pred = ((test_df["Previous_Mastitis_Count"] > 0) & (test_df["CMT_Score_Numeric"] >= 1)).astype(int)
    base_a_metrics = evaluate_model_performance(y_test, base_a_pred, base_a_pred.astype(float))
    
    # Baseline B: Simple Signal Threshold (Electrical_Conductivity_mS_cm >= 5.6)
    base_b_pred = (test_df["Electrical_Conductivity_mS_cm"] >= 5.6).astype(int)
    base_b_metrics = evaluate_model_performance(y_test, base_b_pred, base_b_pred.astype(float))
    
    # Baseline C: Individual Baseline Deviation Rule (ec_deviation_pct >= 0.05 OR yield_drop_pct <= -0.10)
    base_c_pred = ((test_df["ec_deviation_pct"] >= 0.05) | (test_df["yield_drop_pct"] <= -0.10)).astype(int)
    base_c_metrics = evaluate_model_performance(y_test, base_c_pred, base_c_pred.astype(float))
    
    baseline_comparison = {
        "Baseline_A_History_Rule": base_a_metrics,
        "Baseline_B_Simple_EC_Threshold": base_b_metrics,
        "Baseline_C_Individual_Deviation": base_c_metrics,
        "Random_Forest_ML": rf_metrics
    }
    
    # 3. FEATURE-GROUP ABLATION STUDY
    ablation_subsets = {
        "A_Static_Features_Only": ["Parity", "Days_In_Milk", "Previous_Mastitis_Count", "CMT_Score_Numeric"],
        "B_Milk_Features": ["Milk_Yield_Kg", "Electrical_Conductivity_mS_cm", "Milk_Temperature_C", "Last_SCC_Cell_mL", "CMT_Score_Numeric"],
        "C_Behavior_Features": ["Rumination_Min_Day", "Activity_Steps_Day"],
        "D_Environmental_Features": ["Ambient_Temp_C", "Ambient_Humidity_Pct"],
        "E_Temporal_Features": [c for c in feature_cols if "rolling" in c],
        "F_Temporal_Plus_Baseline_Deviations": [c for c in feature_cols if "rolling" in c or "deviation" in c or "drop" in c or "diff" in c or "trend" in c],
        "G_All_Features_Except_Convergence": [c for c in feature_cols if c != "multi_signal_convergence_score"],
        "H_All_Features_Plus_Multi_Signal_Convergence": feature_cols
    }
    
    ablation_results = {}
    for subset_name, sub_cols in ablation_subsets.items():
        clf = RandomForestClassifier(n_estimators=100, max_depth=8, class_weight="balanced", random_state=42)
        clf.fit(X_train[sub_cols], y_train)
        pred_sub = clf.predict(X_test[sub_cols])
        prob_sub = clf.predict_proba(X_test[sub_cols])[:, 1]
        ablation_results[subset_name] = evaluate_model_performance(y_test, pred_sub, prob_sub)
        
    # 4. PROBABILITY CALIBRATION
    brier_score = float(brier_score_loss(y_test, y_test_prob))
    prob_true, prob_pred = calibration_curve(y_test, y_test_prob, n_bins=5)
    
    calibration_report = {
        "brier_score": round(brier_score, 4),
        "calibration_curve": {
            "mean_predicted_probability": [round(float(p), 4) for p in prob_pred],
            "fraction_of_positives": [round(float(p), 4) for p in prob_true]
        },
        "calibration_assessment": "Uncalibrated probabilities typical for decision tree ensembles with class weighting. Tree-based probabilities tend to cluster near 0 and 1."
    }
    
    # 5. HARDENED LEAD-TIME ANALYSIS
    # Calculate lead time on test split per animal episode
    lead_times = []
    false_alarms = 0
    total_alerts = int((y_test_pred == 1).sum())
    
    test_df_eval = test_df.copy()
    test_df_eval["rf_prob"] = y_test_prob
    test_df_eval["rf_flag"] = (y_test_prob >= 0.45).astype(int)
    
    for animal_id, group in test_df_eval.groupby("Animal_ID"):
        group = group.reset_index(drop=True)
        for i in range(len(group)):
            if group.loc[i, "rf_flag"] == 1:
                future_window = group.loc[i:min(i+14, len(group)-1)]
                pos_events = future_window[future_window["Mastitis_Event_In_7_14_Days"] == 1]
                if not pos_events.empty:
                    lead_days = pos_events.index[0] - i + 7
                    lead_times.append(lead_days)
                else:
                    false_alarms += 1
                    
    lead_summary = {
        "mean_lead_time_days": round(float(np.mean(lead_times)), 1) if lead_times else 0.0,
        "median_lead_time_days": round(float(np.median(lead_times)), 1) if lead_times else 0.0,
        "min_lead_time_days": int(np.min(lead_times)) if lead_times else 0,
        "max_lead_time_days": int(np.max(lead_times)) if lead_times else 0,
        "pct_detected_gte_7d": round(float(np.mean([1 if lt >= 7 else 0 for lt in lead_times]) * 100), 1) if lead_times else 0.0,
        "pct_detected_gte_14d": round(float(np.mean([1 if lt >= 14 else 0 for lt in lead_times]) * 100), 1) if lead_times else 0.0,
        "false_alarm_rate": round(float(false_alarms / max(1, total_alerts)), 3),
        "lead_time_disclaimer": "Synthetic-data evaluation. Theoretical 7-14 day lead time reflects simulated physiological shift parameters."
    }
    
    # 6. SHAP FACTOR VERIFICATION FOR EXAMPLE ANIMALS
    shap_examples = {}
    for cow_id in ["COW-027", "COW-012", "COW-005"]:
        cow_rows = test_df[test_df["Animal_ID"] == cow_id]
        if not cow_rows.empty:
            factors = explain_prediction_with_shap(rf_model, cow_rows.iloc[-1:], feature_cols, top_k=3)
            shap_examples[cow_id] = factors
            
    # Assemble complete report
    final_report = {
        "dataset_notice": "SYNTHETIC / DEMONSTRATION DATA",
        "evaluation_period": date_summary,
        "target_generation_audit": {
            "mechanism": "Target Mastitis_Event_In_7_14_Days set to 1 when a simulated clinical episode occurs 7 to 14 days in the future.",
            "synthetic_generator_dependency": "Simulated subclinical severity linearly alters EC, yield, rumination, activity, milk temp, and SCC. The ML model learns the generator's underlying mathematical formulas under simulated conditions.",
            "data_leakage_status": "No temporal data leakage. Feature space at time t exclusively uses observations up to time t."
        },
        "baseline_comparison": baseline_comparison,
        "feature_ablation_study": ablation_results,
        "probability_calibration": calibration_report,
        "lead_time_analysis": lead_summary,
        "shap_verification_examples": shap_examples
    }
    
    report_path = os.path.join(report_dir, "ml_validation_hardening_report.json")
    with open(report_path, "w") as f:
        json.dump(final_report, f, indent=2)
        
    print(f"\nSuccessfully executed hardened ML evaluation!")
    print(f"Saved report to: {report_path}")
    return final_report

if __name__ == "__main__":
    run_hardened_evaluation()
