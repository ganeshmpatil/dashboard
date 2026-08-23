# Drug Reaction Dashboard

A full-stack web application for uploading, storing, and visualizing adverse drug reaction data for the US market.

## Tech Stack

- **Backend:** Go (Gin framework) + GORM
- **Database:** PostgreSQL 15
- **Frontend:** React 18 + Recharts
- **Infrastructure:** Docker Compose (zero local installs needed)

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac/Linux)
- That's it. No Go, Node, Python, or PostgreSQL installation required.

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ganeshmpatil/dashboard.git
cd dashboard

# 2. Start all services (first run takes a few minutes to build)
docker-compose up --build

# 3. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

## Login

| Username | Password |
|----------|----------|
| admin    | admin    |

## Sample Data

A sample Excel file with 3000 synthetic drug reaction records is auto-generated
inside the `datagen` container. To use it:

```bash
# Copy the generated file from the container
docker cp med_datagen:/output/drug_reactions_sample.xlsx .
```

Then upload it via the **Upload Data** screen.

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
docker-compose.yml
  |
  |-- postgres      (PostgreSQL 15, port 5432)
  |-- datagen       (Python - generates sample Excel)
  |-- backend       (Go API, port 8080)
  |-- frontend      (React + Nginx, port 3000 -> proxies /api to backend)
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
docker-compose down          # stop services
docker-compose down -v       # stop + remove database volume
```
