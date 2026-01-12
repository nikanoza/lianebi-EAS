/*
  # Add Icon Types to Hunger Cues Lesson
  
  Updates the hunger cues lesson cards to include icon type field
  for rendering custom SVG icons:
  - rooting: Baby turning head with mouth open
  - fist: Baby sucking on fist
  - sleepy: Baby yawning/tired
  - lipSmacking: Baby with tongue on lips
  - crying: Baby crying
  - turningAway: Baby turning head away
*/

UPDATE lessons
SET content = jsonb_set(
  content,
  '{cards}',
  jsonb_build_array(
    jsonb_build_object(
      'icon', 'rooting',
      'text', 'Baby turning head with mouth open',
      'answer', 'right',
      'feedback', 'Correct! Rooting is an early hunger cue.'
    ),
    jsonb_build_object(
      'icon', 'fist',
      'text', 'Baby sucking on fist',
      'answer', 'right',
      'feedback', 'Yes! This is a clear hunger signal.'
    ),
    jsonb_build_object(
      'icon', 'sleepy',
      'text', 'Baby rubbing eyes and yawning',
      'answer', 'left',
      'feedback', 'This means baby is sleepy, not hungry. Don''t feed! Needs sleep now.'
    ),
    jsonb_build_object(
      'icon', 'lipSmacking',
      'text', 'Baby with tongue on lips',
      'answer', 'right',
      'feedback', 'Correct! Lip smacking is a hunger cue.'
    ),
    jsonb_build_object(
      'icon', 'crying',
      'text', 'Baby crying and arching back',
      'answer', 'left',
      'feedback', 'Late hunger signal! Calm baby first, then feed.'
    ),
    jsonb_build_object(
      'icon', 'turningAway',
      'text', 'Baby turning head away',
      'answer', 'left',
      'feedback', 'Baby is overstimulated, not hungry. Time for calm and quiet.'
    )
  )
)
WHERE id = '65aacc6b-8e60-4725-9022-7ec479bc7c18';