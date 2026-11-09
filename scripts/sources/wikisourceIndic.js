/**
 * Public-domain Hindi and Urdu verse from Wikisource.
 * Gutendex currently has no poetry books tagged hi or ur.
 */
const axios = require('axios');

const USER_AGENT = 'PoetikIngest/1.0 (public-domain poetry reader; contact local dev)';

const CATALOGS = {
  hi: {
    host: 'https://hi.wikisource.org',
    categories: [
      { title: 'Category:कविता', form: 'Free Verse' },
      { title: 'Category:शायरी', form: 'Shayari' },
      { title: 'Category:ग़ज़ल', form: 'Shayari' },
    ],
  },
  ur: {
    host: 'https://ur.wikisource.org',
    categories: [
      { title: 'Category:شاعری', form: 'Shayari' },
      { title: 'زمرہ:شاعری', form: 'Shayari' },
    ],
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(host, params) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await axios.get(`${host}/w/api.php`, {
        timeout: 30000,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
        params: { format: 'json', ...params },
      });
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      if (status !== 429 && status !== 503) throw error;
      const wait = 4000 * attempt;
      console.warn(`Wikisource ${status}, waiting ${wait}ms (${attempt}/5)`);
      await sleep(wait);
    }
  }
  throw lastError;
}

function splitVerse(extract) {
  const blocks = String(extract || '')
    .replace(/\[[0-9]+\]/g, '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.split('\n').map((line) => line.trim()).filter(Boolean).length >= 2);
  return blocks;
}

function poemRecords(page, { language, form, host }) {
  const rawTitle = String(page.title || '');
  if (/^(श्रेणी|Category|زمرہ):/i.test(rawTitle)) return [];
  const parts = rawTitle.split('/').map((part) => part.trim()).filter(Boolean);
  const author = parts.length >= 2 ? parts[0] : 'Unknown';
  const poemTitle = (parts.length >= 2 ? parts.slice(1).join(' / ') : rawTitle).slice(0, 500);
  const blocks = splitVerse(page.extract);
  if (blocks.length === 0) return [];
  const encoded = encodeURIComponent(rawTitle.replace(/ /g, '_'));
  const baseUrl = `${host}/wiki/${encoded}`;
  const pieces = blocks.length === 1 || blocks.join('\n').split('\n').length <= 80
    ? [blocks.join('\n\n')]
    : blocks;

  return pieces.map((content, index) => {
    const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
    return {
      title: pieces.length === 1 ? poemTitle : `${poemTitle} ${index + 1}`,
      author,
      content: lines.join('\n'),
      language,
      era: 'classical',
      form: form || 'Free Verse',
      source: 'wikisource',
      source_url: pieces.length === 1 ? baseUrl : `${baseUrl}#${index + 1}`,
      line_count: lines.length,
      word_count: content.split(/\s+/).filter(Boolean).length,
      themes: ['literature'],
      visibility: 'public',
    };
  }).filter((poem) => poem.title && poem.line_count >= 2 && poem.content.length >= 20);
}

async function fetchCategory(host, category, language, form, maxPages) {
  const poems = [];
  let cont = {};
  while (poems.length < maxPages) {
    let data;
    try {
      data = await api(host, {
        action: 'query',
        generator: 'categorymembers',
        gcmtitle: category,
        gcmtype: 'page',
        gcmlimit: Math.min(20, maxPages - poems.length),
        prop: 'extracts',
        explaintext: 1,
        exlimit: 'max',
        ...cont,
      });
    } catch (error) {
      console.warn(`Wikisource skip ${category}: ${error.message}`);
      break;
    }
    const pages = Object.values(data?.query?.pages || {});
    if (pages.length === 0) break;
    for (const page of pages) {
      if (page.missing != null) continue;
      poems.push(...poemRecords(page, { language, form, host }));
      if (poems.length >= maxPages) break;
    }
    if (!data?.continue || poems.length >= maxPages) break;
    cont = data.continue;
    await sleep(400);
  }
  return poems.slice(0, maxPages);
}

async function fetchIndicPoems(language, { maxPages = 40 } = {}) {
  const catalog = CATALOGS[language];
  if (!catalog) return [];
  const all = [];
  const seen = new Set();
  for (const category of catalog.categories) {
    const batch = await fetchCategory(catalog.host, category.title, language, category.form, maxPages);
    for (const poem of batch) {
      if (seen.has(poem.source_url)) continue;
      seen.add(poem.source_url);
      all.push(poem);
    }
    console.log(`Wikisource ${language} ${category.title}: ${batch.length} poems`);
  }
  return all;
}

module.exports = { fetchIndicPoems };
