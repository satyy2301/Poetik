/**
 * Public-domain Hindi and Urdu verse from Wikisource proofread books.
 * Hindi lives in Page: scans (poem tags). Urdu ghazals are typed divan pages.
 */
const axios = require('axios');

const USER_AGENT = 'PoetikIngest/1.0 (educational public-domain reader; local)';
const KEEP_TEMPLATE = /^(larger|smaller|big|center|left|right|bold|poem|lang|nq|sup|sub|block center)$/i;
const PD_MARK = /\{\{PD-old\}\}|\{\{PD-India\}\}/i;
const KNOWN_HINDI_AUTHORS = {
  कबीर: 'Kabir',
  'कबीर साहब': 'Kabir',
  कबीरदास: 'Kabir',
  सूरदास: 'Surdas',
  सूर: 'Surdas',
  तुलसीदास: 'Tulsidas',
  तुलसी: 'Tulsidas',
  'गोस्वामी तुलसीदास': 'Tulsidas',
  रहीम: 'Rahim',
  बिहारी: 'Bihari',
  बिहारीलाल: 'Bihari',
  मीराबाई: 'Mirabai',
  मीरा: 'Mirabai',
};

function devanagariToInt(value) {
  const digits = String(value).replace(/[०-९]/g, (digit) => String('०१२३४५६७८९'.indexOf(digit)));
  const number = Number.parseInt(digits, 10);
  return Number.isFinite(number) ? number : 0;
}

function pageNumber(title) {
  return devanagariToInt(String(title).split('/').pop());
}

function hindiPoetName(raw) {
  const text = String(raw || '').replace(/\{\{[^}]*\}\}/g, '').replace(/'+/g, '').trim();
  const paren = text.match(/^([^()]{1,40})\(([^()]{1,40})\)$/);
  const name = (paren ? paren[2] : text).replace(/['’"]+$/g, '').replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 40) return '';
  if (/परिचय|शाखा|काल|ग्रंथ|सामान्य|कविता-कौमुदी|कौमुदी/.test(name)) return '';
  return KNOWN_HINDI_AUTHORS[name] || name;
}

const BOOKS = {
  hi: [
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'बिहारी-सतसई.djvu/', author: 'Bihari', form: 'Free Verse', limit: 160 },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'रहीम-कवितावली.djvu/', author: 'Rahim', form: 'Free Verse', limit: 120 },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'भ्रमरगीत-सार.djvu/', author: 'Surdas', form: 'Free Verse', limit: 160 },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'कवितावली.pdf/', author: 'Tulsidas', form: 'Free Verse', limit: 160 },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'रामचरितमानस.pdf/', author: 'Tulsidas', form: 'Free Verse', limit: 160 },
    {
      host: 'https://hi.wikisource.org',
      namespace: 250,
      prefix: 'हिंदी साहित्य का इतिहास-रामचंद्र शुक्ल.pdf/',
      mode: 'shukla',
      form: 'Free Verse',
      focus: 'authors',
      authorCap: 2,
      authorGoal: 55,
      startPage: 200,
      limit: 160,
    },
    {
      host: 'https://hi.wikisource.org',
      namespace: 250,
      prefix: 'कविता-कौमुदी 1.pdf/',
      mode: 'header',
      form: 'Free Verse',
      focus: 'authors',
      authorCap: 3,
      authorGoal: 55,
      limit: 180,
    },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'कवि-प्रिया.djvu/', author: 'केशवदास', form: 'Free Verse', focus: 'more', limit: 120 },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'देव-सुधा.djvu/', author: 'देव', form: 'Free Verse', focus: 'more', limit: 100 },
    { host: 'https://hi.wikisource.org', namespace: 250, prefix: 'जायसी ग्रंथावली.djvu/', author: 'जायसी', form: 'Free Verse', focus: 'more', limit: 140 },
    {
      host: 'https://hi.wikisource.org',
      namespace: 250,
      prefix: 'कविता-कौमुदी 1.pdf/',
      mode: 'header',
      form: 'Free Verse',
      focus: 'more',
      authorCap: 8,
      limit: 220,
    },
  ],
  ur: [
    {
      host: 'https://ur.wikisource.org',
      namespace: 0,
      mode: 'catalog',
      form: 'Shayari',
      authorCap: 8,
      limit: 360,
    },
  ],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function targetCount() {
  const raw = Number(process.env.INDIC_TARGET);
  return Number.isFinite(raw) && raw > 0 ? raw : 1100;
}

