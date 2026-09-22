import pandas as pd
import numpy as np

def create_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates temporal features using strictly past information up to time t.
    Calculates rolling baselines, trends, percentage changes, and multi-signal convergence.
    """
    df = df.copy()
    df = df.sort_values(by=["Animal_ID", "Date"]).reset_index(drop=True)
    
    # Numeric sensor columns for temporal rolling features
    sensor_cols = [
        "Milk_Yield_Kg", 
        "Electrical_Conductivity_mS_cm", 
        "Milk_Temperature_C", 
        "Body_Temperature_C",
        "Rumination_Min_Day", 
        "Activity_Steps_Day"
    ]
    
    # Group by Animal_ID for individual baselines
    grouped = df.groupby("Animal_ID")
    
    for col in sensor_cols:
        # Shift 1 to ensure time t feature uses past observations only up to t
        shifted = grouped[col].shift(1)
        
        # 3-day, 7-day, 14-day rolling means & stds
        df[f"{col}_rolling_3d_mean"] = grouped[col].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean())
        df[f"{col}_rolling_7d_mean"] = grouped[col].transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean())
        df[f"{col}_rolling_14d_mean"] = grouped[col].transform(lambda x: x.shift(1).rolling(14, min_periods=1).mean())
        df[f"{col}_rolling_7d_std"] = grouped[col].transform(lambda x: x.shift(1).rolling(7, min_periods=1).std()).fillna(0.0)
        
    # Individual Baseline Deviations (comparing time t reading to 14-day rolling historical average)
    df["ec_deviation_pct"] = (df["Electrical_Conductivity_mS_cm"] - df["Electrical_Conductivity_mS_cm_rolling_14d_mean"]) / (df["Electrical_Conductivity_mS_cm_rolling_14d_mean"] + 1e-5)
    df["yield_drop_pct"] = (df["Milk_Yield_Kg"] - df["Milk_Yield_Kg_rolling_14d_mean"]) / (df["Milk_Yield_Kg_rolling_14d_mean"] + 1e-5)
    df["rumination_drop_pct"] = (df["Rumination_Min_Day"] - df["Rumination_Min_Day_rolling_14d_mean"]) / (df["Rumination_Min_Day_rolling_14d_mean"] + 1e-5)
    df["activity_drop_pct"] = (df["Activity_Steps_Day"] - df["Activity_Steps_Day_rolling_14d_mean"]) / (df["Activity_Steps_Day_rolling_14d_mean"] + 1e-5)
    df["milk_temp_diff"] = df["Milk_Temperature_C"] - df["Milk_Temperature_C_rolling_14d_mean"]

    # Short-term trends (3d vs 14d mean comparison)
    df["ec_trend_3d_vs_14d"] = df["Electrical_Conductivity_mS_cm_rolling_3d_mean"] - df["Electrical_Conductivity_mS_cm_rolling_14d_mean"]
    df["yield_trend_3d_vs_14d"] = df["Milk_Yield_Kg_rolling_3d_mean"] - df["Milk_Yield_Kg_rolling_14d_mean"]
    
    # MULTI-SIGNAL TEMPORAL CONVERGENCE FEATURE
    # Pattern: EC rising AND Yield declining AND Rumination declining AND Activity declining
    ec_rising = (df["ec_deviation_pct"] > 0.04).astype(float)
    yield_dropping = (df["yield_drop_pct"] < -0.08).astype(float)
    rumination_dropping = (df["rumination_drop_pct"] < -0.10).astype(float)
    activity_dropping = (df["activity_drop_pct"] < -0.10).astype(float)
    
    # Combined score from 0.0 to 1.0 (weighted signal convergence)
    df["multi_signal_convergence_score"] = (
        0.35 * ec_rising + 
        0.25 * yield_dropping + 
        0.20 * rumination_dropping + 
        0.20 * activity_dropping
    )
    
    # Encodings for Categorical variables
    cmt_map = {"Negative": 0, "Trace": 1, "1+": 2, "2+": 3, "3+": 4}
    df["CMT_Score_Numeric"] = df["CMT_Score"].map(cmt_map).fillna(0)
    
    # Fill remaining NaNs from early rolling windows with 0
    df = df.fillna(0.0)
    return df

def get_feature_columns():
    """
    Returns list of feature column names used by ML models.
    """
    return [
        "Parity",
        "Days_In_Milk",
        "Previous_Mastitis_Count",
        "Milk_Yield_Kg",
        "Electrical_Conductivity_mS_cm",
        "Milk_Temperature_C",
        "Body_Temperature_C",
        "Rumination_Min_Day",
        "Activity_Steps_Day",
        "Ambient_Temp_C",
        "Ambient_Humidity_Pct",
        "Last_SCC_Cell_mL",
        "CMT_Score_Numeric",
        "Electrical_Conductivity_mS_cm_rolling_3d_mean",
        "Electrical_Conductivity_mS_cm_rolling_7d_mean",
        "Electrical_Conductivity_mS_cm_rolling_14d_mean",
        "Milk_Yield_Kg_rolling_3d_mean",
        "Milk_Yield_Kg_rolling_7d_mean",
        "Milk_Yield_Kg_rolling_14d_mean",
        "Rumination_Min_Day_rolling_7d_mean",
        "Activity_Steps_Day_rolling_7d_mean",
        "ec_deviation_pct",
        "yield_drop_pct",
        "rumination_drop_pct",
        "activity_drop_pct",
        "milk_temp_diff",
        "ec_trend_3d_vs_14d",
        "yield_trend_3d_vs_14d",
        "multi_signal_convergence_score"
    ]
