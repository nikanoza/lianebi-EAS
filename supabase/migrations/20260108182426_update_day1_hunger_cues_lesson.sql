/*
  # Update Day 1: Hunger Cues Lesson

  Updates the Day 1 lesson with complete swipe card content for learning baby hunger cues.

  ## Changes
    - Updates Day 1 lesson content with intro card, 6 swipe cards, and reward
    - Each card includes illustration description, text, correct answer, and feedback
    - Cards teach hunger cues vs other signals (sleepy, overstimulated, late hunger)
    - Reward shows +10 Care Drops and congratulatory message
*/

UPDATE lessons
SET 
  content = jsonb_build_object(
    'intro', jsonb_build_object(
      'text', 'Crying is the last signal. Let''s learn the language before tears.'
    ),
    'cards', jsonb_build_array(
      jsonb_build_object(
        'illustration', '👶 Baby turning head with mouth open',
        'answer', 'right',
        'feedback', 'Correct! Rooting is an early hunger cue.'
      ),
      jsonb_build_object(
        'illustration', '👶 Baby sucking on fist',
        'answer', 'right',
        'feedback', 'Yes! This is a clear hunger signal.'
      ),
      jsonb_build_object(
        'illustration', '👶 Baby rubbing eyes and yawning',
        'answer', 'left',
        'feedback', 'This means baby is sleepy, not hungry. Don''t feed! Needs sleep now.'
      ),
      jsonb_build_object(
        'illustration', '👶 Baby with tongue on lips',
        'answer', 'right',
        'feedback', 'Correct! Lip smacking is a hunger cue.'
      ),
      jsonb_build_object(
        'illustration', '😭 Baby crying and arching back',
        'answer', 'left',
        'feedback', 'Late hunger signal! Calm baby first, then feed.'
      ),
      jsonb_build_object(
        'illustration', '👶 Baby turning head away',
        'answer', 'left',
        'feedback', 'Baby is overstimulated, not hungry. Time for calm and quiet.'
      )
    ),
    'reward', jsonb_build_object(
      'text', 'You learned 3 main hunger signs!',
      'reward', '+10 Care Drops'
    )
  )
WHERE day_number = 1
  AND title = 'Hunger Cues';
