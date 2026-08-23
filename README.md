# Drug Reaction Dashboard

## Windows Quick Start (No Installation Required)

**Step 1 - Download** two files from the [Releases page](https://github.com/ganeshmpatil/dashboard/releases/tag/v1.0.0):
- `dashboard.exe`
- `drug_reactions_sample.xlsx`

Save both files in the same folder (e.g., Desktop).

**Step 2 - Run:** Double-click `dashboard.exe`. A terminal window opens and your browser launches automatically at http://localhost:8080

**Step 3 - Login:** Username `admin` / Password `admin`

**Step 4 - Upload Data:**
- Click **Upload Data** in the left sidebar
- Drag and drop `drug_reactions_sample.xlsx` into the upload area
- Wait for the success message

**Step 5 - View Dashboard:**
- Click **Dashboard** in the left sidebar
- All charts load with your uploaded data
- Each chart panel has 3 dropdowns you can change:
  - **Group By** - field to analyze (drug, severity, state, age group, etc.)
  - **Metric** - measurement (count, avg age, unique patients, etc.)
  - **Chart** - visualization type (bar, pie, donut, line, area, radar)
- Use the **All Uploads** dropdown at top-right to filter charts by a specific upload

**Step 6 - Stop:** Close the terminal window or press `Ctrl+C`

> Data is saved in `dashboard.db` next to the exe. Delete this file to reset all data.
> No installation, no admin rights, no internet connection needed to run.

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

Produces binaries in `dist/`:
- `dashboard.exe` (Windows)
- `dashboard-linux` (Linux)
- `dashboard-mac` (macOS)

### Tech Stack
- **Backend:** Go (Gin + GORM + SQLite)
- **Frontend:** React 18 + Apache ECharts + Vite
- **Database:** SQLite (embedded, no server needed)

### Architecture

```
Single Executable (dashboard.exe)
  |-- Embedded React frontend (served at /)
  |-- Go REST API with dynamic query engine (served at /api/*)
  |-- SQLite database (dashboard.db created on first run)
```

### Dashboard Features
- Grafana-style dark theme with collapsible panels
- 14 chart panels, each independently configurable
- 15 grouping fields, 5 metrics, 7 chart types per panel
- Cross-tab stacked bar analysis (e.g. Drug x Severity)
- Per-upload dashboard filtering
- 8 summary KPI stat cards

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
