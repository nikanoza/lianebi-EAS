/*
  # Add anonymous access to lessons table
  
  1. Changes
    - Add RLS policy to allow anonymous users to view lessons
    - This enables the app to show lesson content for units
  
  2. Security
    - Read-only access for anonymous users
    - Lessons table only contains public course content
*/

CREATE POLICY "Anonymous users can view lessons"
  ON lessons
  FOR SELECT
  TO anon
  USING (true);
