import createOpenAIClient from '../lib/openai';

export type AITemplate =
  | 'suggest'
  | 'continue'
  | 'shorten'
  | 'tone'
  | 'expand'
  | 'rhyme'
  | 'imagery'
  | 'rewrite_style'
  | 'grammar'
  | 'explain_line';

export type AIRequestOptions = {
  apiKey: string;
  template: AITemplate;
  title: string;
  content: string;
  temperature?: number;
  maxTokens?: number;
  styleOf?: string;
  selectedLine?: string;
};

const buildPrompt = (opts: AIRequestOptions): string => {
  const { template, title, content, styleOf, selectedLine } = opts;

  switch (template) {
    case 'continue':
      return `Continue and finish this poem in its current tone and style. Return a single poem text.\n\nTitle: ${title}\nContent: ${content}`;
    case 'shorten':
      return `Shorten the following poem while preserving meaning. Return up to 3 concise versions as a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
    case 'tone':
      return `Rewrite the poem in 3 different tones (solemn, joyful, ironic). Return a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
    case 'expand':
      return `Expand this poem with richer imagery and detail. Return up to 3 expanded versions as a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
    case 'rhyme':
      return `Suggest up to 5 rhyming improvements or alternate lines for this poem. Return a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
    case 'imagery':
      return `Enhance the sensory imagery in this poem. Return up to 5 improved versions as a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
    case 'rewrite_style':
      return `Rewrite this poem in the style of ${styleOf || 'Emily Dickinson'}. Return a JSON array with 2 versions.\n\nTitle: ${title}\nContent: ${content}`;
    case 'grammar':
      return `Check grammar and style of this poem. Return a JSON object: { "corrected": "full corrected poem", "notes": ["issue 1", "issue 2"] }\n\nTitle: ${title}\nContent: ${content}`;
    case 'explain_line':
      return `Explain the meaning, imagery, and literary devices in this line from a poem. Be concise (2-4 sentences).\n\nPoem title: ${title}\nLine: ${selectedLine || content.split('\n')[0]}`;
    case 'suggest':
    default:
      return `Suggest up to 5 concise alternate versions or improvements for this poem. Return a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
  }
};

export const requestAIWriting = async (opts: AIRequestOptions): Promise<string[]> => {
  const client = createOpenAIClient(opts.apiKey);
  const prompt = buildPrompt(opts);

  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: prompt,
    max_tokens: Math.min(2000, opts.maxTokens ?? 400),
    temperature: Math.max(0, Math.min(1, opts.temperature ?? 0.8)),
  });

  const text =
    response.output_text ||
    (response as any).output?.[0]?.content?.[0]?.text ||
    '';

  if (opts.template === 'grammar') {
    try {
      const parsed = JSON.parse(text);
      const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
      const corrected = parsed.corrected ? [String(parsed.corrected)] : [];
      return [...corrected, ...notes.map((n: string) => `Note: ${n}`)];
    } catch {
      return [text];
    }
  }

  if (opts.template === 'explain_line') {
    return [text.trim()];
  }

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(String).slice(0, 10);
  } catch {
    // fall through
  }

  return text
    .split(/\n\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
};

export const AI_TEMPLATES: { key: AITemplate; label: string }[] = [
  { key: 'suggest', label: 'Suggest' },
  { key: 'continue', label: 'Continue' },
  { key: 'expand', label: 'Expand' },
  { key: 'rhyme', label: 'Rhyme' },
  { key: 'imagery', label: 'Imagery' },
  { key: 'shorten', label: 'Shorten' },
  { key: 'tone', label: 'Tone' },
  { key: 'rewrite_style', label: 'Style' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'explain_line', label: 'Explain' },
];
