/*
  # Add RLS policies for slides table

  1. Security
    - Enable RLS on slides table
    - Add policy for authenticated users to read all slides
    - Add policy for authenticated admins to create slides
    - Add policy for authenticated admins to update slides
    - Add policy for authenticated admins to delete slides
*/

ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all slides
CREATE POLICY "Anyone can read slides"
  ON slides
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to create slides
CREATE POLICY "Admins can create slides"
  ON slides
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (has_role('admin'::app_role) OR has_role('superadmin'::app_role))
  );

-- Allow admins to update slides
CREATE POLICY "Admins can update slides"
  ON slides
  FOR UPDATE
  TO authenticated
  USING (
    (has_role('admin'::app_role) OR has_role('superadmin'::app_role))
  )
  WITH CHECK (
    (has_role('admin'::app_role) OR has_role('superadmin'::app_role))
  );

-- Allow admins to delete slides
CREATE POLICY "Admins can delete slides"
  ON slides
  FOR DELETE
  TO authenticated
  USING (
    (has_role('admin'::app_role) OR has_role('superadmin'::app_role))
  );