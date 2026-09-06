-- =========================================================
-- KRISHISAATHI AI: PostgreSQL Database Schema & RLS Policies
-- Target: Supabase / PostgreSQL 15+
-- “Your Farm. Your Data. Your AI Saathi.”
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 2. FARMS TABLE (Supports multi-farm ownership)
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  acres NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
  soil_type TEXT NOT NULL CHECK (soil_type IN ('black', 'alluvial', 'red', 'laterite', 'sandy_loam', 'clay')),
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  growth_stage TEXT NOT NULL CHECK (growth_stage IN ('sowing', 'germination', 'vegetative', 'flowering', 'pod_formation', 'maturity', 'harvest')),
  health_score INTEGER NOT NULL DEFAULT 82 CHECK (health_score BETWEEN 0 AND 100),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. CROPS TABLE (Extensible historical and active seasonal crop cycles)
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  sowing_date DATE,
  expected_harvest DATE,
  season TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'planned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. ADVISORIES TABLE (AI Saathi Agronomic Guidance)
CREATE TABLE IF NOT EXISTS public.advisories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_hi TEXT,
  query TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('crop', 'weather', 'disease', 'soil', 'irrigation')),
  summary TEXT NOT NULL,
  summary_hi TEXT,
  possible_causes JSONB DEFAULT '[]'::jsonb,
  things_to_check JSONB DEFAULT '[]'::jsonb,
  immediate_action JSONB DEFAULT '[]'::jsonb,
  weather_consideration TEXT,
  prevention JSONB DEFAULT '[]'::jsonb,
  when_to_seek_help TEXT,
  confidence NUMERIC(4, 2) DEFAULT 0.85,
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 5. DISEASE SCANS TABLE (Gemini Vision Diagnoses)
CREATE TABLE IF NOT EXISTS public.disease_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  possible_issue TEXT NOT NULL,
  possible_issue_hi TEXT,
  confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.90,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  symptoms_detected JSONB DEFAULT '[]'::jsonb,
  immediate_action JSONB DEFAULT '[]'::jsonb,
  prevention JSONB DEFAULT '[]'::jsonb,
  when_to_seek_help TEXT,
  image_quality TEXT DEFAULT 'good' CHECK (image_quality IN ('good', 'adequate', 'blurry')),
  disclaimer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 6. FARM OBSERVATIONS TABLE (Soil, Weather & Satellite Telemetry logs)
CREATE TABLE IF NOT EXISTS public.farm_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  observation_date TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  observation_type TEXT NOT NULL CHECK (observation_type IN ('soil', 'weather', 'satellite', 'scouting')),
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- =========================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_advisories_user_farm ON public.advisories(user_id, farm_id);
CREATE INDEX IF NOT EXISTS idx_advisories_created ON public.advisories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_scans_user_farm ON public.disease_scans(user_id, farm_id);
CREATE INDEX IF NOT EXISTS idx_disease_scans_created ON public.disease_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farm_obs_farm_date ON public.farm_observations(farm_id, observation_date DESC);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_observations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update only their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Farms: Users can view and manage their own farms
CREATE POLICY "Users can manage own farms" ON public.farms
  FOR ALL USING (auth.uid() = user_id);

-- Crops: Users can manage crops for farms they own
CREATE POLICY "Users can manage crops in their farms" ON public.crops
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid())
  );

-- Advisories: Users can manage their own advisories
CREATE POLICY "Users can manage own advisories" ON public.advisories
  FOR ALL USING (auth.uid() = user_id);

-- Disease Scans: Users can manage their own disease scans
CREATE POLICY "Users can manage own disease scans" ON public.disease_scans
  FOR ALL USING (auth.uid() = user_id);

-- Observations: Users can view observations on their farms
CREATE POLICY "Users can view observations for own farms" ON public.farm_observations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms WHERE farms.id = farm_observations.farm_id AND farms.user_id = auth.uid())
  );
