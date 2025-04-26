/*
  # Add name field to slides table

  1. Changes
    - Add `name` column to `slides` table with text type
    - Make it nullable to maintain compatibility with existing slides
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'name'
  ) THEN
    ALTER TABLE slides ADD COLUMN name text;
  END IF;
END $$;