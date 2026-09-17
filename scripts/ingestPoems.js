/**
 * Sprint 1 poem ingestion pipeline
 * Usage: node scripts/ingestPoems.js
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */
const { getSupabaseAdmin } = require('./supabaseAdmin');
const { fetchPoetryDB } = require('./sources/poetrydb');
const { fetchGutenbergSupplement } = require('./sources/gutenberg');

const BATCH_SIZE = 100;
const TARGET_POEMS = 500;

const supabase = getSupabaseAdmin();

function dedupePoems(poems) {
  const seen = new Set();
  return poems.filter((poem) => {
    const key = `${poem.source}|${poem.source_url}|${poem.title}|${poem.author}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function upsertCanonicalAuthor(name) {
  const { data: existing } = await supabase
    .from('authors')
    .select('id, name')
    .ilike('name', name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('authors')
    .insert([
      {
        name,
        bio: 'Public domain poet',
        canonical: true,
      },
    ])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function insertPoemBatch(poems) {
  const authorNames = [...new Set(poems.map((p) => p.author).filter(Boolean))];
  const authorMap = {};

  for (const name of authorNames) {
    authorMap[name] = await upsertCanonicalAuthor(name);
  }

  const rows = poems
    .map((poem) => {
      const authorId = authorMap[poem.author];
      if (!authorId) return null;

      return {
        title: poem.title,
        content: poem.content,
        author_id: authorId,
        themes: poem.themes || ['literature'],
        form: poem.form || 'Free Verse',
        era: poem.era || 'classical',
        language: poem.language || 'en',
        source: poem.source,
        source_url: poem.source_url,
        line_count: poem.line_count,
        word_count: poem.word_count,
        visibility: 'public',
        like_count: 0,
      };
    })
    .filter(Boolean);

  if (rows.length === 0) return { inserted: 0, skipped: 0 };

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const { error } = await supabase.from('poems').insert([row]);
    if (error) {
      if (error.code === '23505') {
        skipped += 1;
        continue;
      }
      throw error;
    }
    inserted += 1;
  }

  return { inserted, skipped };
}

async function main() {
  console.log('Fetching poems from PoetryDB...');
  const poetryDbPoems = await fetchPoetryDB({ authorLimit: 60, poemsPerAuthor: 12 });
  console.log(`PoetryDB: ${poetryDbPoems.length} poems`);

  console.log('Fetching Gutenberg supplement...');
  const gutenbergPoems = await fetchGutenbergSupplement();
  console.log(`Gutenberg supplement: ${gutenbergPoems.length} poems`);

  const allPoems = dedupePoems([...poetryDbPoems, ...gutenbergPoems]).slice(0, TARGET_POEMS);
  console.log(`Ingesting ${allPoems.length} unique poems in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < allPoems.length; i += BATCH_SIZE) {
    const batch = allPoems.slice(i, i + BATCH_SIZE);
    try {
      const result = await insertPoemBatch(batch);
      inserted += result.inserted;
      skipped += result.skipped;
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      if (result.inserted > 0) {
        console.log(`Batch ${batchNum}: ${result.inserted} new poems`);
      } else {
        console.log(`Batch ${batchNum}: all ${result.skipped} already in database`);
      }
    } catch (error) {
      console.error(`Batch failed at offset ${i}:`, error.message);
    }
  }

  if (skipped > 0) {
    console.log(`Skipped ${skipped} duplicate poems (already ingested).`);
  }

  const { count } = await supabase
    .from('poems')
    .select('*', { count: 'exact', head: true })
    .eq('visibility', 'public');

  console.log(`Done. Public poems in database: ${count ?? 'unknown'}`);
}

main().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});
