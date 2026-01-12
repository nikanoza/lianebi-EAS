/*
  # Fix Units RLS Policy

  ## Changes
  - Update units SELECT policy to allow viewing all units (not just active ones)
  - This allows the UI to display locked units with proper locked state

  ## Security
  - Still requires authentication to view units
  - Read-only access maintained
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view active units" ON units;

-- Create new policy that allows viewing all units
CREATE POLICY "Authenticated users can view all units"
  ON units FOR SELECT
  TO authenticated
  USING (true);
