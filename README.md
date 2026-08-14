# 🌾 Farm Tracer — From Farm to Fork, Know the Journey

<div align="center">

![Farm Tracer Banner](https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80)

**Transparent, Verifiable, Offline-First Digital Food Supply-Chain Traceability System**

[![GitHub Pages Deployment](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?logo=github&style=flat-square)](https://jiviteshiscoding.github.io/farm-tracer1/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20GenAI-Gemini%20Flash-4285F4?logo=google&logoColor=white&style=flat-square)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-5A0FC8?logo=pwa&logoColor=white&style=flat-square)](https://web.dev/progressive-web-apps/)

[🌐 **Live Demo (GitHub Pages)**](https://jiviteshiscoding.github.io/farm-tracer1/) • [📖 **User Documentation**](#-stakeholder-roles--user-journeys) • [⚡ **Quickstart**](#-installation--local-setup) • [🤖 **Gemini AI Features**](#-multimodal-gemini-ai-features)

</div>

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Key Highlights & Capabilities](#-key-highlights--capabilities)
3. [Stakeholder Roles & User Journeys](#-stakeholder-roles--user-journeys)
4. [Multimodal Gemini AI Features](#-multimodal-gemini-ai-features)
5. [Cryptographic Integrity & Hash Chain](#-cryptographic-integrity--hash-chain)
6. [Offline-First Architecture & Sync Queue](#-offline-first-architecture--sync-queue)
7. [Batch Lineage & Transformation Engine](#-batch-lineage--transformation-engine)
8. [GIS Mapping & Geo-Tracking](#-gis-mapping--geo-tracking)
9. [Regulatory Compliance & Recall System](#-regulatory-compliance--recall-system)
10. [Multi-Language Localization](#-multi-language-localization)
11. [Data Model & Architecture](#-data-model--architecture)
12. [Tech Stack](#-tech-stack)
13. [Installation & Local Setup](#-installation--local-setup)
14. [Deployment Guide](#-deployment-guide)

---

## 🌟 Overview

**Farm Tracer** is an end-to-end digital food supply-chain traceability platform built to establish transparency, authenticity, and food safety from agricultural origins to consumer tables. 

Whether tracking fresh organic tomatoes from rural Maharashtra to metropolitan supermarkets, or monitoring cold-chain dairy processing in Kolhapur, Farm Tracer ensures that every harvest, custody transfer, temperature check, transformation, and retail dispatch is verifiably recorded and tamper-evident.

---

## ✨ Key Highlights & Capabilities

- 🔐 **Cryptographic Hash Chaining**: Every supply-chain event is linked via SHA-256 hash chains (`previousEventHash` $\rightarrow$ `eventHash`) with digital signature verification.
- 📡 **Offline-First PWA**: Operates in low/no connectivity environments using browser-native IndexedDB (`idb`), queuing events locally with idempotency keys and auto-syncing upon reconnection.
- 🗺️ **Interactive Geographic Route Tracing**: Visualizes transit waypoints, transport paths, and regional origins using Leaflet maps with dynamic polyline route generation.
- 🌳 **Batch Lineage DAG**: Tracks complex split, merge, transformation, and repackaging lineages (e.g. raw tomatoes processed into purees and packaged consumer goods).
- 🤖 **Multimodal Gemini AI Integration**:
  - Auto-generated plain-language consumer journey stories.
  - Computer-vision visual product verification and quality audits.
  - Predictive anomaly and supply-chain risk detection.
- 🚨 **Instant Recall Cascading**: Regulators and authorities can trigger 1-click batch recalls that immediately flag all downstream child products across the supply chain.
- 🏷️ **QR Code Engine**: High-density QR generation with standard FSSAI labelling, printing templates, and built-in camera QR scanner.
- 🌐 **9 Indian Languages**: Full UI localization in English, Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Bengali, and Punjabi.

---

## 👥 Stakeholder Roles & User Journeys

Farm Tracer provides tailored workflows for every actor in the food ecosystem:

```
[ 🌾 Farmer ] ➔ [ ⚙️ Processor ] ➔ [ 🚚 Logistics & Cold Storage ] ➔ [ 🏪 Retailer ] ➔ [ 🛒 Consumer ]
                                          ⬆
                          [ ⚖️ Regulatory Authority / FSSAI ]
```

### 1. 🌾 Farmer Dashboard
- **Batch Creation**: Register newly harvested crops with variety, quantity, harvest timestamp, quality grade, and photos.
- **GPS Geo-tagging**: Pin exact farm coordinates via interactive map or device GPS.
- **Label Generation**: Generate and print standardized QR code batch tags for physical crates and sacks.
- **Status Management**: Transition batch state from `HARVESTED` $\rightarrow$ `COLLECTED` $\rightarrow$ `TRANSFERRED`.

### 2. ⚙️ Processor Dashboard
- **Intake Scanner**: Scan incoming raw farm batches to verify origin integrity before intake.
- **Batch Transformation & Lineage**:
  - **Split**: Break large bulk batches into smaller processing units.
  - **Merge**: Combine multiple small farm lots into single processing vats.
  - **Transform**: Convert raw ingredients into processed goods (e.g. Raw Milk $\rightarrow$ Pasteurised Pouch Milk & Ghee).
- **AI Visual Verification**: Capture/upload batch photos to verify visual consistency against declared product specs using Gemini AI.
- **Quality & FSSAI Licensing**: Log FSSAI license numbers, laboratory test grades, and sanitation certificates.

### 3. 🚚 Distributor, Transporter & Cold Storage Portal
- **Custody Transfer Logging**: Scan QR codes at transfer points (pickup, checkpoint, transit hub, delivery).
- **Environmental Telemetry**: Log real-time temperature (°C) and humidity (%) conditions for refrigerated vehicles (reefers) and cold storage facilities.
- **Transit Anomaly Detection**: Flag transit delays, route deviations, and broken cold-chains.

### 4. 🏪 Retailer Dashboard
- **Inward Stock Verification**: Scan goods upon store delivery to verify authenticity, harvest dates, and expiry countdowns.
- **Shelf Lifecycle Management**: Monitor days until expiry, mark items as `RETAIL` or `SOLD`, and prevent expired inventory sales.
- **Instant Recall Alert Banner**: Immediate visual notification if any inventory batch is recalled by authorities.

### 5. 🛒 Consumer Public Trace Page (`/trace/:batchId`)
- **Direct QR Scanning**: Consumers scan QR codes on packaging with any smartphone camera or built-in web scanner.
- **Farm-to-Fork Timeline**: Step-by-step verified chronological timeline showing every stage, actor, timestamp, and location.
- **Interactive Journey Map**: Visual Leaflet map displaying the complete transit path from farm of origin to retail shelf.
- **AI Story Generator**: Plain, reassuring, AI-generated summary of the product's journey and freshness verification.
- **Authenticity Certificate**: Official verification stamp with downloadable digital trace report.

### 6. ⚖️ Regulatory Authority / FSSAI Portal
- **Supply-Chain Oversight**: Complete nationwide/statewide visibility over active batches and risk scores.
- **Automated Anomaly Detector**: Real-time identification of impossible travel speeds, expired transit attempts, and abnormal dwell times.
- **Downstream Recall Propagation**: Issue emergency recall orders that automatically flag parent batches and all descendant child products.
- **Audit Export**: Export official FSSAI compliance dossiers and inspection records.

### 7. 🛠️ System Admin Dashboard
- **Telemetry & Health**: View IndexedDB storage size, event synchronization queue status, network mode, and active peer nodes.
- **Database Management**: One-click mock data reset, sample dataset seeding, and offline storage clearing.

---

## 🤖 Multimodal Gemini AI Features

Farm Tracer integrates Google Gemini AI (`@google/genai`) to provide intelligent analysis across the supply chain:

| Feature | Endpoint / Service | Description |
|---|---|---|
| **AI Journey Story** | `fetchAITraceSummary` | Translates complex cryptographic timeline logs into friendly, factual consumer summaries. |
| **Visual Inspection** | `verifyProductImageWithAI` | Analyzes uploaded produce photos against declared product categories to detect mismatches or spoilage. |
| **Risk & Anomaly Engine** | `runAIRiskAssessment` | Inspects spatial-temporal coordinates, transit timestamps, and lineage splits to flag suspicious supply-chain patterns. |

> *Note: When running without an active backend or API key, client-side fallback engines ensure zero disruption and provide realistic automated evaluations.*

---

## 🔒 Cryptographic Integrity & Hash Chain

Every supply-chain event logged into Farm Tracer is hashed and linked:

$$\text{eventHash} = \text{SHA-256}(\text{id} + \text{batchId} + \text{eventType} + \text{actorId} + \text{timestamp} + \text{previousEventHash} + \text{location})$$

1. **Genesis Event**: The initial harvest record contains `previousEventHash: "0000000000000000000000000000000000000000000000000000000000000000"`.
2. **Immutable Audit Trail**: Any attempt to alter historical timestamps, quantities, or actors breaks the subsequent hash verification chain.
3. **Status Verification**: System flags batches as `VERIFIED`, `WARNING`, `RECALLED`, or `EXPIRED`.

---

## 📶 Offline-First Architecture & Sync Queue

Designed specifically for remote rural agricultural belts with unstable connectivity:

```
[ User Action ] ➔ [ Local IndexedDB Storage ] ➔ [ Immediate UI Update ]
                           │
                           ▼
                 [ Sync Queue (idempotent) ]
                           │
                    (When Online)
                           ▼
          [ Automatic Cloud Synchronization ]
```

- **Storage**: IndexedDB schema with dedicated object stores for `batches`, `events`, `lineage`, `recalls`, and `syncQueue`.
- **Idempotency**: All offline actions are tagged with unique `idempotencyKey` UUIDs to eliminate duplicate records during reconnection sync.
- **Simulation Toggle**: Built-in Network Switcher in the navigation bar allows users to simulate full offline mode and test sync queues.

---

## 🌳 Batch Lineage & Transformation Engine

Food items rarely travel unaltered. Farm Tracer supports four core lineage operations:

- 🔀 **SPLIT**: 1 Bulk Farm Batch $\rightarrow$ Multiple smaller batches.
- 🔗 **MERGE**: Multiple Farm Batches $\rightarrow$ Single processing lot.
- 🔄 **TRANSFORM**: Raw ingredient $\rightarrow$ New processed product type.
- 📦 **REPACK**: Bulk packaging $\rightarrow$ Individual consumer retail SKUs.

The interactive **Lineage Graph (`LineageGraph.tsx`)** renders visual Directed Acyclic Graphs (DAG) showing parent and child relationships.

---

## 🗺️ GIS Mapping & Geo-Tracking

- **Leaflet Integration**: Interactive open-source mapping with OpenStreetMap tiles.
- **Route Trajectory**: Connects origin coordinates, intermediate cold storage hubs, and retail outlets with visual polyline trajectories.
- **Geotag Picker**: Allows farmers and drivers to choose location via GPS geocoding or by dropping a pin on the map.

---

## 🌐 Multi-Language Localization

Farm Tracer features a comprehensive multi-lingual engine (`translations.ts`) supporting 9 major languages:

| Code | Language | Native Script |
|---|---|---|
| **EN** | English | English |
| **HI** | Hindi | हिन्दी |
| **MR** | Marathi | मराठी |
| **GU** | Gujarati | ગુજરાતી |
| **TA** | Tamil | தமிழ் |
| **TE** | Telugu | తెలుగు |
| **KN** | Kannada | ಕನ್ನಡ |
| **BN** | Bengali | বাংলা |
| **PA** | Punjabi | ਪੰਜਾਬੀ |

---

## 📊 Data Model & Architecture

```typescript
// Core Data Entities
Batch {
  id: string;
  batchId: string;           // e.g. "FT-IN-MH-PUN-20260810-9843A1"
  productName: string;
  category: ProductCategory; // MILK, VEGETABLES, FRUITS, GRAINS, CROPS, MEAT_FISHERIES, PROCESSED_FOOD
  quantity: number;
  unit: "KG" | "TONS" | "LITERS" | "BOXES" | "PACKETS" | "UNITS";
  harvestDate?: string;
  productionDate: string;
  expiryDate?: string;
  farmLocation: string;
  lat: number;
  lng: number;
  currentStatus: BatchStatus;
  verificationStatus: VerificationStatus;
  parentBatchIds: string[];
  childBatchIds: string[];
  qualityGrade?: "A+" | "A" | "B" | "C" | "STANDARD" | "ORGANIC";
  fssaiLicence?: string;
}

SupplyChainEvent {
  id: string;
  batchId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: EventType;
  timestamp: string;
  locationName: string;
  temperature?: number;
  humidity?: number;
  previousEventHash: string;
  eventHash: string;
  syncStatus: "SYNCED" | "PENDING" | "FAILED";
}
```

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4, Lucide React Icons, Motion animations
- **Maps & GIS**: Leaflet 1.9, `@types/leaflet`
- **QR Code**: `qrcode`, `html5-qrcode`
- **Charts & Telemetry**: Recharts 3
- **Storage & PWA**: IndexedDB (`idb`), Service Worker API, Web Manifest
- **AI Backend (Optional)**: Express, Node.js, `@google/genai` (Gemini 3.6 Flash)

---

## ⚡ Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm, pnpm, or bun

### 1. Clone the repository
```bash
git clone https://github.com/jiviteshiscoding/farm-tracer1.git
cd farm-tracer1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)
Create a `.env` or `.env.local` file for Gemini AI functionality:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run Development Server
```bash
# Start frontend with Vite
npm run dev
```

Visit **`http://localhost:5173`** (or `http://localhost:3000` if running backend) in your browser.

---

## 🚀 Deployment Guide

### Option 1: GitHub Pages (Automated CI/CD Included)
The repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Go to your repository on GitHub: **Settings $\rightarrow$ Pages**.
2. Under **Build and deployment $\rightarrow$ Source**, select **`GitHub Actions`**.
3. Push to `main` branch. GitHub Actions will build and deploy automatically to:
   👉 **`https://jiviteshiscoding.github.io/farm-tracer1/`**

### Option 2: Vercel / Netlify
1. Import repository on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`. Output Directory: `dist`.
4. Add `GEMINI_API_KEY` in Environment Variables if desired.

### Option 3: Full-Stack on Render / Railway
1. Build Command: `npm install && npm run build:server`
2. Start Command: `npm start`
3. Environment Variables: `GEMINI_API_KEY`, `NODE_ENV=production`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
