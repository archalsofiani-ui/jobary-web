# Jobary — Phase 1 Setup Guide

Follow these steps to get the project running live.

---

## Step 1: Install Node.js

Download and install Node.js (version 18 or higher) from:
https://nodejs.org/en/download

---

## Step 2: Create a GitHub Repository

1. Go to https://github.com and create a free account
2. Click "New repository" → name it `jobary-web` → Private → Create
3. On your computer, open Terminal and run:

```bash
cd "path/to/jobary-web"   # navigate to this project folder
git init
git add .
git commit -m "Phase 1: Foundation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jobary-web.git
git push -u origin main
```

---

## Step 3: Create a Supabase Project

1. Go to https://supabase.com → Sign up free
2. Click "New project" → name it `jobary` → choose region: Middle East (Bahrain)
3. Wait ~2 minutes for it to provision
4. Go to Project Settings → API
5. Copy:
   - Project URL  → save as NEXT_PUBLIC_SUPABASE_URL
   - anon public key → save as NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key → save as SUPABASE_SERVICE_ROLE_KEY (keep secret!)

### Run the database schema:
1. In Supabase dashboard → SQL Editor → New Query
2. Open the file: `supabase/schema.sql` from this project
3. Paste the entire contents → click Run

### Create storage buckets:
In Supabase → Storage → New bucket:
- `avatars`  — Public: ON,  File size limit: 2MB
- `cvs`      — Public: OFF, File size limit: 5MB
- `logos`    — Public: ON,  File size limit: 1MB

---

## Step 4: Configure Environment Variables

1. Copy the example file:
```bash
cp .env.local.example .env.local
```
2. Open `.env.local` and fill in your Supabase values from Step 3

---

## Step 5: Install Dependencies & Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the Jobary homepage!

---

## Step 6: Deploy to Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your `jobary-web` repo
3. In Environment Variables, add:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL = https://your-vercel-url.vercel.app
4. Click Deploy

Your site is now live! Every time you push code to GitHub, Vercel auto-deploys.

---

## What's in This Project (Phase 1)

```
jobary-web/
├── src/
│   ├── app/
│   │   ├── [locale]/          ← All pages (en + ar routing)
│   │   │   ├── layout.tsx     ← Root layout with Navbar + Footer
│   │   │   ├── page.tsx       ← Homepage
│   │   │   ├── jobs/          ← Job listings (Phase 3)
│   │   │   ├── login/         ← Login (Phase 2)
│   │   │   └── signup/        ← Sign up (Phase 2)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                ← Button, Input, Card, Badge, Select, Spinner
│   │   └── layout/            ← Navbar, Footer
│   ├── lib/
│   │   ├── supabase/          ← client.ts + server.ts
│   │   └── utils.ts           ← cn(), SECTORS, CITIES, JOB_TYPES
│   ├── messages/
│   │   ├── en.json            ← English strings
│   │   └── ar.json            ← Arabic strings
│   ├── i18n.ts                ← next-intl config
│   └── middleware.ts          ← Language routing middleware
├── supabase/
│   └── schema.sql             ← Full DB schema + RLS policies
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Next Session: Phase 2 — Authentication & Profiles

Tell Claude: "We are building Jobary. Start Phase 2: build the registration and login system with Supabase Auth for both job seekers and employers."
