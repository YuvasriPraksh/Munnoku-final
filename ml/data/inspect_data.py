import os
import pandas as pd

def inspect_dataset(data_path: str = "data/synthetic_mastitis_data.csv"):
    """
    Programmatically inspects the dataset and outputs detailed diagnostic statistics.
    """
    if not os.path.exists(data_path):
        print(f"Error: Data path {data_path} does not exist.")
        return
        
    df = pd.read_csv(data_path)
    
    print("=" * 60)
    print("MUNNOKKU DATASET INSPECTION REPORT")
    print("=" * 60)
    print(f"Data Source File           : {data_path}")
    print(f"Data Category              : SYNTHETIC / DEMONSTRATION DATA")
    print(f"Total Rows                 : {len(df)}")
    print(f"Total Unique Animals       : {df['Animal_ID'].nunique()}")
    print(f"Unique Farms               : {df['Farm_ID'].unique().tolist()}")
    print(f"Date Range                 : {df['Date'].min()} to {df['Date'].max()}")
    print(f"Total Columns              : {len(df.columns)}")
    print(f"Columns List               : {df.columns.tolist()}")
    print(f"Total Missing Values       : {df.isnull().sum().sum()}")
    print(f"Duplicate Rows             : {df.duplicated().sum()}")
    
    records_per_animal = df.groupby("Animal_ID").size()
    print(f"Records Per Animal (Min/Avg/Max): {records_per_animal.min()} / {records_per_animal.mean():.1f} / {records_per_animal.max()}")
    
    target_col = "Mastitis_Event_In_7_14_Days"
    print("\n--- TARGET VARIABLE ANALYSIS ---")
    print(f"Target Column Name         : {target_col}")
    print("Target Meaning             : 1 if a clinical mastitis event occurs between 7 and 14 days in the future (observation window up to t). 0 otherwise.")
    
    target_counts = df[target_col].value_counts()
    target_pct = df[target_col].value_counts(normalize=True) * 100
    
    print("Class Distribution         :")
    for val, count in target_counts.items():
        print(f"  Class {val} ({'Negative/No Risk' if val == 0 else 'Positive/Future Mastitis Risk'}): {count} rows ({target_pct[val]:.2f}%)")
        
    print("=" * 60)
    return df

if __name__ == "__main__":
    inspect_dataset()