async function api(host, params) {
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await axios.get(`${host}/w/api.php`, {
        timeout: 35000,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        params: { format: 'json', formatversion: 2, ...params },
      });
      if (response.data?.error) {
        throw new Error(response.data.error.info || response.data.error.code);
      }
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      if (status && status !== 429 && status !== 503 && status < 500) throw error;
      const wait = (status === 429 ? 8000 : 2000) * attempt;
      console.warn(`Wikisource wait ${wait}ms (${attempt}/6): ${error.message}`);
      await sleep(wait);
    }
  }
  throw lastError;
}

function matchBraces(text, openAt) {
  let depth = 0;
  for (let i = openAt; i < text.length - 1; i += 1) {
    if (text[i] === '{' && text[i + 1] === '{') {
      depth += 1;
      i += 1;
    } else if (text[i] === '}' && text[i + 1] === '}') {
      depth -= 1;
      if (depth === 0) return i;
      i += 1;
    }
  }
  return -1;
}

function unwrapTemplates(text) {
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '{' && text[i + 1] === '{') {
      const close = matchBraces(text, i);
      if (close === -1) {
        out += text[i];
        continue;
      }
      const inner = text.slice(i + 2, close);
      const name = inner.split('|')[0].trim();
      if (KEEP_TEMPLATE.test(name)) {
        const body = inner.slice(inner.indexOf('|') + 1);
        out += unwrapTemplates(inner.includes('|') ? body : '');
      }
      i = close + 1;
      continue;
    }
    out += text[i];
  }
  return out;
}

function scriptChars(text, language) {
  const re = language === 'ur' ? /[\u0600-\u06FF]/g : /[\u0900-\u097F]/g;
  return (text.match(re) || []).length;
}

function cleanPiece(raw, language) {
  let text = unwrapTemplates(String(raw || ''));
  text = text.replace(/<noinclude>[\s\S]*?<\/noinclude>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2');
  text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
  text = text.replace(/'{2,}/g, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;|&#160;/g, ' ');
  text = text.replace(/॥\s*[०-९0-9]+\s*॥/g, '॥');
  text = text.replace(/[ \t]+\n/g, '\n');

  const lines = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line && !/^(शब्दार्थ|सन्दर्भ|व्याख्या|टिप्पणी|अर्थ|भावार्थ|नोट|अवतरण)[:：\-—]?/.test(line))
    .filter((line) => scriptChars(line, language) >= 4);

  if (lines.length === 1 && /[।]/.test(lines[0])) {
    const parts = lines[0].split(/।/).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return parts.slice(0, 2).map((part, index) => (index === 0 ? `${part}।` : part));
    }
  }
  return lines;
}

function verseTitle(lines) {
  const first = lines[0].replace(/[।॥]+$/g, '').trim();
  return first.slice(0, 90) || 'Untitled';
}

function poemFromLines(lines, { language, author, form, pageTitle, host, index }) {
  const maxLines = language === 'ur' ? 40 : 14;
  const clipped = lines.slice(0, maxLines);
  if (clipped.length < 2) return null;
  if (scriptChars(clipped.join(''), language) < 16) return null;
  const content = clipped.join('\n');
  if (content.length > 1800) return null;
  const slug = encodeURIComponent(pageTitle.replace(/ /g, '_'));
  return {
    title: verseTitle(clipped),
    author,
    content,
    language,
    era: 'classical',
    form,
    source: 'wikisource',
    source_url: `${host}/wiki/${slug}#v${index}`,
    line_count: clipped.length,
    word_count: content.split(/\s+/).filter(Boolean).length,
    themes: ['literature'],
    visibility: 'public',
  };
}

