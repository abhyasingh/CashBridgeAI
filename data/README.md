# CashBridge AI - MVP dataset (HACK-15)

Synthetic, simulation-based data. No real businesses or people. Anchored to the Kaggle Udyam district counts (MSME.csv).
Window: 2024-10-28 to 2026-10-25 (104 weeks). Snapshot date: 2026-10-25. Currency: INR.

| File | Rows | Grain | Use in the MVP |
|---|---|---|---|
| cashbridge_master_dataset.csv | 12,480 | MSME x week | 13-week forecast, gap classifier, dashboard charts |
| invoices.csv | 53,117 | invoice | Receivable Delay Model (target: delay_days), open-invoice list |
| bank_transactions.csv | ~96.6k | bank txn | Account Aggregator style statement, cash burn analysis |
| recurring_commitments.csv | 774 | MSME x obligation | Known future outflows for the forecast |
| bridge_loan_offers.csv | ~164 | gap event | Loan sizing and credit-risk demo (simulated) |
| msme_profiles.csv | 120 | MSME | Onboarding screen, credit score, limits |
| district_msme_context.csv | 785 | district | Kaggle data, cleaned, with derived shares |
| data_dictionary.csv | 161 | column | Every column explained |

## How Kaggle and synthetic data were combined
- States and districts of the 120 businesses were sampled in proportion to the Kaggle micro / small / medium unit counts of each district.
- Size mix is deliberately stratified (80 micro, 32 small, 8 medium) so the demo covers all tiers. Udyam itself is about 97% micro.
- Everything else (invoices, delays, bank flows, loans) is a bottom-up simulation: invoice volumes, customer payment behaviour, supplier lags, salaries, rent, GST, EMI, capex, festival and fiscal-year seasonality, and delay shocks.

## Rules to respect when you model
1. Leakage: customer_avg_prior_delay_days and customer_prior_late_rate use only information known on the invoice date. Do not use paid_date or delay_days as features.
2. Split by time, not randomly (for example train up to 2026-03, test after).
3. Open invoices have blank delay_days (censored). Predict them; do not train on them.
4. Label columns in the master file (gap_next_4w, gap_next_13w, shortfall_next_13w_inr, weeks_to_first_gap_13w) are blank where the future window is incomplete.
5. bridge_loan_offers.csv is a counterfactual simulation of what CashBridge would have offered. Balances in the master file are the no-CashBridge baseline.

## Demo businesses (demo_showcase = 1)
MSME0001 (kirana), MSME0002 (garment), MSME0016 (IT services): healthy history, then a receivable shock and a capex hit in the last weeks. Two are below buffer at the snapshot and one is recovering, which gives a live alert and a loan story.
