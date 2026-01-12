/*
  # Add anonymous access to units table
  
  1. Changes
    - Add RLS policy to allow anonymous users to view units
    - This enables the app to show course cards before user logs in
  
  2. Security
    - Read-only access for anonymous users
    - Units table only contains public course information
*/

CREATE POLICY "Anyone can view units"
  ON units
  FOR SELECT
  TO anon
  USING (true);
