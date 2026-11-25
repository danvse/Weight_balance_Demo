# Weight Balance Demo — August Care RPM

Interactive Angular 22 remote patient monitoring (RPM) & target dry weight portal for patients, doctors, and prescribers connected to a nocturnal mattress scale, morning vitals, and daily medication checklist.

## Live Demo

- **GitHub Pages:** `https://danvse.github.io/Weight_balance_Demo/`

## Repository Structure

```text
.
├── .github/workflows/deploy.yml   # GitHub Actions CI + GitHub Pages deploy
├── assets/raw-videos/             # Optional local raw 1080p video backups (gitignored)
└── frontend/                      # Angular 22 application
    ├── public/media/              # Organized production images & looping/loader videos
    └── src/app/
        ├── core/                  # Route guards, domain models, and CareStateService
        ├── features/              # Auth, Home Dashboard, Profile, Prescriber Chat, EHR
        └── shared/components/     # Trend chart, Symptom/Vitals gate, Mascot, Video bg
```

## Key Features

- **Sign In & Sign Up:** Choose **Patient** or **Prescriber / MD**, or use 1-click stakeholder demo logins.
- **Morning Health Check Gate:** Shortness of breath, appetite, swelling body-part selector, plus optional BP, Heart Rate, and SpO₂ check-in (with Bluetooth cuff/pulse-ox sync simulation).
- **Home Dashboard:**
  - `LB` / `KG` unit toggle, BMI card (age + height + weight), Target Dry Weight gauge, Weight Trends strip, and Today's Action Row (above-the-fold Medication Reminders + Prescriber Visits).
  - Screen-Time style **Days / Weeks / Months** chart with missed-diuretic (`Rx!`) and vitals hover tooltips.
  - **>2 lbs / >0.9 kg Red Alert State** & **Urgent Vitals Banner** with audio chime and direct Prescriber Chat escalation.
- **Prescriber Chat & EHR:** Bi-directional messaging with vitals/adherence sharing and live Prescriber Triage EHR sync.

## Local Development

```bash
cd frontend
npm install
npm start
```

## Deployment Checklist (GitHub Pages)

1. Ensure GitHub repo **Settings → Pages → Source** is set to **GitHub Actions**.
2. Push to `main`: `.github/workflows/deploy.yml` runs `tsc --noEmit`, `ng test --watch=false`, builds with `--base-href /Weight_balance_Demo/`, verifies all media assets in `dist/`, adds `404.html` + `.nojekyll`, and deploys to Pages.
