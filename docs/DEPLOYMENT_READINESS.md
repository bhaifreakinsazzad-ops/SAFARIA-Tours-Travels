# SAFARIA Next.js — Vercel + Supabase Deployment Guide

## Repository & Architecture

- **GitHub Repository**: `https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels` (branch `main`)
- **Framework**: Next.js 16 (App Router, Node 20/24) + Progressive Web App (`/manifest.json`, `/sw.js`, `/offline`)
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS) across all B2B & enquiry tables (`supabase/FULL_PRODUCTION_SCHEMA.sql` and incremental migrations `001`–`005`).

---

## 1. Supabase Setup (Required Before First Login)

1. Create or open your Supabase project.
2. Open **Supabase Dashboard → SQL Editor** and execute `/supabase/FULL_PRODUCTION_SCHEMA.sql` (idempotent; creates all 8 tables, RLS policies, indexes, and the PostgreSQL `check_and_increment_rate_limit` RPC).
   - If upgrading an existing database that already has `001`–`005` applied, run `/supabase/migrations/006_b2b_subscriptions_and_invoices.sql`.
3. From **Project Settings → API** and **Database**, copy:
   - `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
   - `DATABASE_URL` (Postgres connection URI for strict RLS-scoped partner queries)

---

## 2. Vercel Environment Variables

Set these variables in **Vercel → Project Settings → Environment Variables** (`Production` and `Preview`):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase Project URL
- `SUPABASE_URL` — Same Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase Service Role key (server-side only)
- `DATABASE_URL` — Supabase Postgres connection URI
- `SESSION_SECRET` — Strong 32+ character random secret (`openssl rand -hex 32`)
- `ADMIN_API_KEY` — Secret key for service/cron admin calls
- `CRON_SECRET` — Bearer token used by `/api/cron/dispatch-outbox` (configured in `vercel.json`)
- `BOOTSTRAP_ADMIN_EMAIL` — Initial `SUPER_ADMIN` email; first login auto-creates the row in `staff_users`
- `BOOTSTRAP_ADMIN_PASSWORD` — Initial `SUPER_ADMIN` password

Optional GoHighLevel CRM Outbox sync variables:
- `GHL_API_KEY` (or `GHL_ACCESS_TOKEN`), `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID`

---

## 3. Core B2B Workflows & Endpoints

- Public landing & Travel Atelier (`/`), B2B Partner Landing & Agency Needs Finder (`/b2b`), Offline Fallback (`/offline`)
- Partner Workspace (`/partner`) with all six operational desks, real membership status, entitlement usage counters, invoices, and renewal info
- Admin Triage Console (`/admin`) with 30-day analytics (Recharts), lead assignment, 72-hour trial approval, subscription activation (`BDT 5,999` Monthly / `BDT 69,999` Annual), invoice reconciliation, and suspension controls
- Background CRM Outbox Cron (`/api/cron/dispatch-outbox` scheduled in `vercel.json`)

---

## 4. Pre-Deploy Verification Commands

```bash
npm run verify:purge
npm run typecheck
npm run lint
npm test
NODE_ENV=production npm run build
```
