#!/usr/bin/env python3
"""Generate 3000 rows of synthetic US drug reaction data for the last 3 months."""

import os
import random
from datetime import datetime, timedelta
from openpyxl import Workbook

random.seed(42)

DRUGS = {
    "Lisinopril": ("ACE Inhibitor", "Oral", ["10mg", "20mg", "40mg"]),
    "Metformin": ("Antidiabetic", "Oral", ["500mg", "850mg", "1000mg"]),
    "Atorvastatin": ("Statin", "Oral", ["10mg", "20mg", "40mg", "80mg"]),
    "Amlodipine": ("Calcium Channel Blocker", "Oral", ["2.5mg", "5mg", "10mg"]),
    "Omeprazole": ("Proton Pump Inhibitor", "Oral", ["20mg", "40mg"]),
    "Amoxicillin": ("Antibiotic", "Oral", ["250mg", "500mg"]),
    "Metoprolol": ("Beta Blocker", "Oral", ["25mg", "50mg", "100mg"]),
    "Sertraline": ("SSRI", "Oral", ["25mg", "50mg", "100mg"]),
    "Gabapentin": ("Anticonvulsant", "Oral", ["100mg", "300mg", "600mg"]),
    "Hydrocodone": ("Opioid Analgesic", "Oral", ["5mg", "10mg"]),
    "Prednisone": ("Corticosteroid", "Oral", ["5mg", "10mg", "20mg"]),
    "Levothyroxine": ("Thyroid Hormone", "Oral", ["25mcg", "50mcg", "100mcg"]),
    "Warfarin": ("Anticoagulant", "Oral", ["2mg", "5mg", "10mg"]),
    "Ciprofloxacin": ("Fluoroquinolone", "Oral", ["250mg", "500mg"]),
    "Insulin Glargine": ("Insulin", "Subcutaneous", ["10 units", "20 units", "40 units"]),
    "Adalimumab": ("TNF Inhibitor", "Subcutaneous", ["40mg"]),
    "Pembrolizumab": ("PD-1 Inhibitor", "Intravenous", ["200mg"]),
    "Apixaban": ("Anticoagulant", "Oral", ["2.5mg", "5mg"]),
    "Duloxetine": ("SNRI", "Oral", ["30mg", "60mg"]),
    "Tramadol": ("Opioid Analgesic", "Oral", ["50mg", "100mg"]),
}

REACTION_TYPES = [
    "Nausea", "Vomiting", "Diarrhea", "Headache", "Dizziness",
    "Rash", "Urticaria", "Pruritus", "Fatigue", "Insomnia",
    "Abdominal Pain", "Constipation", "Dyspnea", "Cough",
    "Hypotension", "Tachycardia", "Anaphylaxis", "Angioedema",
    "Hepatotoxicity", "Nephrotoxicity", "Thrombocytopenia",
    "Neutropenia", "Hyperglycemia", "Hypoglycemia",
    "Peripheral Neuropathy", "Myalgia", "Arthralgia",
    "Stevens-Johnson Syndrome", "Seizure", "QT Prolongation",
]

MEDDRA_TERMS = {
    "Nausea": "Nausea", "Vomiting": "Vomiting", "Diarrhea": "Diarrhoea",
    "Headache": "Headache", "Dizziness": "Dizziness",
    "Rash": "Rash generalised", "Urticaria": "Urticaria",
    "Pruritus": "Pruritus", "Fatigue": "Fatigue", "Insomnia": "Insomnia",
    "Abdominal Pain": "Abdominal pain", "Constipation": "Constipation",
    "Dyspnea": "Dyspnoea", "Cough": "Cough",
    "Hypotension": "Hypotension", "Tachycardia": "Tachycardia",
    "Anaphylaxis": "Anaphylactic reaction", "Angioedema": "Angioedema",
    "Hepatotoxicity": "Drug-induced liver injury",
    "Nephrotoxicity": "Renal impairment",
    "Thrombocytopenia": "Thrombocytopenia", "Neutropenia": "Neutropenia",
    "Hyperglycemia": "Hyperglycaemia", "Hypoglycemia": "Hypoglycaemia",
    "Peripheral Neuropathy": "Peripheral neuropathy",
    "Myalgia": "Myalgia", "Arthralgia": "Arthralgia",
    "Stevens-Johnson Syndrome": "Stevens-Johnson syndrome",
    "Seizure": "Seizure", "QT Prolongation": "Electrocardiogram QT prolonged",
}

