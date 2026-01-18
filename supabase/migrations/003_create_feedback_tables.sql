-- Migration: Create feedback tables
-- Description: Add reading_feedback table for user feedback and reactions

-- Create reading_feedback table
CREATE TABLE IF NOT EXISTS reading_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Quick reactions
  reaction_type TEXT CHECK (reaction_type IN ('resonated', 'too_vague', 'off_base', 'helpful', 'not_helpful')),
  
  -- Detailed feedback
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Specific aspects
  tone_rating INTEGER CHECK (tone_rating >= 1 AND tone_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_feedback_reading_id ON reading_feedback(reading_id);
CREATE INDEX IF NOT EXISTS idx_reading_feedback_user_id ON reading_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_feedback_reaction ON reading_feedback(reaction_type);
CREATE INDEX IF NOT EXISTS idx_reading_feedback_created_at ON reading_feedback(created_at);

-- Enable Row Level Security
ALTER TABLE reading_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can submit feedback for any reading
CREATE POLICY "Users can submit feedback"
  ON reading_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON reading_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous users can submit feedback (without user_id)
CREATE POLICY "Anonymous can submit feedback"
  ON reading_feedback FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Anonymous users can view feedback they just submitted (within same session)
CREATE POLICY "Anonymous can view recent feedback"
  ON reading_feedback FOR SELECT
  TO anon
  USING (user_id IS NULL AND created_at > NOW() - INTERVAL '1 hour');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_reading_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reading_feedback_timestamp
  BEFORE UPDATE ON reading_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_feedback_updated_at();
