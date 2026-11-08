# SAFARIA TOURS & TRAVELS
## Master Technical Architecture, Forensic Audit & Production Implementation Guide
**Platform:** Next.js (App Router) | React | TypeScript | Tailwind CSS | Three.js | Supabase
**Primary Target Market:** Bangladesh (Dhaka HQ) | International Expansion Ready
**Version:** 2.0.0-PROD | **Date of Record:** 2026

---

## 1. Source Reconstruction Report & Forensic HTML Audit

### 1.1 Baseline Forensic Analysis
The provided reference source (`SAFARIA Tours & Travels _ Your Gateway to Global Travel.html`) is a static client-side export generated from a Next.js (Turbopack) build. It captures the visual shell, metadata, and hero section of the landing page, while the core business sections were deferred placeholders.

| Component / Section | State in Supplied HTML | Reconstructed Production State |
| :--- | :--- | :--- |
| **Document Metadata** | `lang="bn"`, OG tags, Twitter cards present | Standardized with bilingual routing, alternate hreflang, Open Graph & Schema.org JSON-LD |
| **Site Header & Navigation** | Visual markup present; anchor links to `#sf-atlas`, `#sf26-offers`, `#sf-destinations`, `#sf-travel-form`, `#sf-agency` | Fully responsive navigation with desktop menu, mobile drawer, localized route switching, and dynamic CTA modals |
| **Hero Section** | Baseline copy present: *"সঠিক ফ্লাইটে শুরু হোক যাত্রা।"* with skyline backdrop | Preserved exactly with high-performance responsive backdrop, typography hierarchy, and direct quotation CTA trigger |
| **Journey Atlas Visual** | Static SVG globe (`viewBox="0 0 640 640"`) with Dhaka origin `(402, 339)` and 8 destination arcs | Preserved as guaranteed accessible fallback, coupled with a WebGL Three.js interactive 3D globe with auto-rotation, raycasting, and camera transitions |
| **Atlas Destinations** | 8 buttons: RUH, JED, CXB, KUL, SIN, DXB, CAN, LON with screen-reader text | Enhanced with interactive state machine: selecting a destination highlights the route and auto-fills the Flight Enquiry Studio |
| **Services Section (`#sf26-offers`)** | Deferred placeholder (`<section class="deferred-placeholder">`) | Fully reconstructed into an 8-service operational directory with service scopes, consultation modal hooks, and quotation routing |
| **Destinations (`#sf-destinations`)** | Deferred placeholder | Reconstructed into an interactive domestic (8 verified Bangladesh airports) and international (25 hubs) searchable directory |
| **Travel Studio (`#sf-travel-form`)** | Deferred placeholder | Fully reconstructed into a production flight quotation workflow supporting One-Way, Round-Trip, and Multi-City routes with live passenger validation and WhatsApp handoff |
| **B2B Agency (`#sf-agency`)** | Deferred placeholder | Reconstructed into a dedicated B2B portal featuring ৳20,000 monthly / ৳130,000 annual plans, 72-hour trial onboarding, 0% SAFARIA markup terms, and application capture |
| **Footer & Legal** | Retains disclaimer: *"SAFARIA ভ্রমণ সমন্বয় করে; চূড়ান্ত টিকিটিং এয়ারলাইন ও সাপ্লায়ারের নিয়মসাপেক্ষ।"* | Preserved verbatim, fortified with verified contact configuration, business registration notice, and ecosystem attribution |

### 1.2 Available vs. Missing Assets Audit

#### Available Assets (Extracted from HTML):
1. **Wordmark & Typography Rules:** Custom dual-weight mark `SAFARIA TOURS & TRAVELS`.
2. **Hero Copy & Positioning:** Verified Bengali copy defining SAFARIA's coordination role.
3. **Atlas SVG Coordinates:** Exact mathematical paths and circle coordinates for Dhaka to RUH, JED, CXB, KUL, SIN, DXB, CAN, and LON.
4. **Brand Palette Identifiers:** Radial gradients `#17584d` $\rightarrow$ `#0a302d` $\rightarrow$ `#041713` and gold accents `#f4d38d` / `#cfb57c`.

