import React from 'react';
import { Text, TextStyle, View } from 'react-native';
import { parseInlineMarkup } from '../utils/inlineMarkup';

type FormattedTextProps = {
  value: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
};

const FormattedText = ({ value, style, numberOfLines }: FormattedTextProps) => {
  const lines = value.split('\n');
  const visible = numberOfLines ? lines.slice(0, numberOfLines) : lines;

  return (
    <View style={{ width: '100%', alignSelf: 'stretch' }}>
      {visible.map((line, lineIndex) => {
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
          <Text
            key={lineIndex}
            style={[style, heading ? { fontSize: 20, fontWeight: '600' } : null, { paddingRight: 6 }]}
          >
            {pieces.length === 0 ? ' ' : pieces.map((piece, index) => (
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
          </Text>
        );
      })}
    </View>
  );
};

export default FormattedText;
