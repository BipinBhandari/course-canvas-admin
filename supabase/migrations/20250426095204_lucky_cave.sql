/*
  # Add slide templates

  1. New Tables
    - `slide_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `content_type` (text)
      - `content` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `slide_templates` table
    - Add policies for admin access
*/

CREATE TABLE IF NOT EXISTS slide_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content_type text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slide_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage slide templates"
  ON slide_templates
  TO authenticated
  USING (has_role('admin'::app_role) OR has_role('superadmin'::app_role))
  WITH CHECK (has_role('admin'::app_role) OR has_role('superadmin'::app_role));

-- All authenticated users can view templates
CREATE POLICY "Users can view slide templates"
  ON slide_templates
  FOR SELECT
  TO authenticated
  USING (true);