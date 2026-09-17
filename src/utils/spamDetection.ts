const SPAM_PATTERNS = [
  /(.)\1{8,}/i,
  /(https?:\/\/[^\s]+){3,}/i,
  /\b(buy now|click here|free money|crypto giveaway)\b/i,
];

const DUPLICATE_LINE_THRESHOLD = 0.6;

export type SpamCheckResult = {
  isSpam: boolean;
  reasons: string[];
};

export const detectSpam = (text: string): SpamCheckResult => {
  const reasons: string[] = [];
  const trimmed = text.trim();

  if (trimmed.length < 10) {
    reasons.push('Content too short');
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      reasons.push('Matches spam pattern');
      break;
    }
  }

  const lines = trimmed.split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);
  if (lines.length >= 3) {
    const unique = new Set(lines);
    const duplicateRatio = 1 - unique.size / lines.length;
    if (duplicateRatio >= DUPLICATE_LINE_THRESHOLD) {
      reasons.push('Too many duplicate lines');
    }
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const capsRatio = (trimmed.match(/[A-Z]/g)?.length || 0) / Math.max(trimmed.length, 1);
  if (wordCount > 5 && capsRatio > 0.7) {
    reasons.push('Excessive capitalization');
  }

  return { isSpam: reasons.length > 0, reasons };
};