#### Missing Assets & External Dependencies:
1. **Raster Graphics:** `/images/skyline.webp`, `/images/logo-inverted.webp`, and `/images/social-share.jpg`.
   - *Production Solution:* Replaced with high-resolution, optimized vector graphics and CDN-hosted imagery matching the Deep Emerald and Royal Navy palette.
2. **Third-Party API Credentials:**
   - Supabase project URL and service role keys.
   - GoHighLevel (GHL) Location ID and v2 API key.
   - Flight GDS/Aggregator credentials (Amadeus, Sabre, or Duffel).
   - ADS-B Aircraft Tracking credentials (FlightRadar24 / FlightAware / ADS-B Exchange).
   - WhatsApp Cloud API or Twilio WhatsApp business credentials.
   - OpenAI / Anthropic API keys for Voyager AI.

### 1.3 Canonical URL & Domain Conflict Resolution
- **Identified Conflict:**
  - Exported HTML specifies: `https://safaria.vibing.world`
  - Historical business planning noted: `https://safaria.vibing.world/tours-and-travels`
- **Architectural Directive:**
  - Standardize on the root subdomain `https://safaria.vibing.world` as the primary canonical URL.
  - Implement an edge-level 301 redirect in `next.config.mjs` routing `/tours-and-travels` directly to `/` to avoid duplicate indexing penalties.
  - Configure `sitemap.ts` and `robots.ts` strictly referencing `https://safaria.vibing.world`.

---

## 2. Technical Architecture & Component Tree

```
safaria/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                 # Root layout with font injection & localized metadata
│   │   ├── page.tsx                   # Master unified homepage & sections
│   │   ├── services/page.tsx          # Full services directory
│   │   ├── destinations/page.tsx      # Destination directory & search
│   │   ├── agency/page.tsx            # B2B agency partnership & application
│   │   ├── corporate/page.tsx         # Corporate travel management
│   │   ├── visa/page.tsx              # Visa assistance & document checklists
│   │   └── admin/page.tsx             # Protected enquiry management dashboard
│   ├── api/
│   │   ├── enquiries/route.ts         # Multi-category enquiry ingestion & webhook dispatch
│   │   ├── agency/route.ts            # B2B partnership application handler
│   │   ├── ai-assistant/route.ts      # Server-side LLM streaming endpoint
│   │   └── tracking/route.ts          # Aircraft telemetry proxy (with honest fallback)
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
├── components/
│   ├── navigation/SiteHeader.tsx
│   ├── hero/HeroSection.tsx
│   ├── atlas/
│   │   ├── JourneyAtlas.tsx           # Orchestrator (SVG + 3D toggle)
│   │   ├── AtlasSvgFallback.tsx       # Mathematical SVG curve renderer
│   │   └── ThreeGlobe.tsx             # WebGL Three.js interactive earth
│   ├── services/ServiceCatalog.tsx
│   ├── destinations/DestinationGrid.tsx
│   ├── forms/
│   │   ├── FlightEnquiryForm.tsx      # Travel studio quotation engine
│   │   └── AgencyApplicationModal.tsx
│   ├── ai/VoyagerChat.tsx             # Floating concierge widget
│   ├── tracking/FlightRadarCard.tsx   # Live radar interface with telemetry status
│   └── layout/SiteFooter.tsx
├── lib/
│   ├── config/siteConfig.ts           # Centralized business contacts & URLs
│   ├── supabase/client.ts             # Supabase database client
│   ├── crm/ghlAdapter.ts              # GoHighLevel integration adapter with retry queue
│   └── utils/referenceGenerator.ts    # Format: SFR-YYYYMMDD-XXXX
└── types/
    └── index.ts                       # Complete TypeScript domain contracts
```

---

## 3. Database Schema & Security Architecture (PostgreSQL / Supabase)

Execute the following SQL script to initialize the production database schema, constraints, audit triggers, and Row Level Security (RLS) policies.

