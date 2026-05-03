# Find My Match — Production Setup Guide

## Stack
- **Frontend**: React + Vite (this repo)
- **Database + Auth + Realtime**: Supabase
- **Payments**: Stripe
- **Hosting**: Vercel

---

## Step 1 — Supabase Setup (10 min)

1. Go to **supabase.com** → Sign up → New Project
2. Give it a name (e.g. "findmymatch") and set a database password
3. Wait ~2 min for the project to spin up
4. Go to **SQL Editor** (left sidebar)
5. Open the file: `supabase/migrations/001_initial_schema.sql`
6. Paste the entire contents into the SQL editor
7. Click **Run** — all tables, policies, and triggers will be created
8. Go to **Settings → API** and copy:
   - `Project URL` (looks like `https://abcdef.supabase.co`)
   - `anon public` key (long string starting with `eyJ...`)

### Enable Google OAuth (optional)
- Supabase Dashboard → Authentication → Providers → Google → Enable
- Add your Google OAuth credentials

---

## Step 2 — Stripe Setup (5 min)

1. Go to **stripe.com** → Create account
2. Dashboard → **Developers** → **API Keys**
3. Copy your **Publishable key** (starts with `pk_live_` or `pk_test_`)
4. For the referee booking flow, create a product in Stripe:
   - Products → Add product → "Referee Booking Fee"
   - Add price: $50 (or whatever your base rate is)
5. Copy the **Price ID** (starts with `price_`)

> For now the app uses Stripe.js for UI only. To process real payments you'll need a backend (Supabase Edge Function or separate server) to create PaymentIntents. See `PAYMENTS.md` for details.

---

## Step 3 — Local Development

```bash
# Clone or download this project
cd findmymatch

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your real keys:
# VITE_SUPABASE_URL=https://YOUR_ID.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# VITE_APP_URL=http://localhost:5173

# Start dev server
npm run dev
```

Open http://localhost:5173

---

## Step 4 — Deploy to Vercel (5 min)

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts — it auto-detects Vite
```

### Option B: Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to **vercel.com** → New Project → Import from GitHub
3. Select your repo
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` = your Vercel URL (e.g. `https://findmymatch.vercel.app`)
5. Click **Deploy**

### Update Supabase Auth settings after deploying
- Supabase Dashboard → Authentication → URL Configuration
- Add your Vercel URL to **Site URL** and **Redirect URLs**

---

## Step 5 — Make Yourself Admin

After signing up with your account:

```sql
-- Run this in Supabase SQL Editor
-- Replace the email with yours
UPDATE profiles SET role = 'admin' 
WHERE email = 'your@email.com';
```

Then go to `/admin` in the app.

---

## App URLs

| URL | What it does |
|-----|--------------|
| `/` | Landing page |
| `/signup` | Create account (choose role) |
| `/login` | Sign in |
| `/dashboard` | Player dashboard |
| `/referee` | Referee dashboard |
| `/create-match` | Create a match request |
| `/score/:matchId` | Live scoring screen (referee only) |
| `/live/:token` | Public viewer page (share this link!) |
| `/admin` | Admin panel |

---

## Full MVP Flow

1. **Player** signs up → `/dashboard` → Create Match
2. **Referee** signs up → `/referee` → Toggle Available → sees the open match → Accept
3. Match status changes to `confirmed` — both parties notified
4. **Referee** opens confirmed job → Start Live Scoring → `/score/:matchId`
5. Referee scores the match live with + / − buttons
6. **Viewer** opens the shared `/live/:token` URL — sees live score, no login needed
7. Referee clicks End Match → status → `finished`, winner saved

---

## Adding Real Stripe Payments

The current UI shows payment buttons but doesn't charge cards yet.
To add real payments you need a server-side component to create PaymentIntents.

**Quickest approach — Supabase Edge Function:**

```bash
# Install Supabase CLI
npm install -g supabase

# Create edge function
supabase functions new create-payment-intent
```

```typescript
// supabase/functions/create-payment-intent/index.ts
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

Deno.serve(async (req) => {
  const { amount, matchId } = await req.json()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'usd',
    metadata: { matchId }
  })
  return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }))
})
```

```bash
# Set secret key (never expose this in frontend)
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_key

# Deploy
supabase functions deploy create-payment-intent
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | All users (extends Supabase auth) |
| `referee_profiles` | Referee details, ratings, availability |
| `matches` | All match records |
| `live_scores` | Current score state per match |
| `score_events` | Audit log — every score change |
| `payments` | Payment records |
| `viewer_access` | Who paid to view which match |
| `notifications` | In-app notifications |
| `facilities` | Facility owner profiles |
| `tournaments` | Tournament groups |

---

## Real-time Architecture

Supabase Realtime is already configured. When a referee updates the score:

1. `live_scores` row is updated in Postgres
2. Supabase broadcasts the change via websocket
3. All connected viewers receive the update instantly — no polling

This works out of the box with the `useLiveScore` hook which subscribes to `postgres_changes`.

---

## Need Help?

Common issues:

**"Missing Supabase credentials"** → Check your `.env.local` file has correct values and restart `npm run dev`

**Auth redirect not working** → Add your URL to Supabase → Authentication → URL Configuration

**RLS blocking queries** → Check the user's `role` in the `profiles` table matches what's expected

**Realtime not updating** → Confirm `supabase_realtime` publication includes the table (already in the SQL migration)
