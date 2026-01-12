/*
  # Update Day 2: The Perfect Latch Quiz

  Updates the Day 2 lesson with quiz content for learning proper breastfeeding latch technique.

  ## Changes
    - Updates Day 2 lesson game type to 'quiz'
    - Adds intro text
    - Adds 4 multiple-choice questions about proper latch technique
    - Each question has options and correct answer with feedback
    - Adds reward message with Care Drops

  ## Questions
    1. Nipple pain during breastfeeding
    2. Baby's nose position during feeding
    3. Sounds to listen for while feeding
    4. Baby's lip position during feeding
*/

UPDATE lessons
SET
  game_type = 'quiz',
  title = 'The Perfect Latch',
  description = 'Learn to spot the signs of a good latch',
  content = jsonb_build_object(
    'intro', jsonb_build_object(
      'text', 'A proper latch is crucial for comfortable feeding. Let''s test your knowledge on what a perfect latch looks like.'
    ),
    'questions', jsonb_build_array(
      jsonb_build_object(
        'question', 'Should breastfeeding cause nipple pain?',
        'options', jsonb_build_array(
          'Yes, it''s normal',
          'No, it means bad latch',
          'Only at first',
          'Pain is expected'
        ),
        'correctAnswer', 'No, it means bad latch',
        'feedback', 'Correct! Pain during breastfeeding is a clear sign of improper latch. A good latch should be comfortable.'
      ),
      jsonb_build_object(
        'question', 'Where should baby''s nose be during feeding?',
        'options', jsonb_build_array(
          'Pressed against breast',
          'Clear to breathe',
          'Covered by breast',
          'Pointing upward'
        ),
        'correctAnswer', 'Clear to breathe',
        'feedback', 'Yes! Baby''s nose should be clear so they can breathe comfortably while feeding. The chin touches the breast, not the nose.'
      ),
      jsonb_build_object(
        'question', 'What sounds indicate good feeding?',
        'options', jsonb_build_array(
          'Clicking sounds',
          'Deep swallowing only',
          'Gasping',
          'Loud gulping'
        ),
        'correctAnswer', 'Deep swallowing only',
        'feedback', 'Perfect! You should hear deep, rhythmic swallowing. Clicking or gasping sounds suggest a poor latch that needs adjustment.'
      ),
      jsonb_build_object(
        'question', 'How should baby''s lips look during feeding?',
        'options', jsonb_build_array(
          'Tucked in',
          'Fish lips (flanged)',
          'Pursed tight',
          'One lip in, one out'
        ),
        'correctAnswer', 'Fish lips (flanged)',
        'feedback', 'Exactly right! Both lips should be flanged outward like fish lips, creating a seal around the breast tissue, not just the nipple.'
      )
    ),
    'reward', jsonb_build_object(
      'text', 'You now know the key signs of a perfect latch! Remember: comfort is key.',
      'reward', '+15 Care Drops'
    )
  )
WHERE day_number = 2
  AND title LIKE '%Latch%';
