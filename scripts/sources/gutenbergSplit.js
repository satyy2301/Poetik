/**
 * Pure parsing for Project Gutenberg poetry texts.
 * Catalog fetch lives in gutenberg.js.
 */

const SKIP_HEADING = /^(contents|content|index|preface|introduction|introductory|foreword|note|notes|illustration|illustrations|dedication|glossary|appendix|bibliography|footnotes?|the end|end|project gutenberg|produced by|transcriber'?s notes?|errata|advertisement|by the same author|list of illustrations|table of contents|epilogue|prologue)$/i;

const START_RE = /^\*\*\*\s*START OF (?:THE |THIS )?PROJECT GUTENBERG EBOOK\b/i;
const END_RE = /^\*\*\*\s*END OF (?:THE |THIS )?PROJECT GUTENBERG EBOOK\b/i;

function formatAuthor(name) {
  if (!name || typeof name !== 'string') return 'Unknown';
  const trimmed = name.trim();
  const match = trimmed.match(/^([^,]+),\s*(.+)$/);
  if (!match) return trimmed;
  const rest = match[2].trim();
  if (/^(jr|sr|ii|iii|iv|esq)\.?$/i.test(rest)) return trimmed;
  return `${rest} ${match[1].trim()}`.replace(/\s+/g, ' ');
}

function eraFromDeathYear(year) {
  if (!year || !Number.isFinite(year)) return 'classical';
  if (year < 1500) return 'medieval';
  if (year < 1660) return 'renaissance';
  if (year < 1790) return 'enlightenment';
  if (year < 1850) return 'romantic';
  if (year < 1914) return 'victorian';
  return 'modern';
}

function inferForm(lineCount) {
  if (lineCount === 14) return 'Sonnet';
  if (lineCount === 3) return 'Haiku';
  return 'Free Verse';
}

function normalizeHeading(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isAllCapsHeading(raw) {
  const trimmed = raw.trim();
  if (trimmed.length < 2 || trimmed.length > 70) return false;
  const letters = trimmed.replace(/[^A-Za-z]/g, '');
  if (letters.length < 2 || letters !== letters.toUpperCase()) return false;
  if (/[,:;]$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 10) return false;
  return true;
}

function isNumberHeading(raw) {
  const trimmed = raw.trim();
  if (!/^(?:[IVXLCDM]{1,7}|\d{1,4})[.)]?$/.test(trimmed)) return false;
  // A bare "I" is a line of verse. Indented or punctuated numerals are headings.
  if (/^[IVX]$/.test(trimmed) && !/^\s{2,}/.test(raw)) return false;
  return true;
}

function isHeading(raw) {
  return isAllCapsHeading(raw) || isNumberHeading(raw);
}

function stripGutenbergBoilerplate(text) {
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/);
  let start = lines.findIndex((line) => START_RE.test(line.trim()));
  let end = lines.findIndex((line) => END_RE.test(line.trim()));
  if (start === -1) start = 0;
  else start += 1;
  if (end === -1 || end < start) end = lines.length;
  return lines.slice(start, end);
}

function nonEmptyLines(lines) {
  return lines.map((line) => line.trim()).filter(Boolean);
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function looksLikeProse(lines) {
  const content = nonEmptyLines(lines);
  if (content.length < 4) return false;
  return median(content.map((line) => line.length)) > 90;
}

function looksLikeContents(lines) {
  const content = nonEmptyLines(lines);
  if (content.length < 8) return false;
  const dotted = content.filter((line) => /\.{3,}|\s{2,}\d+\s*$/.test(line)).length;
  return dotted / content.length > 0.4;
}

function headingNumber(heading) {
  const match = String(heading || '').trim().match(/^([IVXLCDM]+|\d+)[.)]?$/i);
  return match ? match[1] : null;
}

function shouldSkipBook(book) {
  if (!book || book.copyright !== false) return true;
  const title = book.title || '';
  const subjects = (book.subjects || []).join(' ').toLowerCase();
  if (/\bprose\b/i.test(title)) return true;
  const poetryTitle = /\b(poems?|poetry|sonnets?|verses?|ballads?|lyrics?)\b/i.test(title);
  if (/\b(plays|dramas?|dramatic works|tragedies|comedies)\b/i.test(title) && !poetryTitle) return true;
  if (/complete works/i.test(title) && !poetryTitle) return true;
  const poetrySubject = /\b(poetry|poems|sonnets|verse|ballads)\b/.test(subjects);
  if (/\b(drama|plays|fiction|novels)\b/.test(subjects) && !poetrySubject) return true;
  return false;
}

function plainTextUrl(formats) {
  const entries = Object.entries(formats || {});
  const rank = (key) => {
    const lower = key.toLowerCase();
    if (lower.startsWith('text/plain; charset=utf-8')) return 0;
    if (lower === 'text/plain') return 1;
    if (lower.startsWith('text/plain')) return 2;
    return 9;
  };
  const match = entries
    .filter(([key, url]) => rank(key) < 9 && typeof url === 'string' && !url.endsWith('.zip'))
    .sort((a, b) => rank(a[0]) - rank(b[0]))[0];
  return match ? match[1] : null;
}

function slugTitle(title) {
  const latin = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  if (latin) return latin;
  let hash = 0;
  const value = String(title || '');
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return `poem-${hash.toString(36)}`;
}

