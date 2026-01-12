/*
  # Fix User Profiles RLS and Auto-Creation

  ## Changes
  - Add database trigger to automatically create user profiles when users sign up
  - Update RLS policies to handle automatic profile creation
  - Remove manual profile creation logic dependency

  ## Security
  - Trigger runs with elevated privileges to bypass RLS during initial profile creation
  - Maintains secure RLS policies for all user operations after creation
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, streak_count, care_drops)
  VALUES (NEW.id, NULL, 0, 0);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add INSERT policy for service role only (for edge cases)
CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
