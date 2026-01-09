-- Supabase Database Schema for Pellucid Insights
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Readings table
CREATE TABLE IF NOT EXISTS public.readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reading_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_city TEXT NOT NULL,
  focus_area TEXT,
  headline TEXT NOT NULL,
  core_theme TEXT NOT NULL,
  strengths JSONB NOT NULL,
  watch_outs JSONB NOT NULL,
  next_7_days JSONB NOT NULL,
  journal_prompt TEXT NOT NULL,
  disclaimer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal responses table
CREATE TABLE IF NOT EXISTS public.journal_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_id UUID REFERENCES public.readings(id) ON DELETE CASCADE NOT NULL,
  journal_prompt TEXT NOT NULL,
  user_accepted BOOLEAN NOT NULL,
  generated_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  reading_id UUID REFERENCES public.readings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readings_user_id ON public.readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_reading_id ON public.readings(reading_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON public.readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_responses_reading_id ON public.journal_responses(reading_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can view all readings" ON public.readings;
DROP POLICY IF EXISTS "Users can create own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can create anonymous readings" ON public.readings;
DROP POLICY IF EXISTS "Users can view own journal responses" ON public.journal_responses;
DROP POLICY IF EXISTS "Users can create journal responses" ON public.journal_responses;
DROP POLICY IF EXISTS "Users can create analytics events" ON public.analytics_events;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Anyone can view readings (for sharing links)
CREATE POLICY "Users can view all readings" ON public.readings
  FOR SELECT USING (true);

-- Authenticated users can insert their own readings
CREATE POLICY "Users can create own readings" ON public.readings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view journal responses for any reading (for sharing)
CREATE POLICY "Users can view own journal responses" ON public.journal_responses
  FOR SELECT USING (true);

-- Users can insert journal responses for any reading
CREATE POLICY "Users can create journal responses" ON public.journal_responses
  FOR INSERT WITH CHECK (true);

-- Analytics events (insert only, no read access for users)
CREATE POLICY "Users can create analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for users
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-update updated_at for readings
DROP TRIGGER IF EXISTS set_updated_at ON public.readings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.readings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
