"""
Phase 0: Dataset profiling script.
Reads all CSVs from /data/ and writes a text report.
Never modifies raw files.
"""
import json
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).parents[2] / "data"
OUT_DIR = Path(__file__).parents[1] / "data" / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)

CSV_FILES = [
    "cashbridge_master_dataset.csv",
    "invoices.csv",
    "bank_transactions.csv",
    "recurring_commitments.csv",
    "bridge_loan_offers.csv",
    "msme_profiles.csv",
    "district_msme_context.csv",
    "data_dictionary.csv",
]


def profile_df(name: str, df: pd.DataFrame) -> dict:
    date_cols = [c for c in df.columns if "date" in c.lower() or "week_start" in c.lower()]
    for col in date_cols:
        try:
            df[col] = pd.to_datetime(df[col])
        except Exception:
            pass

    report = {
        "file": name,
        "rows": len(df),
        "cols": len(df.columns),
        "columns": {},
        "date_range": {},
        "duplicates": int(df.duplicated().sum()),
    }

    for col in df.columns:
        s = df[col]
        null_count = int(s.isna().sum())
        unique_count = int(s.nunique(dropna=True))
        col_info: dict = {"dtype": str(s.dtype), "nulls": null_count, "unique": unique_count}
        if pd.api.types.is_numeric_dtype(s) and not s.isna().all():
            col_info["min"] = float(s.min())
            col_info["max"] = float(s.max())
            col_info["mean"] = round(float(s.mean()), 2)
        report["columns"][col] = col_info

    for col in date_cols:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            valid = df[col].dropna()
            if not valid.empty:
                report["date_range"][col] = {
                    "min": str(valid.min().date()),
                    "max": str(valid.max().date()),
                }

    return report


reports = {}
for fname in CSV_FILES:
    fpath = DATA_DIR / fname
    if not fpath.exists():
        print(f"WARN: {fname} not found at {fpath}")
        continue
    print(f"Profiling {fname}...", flush=True)
    df = pd.read_csv(fpath, low_memory=False)
    reports[fname] = profile_df(fname, df)
    print(f"  -> {len(df)} rows, {len(df.columns)} cols")

out_path = OUT_DIR / "dataset_profile.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(reports, f, indent=2, default=str)

print(f"\nProfile written to {out_path}")

# Quick summary for the track doc
print("\n=== DATASET SUMMARY ===")
for fname, r in reports.items():
    print(f"\n{fname}: {r['rows']} rows x {r['cols']} cols | dups={r['duplicates']}")
    if r.get("date_range"):
        for dc, drange in r["date_range"].items():
            print(f"  {dc}: {drange['min']} -> {drange['max']}")
    nullcols = {c: v["nulls"] for c, v in r["columns"].items() if v["nulls"] > 0}
    if nullcols:
        top = sorted(nullcols.items(), key=lambda x: -x[1])[:5]
        print(f"  Top nulls: {top}")
