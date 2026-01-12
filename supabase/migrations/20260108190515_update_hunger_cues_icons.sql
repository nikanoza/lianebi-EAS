/*
  # Update Hunger Cues Lesson Icons
  
  Updates the hunger cues lesson cards with more diverse and relevant icons for each scenario:
  - 👄 Rooting (mouth open)
  - ✊ Sucking on fist
  - 😴 Sleepy/yawning
  - 👅 Tongue/lip smacking
  - 😭 Crying
  - 🙅 Turning away
  
  This ensures each card displays a unique, contextually appropriate icon instead of using the same baby emoji for all cards.
*/

UPDATE lessons
SET content = jsonb_set(
  content,
  '{cards}',
  jsonb_build_array(
    jsonb_build_object(
      'illustration', '👄 Baby turning head with mouth open',
      'answer', 'right',
      'feedback', 'Correct! Rooting is an early hunger cue.'
    ),
    jsonb_build_object(
      'illustration', '✊ Baby sucking on fist',
      'answer', 'right',
      'feedback', 'Yes! This is a clear hunger signal.'
    ),
    jsonb_build_object(
      'illustration', '😴 Baby rubbing eyes and yawning',
      'answer', 'left',
      'feedback', 'This means baby is sleepy, not hungry. Don''t feed! Needs sleep now.'
    ),
    jsonb_build_object(
      'illustration', '👅 Baby with tongue on lips',
      'answer', 'right',
      'feedback', 'Correct! Lip smacking is a hunger cue.'
    ),
    jsonb_build_object(
      'illustration', '😭 Baby crying and arching back',
      'answer', 'left',
      'feedback', 'Late hunger signal! Calm baby first, then feed.'
    ),
    jsonb_build_object(
      'illustration', '🙅 Baby turning head away',
      'answer', 'left',
      'feedback', 'Baby is overstimulated, not hungry. Time for calm and quiet.'
    )
  )
)
WHERE id = '65aacc6b-8e60-4725-9022-7ec479bc7c18';