export const editorHtml = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html, body { margin: 0; padding: 0; background: #04110C; color: #F0FDF4; }
  #editor {
    min-height: 180px;
    padding: 12px;
    outline: none;
    font-size: 16px;
    line-height: 26px;
    font-family: Georgia, serif;
    white-space: pre-wrap;
  }
  #editor:empty:before { content: attr(data-placeholder); color: #4B6358; }
</style>
</head>
<body>
<div id="editor" contenteditable="true" data-placeholder="Let your words flow..."></div>
<script>
  const editor = document.getElementById('editor');
  let saved = null;
  const post = () => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'html', html: editor.innerHTML }));
  };
  const remember = () => {
    const sel = document.getSelection();
    if (sel && sel.rangeCount) saved = sel.getRangeAt(0).cloneRange();
  };
  const restore = () => {
    editor.focus();
    if (!saved) return;
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(saved);
  };
  const run = (name, arg) => {
    restore();
    document.execCommand(name, false, arg || null);
    remember();
    post();
  };
  editor.addEventListener('mouseup', remember);
  editor.addEventListener('keyup', remember);
  editor.addEventListener('touchend', remember);
  editor.addEventListener('input', post);
  const onMessage = (event) => {
    let data = event || {};
    if (typeof event === 'string') {
      try { data = JSON.parse(event); } catch (e) { return; }
    } else if (event && typeof event.data === 'string') {
      try { data = JSON.parse(event.data); } catch (e) { return; }
    } else if (event && event.data && typeof event.data === 'object') {
      data = event.data;
    }
    if (data.type === 'html') {
      editor.innerHTML = data.html || '';
      return;
    }
    if (data.type !== 'command') return;
    const map = {
      bold: 'bold', italic: 'italic', underline: 'underline', strikethrough: 'strikeThrough',
      ul: 'insertUnorderedList', ol: 'insertOrderedList', undo: 'undo', redo: 'redo'
    };
    if (data.action === 'link') {
      const href = window.prompt('Link address');
      if (href) run('createLink', href);
      return;
    }
    if (data.action === 'h1') return run('formatBlock', 'H1');
    if (data.action === 'h2') return run('formatBlock', 'H2');
    if (data.action === 'h3') return run('formatBlock', 'H3');
    if (map[data.action]) run(map[data.action]);
  };
  document.addEventListener('message', onMessage);
  window.addEventListener('message', onMessage);
  window.applyEditorMessage = onMessage;
</script>
</body>
</html>`;
