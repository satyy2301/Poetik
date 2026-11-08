import React, { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { TextInput, StyleSheet, View, Text, NativeSyntheticEvent, TextInputSelectionChangeEventData, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import EditorToolbar, { FormatAction } from './EditorToolbar';
import { editorHtml } from './editorHtml';
import { countSyllables, countWords, findMisspellings } from '../utils/formValidators';
import { htmlToMarkdown, markdownToHtml } from '../utils/inlineMarkup';
import { palette } from '../theme/tokens/colors';

const createDom = Platform.OS === 'web'
  ? require('react-native-web').unstable_createElement
  : null;

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
    const webviewRef = useRef<WebView>(null);
    const surfaceRef = useRef<{ innerHTML: string; focus?: () => void } | null>(null);
    const emittedRef = useRef(value);
    const selectionRef = useRef({ start: 0, end: 0 });
    const undoStack = useRef<string[]>([]);
    const redoStack = useRef<string[]>([]);
    const lastValue = useRef(value);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const postToNativeEditor = useCallback((payload: object) => {
      webviewRef.current?.injectJavaScript(`window.applyEditorMessage(${JSON.stringify(payload)}); true;`);
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        webviewRef.current?.injectJavaScript('document.getElementById("editor")?.focus(); true;');
      },
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

    const syncFromSurface = () => {
      const surface = surfaceRef.current;
      if (!surface) return;
      const markdown = htmlToMarkdown(surface.innerHTML);
      emittedRef.current = markdown;
      applyChange(markdown);
    };

    const formatSurface = (action: FormatAction) => {
      const surface = surfaceRef.current;
      const dom = globalThis as any;
      if (!surface || typeof dom.document === 'undefined') return false;
      surface.focus?.();
      const command: Partial<Record<FormatAction, string>> = {
        bold: 'bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'strikeThrough',
        h1: 'formatBlock',
        h2: 'formatBlock',
        h3: 'formatBlock',
        ul: 'insertUnorderedList',
        ol: 'insertOrderedList',
        undo: 'undo',
        redo: 'redo',
      };
      if (action === 'link') {
        const href = dom.window?.prompt?.('Link address');
        if (href) dom.document.execCommand('createLink', false, href);
        syncFromSurface();
        return true;
      }
      const name = command[action];
      if (!name) return false;
      if (action === 'h1') dom.document.execCommand(name, false, 'H1');
      else if (action === 'h2') dom.document.execCommand(name, false, 'H2');
      else if (action === 'h3') dom.document.execCommand(name, false, 'H3');
      else dom.document.execCommand(name, false);
      syncFromSurface();
      return true;
    };

    useEffect(() => {
      if (value === emittedRef.current) return;
      const html = markdownToHtml(value);
      const surface = surfaceRef.current;
      if (surface) surface.innerHTML = html;
      if (Platform.OS !== 'web') postToNativeEditor({ type: 'html', html });
      emittedRef.current = value;
    }, [value, postToNativeEditor]);

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
      if (Platform.OS === 'web' && formatSurface(action)) return;
      if (Platform.OS !== 'web') {
        postToNativeEditor({ type: 'command', action });
        return;
      }
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

        {Platform.OS === 'web' && createDom ? (
          <View style={[styles.input, styles.webFrame, darkMode && styles.inputDark]}>
            {!value ? (
              <Text style={[styles.placeholder, { color: darkMode ? palette.glacial : palette.ghost }]}>{placeholder}</Text>
            ) : null}
            {createDom('div', {
              ref: (node: { innerHTML: string } | null) => {
                surfaceRef.current = node;
                if (node && !node.innerHTML && value) node.innerHTML = markdownToHtml(value);
              },
              contentEditable: true,
              suppressContentEditableWarning: true,
              onInput: syncFromSurface,
              style: {
                minHeight: focusMode ? 280 : 180,
                outline: 'none',
                color: palette.parchment,
                fontSize: focusMode ? 18 : 16,
                lineHeight: focusMode ? '30px' : '26px',
                fontFamily: 'Newsreader, Georgia, serif',
              },
            })}
          </View>
        ) : (
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: editorHtml }}
            style={[styles.nativeEditor, focusMode && styles.nativeEditorFocus]}
            hideKeyboardAccessoryView
            keyboardDisplayRequiresUserAction={false}
            onLoadEnd={() => postToNativeEditor({ type: 'html', html: markdownToHtml(value) })}
            onMessage={(event) => {
              try {
                const payload = JSON.parse(event.nativeEvent.data);
                if (payload.type !== 'html') return;
                const markdown = htmlToMarkdown(payload.html || '');
                emittedRef.current = markdown;
                applyChange(markdown);
              } catch {
                // ignore malformed editor messages
              }
            }}
          />
        )}

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
    color: palette.parchment,
    marginBottom: 8,
  },
  inputDark: {
    color: palette.parchment,
    backgroundColor: palette.canvas,
    borderRadius: 8,
    padding: 12,
  },
  inputFocus: {
    fontSize: 18,
    lineHeight: 30,
  },
  webFrame: {
    minHeight: 180,
    position: 'relative',
  },
  nativeEditor: {
    minHeight: 220,
    backgroundColor: 'transparent',
  },
  nativeEditorFocus: {
    minHeight: 320,
  },
  placeholder: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    pointerEvents: 'none',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  meta: { fontSize: 12, color: palette.glacial },
  metaDark: { color: palette.ghost },
  warn: { color: palette.mint },
  spellHints: {
    backgroundColor: palette.malachite,
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  spellHint: { fontSize: 12, color: palette.sage },
});

export default RichTextEditor;
