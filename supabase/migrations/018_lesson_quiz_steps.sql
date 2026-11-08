-- Give every lesson one multiple-choice step so the lesson screen can quiz
-- without a separate quiz list.

UPDATE public.lessons
SET steps = COALESCE(steps, '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object(
    'type', 'quiz',
    'question', 'Which rhyme scheme is ABAB?',
    'content', 'Which rhyme scheme is ABAB?',
    'options', jsonb_build_array(
      'Alternate lines rhyme',
      'Consecutive lines rhyme',
      'All lines rhyme',
      'No rhyme'
    ),
    'answerIndex', 0
  )
)
WHERE NOT EXISTS (
  SELECT 1
  FROM jsonb_array_elements(COALESCE(steps, '[]'::jsonb)) AS step
  WHERE step->>'type' = 'quiz'
);
