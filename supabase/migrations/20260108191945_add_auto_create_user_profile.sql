/*
  # Auto-create User Profile on Signup

  ## Changes
  - Creates a trigger function to automatically create a user_profile when a new user signs up
  - This ensures that streak tracking and care drops work immediately after registration

  ## How It Works
  1. When a new user is created in auth.users, the trigger fires
  2. A corresponding user_profile record is created with default values
  3. streak_count starts at 0, care_drops starts at 0
*/

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();