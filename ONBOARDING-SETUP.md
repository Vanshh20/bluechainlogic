# Bluechainlogic Onboarding System — Setup Guide

## Architecture

```
You (/admin page) → Generate link → Supabase stores token → Gmail sends email
Client clicks link → Next.js checks Supabase → Shows onboarding portal
Client submits → Next.js writes to Supabase → Gmail notifies you
```

No external tools. Everything runs inside your Next.js project + Supabase.

---

## 1. Supabase Setup

### Create a project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `bluechainlogic` (or anything)
3. Choose a strong database password
4. Region: EU West (closest to NL)

### Create the table
Go to **SQL Editor** and run:

```sql
CREATE TABLE onboarding_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  timeline TEXT,
  senders TEXT,
  photos TEXT,
  company_name TEXT,
  company_website TEXT,
  elevator_pitch TEXT,
  icp TEXT,
  crm_used TEXT,
  calendar_link TEXT,
  additional_notes TEXT,
  email_accounts INTEGER,
  vayne_email TEXT,
  vayne_password TEXT,
  anymailfinder_email TEXT,
  anymailfinder_password TEXT
);

-- Index for fast token lookups
CREATE INDEX idx_onboarding_token ON onboarding_clients (token);
```

### Migration (if table already exists)
Run this to add the new columns:

```sql
ALTER TABLE onboarding_clients
  ADD COLUMN IF NOT EXISTS email_accounts INTEGER,
  ADD COLUMN IF NOT EXISTS vayne_email TEXT,
  ADD COLUMN IF NOT EXISTS vayne_password TEXT,
  ADD COLUMN IF NOT EXISTS anymailfinder_email TEXT,
  ADD COLUMN IF NOT EXISTS anymailfinder_password TEXT;
```

### Get your keys
Go to **Settings → API**:
- Copy **Project URL** → this is `SUPABASE_URL`
- Copy **service_role key** (NOT the anon key) → this is `SUPABASE_SERVICE_KEY`

> ⚠️ The service_role key bypasses Row Level Security. Only use it server-side (which is what we do — API routes only).

---

## 2. Gmail App Password

You need a Gmail App Password so your Next.js app can send emails:

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is ON (required)
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. App name: `Bluechainlogic`
5. Click **Create** → copy the 16-character password (e.g. `abcd efgh ijkl mnop`)
6. Remove the spaces → `abcdefghijklmnop`

This is your `GMAIL_APP_PASSWORD`.

---

## 3. Vercel Environment Variables

Go to **Vercel → Your Project → Settings → Environment Variables** and add:

| Variable | Value | Example |
|----------|-------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your service_role key | `eyJhbGc...` |
| `GMAIL_USER` | Your Gmail address | `noah@bluechainlogic.com` |
| `GMAIL_APP_PASSWORD` | The 16-char app password | `abcdefghijklmnop` |
| `ADMIN_PASSWORD` | Any strong password for /admin | `MyStr0ngP@ss!` |

After adding all 5, click **Redeploy** (Deployments → latest → Redeploy).

---

## 4. Install Dependencies

Add these to your project before deploying:

```bash
npm install @supabase/supabase-js nodemailer
```

Or update package.json dependencies:

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "nodemailer": "^6.9.0"
}
```

---

## 5. File Structure

```
app/
├── page.js                              ← Landing page
├── admin/
│   └── page.js                          ← Password-protected admin dashboard
├── api/
│   ├── validate-token/route.js          ← Token check (Supabase query)
│   ├── submit-onboarding/route.js       ← Save form data to Supabase
│   └── admin/
│       ├── generate-link/route.js       ← Create token + send email
│       ├── submissions/route.js         ← List all clients
│       └── resend-link/route.js         ← Regenerate expired link
├── lib/
│   ├── supabase.js                      ← Supabase client
│   ├── gmail.js                         ← Email sending (nodemailer)
│   └── auth.js                          ← Admin password check
└── onboard/
    └── [token]/
        ├── page.js                      ← Server component (extracts URL token)
        └── OnboardingPortal.js          ← Client component (form + security gates)
```

---

## 6. How To Use

### Send a new onboarding link:
1. Go to `bluechainlogic.com/admin`
2. Enter your admin password
3. Type client name + email → click **Generate & Send**
4. Client receives an email with their unique link
5. Link is also shown in the dashboard if you need to copy it manually

### Monitor progress:
- The admin dashboard shows all clients, their status, and when they were created/submitted
- Click any row to expand and see full submission details
- Status colors: 🟡 Pending → 🔵 In Progress → 🟢 Completed → 🔴 Expired

### Resend an expired link:
- Click the 🔄 button next to any non-completed client
- A new token is generated, new email is sent, expiry resets to 14 days

### Copy a link manually:
- Click the 📋 button next to any client to copy their onboarding URL

---

## 7. Security

| Layer | How |
|-------|-----|
| **Token** | 32-character random hex (crypto.randomBytes) — unguessable |
| **Expiry** | 14 days from generation |
| **Single-use** | Status flips to "completed" after submission |
| **Server-side only** | All Supabase calls happen in API routes, never client-side |
| **Service key hidden** | Supabase service key is in env vars, never exposed to browser |
| **Admin gated** | /admin API routes check password header on every request |
| **No data leak** | Invalid tokens show generic "Access Denied" — no client info exposed |

---

## 8. Deployment Checklist

- [ ] Supabase project created
- [ ] SQL table + index executed
- [ ] Gmail 2FA enabled + App Password generated
- [ ] 5 environment variables set in Vercel
- [ ] `npm install @supabase/supabase-js nodemailer` (or added to package.json)
- [ ] Deployed to Vercel
- [ ] Test: visit `/admin`, log in, generate a test link, complete onboarding

---

## 9. Future: Custom Dashboard

The Supabase table is designed to be queried from any frontend. When you build your separate internal dashboard later, it can connect to the same Supabase project and display/manage the same data. The table structure supports:

- Filtering by status, date range
- Full-text search on client_name, email, company_name
- JSON parsing of senders/photos fields
- Real-time subscriptions (Supabase supports websockets)