function poemsFromPoemTags(wikitext, meta) {
  const source = String(wikitext || '').replace(/<noinclude>[\s\S]*?<\/noinclude>/gi, '');
  const found = [];
  const re = /<poem\b[^>]*>([\s\S]*?)<\/poem>/gi;
  let match = re.exec(source);
  while (match) {
    const lines = cleanPiece(match[1], meta.language);
    const poem = poemFromLines(lines, { ...meta, index: found.length });
    if (poem) found.push(poem);
    match = re.exec(source);
  }
  return found;
}

function poemsFromGhazals(wikitext, meta) {
  const stripped = unwrapTemplates(String(wikitext || ''));
  const sections = stripped.split(/==+[^=]+==+/);
  const found = [];
  for (const section of sections) {
    const lines = cleanPiece(section, 'ur');
    const poem = poemFromLines(lines, { ...meta, language: 'ur', index: found.length });
    if (poem) found.push(poem);
  }
  return found;
}

function poemsFromDohas(wikitext, meta) {
  const lines = cleanPiece(wikitext, meta.language)
    .filter((line) => /[।॥]$/.test(line) && line.length >= 12 && line.length <= 110);
  const found = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const poem = poemFromLines([lines[i], lines[i + 1]], { ...meta, index: found.length });
    if (poem) found.push(poem);
  }
  return found;
}

function poemsFromLicensed(wikitext, meta) {
  if (!PD_MARK.test(wikitext)) return [];
  const author = (String(wikitext).match(/\|\s*author\s*=\s*([^\n|}]+)/i) || [])[1] || '';
  const name = author.replace(/\{\{[^}]*\}\}/g, '').trim();
  if (!name || name.length < 2 || name.length > 80) return [];
  return poemsFromPoemTags(wikitext, { ...meta, author: name, language: 'ur' });
}

function assignShuklaPoems(wikitext, carried, meta) {
  const source = String(wikitext || '');
  const re = /\{\{larger\|\s*'''\(([०-९0-9]+)\)\s*([^']+?)'''\s*\}\}/gi;
  const marks = [];
  let match = re.exec(source);
  while (match) {
    marks.push({
      index: match.index,
      end: match.index + match[0].length,
      name: hindiPoetName(match[2]),
    });
    match = re.exec(source);
  }
  const chunks = marks.length === 0
    ? [{ name: '', body: source }]
    : [
      { name: '', body: source.slice(0, marks[0].index) },
      ...marks.map((mark, index) => ({
        name: mark.name,
        body: source.slice(mark.end, marks[index + 1] ? marks[index + 1].index : source.length),
      })),
    ];
  let author = carried || '';
  const poems = [];
  for (const chunk of chunks) {
    if (chunk.name) author = chunk.name;
    if (!author) continue;
    poems.push(...poemsFromPoemTags(chunk.body, { ...meta, author, language: 'hi' }));
  }
  return { author, poems };
}

function poemsFromPage(wikitext, book, pageTitle) {
  const meta = {
    language: book.mode === 'ghazal' || book.mode === 'catalog' ? 'ur' : 'hi',
    author: book.author,
    form: book.form,
    pageTitle,
    host: book.host,
  };
  if (book.mode === 'catalog') return poemsFromLicensed(wikitext, meta);
  if (book.mode === 'ghazal') return poemsFromGhazals(wikitext, meta);
  if (book.mode === 'shukla') return assignShuklaPoems(wikitext, '', meta).poems;
  if (/pagequality level="1"/.test(wikitext)) return [];
  if (book.mode === 'header') {
    const author = hindiPoetName((String(wikitext).slice(0, 500).match(/<u>([^<]+)<\/u>/i) || [])[1]);
    if (!author) return [];
    const tagged = poemsFromPoemTags(wikitext, { ...meta, author });
    if (tagged.length > 0) return tagged;
    return poemsFromDohas(wikitext, { ...meta, author });
  }
  const tagged = poemsFromPoemTags(wikitext, meta);
  if (tagged.length > 0) return tagged;
  return poemsFromDohas(wikitext, meta);
}

