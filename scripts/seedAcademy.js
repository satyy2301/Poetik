/**
 * Seed the poetry academy into the existing lessons, quizzes, and daily_challenges tables.
 * Usage: node scripts/seedAcademy.js
 */
const { getSupabaseAdmin } = require('./supabaseAdmin');
const {
  LESSONS,
  CHALLENGES,
  RETIRED_PROMPTS,
  assertAcademyContent,
  toLessonRow,
} = require('./academyContent');

function utcDate(offset) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function upsertLesson(supabase, lesson) {
  const payload = toLessonRow(lesson);
  const { data: existing, error: findError } = await supabase
    .from('lessons')
    .select('id')
    .eq('title', lesson.title);

  if (findError) throw findError;

  if (existing && existing.length) {
    for (const row of existing) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', row.id);
      if (error) throw error;
    }
    console.log(`Updated ${existing.length}: ${lesson.title}`);
    return existing.map((row) => row.id);
  }

  const { data, error } = await supabase.from('lessons').insert(payload).select('id');
  if (error) throw error;
  if (!data || !data.length) throw new Error(`Insert returned no id for ${lesson.title}`);
  console.log(`Inserted: ${lesson.title}`);
  return data.map((row) => row.id);
}

async function main() {
  assertAcademyContent();
  const supabase = getSupabaseAdmin();
  const lessonIds = [];

  for (const lesson of LESSONS) {
    const ids = await upsertLesson(supabase, lesson);
    ids.forEach((id) => lessonIds.push({ id, quiz: lesson.quiz }));
  }

  const ids = lessonIds.map((row) => row.id);
  const { error: deleteQuizError } = await supabase.from('quizzes').delete().in('lesson_id', ids);
  if (deleteQuizError) throw deleteQuizError;

  const { error: quizError } = await supabase.from('quizzes').insert(
    lessonIds.map((row) => ({ lesson_id: row.id, questions: row.quiz })),
  );
  if (quizError) throw quizError;
  console.log(`Replaced quizzes for ${lessonIds.length} lesson row(s).`);

  if (RETIRED_PROMPTS.length) {
    const { error: retireError } = await supabase
      .from('daily_challenges')
      .delete()
      .in('task', RETIRED_PROMPTS);
    if (retireError) throw retireError;
  }

  for (let i = 0; i < CHALLENGES.length; i += 1) {
    const row = {
      date: utcDate(i),
      task: CHALLENGES[i],
      xp_reward: 40 + (i % 3) * 10,
    };
    const { error } = await supabase.from('daily_challenges').upsert(row, { onConflict: 'date' });
    if (error) throw error;
    console.log(`Seeded challenge for ${row.date}`);
  }

  console.log('Academy seeding complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
