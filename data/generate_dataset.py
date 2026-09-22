import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_mastitis_dataset(
    num_animals: int = 50,
    num_days: int = 180,
    random_seed: int = 42,
    output_path: str = "data/synthetic_mastitis_data.csv"
):
    """
    Generates a realistic longitudinal time-series dataset for bovine mastitis prediction.
    Features realistic physiological patterns (Milk Yield, EC, Temp, Rumination, Activity, SCC, CMT).
    Constructed strictly to prevent data leakage for 7-14 day lead-time prediction.
    """
    np.random.seed(random_seed)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    start_date = datetime(2025, 1, 1)
    farms = ["FARM-01", "FARM-02", "FARM-03"]
    breeds = ["Holstein Friesian Cross", "Jersey Cross", "Gir", "Sahiwal"]
    
    rows = []
    
    for animal_idx in range(1, num_animals + 1):
        animal_id = f"COW-{animal_idx:03d}"
        farm_id = farms[(animal_idx - 1) % len(farms)]
        breed = np.random.choice(breeds, p=[0.4, 0.3, 0.15, 0.15])
        parity = int(np.random.choice([1, 2, 3, 4, 5], p=[0.25, 0.3, 0.25, 0.1, 0.1]))
        init_dim = int(np.random.randint(20, 150))
        prev_mastitis = int(np.random.choice([0, 1, 2, 3], p=[0.5, 0.3, 0.15, 0.05]))
        
        # Determine mastitis episode schedule for this animal
        # ~35% of cows experience 1 or 2 mastitis episodes over 180 days
        has_episodes = np.random.rand() < 0.38
        episode_days = []
        if has_episodes:
            num_episodes = np.random.choice([1, 2], p=[0.7, 0.3])
            for _ in range(num_episodes):
                ep_day = np.random.randint(25, num_days - 5)
                episode_days.append(ep_day)
        
        # Animal baseline characteristics
        base_yield = 22.0 + np.random.normal(0, 3.0) + (parity * 0.8)
        base_ec = 5.1 + np.random.normal(0, 0.15)  # mS/cm
        base_temp = 37.8 + np.random.normal(0, 0.1) # Celsius
        base_rumination = 500.0 + np.random.normal(0, 30.0) # min/day
        base_activity = 1200.0 + np.random.normal(0, 100.0) # steps/day
        
        for d in range(num_days):
            curr_date = start_date + timedelta(days=d)
            dim = init_dim + d
            
            # Check proximity to any clinical mastitis episode
            # Episode lasts 3-5 days
            in_clinical_event = False
            days_to_next_episode = 999
            
            for ep_day in episode_days:
                if 0 <= (d - ep_day) <= 4:
                    in_clinical_event = True
                if ep_day > d:
                    dist = ep_day - d
                    if dist < days_to_next_episode:
                        days_to_next_episode = dist
                        
            # Subclinical onset starts 10-14 days before clinical event
            subclinical_severity = 0.0
            if days_to_next_episode <= 14 and not in_clinical_event:
                # Severity increases as we get closer to the episode
                subclinical_severity = max(0.0, (14 - days_to_next_episode) / 14.0)
            elif in_clinical_event:
                subclinical_severity = 1.0
                
            # Environmental ambient variation
            seasonal_temp = 25.0 + 8.0 * np.sin(d / 180.0 * np.pi) + np.random.normal(0, 1.5)
            seasonal_humidity = 65.0 + 10.0 * np.cos(d / 180.0 * np.pi) + np.random.normal(0, 3.0)
            
            # Synthesize physiological signals based on baseline + subclinical onset + noise
            # EC increases with mastitis risk
            ec = base_ec + (subclinical_severity * 1.5) + np.random.normal(0, 0.12)
            
            # Milk yield decreases with mastitis risk and DIM lactation curve
            lactation_factor = 1.0 - (dim * 0.001)
            yield_kg = max(4.0, (base_yield * lactation_factor) - (subclinical_severity * 6.5) + np.random.normal(0, 0.8))
            
            # Milk temperature rises slightly
            milk_temp = base_temp + (subclinical_severity * 0.9) + np.random.normal(0, 0.1)
            
            # Rumination drops
            rumination = max(150.0, base_rumination - (subclinical_severity * 180.0) + np.random.normal(0, 15.0))
            
            # Activity drops or shows restlessness
            activity = max(400.0, base_activity - (subclinical_severity * 350.0) + np.random.normal(0, 45.0))
            
            # Body temperature
            body_temp = base_temp + (subclinical_severity * 0.7) + np.random.normal(0, 0.12)
            
            # SCC (Somatic Cell Count in x10^3 cells/mL)
            scc = int(max(50, 120 + (subclinical_severity * 900) + np.random.normal(0, 40)))
            
            # CMT Score (0: Negative, 1: Trace, 2: 1+, 3: 2+, 4: 3+)
            if scc < 200:
                cmt_score = "Negative"
            elif scc < 400:
                cmt_score = "Trace"
            elif scc < 800:
                cmt_score = "1+"
            elif scc < 1500:
                cmt_score = "2+"
            else:
                cmt_score = "3+"
                
            # Define target variable strictly:
            # Target = 1 if a clinical mastitis event starts between t+7 and t+14 days ahead
            # This represents true early forecasting requirement (7-14 days lead time)
            target = 1 if (7 <= days_to_next_episode <= 14) else 0
            
            rows.append({
                "Animal_ID": animal_id,
                "Farm_ID": farm_id,
                "Date": curr_date.strftime("%Y-%m-%d"),
                "Breed": breed,
                "Parity": parity,
                "Days_In_Milk": dim,
                "Previous_Mastitis_Count": prev_mastitis,
                "Milk_Yield_Kg": round(yield_kg, 2),
                "Electrical_Conductivity_mS_cm": round(ec, 2),
                "Milk_Temperature_C": round(milk_temp, 2),
                "Body_Temperature_C": round(body_temp, 2),
                "Rumination_Min_Day": round(rumination, 1),
                "Activity_Steps_Day": round(activity, 1),
                "Ambient_Temp_C": round(seasonal_temp, 1),
                "Ambient_Humidity_Pct": round(seasonal_humidity, 1),
                "Last_SCC_Cell_mL": scc * 1000,
                "CMT_Score": cmt_score,
                "Mastitis_Event_In_7_14_Days": target
            })
            
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Generated synthetic dataset with {len(df)} rows across {num_animals} animals at {output_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_mastitis_dataset()
