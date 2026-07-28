# 🌍 CivicPulse — Frontend

> **React web application for CivicPulse** — A community platform for infrastructure deficiency reporting and government accountability in Rwanda.

[![CI/CD](https://github.com/louistona/civicpulse-frontend/.github/workflows/deploy.yml/badge.svg)](https://github.com/louistona/civicpulse-frontend/.github/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**🌐 Live Application:** [`https://civicpulse-frontend.vercel.app`](https://civicpulse-frontend-gules.vercel.app)
**⚙️ Backend repository:** [`civicpulse-backend`](https://github.com/louistona/civicpulse-backend.git)
**🔌 Live API:** [`https://civicpulse-api.onrender.com`](https://civicpulse-backend-server.onrender.com)

**Author:** Louis Marie Toussaint Tona
**Supervisor:** Bernard Odartei Lamptey
**Degree:** BSc. in Software Engineering — African Leadership University, June 2026

---

## 📋 Table of Contents

1. [Project Description](#-project-description)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Design System](#-design-system)
5. [Repository Structure](#-repository-structure)
6. [Pages and User Flows](#-pages-and-user-flows)
7. [Environment Setup & Installation](#-environment-setup--installation)
8. [CI/CD Pipeline](#-cicd-pipeline)
9. [Deployment](#-deployment)
10. [Testing](#-testing)
11. [Video Demonstration](#-video-demonstration)

---

## 📖 Project Description

This repository contains the **React + Vite single-page application** that is the citizen-facing and official-facing interface for CivicPulse. It connects to the CivicPulse REST API to provide:

- A **public live heatmap** of infrastructure issues across Kigali, Rwanda — visible to anyone without an account
- A **citizen signup flow** using phone number OTP verification, a 4-digit PIN, and Rwanda's real administrative hierarchy (district → sector → cell → village)
- A **photo-mandatory report submission form** with direct Cloudinary upload, interactive map pin, cascading location dropdowns, and severity selection
- A **community voting panel** on every report where anyone — registered or anonymous — can upvote, downvote, or abstain; votes recalculate the severity score in real time using the platform's engagement-weighted algorithm
- A **government official portal** with a filtered dashboard, status update workflow, and resolution photo upload
- A **public accountability scorecard** displaying district-level response rates, resolution percentages, average response times, and letter grades
- An **SMS-linked voting page** accessible directly from the vote notification sent to registered users in the same cell as a reported issue

### The Problem Being Solved

Rwanda faces a persistent infrastructure communication gap. Citizens have no standardized digital channel to formally report deficiencies — collapsed roads, power outages, water supply failures — to responsible authorities. CivicPulse addresses this by providing a public reporting board that requires no account to browse, an authenticated submission system that ensures data quality, and a transparent accountability layer that makes government response rates publicly visible.

### Key Design Decisions

**Severity-weighted heatmap** — uses `severity^1.5` rather than raw report count, preventing high-volume urban areas from drowning out critical rural issues (addressing the civic digital divide documented by Mellon et al., 2022).

**Community severity voting** — citizens and visitors vote on report severity using a two-metric formula: Engagement Rate (what fraction of voters cast a meaningful vote) and Severity Index (what fraction of meaningful voters said it is a problem). Low engagement automatically deflates severity, ensuring only widely-noticed issues reach Critical status.

**Phone-only citizen identity** — citizens sign up with a phone number and 4-digit PIN rather than email and password. This reduces the barrier to entry for users with limited digital literacy and aligns with Rwanda's high mobile penetration (87.4% as of 2023).

**Location-based notifications** — when a report is submitted, all registered users in the same administrative cell receive an SMS with a direct link to vote on the report. Officials in the same sector receive an email. This creates a geographically targeted feedback loop between communities and government.

---

## ✨ Key Features

### 🌍 Public (no account required)
- Browse the live severity-weighted heatmap centered on Kigali
- Click any heatmap point to see a popup with the report title, severity, category, and a link to the full detail page
- Filter reports by severity level
- Read any report's full details, photo evidence, and status timeline
- Vote on any report's severity (one vote per browser session)
- View the district-level accountability scorecard

### 👤 Citizens (phone number + PIN account)
- Create an account with OTP-verified phone number, 4-digit PIN, and full Rwanda administrative location
- Submit infrastructure reports with mandatory photo evidence, cascading location selection, severity rating, and interactive map pin
- Receive SMS notifications when new reports are submitted in the user's cell
- Vote on other citizens' reports (one vote per report, changeable every 7 days)

### 🏛️ Government Officials (email + password account)
- Restricted dashboard with reports filterable by status, severity, category, and district
- Summary statistics: total reports, awaiting action, in progress, resolved
- Update any report's status through the full lifecycle with a public message
- Upload resolution photo proof when marking a report as resolved
- Receive email notifications for new reports in official's sector
- Receive critical warning emails when community voting elevates a report to Critical severity

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI component framework |
| **Vite** | 8.0 | Build tool and development server |
| **React Router DOM** | 7.17 | Client-side routing and protected routes |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Axios** | 1.17 | HTTP client with JWT interceptors |
| **Leaflet.js** | 1.9 | Interactive map rendering |
| **react-leaflet** | 5.0 | React component bindings for Leaflet |
| **leaflet.heat** | 0.2 | Severity-weighted heatmap canvas layer |
| **OpenStreetMap** | — | Free map tiles (no API key required) |
| **react-dropzone** | — | Drag-and-drop photo upload |
| **Cloudinary** | — | Direct browser photo upload and CDN |
| **PostCSS** | 8.5 | CSS processing for Tailwind |
| **ESLint** | 10.3 | Code quality and consistency |

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1A7A4A` | Buttons, links, active states — Rwanda green |
| `primary-dk` | `#145E38` | Button hover states |
| `danger` | `#D9534F` | Errors, Critical severity, destructive actions |
| `warning` | `#E89B2F` | High severity, amber states |
| `bg` | `#F7F8F5` | Page background — warm off-white |
| `surface` | `#FFFFFF` | Cards, panels, inputs |
| `text-main` | `#1A1A2E` | Primary body text — near-black |
| `text-muted` | `#6B7280` | Labels, placeholders, secondary info |
| `border` | `#E5E7EB` | Card borders, dividers, input borders |

### Severity Color System

| Level | Label | Hex | Tailwind classes |
|---|---|---|---|
| 1 | Low | `#6B7280` | `bg-gray-100 text-gray-600` |
| 2 | Medium | `#E89B2F` | `bg-amber-100 text-amber-700` |
| 3 | High | `#F97316` | `bg-orange-100 text-orange-700` |
| 4 | Critical | `#D9534F` | `bg-red-100 text-red-700` |

### Heatmap Gradient

```
Low intensity    →    High intensity
#1A7A4A (green) → #E89B2F (amber) → #F97316 (orange) → #D9534F (red)
  0.2                  0.5                0.8                1.0
```

### Typography

| Use | Font | Weight | Notes |
|---|---|---|---|
| Headings | Inter | 700 | Tight letter spacing |
| Body | Inter | 400 | Line height 1.6 |
| Coordinates / IDs | JetBrains Mono | 400 | Monospace for precision data |

### Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| Card radius | `0.75rem` (12px) | All card and panel containers |
| Button radius | `0.5rem` (8px) | Standard buttons |
| Input radius | `0.5rem` (8px) | Form inputs and selects |
| Section padding | `2rem` | Page-level sections |
| Card padding | `1.25rem` | Card internal padding |

### Responsive Breakpoints

| Prefix | Min width | Target devices |
|---|---|---|
| *(none)* | 0px | Mobile portrait |
| `sm:` | 640px | Mobile landscape, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

All layouts use Tailwind's responsive prefixes. The grid system adapts from 1 column on mobile to 4 columns on desktop for report cards, and the map uses `60vh` height on all screen sizes.

### Component Design Principles

- **Loading states** — every data-fetching component shows animated pulse skeletons rather than blank space
- **Empty states** — every list or grid shows a friendly illustration and call-to-action when no data exists
- **Error states** — all API errors show a clearly worded message in a red banner
- **Field validation** — form errors appear inline beneath each field immediately on attempted submission, with red border on the offending input
- **Disabled states** — all interactive elements are visually muted with `opacity-60` and `cursor-not-allowed` when disabled

---

## 📁 Repository Structure

```
civicpulse-frontend/
│
├── ⚙️  .github/
│   └── workflows/
│       └── deploy.yml              ← GitHub Actions CI/CD pipeline
│
├── 📄 .env.example                 ← Safe template (no real secrets)
├── 📄 .gitignore                   ← Excludes node_modules, .env, dist
├── 📄 index.html                   ← App entry point and page title
├── 📄 package.json                 ← Dependencies and npm scripts
├── 📄 vite.config.js               ← Vite config: React plugin, leaflet.heat fix
├── 📄 tailwind.config.js           ← Custom color palette and font config
├── 📄 postcss.config.js            ← PostCSS config required by Tailwind v3
├── 📄 eslint.config.js             ← ESLint rules for React and hooks
│
├── public/
│   ├── favicon.svg                 ← Browser tab icon
│   └── icons.svg                   ← SVG icon sprite
│
└── src/
    │
    ├── 📄 main.jsx                 ← React entry point, Leaflet icon fix, CSS import
    ├── 📄 App.jsx                  ← BrowserRouter, all routes, PrivateRoute guard
    │
    ├── assets/
    │   └── hero.png                ← Hero image asset
    │
    ├── components/                 ← Reusable UI components
    │   ├── 📄 Navbar.jsx           ← Sticky navigation: logo, links, auth state,
    │   │                              Dashboard link for officials, logout
    │   ├── 📄 ReportCard.jsx       ← Clickable summary card for the home page grid
    │   ├── 📄 StatusBadge.jsx      ← Colour-coded status pill component
    │   ├── 📄 ReportLoginModal.jsx ← Modal prompting non-logged-in users to sign up
    │   │                              before reporting (appears on + Report Issue click)
    │   ├── 📄 LocationSelector.jsx ← Cascading district → sector → cell → village
    │   │                              dropdowns backed by the API
    │   ├── 📄 VotePanel.jsx        ← Community severity voting panel with real-time
    │   │                              counts, severity index display, and vote buttons
    │   ├── 📄 PhotoUploader.jsx    ← Drag-and-drop uploader with direct Cloudinary
    │   │                              upload, progress bar, preview, and remove button
    │   └── 📄 ReportPhotos.jsx     ← Two-section photo display (Reported Condition /
    │                                  Resolution Evidence) with full-screen lightbox
    │
    ├── context/
    │   └── 📄 AuthContext.jsx      ← Global auth state, session restoration on load,
    │                                  login() and logout() helpers
    │
    ├── hooks/
    │   └── 📄 useLocationData.js   ← Custom hook: cascading dropdown state,
    │                                  API fetching, reset on parent change
    │
    ├── pages/                      ← One file per route
    │   ├── 📄 HomePage.jsx         ← / — severity-weighted heatmap, clickable points,
    │   │                              filter, report card grid, login modal
    │   ├── 📄 CitizenAuthPage.jsx  ← /auth/citizen — 3-step signup (phone → OTP →
    │   │                              name/PIN/location) and phone + PIN login
    │   ├── 📄 OfficialAuthPage.jsx ← /auth/official — email + password login
    │   │                              and full registration with location
    │   ├── 📄 SubmitReportPage.jsx ← /submit — 6-section form: issue details,
    │   │                              location, optional identity, severity,
    │   │                              mandatory photo upload, map pin
    │   ├── 📄 ReportDetailPage.jsx ← /reports/:id — photo sections, metadata,
    │   │                              status timeline, vote panel, official form
    │   ├── 📄 ScorecardPage.jsx    ← /scorecard — district accountability cards
    │   │                              with A–F grades, metric bars, response times
    │   ├── 📄 OfficialDashboardPage.jsx ← /dashboard — report list with filters,
    │   │                              stats row, manage links
    │   ├── 📄 VotingPage.jsx       ← /vote/:id — lightweight voting page linked
    │   │                              in SMS notifications to cell users
    │   ├── 📄 NotFoundPage.jsx     ← * — 404 page with home link
    │   └── 📄 AuthPage.jsx         ← /auth — legacy redirect to /auth/citizen
    │
    ├── services/
    │   └── 📄 api.js               ← Axios instance, VITE_API_URL base URL,
    │                                  JWT auto-attachment interceptor,
    │                                  role-aware 401 redirect interceptor
    │
    ├── utils/
    │   └── 📄 uploadToCloudinary.js ← Direct XHR upload to Cloudinary with
    │                                   progress callback, file validation,
    │                                   error handling
    │
    └── styles/
        └── 📄 index.css            ← Tailwind directives, Leaflet height fix,
                                       severity badge utility classes
```

---

## 📄 Pages and User Flows

### 🏠 Home Page (`/`)

**Accessible to:** Everyone — no login required

The home page is the primary entry point for all users. It shows:

- A sticky filter bar with a severity dropdown and the `+ Report Issue` button
- A full-width Leaflet map (60vh) with a heatmap canvas layer rendered using `leaflet.heat`. Each report contributes a point with weight `= active_severity^1.5`, so Critical issues glow intensely red regardless of volume
- Invisible `CircleMarker` components on top of each report at the same coordinates — these are 0% opacity but capture click events, showing a popup with report title, severity badge, category, district, date, and a "View Full Report" button
- A severity legend below the map
- A responsive grid of `ReportCard` components below the map, ordered by severity descending
- If the user is not logged in and clicks `+ Report Issue`, a `ReportLoginModal` appears over the map offering Sign Up and Log In options

---

### 🔐 Citizen Auth Page (`/auth/citizen`)

**Accessible to:** Everyone

A three-step signup flow with tab switcher between Sign Up and Log In:

**Sign Up — Step 1 (Phone):**
- Phone number input with `+250` prefix fixed
- On submit calls `POST /api/auth/citizen/request-otp`
- In sandbox mode the response includes `debug_code` so you can test without a real SIM

**Sign Up — Step 2 (Verify):**
- 6-digit OTP input with large monospace font
- On success returns either a `verification_token` (new user, go to Step 3) or a full JWT (existing user, log in directly)

**Sign Up — Step 3 (Details):**
- Full name input
- 4-digit PIN with confirmation (side by side)
- `LocationSelector` component for district → sector → cell → village

**Log In:**
- Phone number + 4-digit PIN
- Calls `POST /api/auth/citizen/login`

---

### 🏛️ Official Auth Page (`/auth/official`)

**Accessible to:** Everyone

Simpler two-tab page (Login / Register):

**Register:** name, email, password (min 8 chars), department, plus `LocationSelector` for their assigned location — this determines which sector's reports they receive email notifications for

**Log In:** email + password

On successful official login, redirects to `/dashboard`.

---

### 📝 Submit Report Page (`/submit`)

**Accessible to:** Logged-in citizens only (PrivateRoute with requiredRole="citizen")

A six-section form:

1. **Issue Details** — title (required), description (optional), category dropdown
2. **Administrative Location** — `LocationSelector` cascading dropdowns; captures `district_id`, `sector_id`, `cell_id` for notifications
3. **Report Details** — optional name and contact fields (hidden when logged in, since the account name is used)
4. **Severity Level** — four clickable cards with colour-coded borders and descriptions
5. **Photo Evidence** — `PhotoUploader` component with drag-and-drop, Cloudinary direct upload, progress bar, preview, and validation (mandatory — cannot submit without a photo)
6. **Exact Location** — Leaflet map where clicking drops a `Marker` pin and auto-fills latitude/longitude

On submit: creates the report, then saves the Cloudinary photo URL via `POST /api/photos/:id/submission`, then navigates to the new report's detail page.

---

### 🔍 Report Detail Page (`/reports/:id`)

**Accessible to:** Everyone — officials see additional controls

Two-column layout:

**Left column:**
- `ReportPhotos` component — two labelled sections (Reported Condition / Resolution Evidence) with clickable full-screen lightbox; resolved reports with both photo types show a green "before and after" confirmation banner
- Report title and description
- Coordinates in monospace
- Severity source indicator (community-verified or awaiting votes)

**Right column:**
- Metadata card: category, district, sector, cell, submission date, submitter, severity badge, status badge, vote quick summary
- Status timeline: all four lifecycle stages with timestamps, official names, messages, and inline resolution photo thumbnails
- `VotePanel`: live vote counts, engagement rate, severity index, algorithm explanation, and Up / Down / Abstain buttons (available to everyone)
- Official status update form (officials only): status dropdown, message textarea, resolution photo upload section (appears only when "resolved" is selected), Save Update button

---

### 🏆 Scorecard Page (`/scorecard`)

**Accessible to:** Everyone — no login required

Three summary cards at the top (total reports, average acknowledged %, average resolved %) followed by a district card for each of the three Kigali districts showing:

- Letter grade (A–F) based on resolution percentage
- Acknowledged % progress bar
- Resolved % progress bar
- Average response time in days
- A methodology explanation section at the bottom

**Grading scale:**

| Grade | Resolved % |
|---|---|
| A | ≥ 75% |
| B | ≥ 50% |
| C | ≥ 25% |
| D | > 0% |
| F | 0% |

---

### 🖥️ Official Dashboard Page (`/dashboard`)

**Accessible to:** Logged-in officials only (PrivateRoute with requiredRole="official")

- Four stat cards: Total Reports, Awaiting Action, In Progress, Resolved
- Filter bar: status, severity, category, district dropdowns with a Reset filters button
- Report list showing severity badge, category, district, title, submitter, date, status badge, and a Manage → link to the detail page

---

### 🗳️ Voting Page (`/vote/:id`)

**Accessible to:** Everyone — no login required

A lightweight page designed for mobile use from an SMS link. Shows the report title, category, status, location details, description preview, and the `VotePanel` component. Includes a note explaining the user received this link because they are registered in the same cell.

---

### ❌ 404 Page (`/*`)

Any unmatched route shows the 404 page with a large primary-coloured "404", a helpful message, and a Back to home button.

---

## ⚙️ Environment Setup & Installation

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| Git | Latest | https://git-scm.com |

```bash
node -v    # v20.x.x
npm -v     # 10.x.x
```

You also need the **backend API running** before the frontend will display any data. See the [backend repository](https://github.com/louistona/civicpulse-backend) for setup.

You also need a free **Cloudinary account** with an unsigned upload preset named `civicpulse_uploads`:
1. Cloudinary → Settings → Upload → Upload presets → Add upload preset
2. Preset name: `civicpulse_uploads`
3. Signing mode: `Unsigned`
4. Folder: `civicpulse`
5. Save

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/louistona/civicpulse-frontend.git
cd civicpulse-frontend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set both values:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=civicpulse_uploads
```

> ⚠️ **Important:** Vite only reads `.env` files on startup. If you create or change this file while `npm run dev` is already running, you must stop it (Ctrl+C) and restart.

### Step 4 — Start the development server

```bash
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

### Step 5 — Verify setup

Work through this checklist:

- [ ] Home page loads with the Leaflet map centered on Kigali (`-1.9441, 30.0619`)
- [ ] No red errors in browser console (F12 → Console)
- [ ] Heatmap points appear if reports exist in the database
- [ ] Clicking a heatmap point shows the popup with report details
- [ ] `/auth/citizen` shows the 3-step signup flow
- [ ] `/auth/official` shows the official login page
- [ ] `/scorecard` shows the district accountability cards
- [ ] The `+ Report Issue` button shows the login modal when not logged in
- [ ] After logging in as a citizen, `+ Report Issue` navigates to `/submit`
- [ ] The submit form loads with category dropdown populated
- [ ] After logging in as an official, a Dashboard link appears in the navbar

---

### Available npm scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Vite dev server on `localhost:5173` with HMR |
| Production build | `npm run build` | Compiles to `dist/` folder |
| Preview build | `npm run preview` | Serves `dist/` locally to test production bundle |
| Lint | `npm run lint` | Runs ESLint across all source files |

---

## 🔄 CI/CD Pipeline

**Pipeline file:** `.github/workflows/deploy.yml`

Runs on every push to `main`:

```
Push to main branch
        │
        ▼
┌────────────────────────────────────┐
│  Job 1: Install & Build            │
│  • npm install                     │
│  • npm run build                   │
│    (catches all JSX/import errors  │
│     before they reach production)  │
│  • verify dist/ folder exists      │
└──────────────┬─────────────────────┘
               │ passes
               ▼
┌────────────────────────────────────┐
│  Job 2: Deploy                     │
│  • POST to Vercel deploy hook      │
│  • Vercel pulls latest code        │
│  • npm run build on Vercel         │
│  • dist/ deployed to global CDN    │
└────────────────────────────────────┘
```

**What the build step catches:**
Any JSX syntax error, missing import, or broken component will cause `npm run build` to fail. The pipeline stops, the deploy job is skipped, and your live site stays on the last working version. GitHub sends a failure notification by email.

**Required GitHub repository secret:**

| Secret name | Where to get it |
|---|---|
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → project → Settings → Git → Deploy Hooks |

---

## 🚀 Deployment

**Platform:** Vercel (free tier)

**Project configuration:**

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | *(empty — whole repo is the frontend)* |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Branch | `main` |
| Auto-deploy | Yes — on every push to main |

**Environment variables on Vercel** (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://civicpulse-backend-server.onrender.com/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `civicpulse_uploads` |

After adding environment variables, trigger a manual redeploy:
Vercel → your project → Deployments → three dots → Redeploy

**Deployment flow:**

```
git push origin main
        │
        ▼
GitHub Actions: npm install + npm run build
        │ build passes
        ▼
Vercel receives deploy hook
        │
        ▼
Vercel: npm run build → dist/ folder
        │
        ▼
dist/ deployed to Vercel global CDN
        │
        ▼
Live at https://civicpulse-frontend-gules.vercel.app
```

---

## 🧪 Testing

### Manual functional testing checklist

#### Public access (no account)

- [ ] Home page loads with heatmap over Kigali
- [ ] Heatmap shows heat intensity proportional to report severity
- [ ] Clicking a heatmap point shows the popup with correct report info
- [ ] Clicking "View Full Report" in popup navigates to detail page
- [ ] Severity filter on home page filters report cards correctly
- [ ] Clicking `+ Report Issue` without login shows the `ReportLoginModal`
- [ ] `/scorecard` loads and shows three district cards with grades
- [ ] `/reports/1` loads and shows the report with photo, metadata, timeline

#### Citizen signup flow

- [ ] `/auth/citizen` shows the Sign Up tab with phone input
- [ ] Entering a phone number and clicking Send triggers the OTP step
- [ ] OTP step shows a 6-digit code input
- [ ] In sandbox mode, the `debug_code` in the API response can be used
- [ ] Correct OTP advances to the Details step
- [ ] Wrong OTP shows an error message
- [ ] Details step shows name, PIN, PIN confirm, and location selector
- [ ] District dropdown loads Gasabo, Kicukiro, Nyarugenge
- [ ] Selecting a district loads the sector dropdown
- [ ] Selecting a sector loads the cell dropdown
- [ ] Submitting with all fields creates the account and redirects to home
- [ ] Navbar shows the citizen's name and a Log out button

#### Report submission (logged in as citizen)

- [ ] `+ Report Issue` navigates directly to `/submit`
- [ ] Submitting form with empty fields shows inline validation errors on each field
- [ ] Submitting without a photo shows the photo field error
- [ ] Dragging a photo into the dropzone shows a preview immediately
- [ ] Progress bar animates during Cloudinary upload
- [ ] Green "Photo uploaded" badge appears after completion
- [ ] Clicking the X on the preview removes the photo and resets
- [ ] Selecting district, sector, and cell populates cascading dropdowns
- [ ] Clicking the map drops a marker and shows the coordinates
- [ ] Submitting a valid form creates the report and navigates to its detail page
- [ ] New report appears on the home page heatmap and card grid

#### Report detail — voting

- [ ] Vote panel shows on every non-resolved report detail page
- [ ] Clicking Upvote records a vote and updates the counts immediately
- [ ] Severity badge updates in real time if the vote changes the computed tier
- [ ] Engagement rate and severity index display correctly
- [ ] Algorithm explanation text appears below the metrics
- [ ] Attempting a second vote within 7 days shows the "can change after" message
- [ ] Resolved reports show "Voting is closed" and disabled buttons

#### Official dashboard flow

- [ ] `/auth/official` shows the official login page
- [ ] Logging in with correct credentials redirects to `/dashboard`
- [ ] Dashboard shows the stats row with correct counts
- [ ] Status filter shows only reports with that status
- [ ] Severity filter shows only reports at that level
- [ ] Category filter shows only reports in that category
- [ ] District filter shows only reports in that district
- [ ] Multiple filters can be combined
- [ ] Reset filters button clears all filters
- [ ] Clicking Manage → navigates to the report detail page

#### Official status update with resolution photo

- [ ] Status update form appears only for logged-in officials
- [ ] Changing dropdown to anything except "resolved" — no photo section
- [ ] Changing dropdown to "resolved" — photo upload section appears
- [ ] Uploading a resolution photo shows preview and progress
- [ ] Saving a non-resolved update without photo works correctly
- [ ] Saving resolved status with photo: status updates, photo appears in Resolution Evidence section, green before/after banner appears
- [ ] Saving resolved status without photo: status updates, Resolution Evidence shows placeholder

#### Photo display

- [ ] Reports with submission photos show them under "Reported Condition"
- [ ] Resolved reports with resolution photos show them under "Resolution Evidence"
- [ ] Reports with no photos show a placeholder message
- [ ] Clicking any photo opens the full-screen lightbox
- [ ] Lightbox closes when clicking outside the image
- [ ] Lightbox closes when clicking the X button
- [ ] Caption text appears below the image in the lightbox

#### Navigation and routing

- [ ] `/auth` redirects to `/auth/citizen`
- [ ] Visiting `/submit` while logged out redirects to `/auth/citizen`
- [ ] Visiting `/dashboard` while logged out redirects to `/auth/official`
- [ ] Visiting `/dashboard` as a citizen redirects to `/`
- [ ] Any unknown URL shows the 404 page
- [ ] The 404 page Back to home button works

### Lighthouse performance audit

1. Open your live Vercel URL in Chrome
2. Press F12 → Lighthouse tab
3. Select: Performance, Accessibility, Best Practices, SEO
4. Click Analyze page load

**Target scores:**

| Metric | Target |
|---|---|
| Performance | ≥ 70 |
| Accessibility | ≥ 80 |
| Best Practices | ≥ 80 |
| SEO | ≥ 70 |
| First Contentful Paint | < 2s |
| Largest Contentful Paint | < 4s |

### System Usability Scale (SUS) — Evaluation Study

The evaluation methodology uses the validated 10-item SUS questionnaire administered to 5–10 volunteer participants after completing defined task scenarios.

**Pre-defined success criteria:**
- Mean SUS score ≥ 68 (industry-standard acceptable usability)
- Task completion rate ≥ 75% across both participant groups

**Citizen task set:**
1. Find a Critical severity report on the heatmap and view its details
2. Click a heatmap point and read the popup
3. Sign up as a citizen and submit a report with all required fields
4. Vote on a report that is not your own
5. Navigate to the accountability scorecard and identify the best-performing district

**Official task set:**
1. Log in with official credentials and navigate to the dashboard
2. Filter dashboard to show only Critical severity reports
3. Open a report and update its status to "In Progress" with a message
4. Mark a report as "Resolved" and upload a resolution photo
5. Identify which district has the lowest resolution rate on the scorecard

---

## 🎬 Video Demonstration

> 📹 **Watch the CivicPulse full walkthrough:**
>
> **[▶ Click to watch — YouTube](https://youtu.be/eIwL_lGSnmg)**
>

---

## 📚 Academic References

- Goodchild, M. F. (2007). Citizens as sensors. *GeoJournal, 69*(4), 211–221.
- Heeks, R. (2018). *ICT for Development (ICT4D)*. Routledge.
- Mellon, J., Peixoto, T., & Sjoberg, F. M. (2022). *The haves and the have nots*. World Bank Policy Research Working Paper No. 10195.
- Twizeyimana, J. D. (2023). Towards realisation of the public value of e-government. *IJPSPM, 11*(1), 123–147.
- Zhang, W. et al. (2022). A review of research on civic technology. *arXiv:2204.11461*.
- Zisengwe, M. (2024). Intersections between civic technology and governance. *AJIC, 33*.
- Brooke, J. (1996). SUS: A quick and dirty usability scale. In *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.

---

*CivicPulse Frontend — Built at the African Leadership University, Kigali, Rwanda · June 2026*