SEVERITIES = ["Mild", "Moderate", "Severe", "Life-threatening"]
SEVERITY_WEIGHTS = [0.35, 0.35, 0.20, 0.10]

OUTCOMES = ["Recovered", "Recovering", "Not Recovered", "Fatal", "Unknown"]
OUTCOME_WEIGHTS = [0.40, 0.25, 0.15, 0.05, 0.15]

REPORTERS = ["Physician", "Pharmacist", "Nurse", "Patient", "Other Healthcare Professional"]

STATES = [
    "CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI",
    "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI",
    "CO", "MN", "SC", "AL", "LA", "KY", "OR", "OK", "CT", "UT",
]

end_date = datetime(2026, 8, 23)
start_date = end_date - timedelta(days=90)

wb = Workbook()
ws = wb.active
ws.title = "Drug Reactions"

headers = [
    "patient_id", "patient_age", "patient_gender", "patient_weight",
    "drug_name", "drug_class", "dosage", "route_of_admin",
    "reaction_type", "reaction_severity", "reaction_date", "onset_days",
    "outcome", "reporter_type", "facility_state", "meddra_term",
    "is_serious", "required_hospital",
]
ws.append(headers)

for i in range(3000):
    pid = f"PT-{random.randint(100000, 999999)}"
    age = random.choices(
        [random.randint(1, 17), random.randint(18, 44),
         random.randint(45, 64), random.randint(65, 95)],
        weights=[0.05, 0.30, 0.35, 0.30]
    )[0]
    gender = random.choice(["Male", "Female"])
    weight = round(random.gauss(80 if gender == "Male" else 70, 15), 1)
    weight = max(30, min(weight, 180))

    drug_name = random.choice(list(DRUGS.keys()))
    drug_class, route, dosages = DRUGS[drug_name]
    dosage = random.choice(dosages)

    reaction = random.choice(REACTION_TYPES)
    severity = random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0]

    days_ago = random.randint(0, 90)
    reaction_date = end_date - timedelta(days=days_ago)
    onset_days = random.choices(
        [random.randint(0, 1), random.randint(2, 7),
         random.randint(8, 30), random.randint(31, 90)],
        weights=[0.30, 0.35, 0.25, 0.10]
    )[0]

    outcome = random.choices(OUTCOMES, weights=OUTCOME_WEIGHTS)[0]
    if severity == "Life-threatening":
        outcome = random.choices(
            ["Recovered", "Recovering", "Not Recovered", "Fatal"],
            weights=[0.20, 0.20, 0.30, 0.30]
        )[0]

    reporter = random.choice(REPORTERS)
    state = random.choice(STATES)
    meddra = MEDDRA_TERMS.get(reaction, reaction)

    is_serious = severity in ("Severe", "Life-threatening") or outcome == "Fatal"
    required_hospital = severity == "Life-threatening" or (severity == "Severe" and random.random() < 0.5)

    ws.append([
        pid, age, gender, weight,
        drug_name, drug_class, dosage, route,
        reaction, severity, reaction_date.strftime("%Y-%m-%d"), onset_days,
        outcome, reporter, state, meddra,
        "Yes" if is_serious else "No",
        "Yes" if required_hospital else "No",
    ])

import sys
output_dir = "/output" if os.path.isdir("/output") else os.path.dirname(os.path.abspath(sys.argv[0]))
output = os.path.join(output_dir, "drug_reactions_sample.xlsx")
wb.save(output)
print(f"Generated {output} with 3000 rows")
