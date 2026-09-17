/**
 * Seed 30 days of daily challenges
 * Usage: node scripts/seedChallenges.js
 */
const { getSupabaseAdmin } = require('./supabaseAdmin');

const supabase = getSupabaseAdmin();

const PROMPTS = [
  'Write a 4-line poem using the word "river"',
  'Write a haiku about morning light',
  'Use internal rhyme in a 6-line poem',
  'Write a poem with a metaphor about time',
  'Create a sonnet opening (first 4 lines)',
  'Write about silence in 3 lines',
  'Use all five senses in one short poem',
  'Write a poem in ABAB rhyme scheme',
  'Describe a city street at dusk',
  'Write a poem inspired by rain',
];

function getPrompt(dayIndex) {
  return PROMPTS[dayIndex % PROMPTS.length];
}

async function main() {
  const rows = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    rows.push({
      date: dateStr,
      task: getPrompt(i),
      xp_reward: 40 + (i % 3) * 10,
    });
  }

  for (const row of rows) {
    const { error } = await supabase.from('daily_challenges').upsert(row, {
      onConflict: 'date',
    });
    if (error) {
      console.warn(`Skip ${row.date}:`, error.message);
    } else {
      console.log(`Seeded challenge for ${row.date}`);
    }
  }

  console.log('Challenge seeding complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
