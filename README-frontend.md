# 🖥️ CivicPulse — Frontend

> **React web application for CivicPulse** — A community platform for infrastructure deficiency reporting and government accountability in Rwanda.

[![Frontend CI/CD](https://github.com/YOUR_USERNAME/civicpulse-frontend/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/civicpulse-frontend/actions/workflows/deploy.yml)

**Live app:** `https://civicpulse-frontend.vercel.app`  
**Backend repository:** `https://github.com/YOUR_USERNAME/civicpulse-backend`  
**Backend API:** `https://civicpulse-api.onrender.com`

**Author:** Louis Marie Toussaint Tona  
**Supervisor:** Bernard Odartei Lamptey  
**Degree:** BSc. in Software Engineering — ALU, June 2026

---

## 📋 Table of Contents

1. [Project Description](#-project-description)
2. [Pages and Features](#-pages-and-features)
3. [Tech Stack](#-tech-stack)
4. [Repository Structure](#-repository-structure)
5. [Environment Setup & Installation](#-environment-setup--installation)
6. [Design System](#-design-system)
7. [CI/CD Pipeline](#-cicd-pipeline)
8. [Deployment](#-deployment)
9. [Video Demonstration](#-video-demonstration)

---

## 📖 Project Description

This repository contains the **React + Vite frontend** for CivicPulse. It is a responsive single-page application that connects to the CivicPulse REST API to provide:

- A public live heatmap of infrastructure issues across Kigali, Rwanda
- A citizen-facing report submission form with interactive map location picking
- A government official dashboard for managing report statuses
- A public accountability scorecard displaying district-level response metrics

The application supports three user roles — **Public Visitor** (no login), **Citizen**, and **Government Official** — each with different levels of access controlled via JWT authentication.

### What makes this frontend distinctive

The heatmap uses a **severity-weighted visualization** where the displayed intensity of each point is not simply the number of reports, but is weighted by `severity^1.5`. This means a single critical infrastructure failure appears more prominently than many minor issues, preventing urban reporting volume from drowning out critical rural problems.

---

## 📄 Pages and Features

### 🏠 Home Page (`/`)
- **Public** — no login required
- Interactive Leaflet map centered on Kigali with live heatmap overlay
- Color gradient from green (low) through amber and orange to red (critical)
- Severity filter dropdown to show only reports above a certain level
- Scrollable grid of report cards below the map
- `+ Report Issue` button for logged-in citizens
- Loading skeleton states while data fetches

### 🔐 Login / Signup Page (`/auth`)
- Tab switcher between Login and Sign Up
- Role selector on signup (Citizen or Government Official)
- Client-side and server-side validation with inline error messages
- JWT token stored in localStorage on success
- Automatic redirect based on role after login

### 📝 Submit Report Page (`/submit`)
- **Protected** — citizen login required
- Four-section form: issue details, severity selector, location picker, submit
- Severity selection as clickable color-coded cards (not a dropdown)
- Interactive map — click anywhere on Kigali to drop a pin and auto-fill coordinates
- Real-time coordinate display showing selected latitude/longitude
- Client-side validation highlights missing fields before API call
- Redirects to the new report's detail page on successful submission

### 🔍 Report Detail Page (`/reports/:id`)
- **Public** — no login required to view
- Report photo, title, description, category, district, severity, and submission date
- Visual status timeline showing all lifecycle stages (received → resolved)
- Official messages displayed at each timeline stage
- Status update form visible **only** to logged-in government officials
- Dropdown to change status + textarea for public message

### 🏆 Accountability Scorecard Page (`/scorecard`)
- **Public** — no login required
- Summary cards showing total reports, average acknowledged %, average resolved %
- Per-district cards with progress bars for acknowledged and resolved percentages
- Letter grade (A–F) badge per district based on resolution rate
- Average response time in days per district
- Methodology explanation section
- Live data — updates whenever an official acts on a report

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | v18 | UI component framework |
| Vite | v5 | Build tool and dev server |
| React Router DOM | v6 | Client-side routing and protected routes |
| Tailwind CSS | v3.4 | Utility-first styling framework |
| Axios | v1 | HTTP client with JWT interceptor |
| Leaflet.js | v1.9 | Interactive map rendering |
| react-leaflet | v4 | React bindings for Leaflet |
| leaflet.heat | — | Heatmap layer plugin |
| OpenStreetMap | — | Free map tiles (no API key needed) |

---

## 📁 Repository Structure

```
civicpulse-frontend/
│
├── ⚙️  .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD pipeline
│
├── 📄 .gitignore               ← Excludes node_modules/, .env, dist/
├── 📄 .env.example             ← Safe environment variable template
├── 📄 index.html               ← App entry point and page title
├── 📄 package.json             ← Dependencies and npm scripts
├── 📄 vite.config.js           ← Vite config; leaflet.heat optimizeDeps fix
├── 📄 tailwind.config.js       ← Custom color palette and font config
├── 📄 postcss.config.js        ← PostCSS config required by Tailwind v3
│
└── src/
    │
    ├── 📄 main.jsx             ← React entry point; Leaflet default icon fix
    ├── 📄 App.jsx              ← BrowserRouter; all routes; PrivateRoute guard
    │
    ├── assets/                 ← Static images and icons
    │
    ├── components/             ← Reusable UI pieces used across multiple pages
    │   ├── 📄 Navbar.jsx       ← Sticky top nav; logo; login/logout; role badge
    │   ├── 📄 ReportCard.jsx   ← Clickable card showing report summary
    │   └── 📄 StatusBadge.jsx  ← Colored pill: received / under review / etc.
    │
    ├── context/
    │   └── 📄 AuthContext.jsx  ← Global auth state; session restore on load
    │
    ├── pages/                  ← One file per route
    │   ├── 📄 AuthPage.jsx         ← /auth — Login and Signup
    │   ├── 📄 HomePage.jsx         ← / — Heatmap and report grid
    │   ├── 📄 ReportDetailPage.jsx ← /reports/:id — Detail and timeline
    │   ├── 📄 SubmitReportPage.jsx ← /submit — Citizen submission form
    │   └── 📄 ScorecardPage.jsx    ← /scorecard — District accountability
    │
    ├── services/
    │   └── 📄 api.js           ← Axios instance; JWT header; 401 redirect
    │
    └── styles/
        └── 📄 index.css        ← Tailwind directives; Leaflet height fix
```

---

## ⚙️ Environment Setup & Installation

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | v20 LTS | https://nodejs.org |
| Git | Latest | https://git-scm.com |

Verify:
```bash
node -v    # v20.x.x
npm -v     # 10.x.x
```

The backend API must be running before the frontend will show any data. See the [backend repository](https://github.com/YOUR_USERNAME/civicpulse-backend) for setup instructions.

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/civicpulse-frontend.git
cd civicpulse-frontend
```

---

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

This points to your locally running backend. For production, Vercel uses its own environment variable set in the dashboard.

> ⚠️ **Important:** If you create or change the `.env` file while Vite is already running, you must **stop and restart** `npm run dev` — Vite only reads `.env` on startup.

---

### Step 3 — Install dependencies

```bash
npm install
```

---

### Step 4 — Start the development server

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

### Step 5 — Verify the setup

Work through this checklist:

- [ ] Home page loads with the Leaflet map centered on Kigali
- [ ] No red CORS errors in browser console (F12 → Console)
- [ ] Navigating to `/auth` shows the Login/Signup form
- [ ] Signing up as a citizen succeeds and shows the home page
- [ ] Signing up as an official shows the correct role in the navbar
- [ ] Logged-in citizen sees `+ Report Issue` button
- [ ] `/submit` opens the form with category and district dropdowns populated
- [ ] Clicking the map on `/submit` drops a pin and shows coordinates
- [ ] `/scorecard` shows the district accountability cards
- [ ] Logging out removes the user from the navbar

---

### Available npm scripts

| Script | Command | Description |
|---|---|---|
| Development server | `npm run dev` | Starts Vite on `http://localhost:5173` with hot reload |
| Production build | `npm run build` | Compiles to `dist/` folder |
| Preview build | `npm run preview` | Serves the `dist/` folder locally to test the production build |
| Lint | `npm run lint` | Runs ESLint across all source files |

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1A7A4A` | Buttons, links, active states, Rwanda green |
| `primary-dk` | `#145E38` | Button hover states |
| `danger` | `#D9534F` | Errors, critical severity |
| `warning` | `#E89B2F` | High severity, amber states |
| `bg` | `#F7F8F5` | Page background |
| `surface` | `#FFFFFF` | Cards, panels, inputs |
| `text-main` | `#1A1A2E` | Primary body text |
| `text-muted` | `#6B7280` | Labels, secondary info |
| `border` | `#E5E7EB` | Card borders, dividers |

### Severity Color System

| Level | Label | Color |
|---|---|---|
| 1 | Low | Gray — `#6B7280` |
| 2 | Medium | Amber — `#E89B2F` |
| 3 | High | Orange — `#F97316` |
| 4 | Critical | Red — `#D9534F` |

### Typography

| Use | Font | Weight |
|---|---|---|
| Headings | Inter | 700 |
| Body | Inter | 400 |
| Coordinates / IDs | JetBrains Mono | 400 |

### Responsive Breakpoints (Tailwind defaults)

| Prefix | Min width | Devices |
|---|---|---|
| *(none)* | 0px | Mobile portrait |
| `sm:` | 640px | Mobile landscape, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

---

## 🔄 CI/CD Pipeline

This repository uses **GitHub Actions** for continuous integration and deployment.

**Pipeline file:** `.github/workflows/deploy.yml`

**What it does on every push to `main`:**

```
Push to main
     │
     ▼
┌──────────────────────────────────┐
│  Job 1: Install and Build        │
│  - npm install                   │
│  - npm run build                 │
│    (catches all React errors     │
│     before they reach production)│
│  - verify dist/ folder exists    │
└──────────────┬───────────────────┘
               │ passes
               ▼
┌──────────────────────────────────┐
│  Job 2: Deploy                   │
│  - POST to Vercel deploy hook    │
│  - Vercel pulls latest code      │
│  - Vercel rebuilds and deploys   │
└──────────────────────────────────┘
```

**Required GitHub repository secret:**

| Secret name | Where to get it |
|---|---|
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → your project → Settings → Git → Deploy Hooks |

**To add the secret:**
GitHub → your repo → Settings → Secrets and variables → Actions → New repository secret

**What the build step catches:**
Any JSX syntax error, missing import, or broken component will cause `npm run build` to fail. The pipeline stops, deploy is skipped, and your live site stays on the last working version. You get an email from GitHub notifying you of the failure.

---

## 🚀 Deployment

### Platform: Vercel (free tier)

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | *(empty — whole repo is the frontend)* |
| Build command | `npm run build` |
| Output directory | `dist` |
| Branch | `main` |
| Auto-deploy | Yes — triggers on every push to main |

### Environment variable to set on Vercel:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://civicpulse-api.onrender.com/api` |

Set this in: Vercel → your project → Settings → Environment Variables

### Deployment flow

```
git push origin main
       │
       ▼
GitHub Actions: npm install + npm run build
       │ build passes
       ▼
Vercel receives deploy hook signal
       │
       ▼
Vercel pulls latest code from GitHub
       │
       ▼
npm run build → dist/ folder created
       │
       ▼
dist/ deployed to Vercel global CDN
       │
       ▼
App live at https://civicpulse-frontend.vercel.app
```

### Connecting to a custom domain (optional)

If you have a domain name (e.g. `civicpulse.rw`):
1. Vercel → your project → Settings → Domains
2. Add your domain and follow the DNS instructions Vercel provides

---

## 🎬 Video Demonstration

> 📹 **Watch the CivicPulse demo walkthrough here:**
>
> **[▶ Click to watch — YouTube / Loom / Google Drive](YOUR_VIDEO_LINK_HERE)**
>
> *(Replace the link above with your actual video URL after recording)*

### What the video covers

The demonstration walks through three complete user journeys:

1. **Public visitor** — browsing the live heatmap, filtering by severity, reading a report detail page and its status timeline, and viewing the district accountability scorecard — all without logging in

2. **Citizen** — signing up for an account, submitting a new geotagged infrastructure report by filling the form and clicking the map to pin a location, choosing a severity level, and tracking the report status after submission

3. **Government official** — logging in with an official account, opening a report, updating its status through the lifecycle with a public message, and observing the scorecard metrics update in real time

### Recommended recording tools

| Tool | Platform | Link |
|---|---|---|
| Loom | Web/Desktop — free, shareable link in seconds | https://loom.com |
| OBS Studio | Desktop — free, full control | https://obsproject.com |
| Google Drive | Upload any screen recording | https://drive.google.com |

**Suggested video length:** 3–5 minutes

---

## 📚 Key References

- Goodchild, M. F. (2007). Citizens as sensors. *GeoJournal, 69*(4), 211–221.
- Mellon, J., Peixoto, T., & Sjoberg, F. M. (2022). *The haves and the have nots*. World Bank Policy Research Working Paper No. 10195.
- Heeks, R. (2018). *ICT for Development (ICT4D)*. Routledge.
- Twizeyimana, J. D. (2023). Towards realisation of the public value of e-government. *IJPSPM, 11*(1).

---

*CivicPulse Frontend — Built at the African Leadership University, Kigali, Rwanda · June 2026*
