export type PoemTemplate = {
  id: string;
  name: string;
  form: string;
  description: string;
  structure: string;
  scaffold: string;
  example: string;
  syllablePattern?: number[];
  lineCount?: number;
};

export const POEM_TEMPLATES: PoemTemplate[] = [
  {
    id: 'free-verse',
    name: 'Free Verse',
    form: 'Free Verse',
    description: 'No fixed rules — let images and rhythm guide you.',
    structure: 'Write freely across stanzas.',
    scaffold: '[Opening image]\n\n[Development]\n\n[Turn or insight]\n\n[Closing image]',
    example: 'The city hums beneath rain —\nstreetlights bloom like wet flowers.',
  },
  {
    id: 'haiku',
    name: 'Haiku',
    form: 'Haiku',
    description: 'Three lines: 5-7-5 syllables.',
    structure: 'Line 1: 5 syllables\nLine 2: 7 syllables\nLine 3: 5 syllables',
    scaffold: 'An old silent pond...\nA frog jumps into the pond—\nSplash! Silence again.',
    example: 'An old silent pond...\nA frog jumps into the pond—\nSplash! Silence again.',
    syllablePattern: [5, 7, 5],
    lineCount: 3,
  },
  {
    id: 'sonnet',
    name: 'Sonnet',
    form: 'Sonnet',
    description: '14 lines, often iambic pentameter, ABAB CDCD EFEF GG.',
    structure: 'Three quatrains + closing couplet',
    scaffold: 'When I consider how my light is spent,\nEre half my days, in this dark world and wide,\nAnd that one talent which is death to hide,\nLodged with me useless...\n\n[Continue through 14 lines]',
    example: 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate...',
    lineCount: 14,
  },
  {
    id: 'limerick',
    name: 'Limerick',
    form: 'Limerick',
    description: 'Five lines, AABBA rhyme scheme.',
    structure: 'Lines 1,2,5 rhyme; lines 3,4 rhyme',
    scaffold: 'There once was a poet from Kent\nWhose verses were slightly bent\nShe wrote every night\nBy pale candlelight\nAnd published before she repent',
    example: 'There once was a poet from Kent\nWhose verses were slightly bent...',
    lineCount: 5,
  },
  {
    id: 'ballad',
    name: 'Ballad',
    form: 'Ballad',
    description: 'Narrative poem, often quatrains with ABCB rhyme.',
    structure: 'Tell a story in 4-line stanzas',
    scaffold: 'It was in the month of June\nWhen roses were in bloom\nA wanderer came at noon\nAnd sang a mournful tune',
    example: 'It was in the month of June\nWhen roses were in bloom...',
  },
  {
    id: 'ode',
    name: 'Ode',
    form: 'Ode',
    description: 'Celebratory poem addressing a subject with elevated tone.',
    structure: 'Strophe, antistrophe, epode (or free stanzas)',
    scaffold: 'O subject of my praise,\nYour beauty fills these days —\n\n[Expand with vivid imagery]\n\n[Conclude with reflection]',
    example: 'O wild West Wind, thou breath of Autumn\'s being...',
  },
  {
    id: 'cinquain',
    name: 'Cinquain',
    form: 'Cinquain',
    description: 'Five lines: 2-4-6-8-2 syllables.',
    structure: '2 / 4 / 6 / 8 / 2 syllables',
    scaffold: 'Fog\nSoft gray veil\nBlankets the morning\nHushing the restless city\nStill',
    example: 'Fog\nSoft gray veil\nBlankets the morning\nHushing the restless city\nStill',
    syllablePattern: [2, 4, 6, 8, 2],
    lineCount: 5,
  },
  {
    id: 'tanka',
    name: 'Tanka',
    form: 'Tanka',
    description: 'Five lines: 5-7-5-7-7 syllables.',
    structure: '5 / 7 / 5 / 7 / 7 syllables',
    scaffold: 'On the mountain path\nCherry blossoms falling soft\nSpring wind carries them\nDown into the valley mist\nWhere memory waits for me',
    example: 'On the mountain path\nCherry blossoms falling soft...',
    syllablePattern: [5, 7, 5, 7, 7],
    lineCount: 5,
  },
  {
    id: 'villanelle',
    name: 'Villanelle',
    form: 'Villanelle',
    description: '19 lines with two refrains (A1 and A2).',
    structure: 'A1 b A2 / a b A1 / a b A2 / a b A1 / a b A2 / a b A1 A2',
    scaffold: 'Do not go gentle into that good night,\nOld age should burn and rave at close of day;\nRage, rage against the dying of the light.\n\n[Continue refrains...]',
    example: 'Do not go gentle into that good night...',
    lineCount: 19,
  },
  {
    id: 'acrostic',
    name: 'Acrostic',
    form: 'Acrostic',
    description: 'First letters of each line spell a word.',
    structure: 'Choose a word; each line starts with its letter',
    scaffold: 'Poetry opens\nOceans of feeling\nEvery line a breath\nTime bends to rhythm\nYearning made visible',
    example: 'Poetry opens\nOceans of feeling...',
  },
  {
    id: 'epic',
    name: 'Epic Fragment',
    form: 'Epic',
    description: 'Grand opening — invoke the muse, set the scene.',
    structure: 'Opening invocation + setting',
    scaffold: 'Sing, muse, of the poet who wandered far\nFrom home\'s warm hearth to stranger shores —\nWhere salt wind carved their every scar\nAnd stories bloomed behind closed doors.',
    example: 'Sing, muse, of the poet who wandered far...',
  },
  {
    id: 'lyric',
    name: 'Lyric',
    form: 'Lyric',
    description: 'Personal, musical poem expressing emotion.',
    structure: 'Short stanzas with strong rhythm',
    scaffold: 'My heart is a lantern\nSwinging in the dark —\nEach beat a small flame\nSearching for a spark',
    example: 'My heart is a lantern\nSwinging in the dark...',
  },
];

export const getTemplateById = (id: string) =>
  POEM_TEMPLATES.find((t) => t.id === id);

export const getTemplateByForm = (form: string) =>
  POEM_TEMPLATES.find((t) => t.form === form);
