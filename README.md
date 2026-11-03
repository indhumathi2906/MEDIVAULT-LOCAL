# MEDIVAULT – A Centralized Digital Healthcare Management System

MEDIVAULT is a production-grade full-stack electronic healthcare management system built using the MERN stack (MongoDB, Express.js, React 18 with Vite, and Node.js). It bridges clinical workflows across three distinct operational roles: **Patients**, **Physicians**, and **System Administrators**.

---

## 🏥 Architecture Overview

The system is organized into two standalone applications:
- **`server/`**: RESTful API running Express 4, Mongoose 8, JWT authentication with role authorization middleware, bcrypt password hashing, input validation, and automatic MongoDB Memory Server fallback.
- **`client/`**: React 18 single-page application built on Vite, React Router 6, Axios with automatic JWT interceptors, Recharts data visualization, Lucide icons, and Tailwind CSS.
- **`server.ts`**: Unified full-stack runner allowing single-command local execution and instant cloud preview.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- *(Optional)* Local MongoDB instance on port 27017. If unavailable, MEDIVAULT automatically launches an embedded in-memory MongoDB (`mongodb-memory-server`) with zero manual setup!

### 1. Unified Single-Command Run (Recommended)
From the project root:
```bash
# 1. Install dependencies
npm install

# 2. Start unified full-stack server (boots backend on /api and mounts React frontend)
npm run dev
```
Open your browser to `http://localhost:3000`.

---

### 2. Standalone Server & Client Execution

#### Backend (`server/`)
```bash
cd server

# 1. Copy environment configuration
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Seed clinical database with demo accounts, appointments, vitals & prescriptions
npm run seed

# 4. Start the backend API server (runs on Port 5000)
npm run dev
```

#### Frontend (`client/`)
In a separate terminal:
```bash
cd client

# 1. Install dependencies
npm install

# 2. Launch Vite development client (runs on Port 5173, proxies /api to Port 5000)
npm run dev
```
Open your browser to `http://localhost:5173`.

#### Connecting the frontend to a deployed backend
The frontend reads its API base URL from `VITE_API_BASE_URL`. Set it to your backend's URL including `/api`, for example:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```
For local development, create `client/.env.local` with that value; otherwise the app defaults to `/api` and uses the Vite proxy above. For a deployed frontend, add `VITE_API_BASE_URL` to the hosting provider's environment variables and rebuild/redeploy the frontend. The backend must allow requests from the deployed frontend's origin.

---

## 🔑 One-Click Demo Profiles & Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **PATIENT** | `patient@medivault.com` | `Patient@123456` | Alex Mercer (Age ~40, Blood Group O+, Hypertension managed) |
| **DOCTOR** | `doctor@medivault.com` | `Doctor@123456` | Dr. Sarah Jenkins (Cardiology & Vascular Medicine, 4.9★) |
| **DOCTOR** | `dr.marcus@medivault.com` | `Doctor@123456` | Dr. Marcus Vance (Neurology & Cognitive Health, 5.0★) |
| **ADMIN** | `admin@medivault.com` | `Admin@123456` | System Administrator (Full governance & user audit) |

*Quick login buttons are available directly on the login portal for 1-click clinical testing.*

---

## 📋 Business Rules Verification Checklist

- [x] **Rule 1 – Double-Booking Prevention**: The system rejects appointment bookings if a non-Cancelled appointment exists for the same physician, date, and time slot (HTTP 400).
- [x] **Rule 2 – Reciprocal Notification Dispatch**: Booking an appointment notifies the doctor; appointment status updates automatically trigger notifications for the other party.
- [x] **Rule 3 – Consultation Diagnostic Completion**: Recording a consultation requires an appointment reference and diagnosis, and automatically transitions the appointment status to `Completed`.
- [x] **Rule 4 – Digital Prescription Issuance**: Prescribing requires at least one medication with dosage and duration, generating a certifiable digital prescription and alerting the patient.
- [x] **Rule 5 – Automated Biomarker Calculation**: Progress reviews automatically compute Body Mass Index ($\text{BMI} = \text{weight} / (\text{height}/100)^2$) rounded to 1 decimal place, and notify the patient.
- [x] **Rule 6 – Longitudinal Progress Summary**: Calculates prior-versus-current deltas for Weight, BMI, Blood Pressure, and Fasting Blood Sugar with chronologically indexed Recharts area graphs.
- [x] **Rule 7 – Validated Patient Reviews**: Reviews are strictly restricted to completed visits without prior evaluations. Doctor average rating and total review counts are recomputed after every review modification or removal.
- [x] **Rule 8 – Granular Ownership Enforcement**: Patients and doctors can only access records they are direct parties to, while administrators retain audit access.
- [x] **Rule 9 – Public Registration Safety**: Public registration only permits creation of `PATIENT` or `DOCTOR` accounts; invalid roles default to `PATIENT`. Administrator accounts can only be provisioned via the seed script.
- [x] **Rule 10 – Account Status Governance**: Deactivated users receive HTTP 403 on login and protected calls. Administrator accounts cannot be deactivated.

---

## 🎨 Design Rules & Editorial Clinical Aesthetic

- [x] **Editorial Clinical Concept**: Calibrated for high trust, precision typography, and clinical clarity without generic AI tropes.
- [x] **Curated Palette**: Deep Slate Ink (`#0B132B`), Clinical Caduceus Teal (`#0E7490`), Clean White Surface (`#FFFFFF`), with semantic states (Improving `#15803D`, Stable `#0369A1`, Needs Attention `#B45309`, Alert `#BE123C`).
- [x] **Characterful Typography**: `Fraunces` editorial serif for headings paired with `Plus Jakarta Sans` for body text and `IBM Plex Mono` for vitals, dates, and IDs (`tabular-nums font-mono`).
- [x] **4 Signature Elements**:
  1. Animated real-time ECG rhythm wave motif in auth and loading headers.
  2. Printable digital prescription certificate with watermark, medical license, and signature line.
  3. Interactive vertical milestone timeline with connected clinical nodes.
  4. Monospace biomarker vitals strip with sparkline trends and AHA normal reference bands.
- [x] **Zero-Pill Discipline & Accessibility**: Unboxed metadata with typographic separators (`·`), dark/light theme switch, and full WCAG AA contrast compliance.
