const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const decodeHtml = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const formatInline = (value: string) => {
  let text = escapeHtml(value);
  text = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
  text = text.replace(/\+\+([^+]+)\+\+/g, '<u>$1</u>');
  text = text.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
};

export const markdownToHtml = (markdown: string) => {
  if (!markdown) return '';
  return markdown.split('\n').map((line) => {
    if (line.startsWith('### ')) return `<h3>${formatInline(line.slice(4))}</h3>`;
    if (line.startsWith('## ')) return `<h2>${formatInline(line.slice(3))}</h2>`;
    if (line.startsWith('# ')) return `<h1>${formatInline(line.slice(2))}</h1>`;
    if (line.startsWith('- ')) return `<div>• ${formatInline(line.slice(2))}</div>`;
    return `<div>${formatInline(line) || '<br>'}</div>`;
  }).join('');
};

export const htmlToMarkdown = (html: string) => {
  let source = html
    .replace(/<span[^>]*font-weight:\s*bold[^>]*>([\s\S]*?)<\/span>/gi, '<b>$1</b>')
    .replace(/<span[^>]*font-style:\s*italic[^>]*>([\s\S]*?)<\/span>/gi, '<i>$1</i>')
    .replace(/<span[^>]*text-decoration:[^>]*underline[^>]*>([\s\S]*?)<\/span>/gi, '<u>$1</u>')
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<u>([\s\S]*?)<\/u>/gi, '++$1++')
    .replace(/<(s|strike|del)>([\s\S]*?)<\/\1>/gi, '~~$1~~')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1\n')
    .replace(/<li>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p)>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  source = decodeHtml(source).replace(/\u00a0/g, ' ');
  return source.replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
};

export type MarkupPiece = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
};

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|\+\+[^\n+]+\+\+)/g;

export const parseInlineMarkup = (value: string): MarkupPiece[] => {
  const pieces: MarkupPiece[] = [];
  const parts = value.split(INLINE);
  parts.forEach((part) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      pieces.push({ text: part.slice(2, -2), bold: true });
      return;
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      pieces.push({ text: part.slice(2, -2), strike: true });
      return;
    }
    if (part.startsWith('++') && part.endsWith('++')) {
      pieces.push({ text: part.slice(2, -2), underline: true });
      return;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      pieces.push({ text: part.slice(1, -1), italic: true });
      return;
    }
    pieces.push({ text: part });
  });
  return pieces;
};
