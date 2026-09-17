import { PoemTemplate } from '../data/poemTemplates';

const VOWELS = 'aeiouy';

export const countSyllablesInWord = (word: string): number => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  let count = 0;
  let prevVowel = false;
  for (const char of cleaned) {
    const isVowel = VOWELS.includes(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (cleaned.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
};

export const countSyllables = (text: string): number => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.reduce((sum, word) => sum + countSyllablesInWord(word), 0);
};

export const countWords = (text: string): number =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

export const estimateReadingTime = (text: string): number => {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 150));
};

export const getLineSyllables = (text: string): number[] =>
  text.split('\n').map((line) => countSyllables(line));

export type ValidationResult = {
  valid: boolean;
  message: string;
  hints: string[];
};

export const validateForm = (content: string, template?: PoemTemplate): ValidationResult => {
  if (!template) {
    return { valid: true, message: 'Free form', hints: [] };
  }

  const lines = content.split('\n').filter((l) => l.trim());
  const hints: string[] = [];

  if (template.syllablePattern) {
    const lineSyllables = getLineSyllables(content);
    template.syllablePattern.forEach((expected, i) => {
      const actual = lineSyllables[i] || 0;
      if (actual > 0 && Math.abs(actual - expected) > 1) {
        hints.push(`Line ${i + 1}: ~${actual} syllables (target ${expected})`);
      }
    });
    const allMatch = template.syllablePattern.every((expected, i) => {
      const actual = lineSyllables[i] || 0;
      return actual === 0 || Math.abs(actual - expected) <= 1;
    });
    return {
      valid: allMatch || lines.length === 0,
      message: allMatch ? `${template.name} structure looks good` : 'Syllable pattern needs adjustment',
      hints,
    };
  }

  if (template.lineCount) {
    if (lines.length > 0 && lines.length < template.lineCount) {
      hints.push(`${template.lineCount - lines.length} more line(s) for a full ${template.name}`);
    }
    if (lines.length > template.lineCount) {
      hints.push(`${lines.length - template.lineCount} extra line(s)`);
    }
    return {
      valid: lines.length === 0 || lines.length === template.lineCount,
      message: lines.length === template.lineCount
        ? `${template.name} line count matches`
        : `Target: ${template.lineCount} lines`,
      hints,
    };
  }

  return {
    valid: true,
    message: template.structure,
    hints: [template.structure],
  };
};

const COMMON_MISSPELLINGS: Record<string, string> = {
  teh: 'the',
  recieve: 'receive',
  beleive: 'believe',
  occured: 'occurred',
  seperate: 'separate',
  definately: 'definitely',
  acheive: 'achieve',
  wierd: 'weird',
  thier: 'their',
  freind: 'friend',
};

export const findMisspellings = (text: string): { word: string; suggestion: string; index: number }[] => {
  const results: { word: string; suggestion: string; index: number }[] = [];
  const regex = /\b[a-zA-Z]+\b/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lower = match[0].toLowerCase();
    if (COMMON_MISSPELLINGS[lower]) {
      results.push({
        word: match[0],
        suggestion: COMMON_MISSPELLINGS[lower],
        index: match.index,
      });
    }
  }
  return results.slice(0, 5);
};
