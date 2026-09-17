import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const EditorToolbar = ({ onAction, canUndo, canRedo, darkMode }: EditorToolbarProps) => {
  const btnStyle = darkMode ? styles.btnDark : styles.btn;
  const iconColor = darkMode ? '#ecf0f1' : '#2c3e50';

  const renderBtn = (action: FormatAction, label: string, icon?: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      key={action}
      style={[
        btnStyle,
        (action === 'undo' && !canUndo) || (action === 'redo' && !canRedo) ? styles.btnDisabled : null,
      ]}
      onPress={() => onAction(action)}
      disabled={(action === 'undo' && !canUndo) || (action === 'redo' && !canRedo)}
    >
      {icon ? (
        <Ionicons name={icon} size={16} color={iconColor} />
      ) : (
        <Text style={[styles.btnText, darkMode && styles.btnTextDark]}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {renderBtn('bold', 'B')}
      {renderBtn('italic', 'I')}
      {renderBtn('underline', 'U')}
      {renderBtn('strikethrough', 'S')}
      {renderBtn('link', '', 'link')}
      {renderBtn('h1', 'H1')}
      {renderBtn('h2', 'H2')}
      {renderBtn('h3', 'H3')}
      {renderBtn('ul', '•')}
      {renderBtn('ol', '1.')}
      {renderBtn('undo', '', 'arrow-undo')}
      {renderBtn('redo', '', 'arrow-redo')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { flexGrow: 0, marginBottom: 8 },
  btn: {
    backgroundColor: '#dfe6e9',
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    paddingHorizontal: 8,
  },
  btnDark: {
    backgroundColor: '#34495e',
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    paddingHorizontal: 8,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontWeight: '700', color: '#2c3e50', fontSize: 13 },
  btnTextDark: { color: '#ecf0f1' },
});

export default React.memo(EditorToolbar);
