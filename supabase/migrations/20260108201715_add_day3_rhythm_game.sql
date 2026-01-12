/*
  # Add Rhythm Game to Day 3: Burping Master

  Updates Day 3 lesson to include a rhythm game after the quiz questions.

  ## Changes
    - Changes game_type from 'quiz' to 'multi' to support both quiz and rhythm game
    - Keeps existing 4 quiz questions about burping
    - Adds rhythm game section with tapping mechanic
    - Rhythm game simulates gentle patting on baby's back for burping

  ## Game Flow
    1. Quiz with 4 questions
    2. Rhythm game with circular tap indicator
    3. Completion reward
*/

UPDATE lessons
SET
  game_type = 'multi',
  content = jsonb_build_object(
    'intro', jsonb_build_object(
      'text', 'Burping helps release air swallowed during feeding. Let''s learn the best practices for keeping baby comfortable.'
    ),
    'sections', jsonb_build_array(
      jsonb_build_object(
        'type', 'quiz',
        'questions', jsonb_build_array(
          jsonb_build_object(
            'question', 'Why does baby cry after food?',
            'options', jsonb_build_array(
              'Still hungry',
              'Swallowed air',
              'Too full',
              'Needs diaper change'
            ),
            'correctAnswer', 'Swallowed air',
            'feedback', 'Correct! Babies often cry after feeding because they swallowed air during feeding, which causes discomfort until burped.'
          ),
          jsonb_build_object(
            'question', 'When should you burp baby?',
            'options', jsonb_build_array(
              'Only at the end',
              'Mid-feed and End',
              'Before feeding',
              'Every 5 minutes'
            ),
            'correctAnswer', 'Mid-feed and End',
            'feedback', 'Perfect! Burp baby halfway through feeding and at the end. This prevents too much air buildup and keeps baby comfortable.'
          ),
          jsonb_build_object(
            'question', 'If burping fails after 2 mins?',
            'options', jsonb_build_array(
              'Keep trying longer',
              'Stop, likely no air',
              'Change positions repeatedly',
              'Pat harder'
            ),
            'correctAnswer', 'Stop, likely no air',
            'feedback', 'Yes! If no burp comes after 2 minutes of gentle trying, baby probably doesn''t have air to release. No need to force it.'
          ),
          jsonb_build_object(
            'question', 'What is a safe burping position?',
            'options', jsonb_build_array(
              'Lying flat on back',
              'Shoulder or Lap (jaw supported)',
              'Hanging upside down',
              'Sitting unsupported'
            ),
            'correctAnswer', 'Shoulder or Lap (jaw supported)',
            'feedback', 'Exactly right! Safe positions include over your shoulder or sitting on your lap with jaw and chest supported. Always support baby''s head and neck.'
          )
        )
      ),
      jsonb_build_object(
        'type', 'rhythm',
        'instructions', 'Tap to the beat - gentle pats help baby burp!',
        'tempo', 80,
        'duration', 15
      )
    ),
    'reward', jsonb_build_object(
      'text', 'You''re now a burping expert! Remember: gentle pats and patience work best.',
      'reward', '+15 Care Drops'
    )
  )
WHERE day_number = 3;
