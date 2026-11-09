/**
 * Seed the academy's 90 writing tasks from today forward.
 * Lessons and quizzes are seeded by scripts/seedAcademy.js.
 * Usage: node scripts/seedChallenges.js
 */
const { getSupabaseAdmin } = require('./supabaseAdmin');
const { CHALLENGES, RETIRED_PROMPTS } = require('./academyContent');

const supabase = getSupabaseAdmin();

function utcDate(offset) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function main() {
  if (CHALLENGES.length !== 90) {
    throw new Error(`Expected 90 challenges, found ${CHALLENGES.length}`);
  }

  if (RETIRED_PROMPTS.length) {
    const { error } = await supabase.from('daily_challenges').delete().in('task', RETIRED_PROMPTS);
    if (error) throw error;
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

  console.log('Challenge seeding complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
