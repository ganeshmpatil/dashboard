# Drug Reaction Dashboard

A full-stack web application for uploading, storing, and visualizing adverse drug reaction data for the US market.

## Tech Stack

- **Backend:** Go (Gin framework) + GORM
- **Database:** PostgreSQL 15
- **Frontend:** React 18 + Recharts
- **Infrastructure:** Docker Compose (auto-installed by setup script)

## Prerequisites

- **Nothing.** The setup script installs everything automatically.
- Supported: Windows 10/11, Ubuntu/Debian, Fedora, macOS

## Quick Start

### Windows

```
1. Clone or download this repository
2. Right-click setup.bat -> "Run as administrator"
3. Done. Browser opens automatically.
```

### Linux / macOS

```bash
git clone https://github.com/ganeshmpatil/dashboard.git
cd dashboard
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Install Docker (if not already installed)
2. Start Docker engine
3. Build and launch all services (PostgreSQL, Go backend, React frontend)
4. Generate a sample Excel file with 3000 drug reaction records
5. Open the app in your browser

## Login

| Username | Password |
|----------|----------|
| admin    | admin    |

## Sample Data

The setup script auto-extracts `drug_reactions_sample.xlsx` (3000 records) into the project folder. Upload it via the **Upload Data** screen.

## Features

### Upload Data
- Drag-and-drop or browse to upload `.xlsx` files
- Automatic parsing of 18 data columns
- Batch insert for performance

### Dashboard (Visualize)
- Summary cards: total reactions, patients, uploads, severe cases
- Reactions over time (line chart)
- Top 15 drugs by reaction count (horizontal bar)
- Severity distribution (pie chart)
- Outcome distribution (pie chart)
- Gender distribution (donut chart)
- Serious vs non-serious (donut chart)
- Age group distribution (bar chart)
- Top reaction types (bar chart)
- Drug class breakdown (bar chart)

### Recent Uploads
- View upload history with file name, row count, timestamp
- Delete uploads (removes associated reaction data)

## Architecture

```
setup.bat / setup.sh        <-- one-click entry point
  |
  |-- Installs Docker (if needed)
  |-- docker-compose.yml
        |-- postgres        (PostgreSQL 15, port 5432)
        |-- datagen         (Python - generates sample Excel)
        |-- backend         (Go API, port 8080)
        |-- frontend        (React + Nginx, port 3000 -> proxies /api to backend)
```

## Excel Format

The upload expects `.xlsx` files with these column headers:

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

## Stopping

```bash
docker compose down          # stop services
docker compose down -v       # stop and remove database volume
```
