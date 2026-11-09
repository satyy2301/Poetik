/**
 * Sprint 1 poem ingestion pipeline
 * Usage: node scripts/ingestPoems.js
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * PoetryDB is ingested in full. Gutenberg walks every English poetry book
 * Gutendex marks as public domain. Set GUTENBERG_MAX_BOOKS=40 to cap a run.
 */
const { getSupabaseAdmin } = require('./supabaseAdmin');
const { fetchPoetryDB } = require('./sources/poetrydb');
const { fetchGutenbergPoems } = require('./sources/gutenberg');

const BATCH_SIZE = 100;

const supabase = getSupabaseAdmin();
const existingBySource = new Map();

async function existingUrlSet(source) {
  if (existingBySource.has(source)) return existingBySource.get(source);
  const found = new Set();
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db(() =>
      supabase
        .from('poems')
        .select('source_url')
        .eq('source', source)
        .range(from, from + pageSize - 1),
    );
    if (error) throw error;
    for (const row of data || []) {
      if (row.source_url) found.add(row.source_url);
    }
    if (!data || data.length < pageSize) break;
  }
  existingBySource.set(source, found);
  return found;
}

console.log = (...args) => {
  process.stdout.write(`${args.map((part) => (typeof part === 'string' ? part : JSON.stringify(part))).join(' ')}\n`);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return !error?.code || /fetch failed|network|timeout|ECONN|502|503|504/i.test(message);
}

async function db(work) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const result = await work();
      if (!result?.error) return result;
      lastError = result.error;
      if (!isRetryable(result.error) || attempt === 5) return result;
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === 5) return { error };
    }
    console.warn(`Retrying database call (${attempt}/5): ${lastError.message}`);
    await sleep(1000 * attempt);
  }
  return { error: lastError };
}

function maxGutenbergBooks() {
  const raw = process.env.GUTENBERG_MAX_BOOKS;
  if (raw == null || raw === '' || raw === 'all') return Infinity;
  const count = Number(raw);
  return Number.isFinite(count) && count > 0 ? count : Infinity;
}

function dedupePoems(poems) {
  const seen = new Set();
  return poems.filter((poem) => {
    const key = `${poem.source}|${poem.source_url}|${poem.title}|${poem.author}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function upsertCanonicalAuthor(name, meta = {}) {
  const { data: existing, error: lookupError } = await db(() =>
    supabase.from('authors').select('id, name, birth_year, death_year').ilike('name', name).maybeSingle(),
  );
  if (lookupError) throw lookupError;

  if (existing) {
    const patch = {};
    if (existing.birth_year == null && meta.birth_year) patch.birth_year = meta.birth_year;
    if (existing.death_year == null && meta.death_year) patch.death_year = meta.death_year;
    if (Object.keys(patch).length > 0) {
      const { error: updateError } = await db(() => supabase.from('authors').update(patch).eq('id', existing.id));
      if (updateError) throw updateError;
    }
    return existing.id;
  }

  const { data, error } = await db(() => supabase
    .from('authors')
    .insert([
      {
        name,
        bio: 'Public domain poet',
        canonical: true,
        birth_year: meta.birth_year || null,
        death_year: meta.death_year || null,
      },
    ])
    .select('id')
    .single());

  if (error) throw error;
  return data.id;
}

async function insertPoemBatch(poems) {
  const authorNames = [...new Set(poems.map((p) => p.author).filter(Boolean))];
  const authorMap = {};

  for (const name of authorNames) {
    const meta = poems.find((poem) => poem.author === name) || {};
    authorMap[name] = await upsertCanonicalAuthor(name, {
      birth_year: meta.birth_year,
      death_year: meta.death_year,
    });
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

  const known = new Map();
  for (const source of new Set(rows.map((row) => row.source))) {
    known.set(source, await existingUrlSet(source));
  }

  const fresh = rows.filter((row) => !known.get(row.source)?.has(row.source_url));
  const skipped = rows.length - fresh.length;
  let inserted = 0;

  for (let i = 0; i < fresh.length; i += BATCH_SIZE) {
    const chunk = fresh.slice(i, i + BATCH_SIZE);
    const { error } = await db(() => supabase.from('poems').insert(chunk));
    if (!error) {
      inserted += chunk.length;
      for (const row of chunk) known.get(row.source)?.add(row.source_url);
      continue;
    }
    if (error.code !== '23505') throw error;
    for (const row of chunk) {
      const { error: rowError } = await db(() => supabase.from('poems').insert([row]));
      if (rowError) {
        if (rowError.code === '23505') continue;
        throw rowError;
      }
      inserted += 1;
      known.get(row.source)?.add(row.source_url);
    }
  }

  return { inserted, skipped };
}

async function insertPoems(poems) {
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < poems.length; i += BATCH_SIZE) {
    const batch = poems.slice(i, i + BATCH_SIZE);
    try {
      const result = await insertPoemBatch(batch);
      inserted += result.inserted;
      skipped += result.skipped;
      if (result.inserted > 0) console.log(`Inserted ${result.inserted} poems`);
    } catch (error) {
      console.error(`Batch failed at offset ${i}:`, error.message || error);
    }
  }
  return { inserted, skipped };
}

async function main() {
  console.log('Fetching poems from PoetryDB...');
  const poetryDbPoems = dedupePoems(await fetchPoetryDB());
  console.log(`PoetryDB: ${poetryDbPoems.length} poems`);
  const poetryResult = await insertPoems(poetryDbPoems);
  console.log(`PoetryDB inserted ${poetryResult.inserted}, skipped ${poetryResult.skipped}`);

  const bookLimit = maxGutenbergBooks();
  console.log(
    `Fetching Gutenberg public-domain poetry (${bookLimit === Infinity ? 'all books' : `${bookLimit} books`})...`,
  );
  let inserted = poetryResult.inserted;
  let skipped = poetryResult.skipped;
  await fetchGutenbergPoems({
    maxBooks: bookLimit,
    onBookPoems: async (poems) => {
      const result = await insertPoems(dedupePoems(poems));
      inserted += result.inserted;
      skipped += result.skipped;
    },
  });

  if (skipped > 0) {
    console.log(`Skipped ${skipped} duplicate poems (already ingested).`);
  }

  const { count } = await supabase
    .from('poems')
    .select('*', { count: 'exact', head: true })
    .eq('visibility', 'public');

  console.log(`Done. Inserted ${inserted}. Public poems in database: ${count ?? 'unknown'}`);
}

main().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});
