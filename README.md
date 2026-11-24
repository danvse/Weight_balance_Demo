# Weight Balance Demo — Smart Mattress Scale RPM

Interactive Angular remote patient monitoring (RPM) frontend demo for patients, doctors, and prescribers connected to a nocturnal mattress weight scale.

## Live Demo

- **GitHub Pages:** `https://danvse.github.io/Weight_balance_Demo/`

## Key Features

- **Sign In & Sign Up:** Choose between **Patient** and **Prescriber / MD** roles, or use 1-click stakeholder demo logins.
- **Morning Symptom Gate:** Mandatory daily check-in (shortness of breath, poor appetite, swelling & body-part selector) prior to accessing the dashboard.
- **Home Dashboard:**
  - Nocturnal mattress weight display and **Days / Weeks / Months** trend chart (iPhone Screen Time style) with interactive hover/tap tooltips.
  - Three core blocks: **Weight Changes Table**, **Updates from Prescriber**, and **Last Visit to Prescriber**.
  - **>2 lbs Red Alert State:** Automatically switches dashboard background to red, triggers an alert banner, alarm modal, and audio chime.
- **Prescriber Chat:** Bi-directional messaging with quick symptom chips and vitals sharing.
- **Patient Profile:** Editable demographics, baseline weight, last prescriber visit, and inline diuretic/medication tracker.
- **Prescriber EHR View:** Live triaged roster synced with patient telemetry and a live Care Update publisher.

## Local Development

```bash
cd august-care-angular
npm install
npm start
```
