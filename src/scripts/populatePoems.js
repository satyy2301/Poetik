require('dotenv').config({ path: '../../.env' });
const { supabase } = require('../lib/supabase.cjs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BATCH_SIZE = 100;
const MAX_POEMS = 1000;
const SOURCES = {
  POETRYDB: 'poetrydb',
  POETRY_FOUNDATION: 'poetry-foundation'
};

// Cache directory setup
const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

async function fetchWithCache(url, cacheKey) {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  const response = await axios.get(url);
  fs.writeFileSync(cachePath, JSON.stringify(response.data));
  return response.data;
}

async function fetchPoetryDB(limit = 500) {
  try {
    // First get all authors
    const authorsResponse = await fetchWithCache(
      'https://poetrydb.org/author',
      'poetrydb_authors'
    );

    if (!authorsResponse || !authorsResponse.authors) {
      throw new Error('Invalid response from PoetryDB authors endpoint');
    }

    const authors = authorsResponse.authors.slice(0, 10); // Limit to 10 authors for initial load
    const poems = [];

    for (const author of authors) {
      try {
        const authorPoems = await fetchWithCache(
          `https://poetrydb.org/author/${encodeURIComponent(author)}`,
          `poetrydb_${author}`
        );

        if (!Array.isArray(authorPoems)) continue;

        for (const poem of authorPoems.slice(0, limit / authors.length)) {
          if (!poem.title || !poem.lines) continue;
          
          poems.push({
            title: poem.title,
            author: poem.author || author,
            content: poem.lines.join('\n'),
            language: 'en',
            style: 'classic',
            era: 'classical',
            form: poem.linecount === 14 ? 'sonnet' : 'poem',
            source: SOURCES.POETRYDB,
            source_url: `https://poetrydb.org/author/${encodeURIComponent(author)}/title/${encodeURIComponent(poem.title)}`,
            line_count: poem.linecount || poem.lines.length,
            word_count: poem.lines.join(' ').split(/\s+/).length,
            themes: ['literature'] // Default theme
          });
        }
      } catch (error) {
        console.error(`Error processing PoetryDB author ${author}:`, error.message);
      }
    }
    return poems;
  } catch (error) {
    console.error('PoetryDB fetch error:', error);
    return [];
  }
}

async function batchInsertWithAuthors(poems) {
  if (!poems || poems.length === 0) {
    console.log('No poems to insert');
    return;
  }

  // First process all unique authors
  const authorNames = [...new Set(poems.map(p => p.author).filter(Boolean))];
  
  if (authorNames.length === 0) {
    console.log('No valid authors found in poems');
    return;
  }

  // Get existing authors
  const { data: existingAuthors, error: fetchError } = await supabase
    .from('authors')
    .select('id, name');

  if (fetchError) {
    throw fetchError;
  }

  const existingAuthorNames = existingAuthors?.map(a => a.name) || [];
  const newAuthors = authorNames
    .filter(name => name && !existingAuthorNames.includes(name))
    .map(name => ({ 
      name,
      bio: 'Classical poet',
      era: 'classical'
    }));

  // Insert new authors if any
  if (newAuthors.length > 0) {
    const { error: authorError } = await supabase
      .from('authors')
      .insert(newAuthors)
      .select();
    
    if (authorError) {
      throw authorError;
    }
  }

  // Get all authors again (including newly inserted ones)
  const { data: allAuthors, error: allAuthorsError } = await supabase
    .from('authors')
    .select('id, name');

  if (allAuthorsError) {
    throw allAuthorsError;
  }

  const authorMap = allAuthors.reduce((acc, author) => {
    acc[author.name] = author.id;
    return acc;
  }, {});

  // Prepare poems with author_id and required fields
  const poemsToInsert = poems.map(poem => {
    const authorId = authorMap[poem.author];
    if (!authorId) {
      console.warn(`No author ID found for ${poem.author}`);
      return null;
    }

    return {
      title: poem.title || 'Untitled',
      content: poem.content,
      author_id: authorId,
      style: poem.style || 'classic',
      language: poem.language || 'en',
      era: poem.era || 'classical',
      themes: poem.themes || ['literature'],
      form: poem.form || 'poem',
      source: poem.source || SOURCES.POETRYDB,
      source_url: poem.source_url || '',
      line_count: poem.line_count || 0,
      word_count: poem.word_count || 0,
      author: poem.author // Keeping this for reference
    };
  }).filter(Boolean);

  // Batch insert poems
  for (let i = 0; i < poemsToInsert.length; i += BATCH_SIZE) {
    const batch = poemsToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('poems')
      .insert(batch);
    
    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Inserted ${batch.length} poems (${i + batch.length}/${poemsToInsert.length})`);
    }
  }
}

async function main() {
  try {
    console.log('Starting poem population...');
    
    const poetryDBPoems = await fetchPoetryDB(MAX_POEMS);
    console.log(`Fetched ${poetryDBPoems.length} poems from PoetryDB`);
    
    await batchInsertWithAuthors(poetryDBPoems);
    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Population failed:', error);
  }
}

main();