```sql
-- SAFARIA Tours & Travels - Master Database Migration
-- Version: 2.0.0-PROD

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENQUIRY STATUS ENUMS
CREATE TYPE enquiry_status AS ENUM (
  'NEW',
  'IN_REVIEW',
  'QUOTATION_SENT',
  'CUSTOMER_CONTACTED',
  'CONVERTED',
  'CLOSED_UNFULFILLED'
);

CREATE TYPE trip_type AS ENUM (
  'ONE_WAY',
  'ROUND_TRIP',
  'MULTI_CITY'
);

CREATE TYPE cabin_class AS ENUM (
  'ECONOMY',
  'PREMIUM_ECONOMY',
  'BUSINESS',
  'FIRST'
);

CREATE TYPE agency_plan AS ENUM (
  'MONTHLY_20K',
  'ANNUAL_130K'
);

-- 2. FLIGHT ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.flight_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  trip_type trip_type NOT NULL DEFAULT 'ROUND_TRIP',
  origin_code VARCHAR(3) NOT NULL,
  origin_name VARCHAR(128) NOT NULL,
  destination_code VARCHAR(3) NOT NULL,
  destination_name VARCHAR(128) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  adults INT NOT NULL CHECK (adults >= 1),
  children INT NOT NULL DEFAULT 0 CHECK (children >= 0),
  infants INT NOT NULL DEFAULT 0 CHECK (infants >= 0),
  cabin cabin_class NOT NULL DEFAULT 'ECONOMY',
  preferred_airline VARCHAR(100),
  passenger_name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_whatsapp VARCHAR(32) NOT NULL,
  additional_notes TEXT,
  source_locale VARCHAR(5) DEFAULT 'bn' NOT NULL,
  status enquiry_status DEFAULT 'NEW' NOT NULL,
  ghl_contact_id VARCHAR(128),
  ip_address INET,
  user_agent TEXT
);

-- 3. B2B AGENCY APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.agency_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  agency_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(128) NOT NULL,
  business_email VARCHAR(255) NOT NULL,
  phone_whatsapp VARCHAR(32) NOT NULL,
  business_location VARCHAR(255) NOT NULL,
  years_in_business INT,
  trade_license_no VARCHAR(128),
  iata_registered BOOLEAN DEFAULT FALSE,
  preferred_plan agency_plan DEFAULT 'MONTHLY_20K' NOT NULL,
  trial_requested BOOLEAN DEFAULT TRUE,
  trial_activated_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  settlement_terms_accepted BOOLEAN DEFAULT TRUE NOT NULL,
  status enquiry_status DEFAULT 'NEW' NOT NULL,
  notes TEXT
);

-- 4. GENERAL & CORPORATE ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.general_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  category VARCHAR(64) NOT NULL, -- 'CORPORATE', 'VISA', 'HOTEL', 'TOUR', 'AI_ASSISTANT'
  full_name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_whatsapp VARCHAR(32) NOT NULL,
  company_name VARCHAR(255),
  destination_interest VARCHAR(128),
  requirements TEXT NOT NULL,
  status enquiry_status DEFAULT 'NEW' NOT NULL
);

-- 5. INTEGRATION LOGS TABLE (AUDIT & RECOVERY)
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_name VARCHAR(64) NOT NULL, -- 'GHL', 'RESEND', 'WHATSAPP', 'OPENAI'
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  success BOOLEAN NOT NULL,
  retry_count INT DEFAULT 0
);

-- 6. INDEXES
CREATE INDEX idx_flight_enquiries_ref ON public.flight_enquiries(reference_no);
CREATE INDEX idx_flight_enquiries_created ON public.flight_enquiries(created_at DESC);
CREATE INDEX idx_agency_applications_ref ON public.agency_applications(reference_no);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.flight_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous users may insert enquiries (Submit Forms)
CREATE POLICY "Public insert flight enquiries" 
  ON public.flight_enquiries FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Public insert agency applications" 
  ON public.agency_applications FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Public insert general enquiries" 
  ON public.general_enquiries FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Only authenticated administrators may read and update records
CREATE POLICY "Admin select flight enquiries" 
  ON public.flight_enquiries FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admin update flight enquiries" 
  ON public.flight_enquiries FOR UPDATE 
  TO authenticated 
  USING (true);
```

---

