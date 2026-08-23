# Drug Reaction Dashboard

A single-exe web application for uploading and visualizing adverse drug reaction data (US market).

**Zero install required.** The end user receives two files, double-clicks the exe, and the app opens in their browser.

## For End Users (Windows / Linux / macOS)

### What you receive

| File | Purpose |
|------|---------|
| `dashboard.exe` (17 MB) | The entire application |
| `drug_reactions_sample.xlsx` | Sample dataset with 3000 records |

### How to run

**Windows:** Double-click `dashboard.exe`

**Linux / macOS:**
```bash
chmod +x dashboard-linux   # or dashboard-mac
./dashboard-linux
```

The browser opens automatically at **http://localhost:8080**

| Username | Password |
|----------|----------|
| admin    | admin    |

### Steps
1. Login with admin / admin
2. Go to **Upload Data** and upload `drug_reactions_sample.xlsx`
3. Go to **Dashboard** to see charts

### To stop
Press `Ctrl+C` in the terminal window, or close the terminal.

Data is stored in `dashboard.db` (SQLite) next to the exe. Delete it to reset.

---

## For Developers (Building from Source)

### Prerequisites (build machine only)
- Go 1.21+
- Node.js 18+

### Build

```bash
git clone https://github.com/ganeshmpatil/dashboard.git
cd dashboard
chmod +x build.sh
./build.sh
```

This produces binaries in `dist/`:
- `dashboard.exe` (Windows)
- `dashboard-linux` (Linux)
- `dashboard-mac` (macOS)

### Tech Stack
- **Backend:** Go (Gin + GORM + SQLite)
- **Frontend:** React 18 + Recharts + Vite
- **Database:** SQLite (embedded, no server needed)

### Architecture

```
Single Executable (dashboard.exe)
  |-- Embedded React frontend (served at /)
  |-- Go REST API (served at /api/*)
  |-- SQLite database (dashboard.db created on first run)
```

### Charts Included
- Reactions over time (line chart)
- Top 15 drugs by reaction count (horizontal bar)
- Severity distribution (pie chart)
- Outcome distribution (pie chart)
- Gender distribution (donut chart)
- Serious vs non-serious (donut chart)
- Age group distribution (bar chart)
- Top reaction types (bar chart)
- Drug class breakdown (bar chart)

### Excel Format

| Column | Description |
|--------|-------------|
| patient_id | Unique patient identifier |
| patient_age | Patient age in years |
| patient_gender | Male / Female |
| patient_weight | Weight in kg |
| drug_name | Name of the drug |
| drug_class | Therapeutic class |
| dosage | Dosage amount |
| route_of_admin | Oral / IV / Subcutaneous etc. |
| reaction_type | Type of adverse reaction |
| reaction_severity | Mild / Moderate / Severe / Life-threatening |
| reaction_date | Date of reaction (YYYY-MM-DD) |
| onset_days | Days from drug start to reaction |
| outcome | Recovered / Recovering / Not Recovered / Fatal / Unknown |
| reporter_type | Physician / Pharmacist / Nurse / Patient |
| facility_state | US state code |
| meddra_term | MedDRA preferred term |
| is_serious | Yes / No |
| required_hospital | Yes / No |
