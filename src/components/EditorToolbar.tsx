import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type FormatAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'link'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'undo'
  | 'redo';

type EditorToolbarProps = {
  onAction: (action: FormatAction) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  darkMode?: boolean;
};

type Tool = {
  action: FormatAction;
  label: string;
  mark?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

const TOOLS: Tool[] = [
  { action: 'bold', label: 'Bold', mark: 'B' },
  { action: 'italic', label: 'Italic', mark: 'I' },
  { action: 'underline', label: 'Underline', mark: 'U' },
  { action: 'strikethrough', label: 'Strike', mark: 'S' },
  { action: 'link', label: 'Link', icon: 'link' },
  { action: 'h1', label: 'H1', mark: 'H1' },
  { action: 'h2', label: 'H2', mark: 'H2' },
  { action: 'h3', label: 'H3', mark: 'H3' },
  { action: 'ul', label: 'List', mark: '•' },
  { action: 'ol', label: 'Numbered', mark: '1.' },
  { action: 'undo', label: 'Undo', icon: 'arrow-undo' },
  { action: 'redo', label: 'Redo', icon: 'arrow-redo' },
];

const EditorToolbar = ({ onAction, canUndo, canRedo }: EditorToolbarProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.rowContent}
      // Keep the editor selection when a format button is pressed.
      {...({ onMouseDown: (event: { preventDefault?: () => void }) => event.preventDefault?.() } as object)}
    >
      {TOOLS.map((tool) => {
        const disabled =
          (tool.action === 'undo' && !canUndo) || (tool.action === 'redo' && !canRedo);
        const accent = (tool.action === 'undo' && canUndo) || (tool.action === 'redo' && canRedo);
        const color = accent ? colors.brandPrimary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={tool.action}
            accessibilityRole="button"
            accessibilityLabel={tool.label}
            style={[
              styles.btn,
              {
                borderColor: accent ? colors.brandPrimary : colors.borderSubtle,
                backgroundColor: colors.bgSurface,
              },
              disabled && styles.btnDisabled,
            ]}
            onPress={() => onAction(tool.action)}
            disabled={disabled}
          >
            {tool.icon ? (
              <Ionicons name={tool.icon} size={14} color={color} />
            ) : tool.mark && tool.mark !== tool.label ? (
              <Text style={[styles.mark, { color }]}>{tool.mark}</Text>
            ) : null}
            <Text style={[styles.label, { color }]}>{tool.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { flexGrow: 0, marginBottom: 8 },
  rowContent: { alignItems: 'center', paddingRight: 4 },
  btn: {
    minHeight: 32,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  btnDisabled: { opacity: 0.4 },
  mark: { fontWeight: '700', fontSize: 12 },
  label: { fontWeight: '600', fontSize: 12 },
});

export default React.memo(EditorToolbar);