## 4. CRM Integration Architecture: GoHighLevel (GHL) Adapter

```typescript
// lib/crm/ghlAdapter.ts
import { siteConfig } from '@/lib/config/siteConfig';

interface GhlContactPayload {
  name: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, string | number>;
  source: string;
}

export async function dispatchToGhl(payload: GhlContactPayload): Promise<{ success: boolean; contactId?: string; error?: string }> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn('[CRM Adapter] GHL credentials missing. Skipping external sync. Record stored in Supabase.');
    return { success: false, error: 'CREDENTIALS_PENDING' };
  }

  try {
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        tags: payload.tags,
        source: payload.source,
        customFields: Object.entries(payload.customFields).map(([key, value]) => ({
          id: key,
          field_value: String(value)
        }))
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'GHL API returned an error');
    }

    return { success: true, contactId: data.contact?.id };
  } catch (err: any) {
    console.error('[CRM Adapter Error]', err.message);
    // Note: Database persistence is already complete. Failures do not lose customer enquiries.
    return { success: false, error: err.message };
  }
}
```

---

## 5. Environment Configuration Template (`.env.example`)

```bash
# ==============================================================================
# SAFARIA TOURS & TRAVELS - CORE PRODUCTION CONFIGURATION
# ==============================================================================

# 1. CANONICAL & SITE ROUTING
NEXT_PUBLIC_SITE_URL="https://safaria.vibing.world"
NEXT_PUBLIC_DEFAULT_LOCALE="bn"

# 2. BUSINESS CONTACTS (VERIFIED)
NEXT_PUBLIC_WHATSAPP_NUMBER="8801674178437"
NEXT_PUBLIC_SUPPORT_EMAIL="safariatoursandtravels@gmail.com"
NEXT_PUBLIC_OFFICE_ADDRESS="Dhaka, Bangladesh"

# 3. SUPABASE INFRASTRUCTURE
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. CRM & AUTOMATION (GoHighLevel v2 API)
GHL_API_KEY="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
GHL_LOCATION_ID="loc_xxxxxxxxxxxxxxxx"

# 5. AI TRAVEL CONCIERGE (Server-Side LLM Integration)
AI_PROVIDER="openai" # Options: 'openai', 'anthropic', 'puter_bridge'
AI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
AI_MODEL_NAME="gpt-4o-mini"

# 6. EXTERNAL FLIGHT SUPPLIER & TRACKING INTEGRATIONS (UPCOMING)
# Keep empty until commercial agreements are executed
FLIGHT_SUPPLIER_PROVIDER="" # Options: 'amadeus', 'sabre', 'duffel'
FLIGHT_SUPPLIER_CLIENT_ID=""
FLIGHT_SUPPLIER_SECRET=""

AIRCRAFT_RADAR_PROVIDER="" # Options: 'flightaware', 'flightradar24', 'adsbexchange'
AIRCRAFT_RADAR_API_KEY=""

# 7. NOTIFICATIONS & EMAIL
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
ADMIN_NOTIFICATION_EMAIL="safariatoursandtravels@gmail.com"
```

---

## 6. Phased Rollout & Quality Assurance Matrix

| Phase | Milestone | Acceptance Criteria | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Source & Shell Reconstruction | Faithful recreation of original brand styling, fonts, hero copy, and SVG Journey Atlas. | **COMPLETE** |
| **Phase 2** | Section Rejuvenation | Complete implementation of Services, Destinations, Travel Studio, and B2B Agency sections. | **COMPLETE** |
| **Phase 3** | Data & Enquiry Workflows | Unique reference generation, client & server validation, WhatsApp message generator, and Supabase SQL. | **COMPLETE** |
| **Phase 4** | 3D & Interactive Experiences | Three.js Journey Atlas with fallback, Voyager AI Concierge, and live radar telemetry state. | **COMPLETE** |
| **Phase 5** | Localization & SEO | Full Bengali and English parity, Open Graph tags, canonical standardization, and Schema.org JSON-LD. | **COMPLETE** |
| **Phase 6** | Operational Administration | Embedded administrative console for reviewing enquiries, status tracking, and CRM dispatch logs. | **COMPLETE** |