async function listTitles(book) {
  const titles = [];
  let cont = {};
  for (let guard = 0; guard < 40; guard += 1) {
    const data = await api(book.host, {
      action: 'query',
      list: 'allpages',
      apprefix: book.prefix,
      apnamespace: book.namespace,
      aplimit: 500,
      ...cont,
    });
    for (const page of data.query?.allpages || []) {
      if (/کتابیات|فہرست|اشاریہ|مقدمہ|دیباچہ/.test(page.title)) continue;
      titles.push(page.title);
    }
    if (!data.continue) break;
    cont = data.continue;
    await sleep(900);
  }
  return titles;
}

async function fetchBatch(book, titles) {
  const data = await api(book.host, {
    action: 'query',
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    titles: titles.join('|'),
  });
  const pages = data.query?.pages || [];
  const byTitle = new Map();
  for (const page of pages) {
    const text = page.revisions?.[0]?.slots?.main?.content || '';
    if (page.title && text) byTitle.set(page.title, text);
  }
  return byTitle;
}

function rememberPoem(poem, book, seen, perAuthor) {
  const key = poem.content.replace(/\s+/g, '');
  if (seen.has(key)) return false;
  const cap = book.authorCap || 0;
  if (cap > 0) {
    const used = perAuthor.get(poem.author) || 0;
    if (used >= cap) return false;
    perAuthor.set(poem.author, used + 1);
  }
  seen.add(key);
  return true;
}

async function consumeTitles(book, titles, state) {
  const batch = [];
  const bodies = await fetchBatch(book, titles);
  for (const title of titles) {
    if (state.bookCount >= (book.limit || Infinity)) break;
    if (state.collected.length >= state.goal) break;
    const text = bodies.get(title);
    if (!text) continue;
    for (const poem of poemsFromPage(text, book, title)) {
      if (!rememberPoem(poem, book, state.seen, state.perAuthor)) continue;
      batch.push(poem);
      state.collected.push(poem);
      state.bookCount += 1;
      state.authors.add(poem.author);
      if (state.bookCount >= (book.limit || Infinity) || state.collected.length >= state.goal) break;
    }
  }
  if (state.onPoems && batch.length > 0) await state.onPoems(batch);
  return batch.length;
}

function authorGoalReached(book, state) {
  return Boolean(book.authorGoal) && state.authors.size >= book.authorGoal;
}

async function scanShukla(book, state) {
  const titles = (await listTitles(book))
    .filter((title) => pageNumber(title) >= (book.startPage || 1))
    .sort((a, b) => pageNumber(a) - pageNumber(b));
  console.log(`Wikisource Shukla: ${titles.length} pages from ${book.startPage || 1}`);
  let carried = '';
  for (let i = 0; i < titles.length; i += 6) {
    if (authorGoalReached(book, state) || state.bookCount >= (book.limit || Infinity)) break;
    const slice = titles.slice(i, i + 6);
    try {
      const bodies = await fetchBatch(book, slice);
      const batch = [];
      for (const title of [...slice].sort((a, b) => pageNumber(a) - pageNumber(b))) {
        const text = bodies.get(title);
        if (!text || /pagequality level="1"/.test(text)) continue;
        const parsed = assignShuklaPoems(text, carried, {
          language: 'hi',
          form: book.form,
          pageTitle: title,
          host: book.host,
        });
        carried = parsed.author || carried;
        for (const poem of parsed.poems) {
          if (!rememberPoem(poem, book, state.seen, state.perAuthor)) continue;
          batch.push(poem);
          state.collected.push(poem);
          state.bookCount += 1;
          state.authors.add(poem.author);
          if (authorGoalReached(book, state) || state.bookCount >= (book.limit || Infinity)) break;
        }
      }
      if (state.onPoems && batch.length > 0) await state.onPoems(batch);
    } catch (error) {
      console.warn(`Wikisource batch skipped: ${error.message}`);
    }
    if ((i / 6) % 8 === 0) {
      console.log(`Wikisource Shukla ${state.authors.size} authors, ${state.bookCount} poems`);
    }
    await sleep(1500);
  }
}