function poemRecord({ title, content, author, book, era, form, minLines = 3 }) {
  const trimmedTitle = String(title || '').replace(/\s+/g, ' ').trim().slice(0, 500);
  const body = content.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const contentLines = nonEmptyLines(body.split('\n'));
  if (!trimmedTitle || contentLines.length < minLines || contentLines.length > 250) return null;
  if (looksLikeProse(body.split('\n')) || looksLikeContents(body.split('\n'))) return null;

  const authorName = formatAuthor(author);
  const lineCount = contentLines.length;
  const shayari = isShayariBook(book);
  return {
    title: trimmedTitle,
    author: authorName,
    content: body,
    language: book.language || 'en',
    era: era || 'classical',
    form: form || (shayari ? 'Shayari' : inferForm(lineCount)),
    source: 'gutenberg',
    source_url: `https://www.gutenberg.org/ebooks/${book.id}#${slugTitle(trimmedTitle)}`,
    line_count: lineCount,
    word_count: body.split(/\s+/).filter(Boolean).length,
    themes: ['literature'],
    visibility: 'public',
    birth_year: book.birthYear || null,
    death_year: book.deathYear || null,
  };
}

function isShayariBook(book) {
  const blob = `${book?.title || ''} ${(book?.subjects || []).join(' ')}`;
  return /shayari|ghazal|\bsher\b|nazm|शायरी|ग़ज़ल|गजल|नज़्म|غزل|نظم/i.test(blob);
}

function isMostlyNonLatin(text) {
  const sample = String(text || '').slice(0, 8000);
  const letters = sample.match(/[A-Za-z\u0900-\u097F\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || [];
  if (letters.length < 40) return false;
  const latin = letters.filter((ch) => /[A-Za-z]/.test(ch)).length;
  return latin / letters.length < 0.45;
}

function uniquePoemUrls(poems) {
  const seen = new Map();
  return poems.map((poem) => {
    const count = seen.get(poem.source_url) || 0;
    seen.set(poem.source_url, count + 1);
    if (count === 0) return poem;
    return { ...poem, source_url: `${poem.source_url}-${count + 1}` };
  });
}

function splitNonLatinPoems(text, book) {
  const lines = stripGutenbergBoilerplate(text);
  const blocks = [];
  let current = [];
  const push = () => {
    if (current.some((line) => line.trim())) blocks.push(current);
    current = [];
  };
  for (const line of lines) {
    if (!line.trim()) push();
    else current.push(line);
  }
  push();

  const poems = [];
  let untitled = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    const blockLines = nonEmptyLines(blocks[i]);
    if (blockLines.length === 0) continue;
    const nextLines = blocks[i + 1] ? nonEmptyLines(blocks[i + 1]) : [];
    const titled = blockLines.length === 1
      && blockLines[0].length <= 48
      && nextLines.length >= 2
      && !SKIP_HEADING.test(blockLines[0]);
    const title = titled ? blockLines[0] : `${book.title} ${untitled + 1}`;
    const contentLines = titled ? blocks[i + 1] : blocks[i];
    if (titled) i += 1;
    else untitled += 1;
    const record = poemRecord({
      title,
      content: contentLines.join('\n'),
      author: book.author,
      book,
      era: book.era,
      minLines: 2,
    });
    if (record) poems.push(record);
  }
  return uniquePoemUrls(poems);
}

function splitGutenbergPoems(text, book) {
  if (isMostlyNonLatin(text)) return splitNonLatinPoems(text, book);
  const lines = stripGutenbergBoilerplate(text);
  if (lines.length === 0) return [];

  const bookTitleKey = normalizeHeading(book.title);
  const sections = [];
  let heading = null;
  let sonnetMode = false;
  let partLabel = null;
  let buffer = [];

  const flush = () => {
    sections.push({ heading, sonnetMode, partLabel, lines: buffer });
    buffer = [];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (/^\*\*\*/.test(trimmed)) continue;
    if (isHeading(raw)) {
      if (bookTitleKey && normalizeHeading(trimmed) === bookTitleKey) continue;
      flush();
      heading = trimmed.replace(/\.$/, '');
      if (isAllCapsHeading(raw)) {
        sonnetMode = /SONNET/.test(heading.toUpperCase());
        if (/^(hell|purgatory|paradise|inferno|purgatorio|paradiso)$/i.test(heading)) {
          partLabel = heading;
        }
      }
      continue;
    }
    buffer.push(raw);
  }
  flush();

  const poems = [];
  let pending = null;

  const emit = (section) => {
    if (!section.heading || SKIP_HEADING.test(section.heading)) return;
    const number = headingNumber(section.heading);
    const contentLines = nonEmptyLines(section.lines);
    if (number && contentLines.length < 8 && pending) {
      pending.lines = pending.lines.concat([''], section.lines);
      return;
    }
    if (pending) {
      const record = poemRecord({
        title: pending.title,
        content: pending.lines.join('\n'),
        author: book.author,
        book,
        era: book.era,
      });
      if (record) poems.push(record);
    }
    let title = number
      ? `${section.sonnetMode ? 'Sonnet' : 'Poem'} ${number}`
      : section.heading;
    if (section.partLabel && /^canto\b/i.test(section.heading)) {
      title = `${section.partLabel} — ${section.heading}`;
    }
    pending = { title, lines: section.lines.slice() };
  };

  for (const section of sections) emit(section);
  if (pending) {
    const record = poemRecord({
      title: pending.title,
      content: pending.lines.join('\n'),
      author: book.author,
      book,
      era: book.era,
    });
    if (record) poems.push(record);
  }

  if (poems.length === 0) {
    const fallback = poemRecord({
      title: book.title,
      content: lines.join('\n'),
      author: book.author,
      book,
      era: book.era,
    });
    if (fallback) poems.push(fallback);
  }

  return uniquePoemUrls(poems);
}

module.exports = {
  formatAuthor,
  eraFromDeathYear,
  stripGutenbergBoilerplate,
  splitGutenbergPoems,
  shouldSkipBook,
  plainTextUrl,
};
