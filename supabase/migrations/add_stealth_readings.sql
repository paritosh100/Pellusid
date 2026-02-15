-- Migration: Add stealth_readings table
-- This creates a separate table for stealth mode readings, leaving the existing readings table untouched.

CREATE TABLE IF NOT EXISTS public.stealth_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reading_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_city TEXT NOT NULL,
  focus_area TEXT,
  where_youve_been TEXT NOT NULL,
  where_you_are TEXT NOT NULL,
  direction TEXT NOT NULL,
  summary JSONB NOT NULL,
  closing_nudge TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stealth_readings_user_id ON public.stealth_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_stealth_readings_reading_id ON public.stealth_readings(reading_id);
CREATE INDEX IF NOT EXISTS idx_stealth_readings_created_at ON public.stealth_readings(created_at DESC);

-- Row Level Security
ALTER TABLE public.stealth_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (mirror the readings table policies)
DROP POLICY IF EXISTS "Users can view all stealth readings" ON public.stealth_readings;
CREATE POLICY "Users can view all stealth readings" ON public.stealth_readings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own stealth readings" ON public.stealth_readings;
CREATE POLICY "Users can create own stealth readings" ON public.stealth_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.stealth_readings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stealth_readings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
