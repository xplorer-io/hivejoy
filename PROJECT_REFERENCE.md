# Hive Joy Marketplace - Project Reference

> Complete technical reference for the Hive Joy project. Use this to pick up development at any time.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Variables](#3-environment-variables)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Migrations](#6-migrations)
7. [Authentication](#7-authentication)
8. [API Routes](#8-api-routes)
9. [Server-Side Data Functions](#9-server-side-data-functions)
10. [State Management](#10-state-management)
11. [Pages & Routes](#11-pages--routes)
12. [Key Components](#12-key-components)
13. [User Flows](#13-user-flows)
14. [Third-Party Integrations](#14-third-party-integrations)
15. [Commission & Business Logic](#15-commission--business-logic)
16. [Type Definitions](#16-type-definitions)
17. [Middleware & Route Protection](#17-middleware--route-protection)
18. [Build & Deployment](#18-build--deployment)
19. [Development Tips](#19-development-tips)

---

## 1. Project Overview

**Hive Joy Marketplace** is an Australian honey marketplace connecting verified honey producers directly with consumers. Every jar is traceable back to the beekeeper, region, and harvest batch.

### Three User Roles

| Role | Description |
|------|-------------|
| **Consumer** | Browse, purchase honey, track orders |
| **Producer (Seller)** | Register, create batches/products, manage orders. Must be verified by admin. |
| **Admin** | Approve seller applications, moderate listings, manage disputes, view analytics |

### Core Principles

- **Producer-only**: No resellers or importers. All sellers must be beekeepers.
- **Batch traceability**: Every product links to a harvest batch with region, dates, floral sources.
- **Australian-only**: Exclusively for Australian businesses and consumers.
- **Verified sellers**: Admin approval required before a producer can sell.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router, Turbopack) | ^16.1.6 |
| **React** | React + React DOM | 19.2.3 |
| **Language** | TypeScript | 5.9.3 |
| **Database & Auth** | Supabase (PostgreSQL + RLS + Auth) | supabase-js ^2.91.1, ssr ^0.8.0 |
| **Payments** | Stripe | stripe ^20.1.2, stripe-js ^8.6.1 |
| **Email** | SendGrid | @sendgrid/mail ^8.1.6 |
| **Image CDN** | Cloudinary | ^2.9.0 |
| **Analytics** | PostHog | posthog-js ^1.336.4 |
| **State** | Zustand | ^5.0.9 |
| **Forms** | React Hook Form + Zod | ^7.70.0 / ^4.3.5 |
| **UI** | Tailwind CSS v4 + shadcn/ui (Radix) | tailwindcss ^4 |
| **Icons** | Lucide React | ^0.562.0 |
| **Date/Time** | Luxon | ^3.7.2 |
| **Styling Utils** | clsx, tailwind-merge, CVA | ^2.1.1 / ^3.4.0 / ^0.7.1 |
| **Node** | Node.js | 22.x required |

### Dev Dependencies

| Package | Version |
|---------|---------|
| @tailwindcss/postcss | ^4 |
| @types/luxon | ^3.7.1 |
| @types/node | ^20 |
| @types/react | ^19 |
| @types/react-dom | ^19 |
| eslint | ^9 |
| eslint-config-next | 16.1.1 |
| tw-animate-css | ^1.4.0 |

---

## 3. Environment Variables

All variables go in `.env.local`. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Supabase (Required)

| Variable | Public? | Description | Where to get it |
|----------|---------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anonymous/public key for client-side access | Same location |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Service role key - bypasses RLS. Server-only. | Same location (keep secret) |

### Stripe (Required)

| Variable | Public? | Description | Where to get it |
|----------|---------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | **No** | Server-side Stripe API key | Stripe Dashboard > Developers > API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Client-side Stripe key | Same location |
| `STRIPE_WEBHOOK_SECRET` | **No** | Signing secret for Stripe webhook events | Stripe Dashboard > Webhooks > Signing secret |

### App URLs (Required)

| Variable | Public? | Description |
|----------|---------|-------------|
| `APP_BASE_URL` | **No** | Base URL used in server-side email links (e.g., `https://hivejoy.com`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL accessible to the client |

### SendGrid (Required for emails)

| Variable | Public? | Description |
|----------|---------|-------------|
| `SENDGRID_API_KEY` | **No** | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | **No** | Sender email (must be verified in SendGrid). Falls back to `noreply@hivejoy.com` |
| `SENDGRID_ADMIN_EMAILS` | **No** | Comma-separated admin emails for notifications (fallback when no admins found in DB) |
| `SENDGRID_AGENT_EMAIL` | **No** | Legacy single-recipient fallback email |

### PostHog (Required for analytics)

| Variable | Public? | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog instance host URL |

### Cloudinary (Required for image uploads)

| Variable | Public? | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes | Upload preset for unsigned uploads |

### Optional

| Variable | Public? | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_DEFAULT_COVER_IMAGE_URL` | Yes | Default cover image CDN URL |
| `NEXT_PUBLIC_FOUNDER_IMAGE_URL` | Yes | Founder/default user image CDN URL |

---

## 4. Project Structure

```
hivejoy/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers, metadata)
│   ├── globals.css               # Global styles (Tailwind imports)
│   ├── (consumer)/               # Consumer route group
│   │   ├── layout.tsx            # Header + Footer wrapper
│   │   ├── page.tsx              # Homepage
│   │   ├── products/             # Product browse & detail
│   │   ├── producers/            # Producer browse & profiles
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Multi-step checkout
│   │   ├── orders/               # Order history
│   │   ├── about/                # About page
│   │   ├── our-story/            # Company story
│   │   └── policies/             # Terms, refund policy
│   ├── (seller)/seller/          # Seller route group
│   │   ├── layout.tsx            # Sidebar + verification gates
│   │   ├── dashboard/            # Seller dashboard
│   │   ├── batches/              # Batch management (list, new, [id])
│   │   ├── listings/             # Product management (list, new, [id])
│   │   ├── orders/               # Seller order management
│   │   ├── profile/              # Seller profile
│   │   ├── register-new/         # Seller registration form
│   │   ├── apply/                # Seller application entry
│   │   ├── application-sent/     # Post-application status page
│   │   └── policies/payout/      # Payout policy
│   ├── (admin)/admin/            # Admin route group
│   │   ├── layout.tsx            # Admin sidebar + role gate
│   │   ├── dashboard/            # Admin analytics dashboard
│   │   ├── seller-applications/  # Application review queue
│   │   ├── sellers/              # Seller management
│   │   ├── verifications/        # Verification queue
│   │   ├── listings/             # Listing moderation
│   │   └── disputes/             # Dispute management
│   ├── auth/                     # Authentication pages
│   │   ├── consumer/             # Consumer login (OTP + social)
│   │   ├── producer/             # Producer login
│   │   ├── admin/                # Admin login
│   │   └── callback/             # OAuth/email link callback handler
│   └── api/                      # API routes
│       ├── auth/                 # send-otp, user
│       ├── products/             # [id], create
│       ├── producers/            # register, register-comprehensive, me, update-profile, etc.
│       ├── batches/              # create, [id], [id]/products
│       ├── checkout/             # checkout, session, webhook
│       ├── admin/                # seller-applications, sellers, set-admin
│       ├── floral-sources/       # GET floral source options
│       ├── cloudinary/           # delete image
│       └── sendgrid/             # seller-registration email
│
├── components/
│   ├── shared/                   # Header, Footer, ProductCard, ProducerCard, ProvenanceDisplay
│   ├── ui/                       # shadcn/ui primitives (Button, Dialog, Input, Select, etc.)
│   ├── providers/                # Providers index, AuthProvider, PostHogProvider
│   ├── auth/                     # Auth-specific components
│   ├── marketing/                # Landing page components (Hero, TrustRow, CTA, FeaturedSection)
│   └── dev/                      # DevRoleSwitcher (dev-only role toggle)
│
├── lib/
│   ├── api/                      # Server-side data functions
│   │   ├── database.ts           # Core DB queries (products, producers, batches, profiles)
│   │   ├── orders.ts             # Order operations
│   │   ├── admin.ts              # Admin stats & operations
│   │   ├── batches.ts            # Batch helpers
│   │   ├── products.ts           # Product helpers (with mock fallback)
│   │   ├── producers.ts          # Producer helpers
│   │   ├── profile.ts            # Profile operations
│   │   ├── auth.ts               # Auth helpers
│   │   └── mock-data.ts          # Mock data for development
│   ├── stores/
│   │   ├── auth-store.ts         # Zustand auth state (user, producerProfile, logout)
│   │   └── cart-store.ts         # Zustand cart state (items, add/remove, totals)
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (with build-time mock)
│   │   ├── server.ts             # Server-side Supabase client (uses cookies)
│   │   └── admin.ts              # Admin client (bypasses RLS with service role key)
│   ├── stripe/
│   │   └── checkout-store.ts     # In-memory checkout session store (nonce, snapshots)
│   ├── auth/
│   │   └── disposable-email.ts   # Blocks 55 known disposable email domains
│   ├── sendgrid/
│   │   └── email.ts              # Email templates (registration, verification, status updates)
│   ├── cloudinary/
│   │   └── upload.ts             # Image upload/delete (unsigned, client-side via REST)
│   ├── config/
│   │   └── commission.ts         # Commission rate (8%) + calculation functions
│   ├── constants/
│   │   └── images.ts             # Default image URL helpers
│   └── utils.ts                  # cn() classname merge utility
│
├── hooks/
│   └── useAuth.ts                # Auth hook (OTP send/verify, social sign-in, cooldowns)
│
├── types/
│   └── index.ts                  # All TypeScript interfaces and type unions
│
├── migrations/                   # 16 SQL migration files (see Migrations section)
├── scripts/                      # Utility scripts (Cloudinary bulk upload)
├── public/                       # Static assets (icons, manifest.json)
│
├── proxy.ts                      # Next.js middleware (route protection, role checks)
├── supabase-schema.sql           # Full database schema (run in Supabase SQL Editor)
├── PROJECT_OVERVIEW.md           # Business overview / pitch document
├── Dockerfile                    # Docker build (Node 22.14.0-alpine)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── components.json               # shadcn/ui config (new-york style, RSC, neutral base)
```

---

## 5. Database Schema

Run `supabase-schema.sql` in the Supabase SQL Editor to create all tables. Then run migrations in order.

### Tables

#### profiles
Extends Supabase `auth.users`. Auto-created by trigger on signup.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | FK to auth.users |
| email | TEXT | NOT NULL |
| phone | TEXT | |
| role | TEXT | 'consumer' (default), 'producer', 'admin' |
| status | TEXT | 'active' (default), 'suspended', 'banned' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### producers
Seller profiles. Created during registration. Massively extended by migration #2 with ~60 additional columns.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | FK to profiles, ON DELETE CASCADE |
| business_name | TEXT | NOT NULL |
| abn | TEXT | Australian Business Number |
| street, suburb, state, postcode | TEXT | Business address |
| country | TEXT | Default 'Australia' |
| bio | TEXT | |
| profile_image | TEXT | Cloudinary URL |
| cover_image | TEXT | Cloudinary URL |
| verification_status | TEXT | pending / submitted / under_review / approved / rejected |
| badge_level | TEXT | none / verified / premium |
| application_status | TEXT | Added by migration: draft / pending_review / changes_requested / approved / rejected / suspended |
| created_at, updated_at | TIMESTAMPTZ | |

**Extended fields (from migration #2):** full_legal_name, seller_type, trading_name, website, social_profile, phone_number, secondary contact fields, shipping address fields, beekeeper_registration_number, registering_authority, registration_proof_url, apiary_photo_url, number_of_hives, harvest_regions, typical_harvest_months, extraction_method, certifications, food_safety_compliant, food_handling_registration_number, local_council_authority, bank_account_name/bsb/account_number, gst_registered, gst_included_in_pricing, and 4 declaration boolean fields.

#### batches
Harvest batch traceability. Links producers to products.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| producer_id | UUID | FK to producers, ON DELETE CASCADE |
| region | TEXT | NOT NULL |
| harvest_date | DATE | NOT NULL |
| extraction_date | DATE | NOT NULL |
| floral_source_tags | TEXT[] | Array of floral source names |
| notes | TEXT | |
| status | TEXT | draft / active / archived |
| created_at, updated_at | TIMESTAMPTZ | |

#### products

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| producer_id | UUID | FK to producers, ON DELETE CASCADE |
| batch_id | UUID | FK to batches, ON DELETE SET NULL |
| title | TEXT | NOT NULL |
| description | TEXT | |
| photos | TEXT[] | Array of Cloudinary URLs |
| status | TEXT | draft / pending_approval / approved / rejected / archived |
| created_at, updated_at | TIMESTAMPTZ | |

#### product_variants

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| product_id | UUID | FK to products, ON DELETE CASCADE |
| size | TEXT | e.g., "250g", "500g" |
| price | DECIMAL(10,2) | In AUD |
| stock | INTEGER | Default 0 |
| weight | DECIMAL(8,2) | In grams |
| barcode | TEXT | Optional |
| created_at, updated_at | TIMESTAMPTZ | |

#### orders

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| buyer_id | UUID | FK to profiles |
| seller_id | UUID | FK to profiles |
| subtotal, shipping_cost, platform_fee, gst_total, total | DECIMAL(10,2) | |
| status | TEXT | pending / confirmed / processing / packed / shipped / delivered / cancelled / refunded |
| shipping_street, shipping_suburb, shipping_state, shipping_postcode, shipping_country | TEXT | |
| tracking_number, carrier | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

#### order_items
Snapshots batch data at time of order for permanent traceability.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| order_id | UUID | FK to orders, ON DELETE CASCADE |
| variant_id | UUID | FK to product_variants |
| product_id | UUID | FK to products |
| product_title | TEXT | Snapshot |
| variant_size | TEXT | Snapshot |
| quantity | INTEGER | |
| unit_price | DECIMAL(10,2) | |
| gst | DECIMAL(10,2) | |
| batch_id | UUID | FK to batches |
| batch_region | TEXT | Snapshot |
| batch_harvest_date | DATE | Snapshot |
| batch_floral_sources | TEXT[] | Snapshot |

#### Other Tables

- **reviews** — Rating (1-5), comment, linked to order/buyer/seller/product
- **seller_declarations** — 8 boolean declarations, terms acceptance, IP/user-agent tracking (migration #1)
- **floral_sources** — 33 seeded honey types with scientific names and regional data (migration #2)
- **producer_floral_sources** — Many-to-many junction with optional custom sources (migration #2)
- **producer_application_log** — Audit trail for application status changes (migration #2)
- **verification_submissions** — Admin review records for producer verification
- **verification_documents** — Uploaded docs (business_registration, abn_certificate, food_safety, beekeeper_registration, other)
- **support_tickets** — Dispute/support system (open/in_progress/resolved/closed)
- **ticket_messages** — Messages within tickets, with sender role
- **audit_logs** — Platform-wide action log (actor, entity, action, before/after JSONB)

### Row-Level Security (RLS)

RLS is enabled on **all tables**. Key policies:

| Table | Policy | Rule |
|-------|--------|------|
| profiles | View/update own | `auth.uid() = id` |
| profiles | Admins view all | Uses `is_admin()` security definer function |
| producers | Create own | `auth.uid() = user_id` |
| producers | View own + approved | Own OR `verification_status = 'approved'` |
| producers | Admins view/update all | Admin role check |
| products | Public view approved | `status = 'approved'` |
| products | Create/manage own | Via producer ownership chain |
| product_variants | Public view (approved products) | Via product status check |
| batches | Create/view/delete own | Via producer ownership |
| batches | Public view (approved producers) | Via producer verification status |
| orders | View own | `buyer_id` OR `seller_id` matches `auth.uid()` |
| reviews | Public view | `true` |
| support_tickets | CRUD own + admin all | User ownership OR admin role |

**Note:** The admin client (service role key) bypasses all RLS policies.

---

## 6. Migrations

Run these in order after the base schema. Located in `migrations/`.

| # | File | What it does |
|---|------|--------------|
| 1 | `20260211000001_add_seller_declarations.sql` | Creates `seller_declarations` table (8 boolean declarations, terms acceptance, IP/UA tracking) |
| 2 | `20260211000002_add_seller_onboarding_fields.sql` | Creates `floral_sources` (33 types), `producer_floral_sources`, `producer_application_log`. Adds ~60 columns to `producers` (identity, contacts, beekeeper info, food safety, banking, application_status) |
| 3 | `20260211000003_allow_null_floral_source_id.sql` | Allows NULL `floral_source_id` in junction table for custom "other" sources |
| 4 | `20260215000004_add_profile_insert_policy.sql` | Adds RLS INSERT policy on profiles (self-create backup for trigger failures) |
| 5 | `20260215000005_add_admin_producers_policy.sql` | Adds admin SELECT/UPDATE policies on producers |
| 6 | `20260215000006_add_admin_profiles_policy.sql` | Adds admin SELECT policy on profiles |
| 7 | `20260215000007_fix_admin_profiles_policy_recursion.sql` | Fixes infinite recursion with `is_admin()` security definer function |
| 8 | `20260215000008_fix_approved_producers_role.sql` | Sets role to 'producer' for users with approved applications |
| 9 | `20260215000009_fix_missing_application_status.sql` | Backfills `application_status` from `verification_status` |
| 10 | `20260215000010_set_admin_user.sql` | Sets specific emails as admin users |
| 11 | `20260216000011_fix_admin_role.sql` | Ensures admin emails have correct role |
| 12 | `20260218000012_add_batches_delete_policy.sql` | Adds batch DELETE RLS policy + performance indexes |
| 13 | `20260218000013_add_admin_adarshathegreat653.sql` | Template for adding admin users by email |
| 14 | `20260218000014_fix_profile_creation_trigger.sql` | Disables auto profile creation in trigger (moved to app code) |
| 15 | `20260218000015_set_all_producers_verified_badge.sql` | Sets all producers to `badge_level = 'verified'` |
| 16 | `20260218000016_set_producer_adhikari.sql` | Template for setting specific users as producers |

---

## 7. Authentication

### Method
Email OTP (8-digit code) + OAuth (Google, Facebook) via Supabase Auth.

### Flow

```
1. User enters email on /auth/consumer (or /auth/producer, /auth/admin)
2. POST /api/auth/send-otp → Supabase signInWithOtp()
3. User enters 8-digit OTP code
4. Client calls supabase.auth.verifyOtp()
5. On success → session created → AuthProvider picks up state change
6. AuthProvider calls GET /api/auth/user → fetches profile with latest role
7. User state stored in Zustand auth-store → persisted to localStorage
```

### Social Login
- Calls `supabase.auth.signInWithOAuth({ provider: 'google' | 'facebook' })`
- Redirect URL: `/auth/callback`
- Callback handler: `app/auth/callback/route.ts` exchanges code for session

### Auth Callback (`/auth/callback`)
- Handles OAuth code exchange
- Handles email link verification (token_hash + type)
- Ensures profile exists in `profiles` table
- Redirects based on context or defaults to `/`

### Key Auth Files
- `hooks/useAuth.ts` — Hook with OTP send/verify, social sign-in, 60s cooldown (5min on rate limit)
- `lib/supabase/client.ts` — Browser client (includes build-time mock)
- `lib/supabase/server.ts` — Server client (uses Next.js cookies)
- `lib/supabase/admin.ts` — Admin client (service role, bypasses RLS)
- `lib/auth/disposable-email.ts` — Blocks 55 disposable email domains
- `components/providers/auth-provider.tsx` — Initializes auth state, listens to `onAuthStateChange`, refreshes on window focus

### Supabase Client Types

| Client | File | When to use |
|--------|------|-------------|
| Browser | `lib/supabase/client.ts` | Client components, `useAuth` hook |
| Server | `lib/supabase/server.ts` | API routes, server components (respects RLS) |
| Admin | `lib/supabase/admin.ts` | Privileged server ops (bypasses RLS). Returns `null` if key missing. |

---

## 8. API Routes

All routes are in `app/api/`.

### Authentication

| Method | Route | Description | Client |
|--------|-------|-------------|--------|
| POST | `/api/auth/send-otp` | Send OTP to email/phone. Validates disposable emails. 60s cooldown. | Server |
| GET | `/api/auth/user` | Get current user profile. Creates profile if missing. Returns latest role. | Server + Admin fallback |

### Products

| Method | Route | Description | Client |
|--------|-------|-------------|--------|
| GET | `/api/products/[id]` | Get product with producer, batch, and variants | Server |
| POST | `/api/products/create` | Create product with variants. Auto-generates size from weight. Status set to 'approved'. | Server |
| PATCH | `/api/products/[id]` | Update product. Replaces all variants. Ownership check. | Server |
| DELETE | `/api/products/[id]` | Delete product and variants. Ownership check. | Server + Admin |

### Producers

| Method | Route | Description | Client |
|--------|-------|-------------|--------|
| POST | `/api/producers/register` | Basic registration (businessName, ABN, address, bio, 8 declarations, terms). Emails admins. | Server |
| POST | `/api/producers/register-comprehensive` | Full onboarding (sections A-H: identity, contact, beekeeper info, production, food safety, banking). Links floral sources. Creates audit log. | Server |
| GET | `/api/producers/me` | Get current user's producer profile. Auto-creates for admins. | Server |
| GET | `/api/producers/[id]/products` | Get producer's products | Server |
| PATCH | `/api/producers/update-profile` | Update producer info (bio, images, contact, address). Ownership check. | Server |
| POST | `/api/producers/update-application` | Resubmit rejected application with updated fields | Server |
| GET | `/api/producers/my-application` | Get full application with floral sources and audit log | Server |
| GET | `/api/producers/application-status` | Get application status, latest admin notes, changed fields | Server |

### Batches

| Method | Route | Description | Client |
|--------|-------|-------------|--------|
| GET | `/api/batches` | Get all batches for current user's producers | Server |
| POST | `/api/batches/create` | Create batch (region, dates, floralSourceTags[], notes). Auto-creates producer if needed. | Server |
| GET | `/api/batches/[id]` | Get single batch. Authorization check. | Server + Admin |
| PATCH | `/api/batches/[id]` | Update batch fields. Ownership check. | Server |
| DELETE | `/api/batches/[id]` | Delete batch (only if no products use it). | Server + Admin |
| GET | `/api/batches/[id]/products` | Get all products linked to batch | Server |
| PATCH | `/api/batches/[id]/products` | Unlink products from batch (set batch_id = null) | Server + Admin |

### Checkout & Orders

| Method | Route | Description | Client |
|--------|-------|-------------|--------|
| POST | `/api/checkout` | Create Stripe checkout session. Validates address (Australian states, 4-digit postcode). Sets nonce cookies (2h TTL). Returns Stripe redirect URL. | Server |
| GET | `/api/checkout/session` | Verify Stripe session status. Checks nonce. Returns payment status. Clears cookies on success. | Server |
| POST | `/api/checkout/webhook` | Stripe webhook handler for session completion events. | Server |

### Admin

| Method | Route | Description | Client |
|--------|-------|-------------|--------|
| GET | `/api/admin/seller-applications` | Get all pending applications (pending_review, changes_requested) | Server |
| GET | `/api/admin/seller-applications/[id]` | Get single application with floral sources and audit log | Server |
| PATCH | `/api/admin/seller-applications/[id]` | Approve/reject application. Updates profile role. Creates audit log. Sends email. | Server + Admin |
| GET | `/api/admin/sellers` | Get all approved sellers | Server + Admin |
| PATCH | `/api/admin/sellers/[id]` | Suspend/ban/remove/reactivate seller. Remove = CASCADE delete all data. Sends email. | Server + Admin |
| POST | `/api/admin/set-admin` | Grant admin role to a user | Server + Admin |

### Utilities

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/cloudinary/delete` | Delete image from Cloudinary by public ID |
| POST | `/api/sendgrid/seller-registration` | Send seller registration notification email to admins |
| GET | `/api/floral-sources` | Get all floral source options from DB |

---

## 9. Server-Side Data Functions

Located in `lib/api/`.

### database.ts (Core queries)

```typescript
getUserProfile(userId: string): Promise<User | null>
getProducers(page?, pageSize?): Promise<PaginatedResponse<ProducerProfile>>
getProducer(id: string): Promise<ProducerProfile | null>
getProducerByUserId(userId: string): Promise<ProducerProfile | null>
getFeaturedProducers(): Promise<ProducerProfile[]>
createProducer(data): Promise<ProducerProfile>
getBatch(id: string): Promise<Batch | null>
getBatchesByProducer(producerId: string): Promise<Batch[]>
createBatch(data): Promise<Batch>
getProducts(filters?, page?, pageSize?): Promise<PaginatedResponse<ProductWithDetails>>
getProduct(id: string): Promise<ProductWithDetails | null>
getFeaturedProducts(): Promise<ProductWithDetails[]>
getProductsByProducer(producerId, includeAllStatuses?): Promise<Product[]>
searchProducts(query: string): Promise<ProductWithDetails[]>
createProduct(data): Promise<Product>
saveSellerDeclarations(data): Promise<void>
```

### orders.ts
Order CRUD, status updates, seller stats.

### admin.ts
`getAdminStats()` — Returns GMV (30 days), total orders, AOV, repeat buyer rate, producer counts, listing counts.

### products.ts / producers.ts / batches.ts / profile.ts / auth.ts
Domain-specific helpers that wrap database.ts or make direct Supabase calls.

### mock-data.ts
Mock products/producers for development when Supabase is unavailable.

---

## 10. State Management

### Auth Store (`lib/stores/auth-store.ts`)

```typescript
// Zustand store, persisted to localStorage key: "hive-joy-auth"
interface AuthState {
  user: User | null
  producerProfile: ProducerProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser(user: User | null): void
  setProducerProfile(profile: ProducerProfile | null): void
  setLoading(loading: boolean): void
  logout(): void           // Signs out from Supabase, clears state
  devSetRole(role: UserRole): void  // Dev helper for testing
}
```

### Cart Store (`lib/stores/cart-store.ts`)

```typescript
// Zustand store, persisted to localStorage key: "hive-joy-cart"
interface CartState {
  items: CartItem[]
  hasHydrated: boolean

  addItem(product: Product, variant: ProductVariant, quantity: number): void
  removeItem(variantId: string): void
  updateQuantity(variantId: string, quantity: number): void
  clearCart(): void

  // Computed
  getItemCount(): number
  getSubtotal(): number
  getCartBySeller(): Map<string, CartItem[]>  // Groups items by seller
}
```

### Checkout Store (`lib/stripe/checkout-store.ts`)

```typescript
// In-memory server-side store (NOT persisted — TODO: migrate to database)
// Stores checkout session snapshots with 2-hour TTL
registerCheckout(sessionId: string, snapshot: CheckoutSnapshot): void
getCheckoutSnapshot(sessionId: string): CheckoutSnapshot | undefined
markSessionVerified(sessionId: string): void
isSessionVerified(sessionId: string): boolean
clearCheckout(sessionId: string): void
```

---

## 11. Pages & Routes

### Consumer Routes (`(consumer)`)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, featured products (2-col grid), featured producers (3-col grid), trust row, CTA |
| `/products` | Browse | Product grid with filters (search, region, floral source, price range, sort). Pagination. Desktop sidebar + mobile sheet. |
| `/products/[id]` | Product Detail | Gallery (7-col) + buy box (5-col, sticky). Provenance display. Producer card. Add to cart. |
| `/producers` | Browse Producers | Producer card grid |
| `/producers/[id]` | Producer Profile | Producer details + their products |
| `/cart` | Shopping Cart | Item list with qty controls. Order summary (subtotal + $12 flat shipping). |
| `/checkout` | Checkout | 2-step: (1) Contact + shipping address, (2) Review + submit. Australian states only, 4-digit postcode. Redirects to Stripe. |
| `/orders` | Order History | Past orders list |
| `/about` | About | Brand info |
| `/our-story` | Story | Company narrative |
| `/policies/terms` | Terms | Terms & conditions |
| `/policies/refund-returns` | Refund | Refund/return policy |

### Seller Routes (`(seller)/seller`)

Layout includes verification gates — non-verified producers see registration prompts, suspended users see status messages.

| Route | Page | Description |
|-------|------|-------------|
| `/seller/dashboard` | Dashboard | Stats (revenue, orders, pending, active batches). Getting Started steps. Quick action buttons. |
| `/seller/batches` | Batch List | All batches for the seller |
| `/seller/batches/new` | Create Batch | Form: region, harvest/extraction dates, floral sources (multi-select), notes |
| `/seller/batches/[id]` | Edit Batch | Edit existing batch |
| `/seller/listings` | Listings | All product listings |
| `/seller/listings/new` | Create Listing | Form: title, description, photos (max 5, Cloudinary upload), batch selector, price/stock/weight |
| `/seller/listings/[id]` | Edit Listing | Edit existing product |
| `/seller/orders` | Orders | Incoming orders management |
| `/seller/profile` | Profile | Edit business info |
| `/seller/register-new` | Registration | Seller registration form |
| `/seller/apply` | Apply | Entry point for becoming a seller |
| `/seller/application-sent` | Status | Post-application confirmation |
| `/seller/policies/payout` | Payout Policy | Seller payout information |

### Admin Routes (`(admin)/admin`)

Layout restricted to admin role only.

| Route | Page | Description |
|-------|------|-------------|
| `/admin/dashboard` | Dashboard | GMV (30d), total orders, AOV, repeat buyers, producer counts, listing counts. Quick action cards. |
| `/admin/seller-applications` | Applications | Queue of pending applications. Status badges. Review links. |
| `/admin/seller-applications/[id]` | Review App | Full application detail. Approve/reject with notes. |
| `/admin/sellers` | Sellers | All verified sellers list |
| `/admin/sellers/[id]` | Manage Seller | Suspend/ban/remove/reactivate |
| `/admin/verifications` | Verifications | Document verification queue |
| `/admin/verifications/[id]` | Review | Verify individual documents |
| `/admin/listings` | Listings | Product moderation queue |
| `/admin/disputes` | Disputes | Customer dispute management |

### Auth Routes

| Route | Description |
|-------|-------------|
| `/auth` | Redirects to `/auth/consumer` |
| `/auth/consumer` | Consumer login (email OTP + Google/Facebook) |
| `/auth/producer` | Producer login |
| `/auth/admin` | Admin login (with dev role switcher) |
| `/auth/callback` | OAuth/email link callback handler |

---

## 12. Key Components

### Shared Components (`components/shared/`)

- **Header** — Sticky with backdrop blur. Logo, desktop nav (Browse Honey, Our Producers, role-based links), search, cart icon with badge, user dropdown (email, role, My Orders, dashboards, Sign Out), mobile menu sheet.
- **Footer** — 4-column grid: logo/tagline, shop links, producer links, support links. Copyright + policy links.
- **ProductCard** — Image, title, producer name, region, price ("from" if multiple variants), verified/premium badge.
- **ProducerCard** — Cover image, overlapping avatar, business name, state, bio, verification badge.
- **ProvenanceDisplay** — Batch traceability info (region, harvest date, floral sources).

### Providers (`components/providers/`)

- **Providers (index.tsx)** — Wraps app: `PostHogProvider > AuthProvider > AuthErrorRedirect + DevRoleSwitcher`
- **AuthProvider** — Maps Supabase user to app User type. Fetches role from `/api/auth/user`. Listens to `onAuthStateChange`. Refreshes on window focus.
- **PostHogProvider** — Initializes PostHog. Identifies user (id, role, status). Captures page views. Resets on logout.

### Dev Components (`components/dev/`)

- **DevRoleSwitcher** — Bottom-right floating button to switch between consumer/producer/admin roles during development.

### UI Components (`components/ui/`)

19+ shadcn/ui components built on Radix UI: Button, Input, Label, Textarea, Card, Dialog, Sheet, Select, Checkbox, AlertDialog, Avatar, Progress, Tabs, Separator, DropdownMenu, and more.

---

## 13. User Flows

### Consumer Purchase Flow

```
1. Browse homepage (/) → see featured products and producers
2. Browse products (/products) → filter by region, floral source, price
3. View product detail (/products/[id]) → see provenance, producer info
4. Add to cart → cart icon badge updates
5. View cart (/cart) → adjust quantities, see subtotal + $12 shipping
6. Checkout (/checkout) → Step 1: enter email, phone, shipping address
7. Review order → Step 2: confirm details
8. Submit → POST /api/checkout → redirect to Stripe
9. Pay on Stripe → redirect back
10. Order confirmation → email sent via SendGrid
11. View orders (/orders) → track status
```

### Producer Onboarding Flow

```
1. Sign in at /auth/producer (OTP or social)
2. Navigate to /seller → layout detects non-producer, shows registration prompt
3. Go to /seller/apply or /seller/register-new
4. Complete registration form:
   - Business info (name, ABN, address)
   - Beekeeper details (registration number, authority)
   - Production info (hives, regions, floral sources, extraction method)
   - Food safety compliance
   - Banking details
   - 8 mandatory declarations (all must be true)
   - Terms acceptance (IP + user agent logged)
5. Submit → POST /api/producers/register-comprehensive
6. Admin receives email notification
7. Redirected to /seller/application-sent → awaits approval
8. Admin reviews at /admin/seller-applications/[id] → approves
9. Producer receives approval email
10. Profile role updated to 'producer', badge_level = 'verified'
11. Full seller dashboard access unlocked
12. Create batches (/seller/batches/new) → record harvest data
13. Create listings (/seller/listings/new) → link to batch, upload photos, set pricing
14. Products go live (auto-approved on creation)
```

### Admin Moderation Flow

```
1. Sign in at /auth/admin
2. Dashboard (/admin/dashboard) → overview of GMV, orders, producers, listings
3. Review seller applications (/admin/seller-applications)
   → View details → Approve (sets role to producer) or Reject (with notes)
   → Email sent to seller automatically
4. Manage sellers (/admin/sellers)
   → Suspend, ban, or remove sellers
   → Remove = CASCADE delete all producer data
5. Moderate listings (/admin/listings) → approve/reject products
6. Handle disputes (/admin/disputes)
```

---

## 14. Third-Party Integrations

### Supabase
- **Auth**: Email OTP, phone OTP, OAuth (Google, Facebook)
- **Database**: PostgreSQL with Row-Level Security
- **3 clients**: Browser (RLS), Server (RLS + cookies), Admin (bypasses RLS)
- **Auto profile creation**: Trigger on `auth.users` INSERT (disabled in migration #14, now handled in app code)

### Stripe
- **Checkout Sessions**: Created via `POST /api/checkout`. Supports card, Afterpay/Clearpay.
- **Webhook**: `POST /api/checkout/webhook` handles `checkout.session.completed` events.
- **Nonce verification**: `client_reference_id` contains nonce. Cookies (`checkout_nonce`, `checkout_session`) set with 2h TTL.
- **In-memory store**: `lib/stripe/checkout-store.ts` holds session snapshots. TODO: migrate to database.

### SendGrid
- **4 email templates** in `lib/sendgrid/email.ts`:
  1. `sendSellerRegistrationEmail()` — New seller notification to admins
  2. `sendVerificationRequestEmail()` — Verification submission notification
  3. `sendApplicationStatusUpdateEmail()` — Approval/rejection notification to seller
  4. `sendSellerStatusChangeEmail()` — Suspension/ban notification to seller
- All emails have HTML + plain text versions
- HTML is XSS-protected via `escapeHtml()`
- Recipient resolution: explicit emails → `SENDGRID_ADMIN_EMAILS` → `SENDGRID_AGENT_EMAIL`

### Cloudinary
- **Client-side uploads** via unsigned preset (REST API)
- `lib/cloudinary/upload.ts`: `uploadImage()`, `uploadImages()`, `deleteImage()`
- Folder structure: `hivejoy/products`, `hivejoy/producers`, `hivejoy/verification`, `hivejoy/batches`
- Server-side delete via `POST /api/cloudinary/delete`
- Max 5 photos per product

### PostHog
- Initialized in `PostHogProvider`
- Identifies user with id, role, status
- Captures page views with current URL
- Resets identity on logout
- Config: `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`

---

## 15. Commission & Business Logic

File: `lib/config/commission.ts`

```typescript
COMMISSION_CONFIG.LAUNCH_RATE = 8  // 8% per completed sale

calculateCommission(saleTotal: number, rate?: number): number
// Returns commission amount (rounded to 2 decimal places)

calculateSellerPayout(saleTotal: number, rate?: number): number
// Returns saleTotal - commission

getCommissionRate(): number
// Returns current rate (8)
```

### Shipping
- Flat rate: **$12 AUD** (hardcoded in cart page)
- Australian addresses only (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
- Postcode: 4-digit validation

---

## 16. Type Definitions

File: `types/index.ts`

### Status Enums

```typescript
type UserRole = 'consumer' | 'producer' | 'admin'
type VerificationStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected'
type BatchStatus = 'draft' | 'active' | 'archived'
type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived'
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
```

### Core Interfaces

```typescript
interface User {
  id: string; email: string; phone?: string;
  role: UserRole; status: 'active' | 'suspended' | 'banned';
  createdAt: string; updatedAt: string;
}

interface ProducerProfile {
  id: string; userId: string; businessName: string; abn?: string;
  address: Address; bio: string; profileImage?: string; coverImage?: string;
  verificationStatus: VerificationStatus; badgeLevel: 'none' | 'verified' | 'premium';
  createdAt: string; updatedAt: string;
}

interface Address {
  street: string; suburb: string; state: string; postcode: string; country: string;
}

interface Batch {
  id: string; producerId: string; region: string;
  harvestDate: string; extractionDate: string;
  floralSourceTags: string[]; notes?: string;
  status: BatchStatus; createdAt: string; updatedAt: string;
}

interface Product {
  id: string; producerId: string; batchId: string;
  title: string; description: string; photos: string[];
  status: ProductStatus; variants: ProductVariant[];
  createdAt: string; updatedAt: string;
}

interface ProductVariant {
  id: string; productId: string; size: string;
  price: number; stock: number; weight: number; barcode?: string;
}

interface ProductWithDetails extends Product {
  producer: ProducerProfile | null;
  batch: Batch | null;
}

interface Order {
  id: string; buyerId: string; sellerId: string;
  items: OrderItem[]; subtotal: number; shippingCost: number;
  platformFee: number; gstTotal: number; total: number;
  status: OrderStatus; shippingAddress: Address;
  trackingNumber?: string; carrier?: string;
  createdAt: string; updatedAt: string;
}

interface OrderItem {
  id: string; orderId: string; variantId: string; productId: string;
  productTitle: string; variantSize: string; quantity: number;
  unitPrice: number; gst: number;
  batchSnapshot: { batchId: string; region: string; harvestDate: string; floralSources: string[] };
}

interface CartItem {
  variantId: string; productId: string; quantity: number;
  product: Product; variant: ProductVariant;
}

interface Review {
  id: string; orderId: string; buyerId: string; sellerId: string;
  productId: string; rating: number; comment: string; createdAt: string;
}

interface SupportTicket {
  id: string; orderId?: string; userId: string; reason: string;
  status: TicketStatus; messages: TicketMessage[];
  createdAt: string; updatedAt: string;
}

interface TicketMessage {
  id: string; ticketId: string; senderId: string;
  senderRole: UserRole; content: string; createdAt: string;
}

interface AuditLog {
  id: string; actorId: string; actorRole: UserRole;
  entityType: string; entityId: string; action: string;
  before?: Record<string, unknown>; after?: Record<string, unknown>;
  timestamp: string;
}
```

### API Types

```typescript
interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; pageSize: number; totalPages: number;
}

interface ApiError {
  code: string; message: string; details?: Record<string, string>;
}

interface ProductFilters {
  search?: string; region?: string; floralSource?: string;
  minPrice?: number; maxPrice?: number; producerId?: string; verified?: boolean;
}

interface OrderFilters {
  status?: OrderStatus; dateFrom?: string; dateTo?: string;
}
```

---

## 17. Middleware & Route Protection

File: `proxy.ts` (Next.js middleware)

### Public Routes (no auth required)

```
/                    /auth/*              /api/*
/products/*          /producers/*         /policies/*
/about/*             /our-story/*
```

### Protected Routes (auth required)

```
/seller/*     → requires 'producer' role (except /seller/register, /seller/apply)
/admin/*      → requires 'admin' role
/profile/*    → requires authentication
/orders/*     → requires authentication
/cart/*       → requires authentication
```

### Middleware Logic

```
1. Redirect /auth → /auth/consumer
2. Skip protection for public paths
3. For protected paths:
   a. Get Supabase user via supabase.auth.getUser()
   b. If no user → redirect to appropriate login page
   c. If user → fetch profile via getUserProfile()
   d. Check if user has required role
   e. Allow access or redirect to / with error
```

### Matcher Config
Matches all paths except static files: `_next/static`, `_next/image`, `favicon.ico`, image extensions.

---

## 18. Build & Deployment

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start dev server (with Turbopack) |
| `build` | `next build` | Production build (lint runs as prebuild) |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |
| `check` | `npm run lint && npm run build` | Full lint + build check |
| `prebuild` | `npm run lint` | Auto-runs before build |

### Dockerfile

```dockerfile
FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Requirements
- **Node.js 22.x** (enforced by `engines` in package.json)
- All environment variables in `.env.local` must be set
- Supabase project with schema + migrations applied
- Stripe account with webhook endpoint configured
- SendGrid account with verified sender
- Cloudinary account with unsigned upload preset

### Next.js Config (`next.config.ts`)

```typescript
{
  turbopack: {},
  serverExternalPackages: ['@sendgrid/mail', '@sendgrid/helpers'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
}
```

### Other Config Files

- **tsconfig.json** — Target ES2017, strict mode, `@/*` path alias to project root
- **postcss.config.mjs** — Uses `@tailwindcss/postcss` plugin
- **eslint.config.mjs** — Extends `next/core-web-vitals` + `next/typescript`
- **components.json** — shadcn/ui: new-york style, RSC mode, neutral base color, lucide icons

---

## 19. Development Tips

### Running Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in all values in .env.local

# Set up database
# 1. Create Supabase project
# 2. Run supabase-schema.sql in SQL Editor
# 3. Run each migration file in order

# Start dev server
npm run dev
```

### Dev Role Switcher
A floating button appears in the bottom-right corner that lets you switch between consumer/producer/admin roles without logging out. This is rendered by `DevRoleSwitcher` in the providers.

### Mock Data
`lib/api/mock-data.ts` provides fallback data when Supabase is unavailable. The browser Supabase client returns a mock client during build time to prevent build failures.

### Key Patterns

1. **Build-time safety**: Both browser and server Supabase clients return mock clients when env vars are missing (prevents build failures)
2. **Admin client returns null**: Always check `createAdminClient()` return value for null
3. **Products auto-approved**: Products are set to `status: 'approved'` on creation (no admin approval step currently)
4. **Profile creation**: Trigger is disabled (migration #14). Profiles are created in app code via `/api/auth/user` endpoint
5. **Checkout nonce**: Stripe sessions use a nonce in `client_reference_id` + cookies for CSRF protection
6. **Seller layout gates**: The seller layout (`(seller)/seller/layout.tsx`) handles all verification states — pending, changes_requested, rejected, suspended, banned — with appropriate UI for each

### Color Theme
- Primary: `#D97706` (amber-600)
- Fonts: Geist Sans + Geist Mono
- shadcn/ui base: neutral

### Useful Commands

```bash
npm run check    # Full lint + build verification
npm run lint     # ESLint only
npm run build    # Production build
npm run dev      # Dev server
```