async function scanListedBook(book, state) {
  const titles = await listTitles(book);
  console.log(`Wikisource ${book.author}: ${titles.length} pages`);
  for (let i = 0; i < titles.length; i += 6) {
    if (authorGoalReached(book, state) || state.collected.length >= state.goal || state.bookCount >= (book.limit || Infinity)) break;
    try {
      await consumeTitles(book, titles.slice(i, i + 6), state);
    } catch (error) {
      console.warn(`Wikisource batch skipped: ${error.message}`);
    }
    if ((i / 6) % 8 === 0) console.log(`Wikisource parsed ${state.collected.length} poems`);
    await sleep(1500);
  }
}

async function scanCatalog(book, state) {
  let cont = { apfrom: 'آ' };
  let guard = 0;
  console.log('Wikisource Urdu catalog: public-domain ghazals by many poets');
  while (guard < 80 && state.collected.length < state.goal && state.bookCount < (book.limit || Infinity)) {
    const data = await api(book.host, {
      action: 'query',
      list: 'allpages',
      apnamespace: 0,
      aplimit: 40,
      ...cont,
    });
    const titles = (data.query?.allpages || [])
      .map((page) => page.title)
      .filter((title) => title && !title.includes('/') && !/سور|خطبہ|Treaty|قرآن|دیوان غالب/.test(title));
    for (let i = 0; i < titles.length; i += 5) {
      if (state.collected.length >= state.goal || state.bookCount >= (book.limit || Infinity)) break;
      try {
        await consumeTitles(book, titles.slice(i, i + 5), state);
      } catch (error) {
        console.warn(`Wikisource batch skipped: ${error.message}`);
      }
      await sleep(1500);
    }
    console.log(`Wikisource Urdu parsed ${state.collected.length} poems`);
    if (!data.continue) break;
    cont = data.continue;
    guard += 1;
  }
}

async function fetchScannedVerse(language, { onPoems } = {}) {
  const focus = process.env.INDIC_FOCUS || '';
  const books = (BOOKS[language] || []).filter((book) => (book.focus || '') === focus);
  const state = {
    seen: new Set(),
    perAuthor: new Map(),
    authors: new Set(),
    collected: [],
    bookCount: 0,
    goal: language === 'hi' ? targetCount() : 360,
    onPoems,
  };

  for (const book of books) {
    if (state.collected.length >= state.goal || authorGoalReached(book, state)) break;
    state.bookCount = 0;
    try {
      if (book.mode === 'catalog') await scanCatalog(book, state);
      else if (book.mode === 'shukla') await scanShukla(book, state);
      else await scanListedBook(book, state);
    } catch (error) {
      console.warn(`Wikisource book failed ${book.prefix || book.mode}: ${error.message}`);
    }
    console.log(`Wikisource kept ${state.bookCount} from ${book.author || book.mode}; authors ${state.authors.size}`);
  }

  console.log(`Wikisource scan ${language}: ${state.collected.length} poems, ${state.authors.size} authors`);
  return state.collected;
}

module.exports = {
  fetchScannedVerse,
  poemsFromPage,
  assignShuklaPoems,
  hindiPoetName,
};
