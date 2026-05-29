-- ============================================================
-- JOBARY DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS (extends Supabase auth.users) ────────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'employer', 'admin')),
  language_pref TEXT NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'ar')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SEEKER PROFILES ────────────────────────────────────────
CREATE TABLE public.seeker_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name_en         TEXT,
  name_ar         TEXT,
  photo_url       TEXT,
  nationality     TEXT,
  bio_en          TEXT,
  bio_ar          TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  city            TEXT,
  skills          TEXT[] DEFAULT '{}',
  languages       TEXT[] DEFAULT '{}',
  salary_min      INTEGER,
  salary_max      INTEGER,
  cv_url          TEXT,
  is_visible      BOOLEAN DEFAULT TRUE,
  years_exp       INTEGER DEFAULT 0,
  education_level TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMPANIES ───────────────────────────────────────────────
CREATE TABLE public.companies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name_en      TEXT NOT NULL,
  name_ar      TEXT,
  logo_url     TEXT,
  sector       TEXT,
  size         TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  city         TEXT,
  website      TEXT,
  description_en TEXT,
  description_ar TEXT,
  cr_number    TEXT,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── JOBS ────────────────────────────────────────────────────
CREATE TABLE public.jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title_en        TEXT NOT NULL,
  title_ar        TEXT,
  description_en  TEXT NOT NULL,
  description_ar  TEXT,
  requirements_en TEXT,
  requirements_ar TEXT,
  sector          TEXT NOT NULL,
  city            TEXT NOT NULL,
  job_type        TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance')),
  salary_min      INTEGER,
  salary_max      INTEGER,
  salary_currency TEXT DEFAULT 'SAR',
  experience_min  INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  is_featured     BOOLEAN DEFAULT FALSE,
  boosted_until   TIMESTAMPTZ,
  deadline        DATE,
  views_count     INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPLICATIONS ────────────────────────────────────────────
CREATE TABLE public.applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id        UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  seeker_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn'
  )),
  cover_note    TEXT,
  employer_note TEXT,
  applied_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ─── MESSAGES ────────────────────────────────────────────────
CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id      UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SAVED JOBS ──────────────────────────────────────────────
CREATE TABLE public.saved_jobs (
  seeker_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (seeker_id, job_id)
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'pro')),
  start_date  TIMESTAMPTZ DEFAULT NOW(),
  end_date    TIMESTAMPTZ,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  payment_ref TEXT,
  amount_paid INTEGER,
  currency    TEXT DEFAULT 'SAR',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── JOB ALERTS ──────────────────────────────────────────────
CREATE TABLE public.job_alerts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seeker_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  keywords   TEXT,
  sector     TEXT,
  city       TEXT,
  job_type   TEXT,
  salary_min INTEGER,
  frequency  TEXT DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_jobs_sector    ON public.jobs(sector);
CREATE INDEX idx_jobs_city      ON public.jobs(city);
CREATE INDEX idx_jobs_status    ON public.jobs(status);
CREATE INDEX idx_jobs_company   ON public.jobs(company_id);
CREATE INDEX idx_jobs_featured  ON public.jobs(is_featured, boosted_until);
CREATE INDEX idx_apps_job       ON public.applications(job_id);
CREATE INDEX idx_apps_seeker    ON public.applications(seeker_id);
CREATE INDEX idx_msgs_receiver  ON public.messages(receiver_id);
CREATE INDEX idx_msgs_sender    ON public.messages(sender_id);

-- Full-text search index on jobs
CREATE INDEX idx_jobs_fts ON public.jobs
  USING GIN (to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(description_en, '')));

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts        ENABLE ROW LEVEL SECURITY;

-- Users: read own, update own
CREATE POLICY "Users can read own data"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Seeker profiles: owner full access; others can read visible profiles
CREATE POLICY "Seeker: manage own profile"  ON public.seeker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read visible profiles" ON public.seeker_profiles FOR SELECT USING (is_visible = TRUE);

-- Companies: owner full access; anyone can read
CREATE POLICY "Company owner full access" ON public.companies FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Anyone can read companies" ON public.companies FOR SELECT USING (TRUE);

-- Jobs: company owner manages; anyone can read active jobs
CREATE POLICY "Company owner manages jobs" ON public.jobs FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM public.companies WHERE id = company_id));
CREATE POLICY "Anyone can read active jobs" ON public.jobs FOR SELECT USING (status = 'active');

-- Applications: seeker manages own; employer can read their job applications
CREATE POLICY "Seeker manages own applications" ON public.applications FOR ALL USING (auth.uid() = seeker_id);
CREATE POLICY "Employer reads their job applications" ON public.applications FOR SELECT
  USING (auth.uid() = (SELECT c.owner_id FROM public.companies c JOIN public.jobs j ON j.company_id = c.id WHERE j.id = job_id));
CREATE POLICY "Employer updates application status" ON public.applications FOR UPDATE
  USING (auth.uid() = (SELECT c.owner_id FROM public.companies c JOIN public.jobs j ON j.company_id = c.id WHERE j.id = job_id));

-- Messages: sender and receiver can read/write
CREATE POLICY "Message participants access" ON public.messages FOR ALL
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Saved jobs: seeker only
CREATE POLICY "Seeker manages saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = seeker_id);

-- Subscriptions: company owner reads own
CREATE POLICY "Company owner reads subscriptions" ON public.subscriptions FOR SELECT USING (
  auth.uid() = (SELECT owner_id FROM public.companies WHERE id = company_id)
);

-- Job alerts: seeker only
CREATE POLICY "Seeker manages job alerts" ON public.job_alerts FOR ALL USING (auth.uid() = seeker_id);

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated          BEFORE UPDATE ON public.users           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_seeker_profiles_updated BEFORE UPDATE ON public.seeker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated      BEFORE UPDATE ON public.companies        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated           BEFORE UPDATE ON public.jobs             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated   BEFORE UPDATE ON public.applications     FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTO-CREATE USER ROW ON SIGNUP ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, language_pref)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker'),
    COALESCE(NEW.raw_user_meta_data->>'language_pref', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── STORAGE BUCKETS (run separately in Supabase dashboard or via API) ───
-- Create these buckets in Supabase Storage:
-- 1. "avatars"   — public, max 2MB, image/*
-- 2. "cvs"       — private (seeker + employer with application), max 5MB, application/pdf
-- 3. "logos"     — public, max 1MB, image/*

-- ─── HELPER: increment applications count ────────────────────
CREATE OR REPLACE FUNCTION increment_applications(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.jobs SET applications_count = applications_count + 1 WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
