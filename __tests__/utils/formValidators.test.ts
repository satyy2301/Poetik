import {
  countSyllables,
  countWords,
  estimateReadingTime,
  findMisspellings,
  validateForm,
} from '../../src/utils/formValidators';

describe('formValidators', () => {
  it('counts words', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('')).toBe(0);
  });

  it('estimates reading time', () => {
    expect(estimateReadingTime('one two three')).toBe(1);
  });

  it('counts syllables approximately', () => {
    expect(countSyllables('hello')).toBeGreaterThan(0);
  });

  it('finds common misspellings', () => {
    const results = findMisspellings('I recieve teh gift');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.suggestion === 'receive')).toBe(true);
  });

  it('validates free form without template', () => {
    const result = validateForm('any content');
    expect(result.valid).toBe(true);
  });

  it('validates line count templates', () => {
    const result = validateForm('line one\nline two', {
      id: 'haiku',
      name: 'Haiku',
      form: 'Haiku',
      description: 'Three lines',
      structure: '3 lines',
      scaffold: 'line one\nline two\nline three',
      example: 'An old pond...',
      lineCount: 3,
    });
    expect(result.valid).toBe(false);
    expect(result.hints.length).toBeGreaterThan(0);
  });
});
