// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import ControlledEditor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';

loader.config({ monaco });

window.MonacoEnvironment = {
  getWorker: (workerId, label) => {
    switch (label) {
      case 'json':
        return new Worker(new URL(`monaco-editor/esm/vs/language/json/json.worker?worker`, import.meta.url));
      case 'css':
        return new Worker(new URL(`monaco-editor/esm/vs/language/css/css.worker?worker`, import.meta.url));
      case 'html':
        return new Worker(new URL(`monaco-editor/esm/vs/language/html/html.worker?worker`, import.meta.url));
      case 'typescript':
        return new Worker(new URL(`monaco-editor/esm/vs/language/typescript/ts.worker?worker`, import.meta.url));
      default:
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker?worker', import.meta.url));
    }
  }
};

interface IProps {
  value?: string;
  language?: 'typescript' | 'schema' | 'json' | 'javascript' | 'plaintext' | 'xml' | 'html' | 'css';
  height?: number | string;
  width?: number | string;
  readOnly?: boolean;
  disabled?: boolean;
  wordWrap?: 'on' | 'off';
  onChange?: (v: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => void;
}

export default function MonacoEditor(props: IProps) {
  const editorRef = useRef(null as any);
  const [monacoValue, setMonacoValue] = useState('' as any);

  const { disabled } = props;

  const {
    value = '',
    width = '100%',
    height = 400,
    readOnly = disabled ?? false,
    language = 'json',
    wordWrap = 'on',
    onChange,
    ...resetProps
  } = props;

  const options: any = {
    formatOnPaste: true,
    formatOnType: true,
    minimap: {
      enabled: false
    },
    scrollbar: {
      verticalScrollbarSize: 0,
      verticalSliderSize: 11,
      horizontalScrollbarSize: 0,
      horizontalSliderSize: 11
    },
    readOnly,
    wordWrap,
    renderLineHighlight: readOnly ? 'none' : 'line',
    unusualLineTerminators: 'off',
    scrollBeyondLastLine: false,
    isViewportWrapping: true,
    tabSize: 2
  };

  function checkJsonCode(strJsonCode: any): string {
    if (language !== 'json') {
      return strJsonCode;
    }
    let res = '';
    try {
      res = JSON.stringify(JSON.parse(strJsonCode), null, '\t');
    } catch (error) {
      res = strJsonCode;
    }
    return res;
  }

  const theme = document.body.hasAttribute('theme-mode') ? 'dark' : 'light';
  const handleEditorDidMount = (editor: any, _: any) => {
    editorRef.current = editor;
    if (!readOnly) {
      editor.getAction('editor.action.formatDocument').run();
    }
  };

  useEffect(() => {
    readOnly && editorRef.current?.setScrollPosition({ scrollTop: 0 });
    if (readOnly) {
      setMonacoValue(checkJsonCode(value));
    } else {
      setMonacoValue(value);
    }
  }, [value, language]);

  const handleChange = (v: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => {
    onChange?.(v, ev);
    if (!readOnly && ev.isFlush) {
      editorRef.current?.getAction('editor.action.formatDocument').run();
    }
  };

  return (
    <ControlledEditor
      {...resetProps}
      defaultLanguage={language}
      height={height}
      width={width}
      language={language}
      theme={theme}
      value={monacoValue}
      options={options}
      onMount={handleEditorDidMount}
      onChange={handleChange}
    />
  );
}
