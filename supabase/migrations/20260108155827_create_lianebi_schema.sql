/*
  # Lianebi - Gamified Parenting App Schema

  ## Overview
  Creates the complete database schema for the Lianebi parenting education app with gamification features.

  ## New Tables
  
  ### user_profiles
  - id (uuid, FK to auth.users) - User identifier
  - display_name (text) - User's display name
  - streak_count (integer) - Current consecutive days streak
  - last_activity_date (date) - Last day user completed an activity
  - care_drops (integer) - Virtual currency balance
  - created_at (timestamptz) - Account creation timestamp
  - updated_at (timestamptz) - Last profile update
  
  ### units
  - id (uuid, PK) - Unit identifier
  - title (text) - Unit title
  - description (text) - Unit description
  - age_range (text) - Target age range
  - order_index (integer) - Display order
  - is_active (boolean) - Whether unit is available
  - image_key (text) - Reference to mascot image state
  - created_at (timestamptz)
  
  ### lessons
  - id (uuid, PK) - Lesson identifier
  - unit_id (uuid, FK) - Parent unit
  - day_number (integer) - Day number within unit
  - title (text) - Lesson title
  - description (text) - Brief description
  - game_type (text) - Type of interaction
  - content (jsonb) - Game-specific content and questions
  - care_drops_reward (integer) - Reward for completion
  - order_index (integer) - Display order on map
  - created_at (timestamptz)
  
  ### user_progress
  - id (uuid, PK) - Progress record identifier
  - user_id (uuid, FK) - User reference
  - lesson_id (uuid, FK) - Lesson reference
  - completed (boolean) - Whether lesson is completed
  - score (integer) - Score achieved
  - completed_at (timestamptz) - Completion timestamp
  - created_at (timestamptz)
  
  ### care_drops_transactions
  - id (uuid, PK) - Transaction identifier
  - user_id (uuid, FK) - User reference
  - amount (integer) - Amount
  - transaction_type (text) - Type of transaction
  - reference_id (uuid) - Reference to related record
  - description (text) - Transaction description
  - created_at (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access and modify their own data
  - Public read access to units and lessons
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  streak_count integer DEFAULT 0,
  last_activity_date date,
  care_drops integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  age_range text,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true,
  image_key text,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  title text NOT NULL,
  description text,
  game_type text NOT NULL,
  content jsonb DEFAULT '{}',
  care_drops_reward integer DEFAULT 10,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create care_drops_transactions table
CREATE TABLE IF NOT EXISTS care_drops_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  reference_id uuid,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_drops_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for units (public read)
CREATE POLICY "Anyone can view active units"
  ON units FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for lessons (public read)
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for care_drops_transactions
CREATE POLICY "Users can view own transactions"
  ON care_drops_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON care_drops_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_care_drops_transactions_user_id ON care_drops_transactions(user_id);

-- Insert seed data for Unit 1
INSERT INTO units (title, description, age_range, order_index, is_active, image_key)
VALUES 
  ('Newborn Survival', 'Master the essential skills for caring for your newborn in the first 3 months', '0-3 Months', 1, true, 'swaddle_happy'),
  ('Sleep & Routine', 'Learn to establish healthy sleep patterns and daily routines', '3-6 Months', 2, false, 'sleeping'),
  ('Solids & Safety', 'Navigate the exciting world of first foods and baby-proofing', '6-9 Months', 3, false, 'eating')
ON CONFLICT DO NOTHING;

-- Insert lessons for Unit 1 (10-day pilot)
INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  1,
  'Hunger Cues',
  'Learn to recognize when your baby is hungry',
  'swipe',
  '{"cards": [
    {"image": "rooting", "text": "Baby turning head and opening mouth", "answer": "hungry"},
    {"image": "yawning", "text": "Baby yawning and rubbing eyes", "answer": "sleepy"},
    {"image": "sucking", "text": "Baby sucking on hands or fingers", "answer": "hungry"},
    {"image": "crying", "text": "Baby crying with fists clenched", "answer": "hungry"}
  ]}'::jsonb,
  15,
  1
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  2,
  'The Latch',
  'Perfect your breastfeeding technique',
  'swipe',
  '{"cards": [
    {"image": "good_latch", "text": "Wide mouth, lips flanged out", "answer": "correct"},
    {"image": "shallow_latch", "text": "Only nipple in mouth", "answer": "incorrect"},
    {"image": "chin_touching", "text": "Chin touching breast, nose clear", "answer": "correct"}
  ]}'::jsonb,
  15,
  2
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  3,
  'Burping Basics',
  'Master the rhythm of burping your baby',
  'rhythm',
  '{"instructions": "Tap to the beat to pat your baby back gently", "tempo": 120, "duration": 30}'::jsonb,
  20,
  3
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  4,
  'Poop Decoder',
  'Understand what your baby diaper is telling you',
  'swipe',
  '{"cards": [
    {"image": "yellow_seedy", "text": "Yellow and seedy", "answer": "normal"},
    {"image": "green_watery", "text": "Green and watery", "answer": "concern"},
    {"image": "brown_soft", "text": "Brown and soft", "answer": "normal"}
  ]}'::jsonb,
  15,
  4
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  5,
  'Safe Sleep',
  'Create a safe sleep environment',
  'drag_drop',
  '{"instructions": "Remove unsafe items from the crib", "items": [
    {"id": "blanket", "name": "Blanket", "safe": false},
    {"id": "pillow", "name": "Pillow", "safe": false},
    {"id": "stuffed_toy", "name": "Stuffed Animal", "safe": false},
    {"id": "bumper", "name": "Crib Bumper", "safe": false}
  ]}'::jsonb,
  20,
  5
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  6,
  'Swaddle Magic',
  'Learn the perfect swaddle technique',
  'swipe',
  '{"cards": [
    {"image": "diamond_fold", "text": "Fold blanket into diamond shape", "answer": "correct"},
    {"image": "arms_down", "text": "Keep arms straight at sides", "answer": "correct"},
    {"image": "loose_wrap", "text": "Wrap loosely around hips", "answer": "correct"}
  ]}'::jsonb,
  15,
  6
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  7,
  'Bath Time',
  'Get the perfect bath temperature',
  'slider',
  '{"instructions": "Adjust the thermometer to the safe zone", "min": 32, "max": 42, "optimal": 37, "unit": "°C", "safeRange": [36, 38]}'::jsonb,
  20,
  7
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  8,
  'Crying SOS',
  'Decode different types of cries',
  'swipe',
  '{"cards": [
    {"audio": "hungry_cry", "text": "Short, rhythmic cries", "answer": "hungry"},
    {"audio": "tired_cry", "text": "Whiny, continuous cry", "answer": "tired"},
    {"audio": "pain_cry", "text": "Sudden, high-pitched scream", "answer": "pain"}
  ]}'::jsonb,
  15,
  8
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  9,
  'Tummy Time',
  'Build strength with proper positioning',
  'drag_drop',
  '{"instructions": "Position baby correctly for tummy time", "correctPosition": {"angle": 0, "surface": "firm", "supervision": true}}'::jsonb,
  20,
  9
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (unit_id, day_number, title, description, game_type, content, care_drops_reward, order_index)
SELECT 
  u.id,
  10,
  'Milestone Check',
  'Recognize early developmental milestones',
  'swipe',
  '{"cards": [
    {"image": "tracking", "text": "Baby follows objects with eyes", "answer": "milestone"},
    {"image": "smiling", "text": "Baby smiles at familiar faces", "answer": "milestone"},
    {"image": "head_control", "text": "Baby holds head up briefly", "answer": "milestone"}
  ]}'::jsonb,
  25,
  10
FROM units u WHERE u.title = 'Newborn Survival'
ON CONFLICT DO NOTHING;