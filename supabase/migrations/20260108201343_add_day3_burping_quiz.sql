/*
  # Add Day 3: Burping Master Quiz

  Adds Day 3 lesson with quiz content about proper burping techniques.

  ## Changes
    - Creates Day 3 lesson with 'quiz' game type
    - Adds intro text about burping
    - Adds 4 multiple-choice questions about burping techniques
    - Each question has options and correct answer with feedback
    - Adds reward message with Care Drops

  ## Questions
    1. Why babies cry after feeding
    2. When to burp during feeding
    3. What to do if burping fails after 2 minutes
    4. Safe burping positions
*/

UPDATE lessons
SET
  game_type = 'quiz',
  title = 'Burping Master',
  description = 'Learn when and how to burp your baby',
  content = jsonb_build_object(
    'intro', jsonb_build_object(
      'text', 'Burping helps release air swallowed during feeding. Let''s learn the best practices for keeping baby comfortable.'
    ),
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
    ),
    'reward', jsonb_build_object(
      'text', 'You''re now a burping expert! Remember: gentle pats and patience work best.',
      'reward', '+15 Care Drops'
    )
  )
WHERE day_number = 3;
