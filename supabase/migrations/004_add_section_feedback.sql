-- Migration: Add section-specific feedback
-- Description: Add section_ratings column to support granular feedback per reading section

-- Add section_ratings JSONB column
ALTER TABLE reading_feedback 
ADD COLUMN IF NOT EXISTS section_ratings JSONB;

-- Add index for section ratings queries
CREATE INDEX IF NOT EXISTS idx_reading_feedback_section_ratings 
ON reading_feedback USING gin(section_ratings);

-- Add comment for documentation
COMMENT ON COLUMN reading_feedback.section_ratings IS 
'JSONB object containing ratings for each section: headline, coreTheme, strengths, frictions, next7Days, journalPrompt. 
Example: {"headline": {"helpful": true, "rating": 5}, "coreTheme": {"helpful": true, "rating": 4}}';
