/**
 * Minimal Gutenberg poetry fetcher.
 * Uses PoetryDB as primary source; this module adds curated public-domain titles
 * when PoetryDB quota is not enough.
 */
const axios = require('axios');

const CURATED_TITLES = [
  { title: 'The Raven', author: 'Edgar Allan Poe' },
  { title: 'Ozymandias', author: 'Percy Bysshe Shelley' },
  { title: 'Kubla Khan', author: 'Samuel Taylor Coleridge' },
];

async function fetchGutenbergSupplement() {
  const poems = [];

  for (const entry of CURATED_TITLES) {
    try {
      const url = `https://poetrydb.org/author,title/${encodeURIComponent(entry.author)};${encodeURIComponent(entry.title)}`;
      const response = await axios.get(url, { timeout: 15000 });
      const rows = Array.isArray(response.data) ? response.data : [response.data];

      for (const poem of rows) {
        if (!poem?.lines) continue;
        poems.push({
          title: poem.title || entry.title,
          author: poem.author || entry.author,
          content: poem.lines.join('\n'),
          language: 'en',
          era: 'classical',
          form: 'Free Verse',
          source: 'gutenberg-curated',
          source_url: `gutenberg:${entry.author}:${entry.title}`,
          line_count: poem.linecount || poem.lines.length,
          word_count: poem.lines.join(' ').split(/\s+/).length,
          themes: ['literature'],
          visibility: 'public',
        });
      }
    } catch (error) {
      console.warn(`Gutenberg supplement skip ${entry.title}:`, error.message);
    }
  }

  return poems;
}

module.exports = { fetchGutenbergSupplement };
