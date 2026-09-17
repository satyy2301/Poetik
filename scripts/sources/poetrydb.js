const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../../src/scripts/cache');

async function fetchWithCache(url, cacheKey) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  const response = await axios.get(url, { timeout: 30000 });
  fs.writeFileSync(cachePath, JSON.stringify(response.data));
  return response.data;
}

function normalizePoem(poem, authorName, sourceUrl) {
  if (!poem?.title || !poem?.lines) return null;

  const content = Array.isArray(poem.lines) ? poem.lines.join('\n') : String(poem.lines);
  if (!content.trim()) return null;

  const lineCount = poem.linecount || content.split('\n').length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    title: poem.title.trim(),
    author: poem.author || authorName,
    content,
    language: 'en',
    era: 'classical',
    form: lineCount === 14 ? 'Sonnet' : lineCount === 3 ? 'Haiku' : 'Free Verse',
    source: 'poetrydb',
    source_url: sourceUrl,
    line_count: lineCount,
    word_count: wordCount,
    themes: ['literature'],
    visibility: 'public',
  };
}

async function fetchPoetryDB({ authorLimit = 50, poemsPerAuthor = 15 } = {}) {
  const authorsResponse = await fetchWithCache(
    'https://poetrydb.org/author',
    'poetrydb_authors',
  );

  const authors = (authorsResponse?.authors || []).slice(0, authorLimit);
  const poems = [];

  for (const author of authors) {
    try {
      const authorPoems = await fetchWithCache(
        `https://poetrydb.org/author/${encodeURIComponent(author)}`,
        `poetrydb_${author}`,
      );

      if (!Array.isArray(authorPoems)) continue;

      for (const poem of authorPoems.slice(0, poemsPerAuthor)) {
        const normalized = normalizePoem(
          poem,
          author,
          `https://poetrydb.org/author/${encodeURIComponent(author)}/title/${encodeURIComponent(poem.title)}`,
        );
        if (normalized) poems.push(normalized);
      }
    } catch (error) {
      console.warn(`PoetryDB skip author ${author}:`, error.message);
    }
  }

  return poems;
}

module.exports = { fetchPoetryDB };
