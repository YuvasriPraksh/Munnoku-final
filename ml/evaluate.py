import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, confusion_matrix
)

def evaluate_model_performance(y_true, y_pred, y_prob):
    """
    Computes comprehensive classification metrics for model evaluation.
    """
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    try:
        roc_auc = roc_auc_score(y_true, y_prob)
    except Exception:
        roc_auc = 0.5
        
    p_prec, p_rec, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = auc(p_rec, p_prec)
    
    return {
        "Accuracy": float(acc),
        "Precision": float(prec),
        "Recall": float(rec),
        "F1_Score": float(f1),
        "Specificity": float(specificity),
        "ROC_AUC": float(roc_auc),
        "PR_AUC": float(pr_auc),
        "Confusion_Matrix": {
            "TN": int(tn), "FP": int(fp),
            "FN": int(fn), "TP": int(tp)
        }
    }

def evaluate_lead_time(test_df: pd.DataFrame, model, feature_cols, probability_threshold: float = 0.45):
    """
    Evaluates lead-time performance on time-series records.
    Calculates lead time in days between first high-risk alert and clinical event occurrence.
    """
    df = test_df.copy().sort_values(by=["Animal_ID", "Date"])
    X_test = df[feature_cols]
    df["predicted_prob"] = model.predict_proba(X_test)[:, 1]
    df["predicted_flag"] = (df["predicted_prob"] >= probability_threshold).astype(int)
    
    lead_times = []
    false_alarms = 0
    total_alerts = (df["predicted_flag"] == 1).sum()
    
    # Analyze alert sequences per animal
    for animal_id, group in df.groupby("Animal_ID"):
        group = group.reset_index(drop=True)
        for i in range(len(group)):
            if group.loc[i, "predicted_flag"] == 1:
                # Look ahead up to 14 days to see when clinical mastitis occurs (where target was 1 or event started)
                future_window = group.loc[i:min(i+14, len(group)-1)]
                clinical_matches = future_window[future_window["Mastitis_Event_In_7_14_Days"] == 1]
                
                if not clinical_matches.empty:
                    # Lead time in days
                    first_match_idx = clinical_matches.index[0]
                    lead_days = first_match_idx - i + 7 # target is 7-14 days ahead
                    lead_times.append(lead_days)
                else:
                    false_alarms += 1
                    
    if len(lead_times) > 0:
        mean_lead = float(np.mean(lead_times))
        median_lead = float(np.median(lead_times))
        pct_gte_7d = float(np.mean([1 if lt >= 7 else 0 for lt in lead_times]) * 100)
        pct_gte_14d = float(np.mean([1 if lt >= 14 else 0 for lt in lead_times]) * 100)
    else:
        mean_lead, median_lead, pct_gte_7d, pct_gte_14d = 0.0, 0.0, 0.0, 0.0
        
    far = float(false_alarms / total_alerts) if total_alerts > 0 else 0.0
    
    return {
        "mean_lead_time_days": round(mean_lead, 1),
        "median_lead_time_days": round(median_lead, 1),
        "pct_detected_gte_7d": round(pct_gte_7d, 1),
        "pct_detected_gte_14d": round(pct_gte_14d, 1),
        "false_alarm_rate": round(far, 3),
        "lead_time_validation_note": "Lead-time evaluation conducted on synthetic longitudinal time-series data. 7-14 day lead time represents theoretical capability under simulated physiological parameter shifts."
    }
