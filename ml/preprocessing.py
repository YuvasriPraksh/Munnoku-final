import pandas as pd
import numpy as np

def load_and_preprocess_raw_data(data_path: str = "data/synthetic_mastitis_data.csv"):
    """
    Loads raw longitudinal dataset and sorts chronologically per animal.
    Prevents time-series data leakage.
    """
    df = pd.read_csv(data_path)
    df["Date"] = pd.to_datetime(df["Date"])
    
    # Sort strictly by Animal_ID and Date
    df = df.sort_values(by=["Animal_ID", "Date"]).reset_index(drop=True)
    return df

def split_time_series_chronologically(df: pd.DataFrame, train_ratio: float = 0.70, val_ratio: float = 0.15):
    """
    Splits observations chronologically per animal into train, validation, and test sets.
    Ensures zero temporal data leakage.
    """
    train_dfs = []
    val_dfs = []
    test_dfs = []
    
    for animal_id, group in df.groupby("Animal_ID", sort=False):
        n = len(group)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))
        
        train_dfs.append(group.iloc[:train_end])
        val_dfs.append(group.iloc[train_end:val_end])
        test_dfs.append(group.iloc[val_end:])
        
    train_df = pd.concat(train_dfs).reset_index(drop=True)
    val_df = pd.concat(val_dfs).reset_index(drop=True)
    test_df = pd.concat(test_dfs).reset_index(drop=True)
    
    return train_df, val_df, test_df
