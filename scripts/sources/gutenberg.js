/**
 * Public-domain poetry from Project Gutenberg via the Gutendex catalog.
 * Only books Gutendex marks copyright:false are downloaded.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
  formatAuthor,
  eraFromDeathYear,
  splitGutenbergPoems,
  shouldSkipBook,
  plainTextUrl,
} = require('./gutenbergSplit');

const CACHE_DIR = path.join(__dirname, '../cache/gutenberg');
const USER_AGENT = 'PoetikIngest/1.0 (public-domain poetry reader; contact local dev)';

function catalogUrl(language) {
  return `https://gutendex.com/books/?topic=poetry&languages=${encodeURIComponent(language)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getText(url, { timeout = 45000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await axios.get(url, {
        timeout,
        responseType: 'text',
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json, text/plain, */*' },
        transformResponse: [(data) => data],
      });
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      console.warn(`Request failed (${attempt}/4) ${url}: ${error.message}`);
      if (status && status < 500 && status !== 429) throw error;
      await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

function cachePath(bookId) {
  return path.join(CACHE_DIR, `${bookId}.txt`);
}

async function readBookText(bookId, url) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = cachePath(bookId);
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');

  const text = await getText(url, { timeout: 60000 });
  if (typeof text !== 'string' || text.includes('<!DOCTYPE') || text.includes('<html')) {
    throw new Error(`Book ${bookId} did not return plain text`);
  }
  fs.writeFileSync(file, text);
  return text;
}

function bookMeta(book, language) {
  const author = book.authors?.[0];
  const deathYear = author?.death_year || null;
  return {
    id: book.id,
    title: book.title,
    author: formatAuthor(author?.name),
    birthYear: author?.birth_year || null,
    deathYear,
    era: eraFromDeathYear(deathYear),
    language: language || 'en',
    subjects: book.subjects || [],
  };
}

/**
 * Walk a Gutendex poetry catalog. language is a Gutendex code such as en, hi, or ur.
 * Calls onBookPoems(poems, meta) per book that yields at least one poem.
 * maxBooks limits downloaded texts (Infinity = all).
 */
async function fetchGutenbergPoems({ maxBooks = Infinity, onBookPoems, language = 'en' } = {}) {
  let url = catalogUrl(language);
  let downloaded = 0;
  let yielded = 0;
  const all = [];

  while (url && downloaded < maxBooks) {
    let page;
    try {
      page = JSON.parse(await getText(url));
    } catch (error) {
      console.warn('Gutenberg catalog page failed:', error.message);
      break;
    }
    const results = Array.isArray(page.results) ? page.results : [];

    for (const book of results) {
      if (downloaded >= maxBooks) break;
      if (shouldSkipBook(book)) continue;
      const textUrl = plainTextUrl(book.formats);
      if (!textUrl) continue;

      downloaded += 1;
      const meta = bookMeta(book, language);
      try {
        const text = await readBookText(book.id, textUrl);
        const poems = splitGutenbergPoems(text, meta);
        yielded += poems.length;
        console.log(`Gutenberg ${language} #${book.id} ${meta.title}: ${poems.length} poems`);
        if (onBookPoems && poems.length > 0) await onBookPoems(poems, meta);
        else all.push(...poems);
      } catch (error) {
        console.warn(`Gutenberg skip #${book.id} ${meta.title}:`, error.message);
      }
      await sleep(750);
    }

    url = downloaded >= maxBooks ? null : page.next || null;
  }

  console.log(`Gutenberg ${language} done. Books read: ${downloaded}. Poems parsed: ${yielded}.`);
  return onBookPoems ? [] : all;
}

module.exports = { fetchGutenbergPoems };
