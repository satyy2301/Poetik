-- Seed lessons for Poetik
-- Run this in Supabase SQL editor to populate example courses

insert into public.lessons (title, description, type, difficulty, steps, xp_reward, lesson_order) values
('Poetry 101: The Absolute Basics', 'What is poetry? Understanding form vs free verse; basic terminology and simple rhyme schemes', 'curated', 1, '[{"type":"theory","content":"What is poetry? Form vs free verse."},{"type":"theory","content":"Terminology: stanza, line, meter."},{"type":"interactive","content":"Write a 4-line stanza using AABB or ABAB rhyme.","requiresResponse":true}]'::jsonb, 25, 1),
('Rhyme Time: Mastering Sound Patterns', 'Perfect vs slant rhyme, internal rhyme and creating rhythmic flow', 'curated', 2, '[{"type":"theory","content":"Perfect vs slant rhyme."},{"type":"example","content":"Examples of internal rhyme."},{"type":"interactive","content":"Create 3 lines using internal rhyme.","requiresResponse":true}]'::jsonb, 30, 2),
('Imagery & Sensory Language', 'Painting pictures with words; five senses; metaphor vs simile', 'curated', 2, '[{"type":"theory","content":"Using sensory language and imagery."},{"type":"interactive","content":"Describe a scene using three senses.","requiresResponse":true}]'::jsonb, 35, 3),
('Your First Poem: A Guided Workshop', 'Step-by-step poem creation and revision techniques', 'curated', 2, '[{"type":"theory","content":"Overcoming blank page anxiety."},{"type":"interactive","content":"Draft a short poem from a prompt.","requiresResponse":true},{"type":"interactive","content":"Revise your draft focusing on imagery.","requiresResponse":true}]'::jsonb, 50, 4),
('Sonnet Mastery: 14 Lines to Perfection', 'Petrarchan vs Shakespearean; iambic pentameter practice; the volta', 'curated', 4, '[{"type":"theory","content":"Structure of sonnets and iambic pentameter."},{"type":"example","content":"Analyze a Shakespearean sonnet."},{"type":"interactive","content":"Attempt 4 lines in iambic pentameter.","requiresResponse":true}]'::jsonb, 60, 5),
('Haiku: Less is More', '5-7-5 syllable structure; seasonal references (kigo)', 'curated', 1, '[{"type":"theory","content":"Haiku structure and kigo."},{"type":"interactive","content":"Write a haiku about your morning.","requiresResponse":true}]'::jsonb, 30, 6),
('Metaphor Magic: Beyond Like and As', 'Extended metaphors, conceits, and symbolism', 'curated', 4, '[{"type":"theory","content":"Extended metaphors and conceits."},{"type":"interactive","content":"Create an extended metaphor for an everyday object.","requiresResponse":true}]'::jsonb, 55, 7);

-- Optional: seed a daily challenge for today
insert into public.daily_challenges (date, task, xp_reward) values (current_date, 'Write a 4-line poem that uses the word "river"', 50) on conflict (date) do nothing;

-- Optional: seed a sample quiz
insert into public.quizzes (lesson_id, questions) values (
  (select id from public.lessons where lesson_order = 1 limit 1),
  '[{"question":"Which rhyme scheme is ABAB?","options":["Alternate lines rhyme","Consecutive lines rhyme","All lines rhyme","No rhyme"],"answerIndex":0},{"question":"A haiku has which syllable pattern?","options":["5-7-5","4-4-4","3-3-3","6-6-6"],"answerIndex":0}]'::jsonb
);
