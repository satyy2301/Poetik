import React from 'react';
import { Text, TextStyle } from 'react-native';
import { parseInlineMarkup } from '../utils/inlineMarkup';

type FormattedTextProps = {
  value: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
};

const FormattedText = ({ value, style, numberOfLines }: FormattedTextProps) => {
  const lines = value.split('\n');

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {lines.map((line, lineIndex) => {
        let content = line;
        let heading = false;
        if (content.startsWith('### ')) {
          content = content.slice(4);
          heading = true;
        } else if (content.startsWith('## ')) {
          content = content.slice(3);
          heading = true;
        } else if (content.startsWith('# ')) {
          content = content.slice(2);
          heading = true;
        } else if (content.startsWith('- ')) {
          content = `• ${content.slice(2)}`;
        }

        const pieces = parseInlineMarkup(content);
        return (
          <Text key={lineIndex} style={heading ? { fontSize: 20, fontWeight: '600' } : undefined}>
            {pieces.map((piece, index) => (
              <Text
                key={index}
                style={{
                  fontWeight: piece.bold ? '700' : undefined,
                  fontStyle: piece.italic ? 'italic' : undefined,
                  textDecorationLine: piece.underline
                    ? 'underline'
                    : piece.strike
                      ? 'line-through'
                      : undefined,
                }}
              >
                {piece.text}
              </Text>
            ))}
            {lineIndex < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      })}
    </Text>
  );
};

export default FormattedText;
