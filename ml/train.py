import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

from preprocessing import load_and_preprocess_raw_data, split_time_series_chronologically
from feature_engineering import create_temporal_features, get_feature_columns
from evaluate import evaluate_model_performance, evaluate_lead_time

def train_and_evaluate_all_models(
    data_path: str = "data/synthetic_mastitis_data.csv",
    output_dir: str = "ml/models",
    report_dir: str = "ml/reports"
):
    """
    Trains and compares 4 ML models:
    1. Logistic Regression
    2. Random Forest
    3. XGBoost
    4. LightGBM
    Saves best model and generates detailed evaluation metrics report.
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(report_dir, exist_ok=True)
    
    print("Loading and preprocessing dataset...")
    df_raw = load_and_preprocess_raw_data(data_path)
    df_feat = create_temporal_features(df_raw)
    
    train_df, val_df, test_df = split_time_series_chronologically(df_feat)
    
    feature_cols = get_feature_columns()
    target_col = "Mastitis_Event_In_7_14_Days"
    
    X_train, y_train = train_df[feature_cols], train_df[target_col]
    X_val, y_val = val_df[feature_cols], val_df[target_col]
    X_test, y_test = test_df[feature_cols], test_df[target_col]
    
    # Calculate scale weight for imbalanced target
    pos_count = (y_train == 1).sum()
    neg_count = (y_train == 0).sum()
    scale_weight = float(neg_count / max(1, pos_count))
    
    print(f"Train samples: {len(X_train)} (Positive: {pos_count}, Negative: {neg_count}, Scale Weight: {scale_weight:.2f})")
    print(f"Validation samples: {len(X_val)}")
    print(f"Test samples: {len(X_test)}")
    
    # Instantiate 4 candidate models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8, class_weight="balanced", random_state=42),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.05, scale_pos_weight=scale_weight, random_state=42, eval_metric="logloss"),
        "LightGBM": LGBMClassifier(n_estimators=100, max_depth=5, learning_rate=0.05, scale_pos_weight=scale_weight, random_state=42, verbose=-1)
    }
    
    evaluation_results = {}
    trained_model_objs = {}
    best_f1 = -1.0
    best_model_name = ""
    best_model_obj = None
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        metrics = evaluate_model_performance(y_test, y_pred, y_prob)
        evaluation_results[name] = metrics
        trained_model_objs[name] = model
        
        # Save individual model
        filename = name.lower().replace(" ", "_") + ".pkl"
        joblib.dump(model, os.path.join(output_dir, filename))
        
        print(f"  Accuracy : {metrics['Accuracy']:.4f}")
        print(f"  Precision: {metrics['Precision']:.4f}")
        print(f"  Recall   : {metrics['Recall']:.4f}")
        print(f"  F1-Score : {metrics['F1_Score']:.4f}")
        print(f"  PR-AUC   : {metrics['PR_AUC']:.4f}")
        print(f"  ROC-AUC  : {metrics['ROC_AUC']:.4f}")
        
        if metrics["F1_Score"] > best_f1:
            best_f1 = metrics["F1_Score"]
            best_model_name = name
            best_model_obj = model
            
    # Save overall best model
    joblib.dump(best_model_obj, os.path.join(output_dir, "best_model.pkl"))
    joblib.dump(feature_cols, os.path.join(output_dir, "feature_columns.pkl"))
    print(f"\nBest Model Selected: {best_model_name} (F1 Score: {best_f1:.4f})")
    
    # Evaluate lead time for best model
    lead_time_metrics = evaluate_lead_time(test_df, best_model_obj, feature_cols)
    print("\nLEAD-TIME EVALUATION RESULTS:")
    print(json.dumps(lead_time_metrics, indent=2))
    
    # Save final JSON report
    report_data = {
        "dataset_type": "SYNTHETIC / DEMONSTRATION DATA",
        "best_model": best_model_name,
        "feature_count": len(feature_cols),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "model_performance_comparison": evaluation_results,
        "lead_time_evaluation": lead_time_metrics
    }
    
    report_path = os.path.join(report_dir, "ml_evaluation_report.json")
    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=2)
        
    print(f"\nSaved detailed evaluation report to {report_path}")
    return report_data

if __name__ == "__main__":
    train_and_evaluate_all_models()
