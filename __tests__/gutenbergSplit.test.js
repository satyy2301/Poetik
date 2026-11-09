const {
  formatAuthor,
  splitGutenbergPoems,
  shouldSkipBook,
  plainTextUrl,
  stripGutenbergBoilerplate,
} = require('../scripts/sources/gutenbergSplit');

const BOOK = {
  id: 1065,
  title: 'Sample Poems',
  author: 'Jane Poet',
  era: 'victorian',
};

function wrap(body) {
  return `
*** START OF THE PROJECT GUTENBERG EBOOK SAMPLE POEMS ***
${body}
*** END OF THE PROJECT GUTENBERG EBOOK SAMPLE POEMS ***
License boilerplate must stay out of the poem.
`;
}

describe('gutenberg poem splitting', () => {
  it('formats Gutenberg author names', () => {
    expect(formatAuthor('Dickinson, Emily')).toBe('Emily Dickinson');
    expect(formatAuthor('Gordon, Adam Lindsay')).toBe('Adam Lindsay Gordon');
    expect(formatAuthor('William Blake')).toBe('William Blake');
  });

  it('drops the Gutenberg header and footer', () => {
    const lines = stripGutenbergBoilerplate(wrap('A line of verse'));
    expect(lines.join('\n')).not.toMatch(/PROJECT GUTENBERG/);
    expect(lines.join('\n')).not.toMatch(/License boilerplate/);
    expect(lines.join('\n')).toMatch(/A line of verse/);
  });

  it('splits all-caps titles into separate poems and skips contents', () => {
    const poems = splitGutenbergPoems(
      wrap(`
CONTENTS

THE RAVEN .......... 1

THE RAVEN

Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore,
While I nodded, nearly napping, suddenly there came a tapping.

OZYMANDIAS

I met a traveller from an antique land,
Who said two vast and trunkless legs of stone
Stand in the desert near a shattered visage.
`),
      BOOK,
    );

    expect(poems.map((poem) => poem.title)).toEqual(['THE RAVEN', 'OZYMANDIAS']);
    expect(poems[0].content).toMatch(/midnight dreary/);
    expect(poems[0].content).not.toMatch(/antique land/);
    expect(poems[0].source).toBe('gutenberg');
    expect(poems[0].source_url).toBe('https://www.gutenberg.org/ebooks/1065#the-raven');
    expect(poems[1].line_count).toBe(3);
  });

  it('keeps a single-letter verse line and numbers sonnets', () => {
    const lines = Array.from({ length: 14 }, (_, index) => `Line ${index + 1} of the sonnet stays.`);
    const poems = splitGutenbergPoems(
      wrap(`
THE SONNETS

                    1

${lines.join('\n')}

A WALK

I
went down to the river today
and stayed until the lights came on
`),
      BOOK,
    );

    expect(poems.map((poem) => poem.title)).toEqual(['Sonnet 1', 'A WALK']);
    expect(poems[0].form).toBe('Sonnet');
    expect(poems[1].content).toMatch(/^I\nwent down/m);
  });

  it('keeps a short book with no internal titles as one poem', () => {
    const poems = splitGutenbergPoems(
      wrap(`
So we'll go no more a roving
So late into the night,
Though the heart be still as loving,
And the moon be still as bright.
`),
      { ...BOOK, title: 'So we will go no more a roving' },
    );
    expect(poems).toHaveLength(1);
    expect(poems[0].title).toBe('So we will go no more a roving');
  });

  it('splits a long poem-cycle on canto headings', () => {
    const stanza = 'In the midway of this our mortal life,\nI found me in a gloomy wood, astray,\nGone from the path direct.';
    const poems = splitGutenbergPoems(
      wrap(`
HELL

CANTO I

${stanza}

CANTO II

${stanza}
And still the verse continues here.
`),
      { ...BOOK, id: 8800, title: 'The Divine Comedy' },
    );
    expect(poems.map((poem) => poem.title)).toEqual(['HELL — CANTO I', 'HELL — CANTO II']);
  });

  it('skips plays and books that are not public domain', () => {
    expect(shouldSkipBook({ copyright: false, title: 'The Complete Works of William Shakespeare', subjects: ['English drama'] })).toBe(true);
    expect(shouldSkipBook({ copyright: false, title: 'Poems', subjects: ['English poetry'] })).toBe(false);
    expect(shouldSkipBook({ copyright: false, title: 'The Odyssey, rendered into English prose', subjects: ['Poetry'] })).toBe(true);
    expect(shouldSkipBook({ copyright: null, title: 'Poems', subjects: ['Poetry'] })).toBe(true);
    expect(plainTextUrl({ 'text/html': 'https://example.com/a.html', 'text/plain; charset=utf-8': 'https://example.com/a.txt' })).toBe('https://example.com/a.txt');
  });
});
