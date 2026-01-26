-- App Name Votes Table
-- Stores user votes for app naming options

CREATE TABLE IF NOT EXISTS public.app_name_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  selected_name TEXT NOT NULL CHECK (selected_name IN ('pellucid', 'intuitwithme', 'insightbridge')),
  reading_id TEXT, -- Optional: track which reading they were viewing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_app_name_votes_selected_name ON public.app_name_votes(selected_name);
CREATE INDEX IF NOT EXISTS idx_app_name_votes_created_at ON public.app_name_votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_name_votes_session_id ON public.app_name_votes(session_id);

-- Row Level Security
ALTER TABLE public.app_name_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can insert app name votes" ON public.app_name_votes;
DROP POLICY IF EXISTS "Anyone can view app name vote counts" ON public.app_name_votes;

-- Anyone can insert votes (anonymous or authenticated)
CREATE POLICY "Anyone can insert app name votes" ON public.app_name_votes
  FOR INSERT WITH CHECK (true);

-- Anyone can view aggregated vote counts (for analytics)
CREATE POLICY "Anyone can view app name vote counts" ON public.app_name_votes
  FOR SELECT USING (true);
