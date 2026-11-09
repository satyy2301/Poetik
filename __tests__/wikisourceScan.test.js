const { poemsFromPage, assignShuklaPoems } = require('../scripts/sources/wikisourceScan');

test('assigns Shukla sample verses to the poet named in the heading', () => {
  const page = `{{larger|'''(३९) फतेह'''}}
{{Block center|<poem><small>बैरिन की बाहिनी को भीषन निदाघ-रवि,
दान-झरि सिंधुर है, जग को बसुंधर है॥</small></poem>}}
{{larger|'''(४०) नाथ (हरिनाथ)'''}}`;
  const parsed = assignShuklaPoems(page, '', {
    form: 'Free Verse',
    pageTitle: 'पृष्ठ:हिंदी साहित्य का इतिहास-रामचंद्र शुक्ल.pdf/३२०',
    host: 'https://hi.wikisource.org',
  });
  expect(parsed.poems).toHaveLength(1);
  expect(parsed.poems[0].author).toBe('फतेह');
  expect(parsed.poems[0].language).toBe('hi');
  expect(parsed.author).toBe('हरिनाथ');
});

const kabir = `
<noinclude><pagequality level="3" user="x" />{{rh|गुरुदेव को अंग]||[६९}}</noinclude>
{{larger|'''शब्दार्थ'''}}—भिद्या—भिदा
{{block center|<poem>{{larger|'''गूंगा हुवा बावला, बहरा हुआ कान।'''
'''पाऊँ मैं पंगुल भया, सतगुर मार्या बाण॥१०॥'''}}</poem>}}
`;

const ghalib = `
{{Header|title=دیوان غالب|author=مرزا اسد اللہ خان غالب}}
== 1۔ ==
نقش فریادی ہےکس کی شوخئ تحریر کا <br>
کاغذی ہے پیرہن ہر پیکرِ تصویر کا
== 2۔ ==
نہ تھا کچھ تو خدا تھا کچھ نہ ہوتا تو خدا ہوتا <br>
ڈوبویا مجھ کو ہونے نے نہ ہوتا میں تو کیا ہوتا
`;

test('splits a Kabir scan poem tag into one doha', () => {
  const poems = poemsFromPage(kabir, {
    host: 'https://hi.wikisource.org',
    author: 'Kabir',
    form: 'Free Verse',
  }, 'पृष्ठ:Kabir Granthavali.pdf/८०');
  expect(poems).toHaveLength(1);
  expect(poems[0].author).toBe('Kabir');
  expect(poems[0].language).toBe('hi');
  expect(poems[0].content).toContain('गूंगा हुवा बावला');
  expect(poems[0].content).not.toContain('शब्दार्थ');
  expect(poems[0].content).not.toContain('१०');
  expect(poems[0].source).toBe('wikisource');
});

test('splits a Ghalib divan page into ghazals', () => {
  const poems = poemsFromPage(ghalib, {
    host: 'https://ur.wikisource.org',
    author: 'Ghalib',
    form: 'Shayari',
    mode: 'ghazal',
  }, 'دیوان غالب/غزلیات/ردیف الف/ردیف الف غزل 1 تا 15');
  expect(poems).toHaveLength(2);
  expect(poems[0].language).toBe('ur');
  expect(poems[0].form).toBe('Shayari');
  expect(poems[0].content).toContain('نقش فریادی');
  expect(poems[1].title.length).toBeGreaterThan(4);
});

const rahim = `<noinclude><pagequality level="4" user="x" /></noinclude>
{{Block center|{{Smaller|रहिमन असमय के परे, हित अनहित ह्वै जाइ।<br>
बधिक-बानसों मृग बँध्यो, देतो रुधिर बताइ॥<br>
{{gap|16em}}रहीम}}}} भाव दोनों का स्पष्ट है।`;

test('reads a Rahim doha that is not inside a poem tag', () => {
  const poems = poemsFromPage(rahim, {
    host: 'https://hi.wikisource.org',
    author: 'Rahim',
    form: 'Free Verse',
  }, 'पृष्ठ:रहीम-कवितावली.djvu/४०');
  expect(poems).toHaveLength(1);
  expect(poems[0].author).toBe('Rahim');
  expect(poems[0].content).toContain('रहिमन असमय');
  expect(poems[0].content).not.toContain('स्पष्ट');
});

const licensed = `{{header
 | title = آؤ حسن یار کی باتیں کریں
 | author = چراغ حسن حسرت
}}
<poem>
آؤ حسن یار کی باتیں کریں
زلف کی رخسار کی باتیں کریں
</poem>
{{PD-India}}`;

const pakistanOnly = licensed.replace('{{PD-India}}', '{{PD-Pakistan}}');

test('keeps a licensed Urdu ghazal and its poet', () => {
  const poems = poemsFromPage(licensed, {
    host: 'https://ur.wikisource.org',
    form: 'Shayari',
    mode: 'catalog',
  }, 'آؤ حسن یار کی باتیں کریں');
  expect(poems).toHaveLength(1);
  expect(poems[0].author).toBe('چراغ حسن حسرت');
  expect(poems[0].language).toBe('ur');
});

test('skips Urdu pages that are not marked public domain for India', () => {
  const poems = poemsFromPage(pakistanOnly, {
    host: 'https://ur.wikisource.org',
    form: 'Shayari',
    mode: 'catalog',
  }, 'آؤ حسن یار کی باتیں کریں');
  expect(poems).toHaveLength(0);
});
