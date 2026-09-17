import React, { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { TextInput, StyleSheet, View, Text, NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native';
import EditorToolbar, { FormatAction } from './EditorToolbar';
import { countSyllables, countWords, findMisspellings } from '../utils/formValidators';

export type RichTextEditorRef = {
  focus: () => void;
  getSelection: () => { start: number; end: number };
};

type RichTextEditorProps = {
  value: string;
  onChange: (text: string) => void;
  onStatsChange?: (stats: { words: number; syllables: number }) => void;
  placeholder?: string;
  darkMode?: boolean;
  focusMode?: boolean;
  maxLength?: number;
  showToolbar?: boolean;
};

const FORMAT_MAP: Record<string, { before: string; after: string }> = {
  bold: { before: '**', after: '**' },
  italic: { before: '*', after: '*' },
  underline: { before: '++', after: '++' },
  strikethrough: { before: '~~', after: '~~' },
  link: { before: '[', after: '](url)' },
};

const LINE_PREFIX: Record<string, string> = {
  h1: '# ',
  h2: '## ',
  h3: '### ',
  ul: '- ',
  ol: '1. ',
};

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      onStatsChange,
      placeholder = 'Let your words flow...',
      darkMode = false,
      focusMode = false,
      maxLength = 10000,
      showToolbar = true,
    },
    ref,
  ) => {
    const inputRef = useRef<TextInput>(null);
    const selectionRef = useRef({ start: 0, end: 0 });
    const undoStack = useRef<string[]>([]);
    const redoStack = useRef<string[]>([]);
    const lastValue = useRef(value);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      getSelection: () => selectionRef.current,
    }));

    useEffect(() => {
      onStatsChange?.({ words: countWords(value), syllables: countSyllables(value) });
    }, [value, onStatsChange]);

    const pushUndo = useCallback((prev: string) => {
      undoStack.current = [...undoStack.current.slice(-49), prev];
      redoStack.current = [];
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(false);
    }, []);

    const applyChange = useCallback(
      (newText: string) => {
        if (newText !== lastValue.current) {
          pushUndo(lastValue.current);
          lastValue.current = newText;
          onChange(newText);
        }
      },
      [onChange, pushUndo],
    );

    const wrapSelection = (before: string, after: string) => {
      const { start, end } = selectionRef.current;
      if (start === end) {
        const newText = value.slice(0, start) + before + after + value.slice(start);
        applyChange(newText);
        return;
      }
      const selected = value.slice(start, end);
      const newText = value.slice(0, start) + before + selected + after + value.slice(end);
      applyChange(newText);
    };

    const prefixCurrentLine = (prefix: string) => {
      const { start } = selectionRef.current;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const newText = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      applyChange(newText);
    };

    const handleAction = (action: FormatAction) => {
      if (action === 'undo') {
        if (undoStack.current.length === 0) return;
        const prev = undoStack.current.pop()!;
        redoStack.current.push(value);
        lastValue.current = prev;
        onChange(prev);
        setCanUndo(undoStack.current.length > 0);
        setCanRedo(redoStack.current.length > 0);
        return;
      }
      if (action === 'redo') {
        if (redoStack.current.length === 0) return;
        const next = redoStack.current.pop()!;
        pushUndo(value);
        lastValue.current = next;
        onChange(next);
        setCanUndo(undoStack.current.length > 0);
        setCanRedo(redoStack.current.length > 0);
        return;
      }
      if (FORMAT_MAP[action]) {
        const { before, after } = FORMAT_MAP[action];
        wrapSelection(before, after);
        return;
      }
      if (LINE_PREFIX[action]) {
        prefixCurrentLine(LINE_PREFIX[action]);
      }
    };

    const handleChange = (text: string) => {
      // Markdown shortcuts on new line
      const lines = text.split('\n');
      const lastLine = lines[lines.length - 1];
      let processed = text;

      if (lastLine === '# ') processed = text.slice(0, -2) + '# ';
      if (lastLine === '## ') processed = text;
      if (lastLine === '- ') processed = text;

      if (processed !== lastValue.current) {
        pushUndo(lastValue.current);
      }
      lastValue.current = processed;
      onChange(processed);
    };

    const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      selectionRef.current = e.nativeEvent.selection;
    };

    const misspellings = findMisspellings(value);
    const charsLeft = maxLength - value.length;

    return (
      <View style={[styles.container, focusMode && styles.focusMode]}>
        {showToolbar && (
          <EditorToolbar
            onAction={handleAction}
            canUndo={canUndo}
            canRedo={canRedo}
            darkMode={darkMode}
          />
        )}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            darkMode && styles.inputDark,
            focusMode && styles.inputFocus,
          ]}
          placeholder={placeholder}
          placeholderTextColor={darkMode ? '#7f8c8d' : '#95a5a6'}
          multiline
          value={value}
          onChangeText={handleChange}
          onSelectionChange={handleSelectionChange}
          maxLength={maxLength}
          textAlignVertical="top"
        />

        <View style={styles.footer}>
          <Text style={[styles.meta, darkMode && styles.metaDark]}>
            {countWords(value)} words · {countSyllables(value)} syllables
          </Text>
          <Text style={[styles.meta, darkMode && styles.metaDark, charsLeft < 500 && styles.warn]}>
            {charsLeft} chars left
          </Text>
        </View>

        {misspellings.length > 0 && (
          <View style={styles.spellHints}>
            {misspellings.map((m, i) => (
              <Text key={i} style={styles.spellHint}>
                "{m.word}" → {m.suggestion}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  focusMode: { paddingTop: 4 },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputDark: {
    color: '#ecf0f1',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
  },
  inputFocus: {
    fontSize: 18,
    lineHeight: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  meta: { fontSize: 12, color: '#7f8c8d' },
  metaDark: { color: '#95a5a6' },
  warn: { color: '#e67e22' },
  spellHints: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  spellHint: { fontSize: 12, color: '#856404' },
});

export default RichTextEditor;
