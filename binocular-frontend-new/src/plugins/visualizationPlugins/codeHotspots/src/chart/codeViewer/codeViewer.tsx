import type { SelectedFile } from '../../reducer';
import { type RefObject, useEffect, useState } from 'react';

import SourceCodeRequest from './utils/sourceCodeRequest';
import ReactCodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import LanguageDetection from './utils/languageDetection';
import { codeMirrorThemeLight } from './codeMirrorThemeLight';
import { EditorView } from '@codemirror/view';
import type { DataPluginBranch } from '../../../../../interfaces/dataPluginInterfaces/dataPluginBranches';

function CodeViewer(props: { ref: RefObject<EditorView | null>; file: SelectedFile | null; currentBranch: DataPluginBranch | undefined }) {
  const [sourceCode, setSourceCode] = useState('No Source code loaded.');
  const [language, setLanguage] = useState('tsx');

  useEffect(() => {
    if (props.file && props.currentBranch) {
      setLanguage(LanguageDetection.languageFromExtension(props.file.path.split('.').pop() || ''));
      SourceCodeRequest.getSourceCode(props.file.url, props.file.path, props.currentBranch.branch, 'develop', '', '', '', '').then(
        (newSourceCode) => setSourceCode(newSourceCode),
      );
    }
  }, [props.file, props.currentBranch]);

  const alternatingLinesTheme = EditorView.theme({
    '.cm-line:nth-child(odd)': {
      backgroundColor: '#00000000',
    },
    '.cm-line:nth-child(even)': {
      backgroundColor: '#0000000a',
    },
  });

  return (
    <div className="codeViewer-wrapper w100">
      <ReactCodeMirror
        id={'codeMirror'}
        value={sourceCode}
        basicSetup={{
          highlightActiveLineGutter: false,
          foldGutter: false,
        }}
        theme={codeMirrorThemeLight}
        readOnly={true}
        extensions={[
          /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
          // @ts-expect-error
          loadLanguage(language),
          EditorView.updateListener.of((update) => {
            if (update.geometryChanged) {
              update.view.requestMeasure();
            }
          }),
          alternatingLinesTheme,
        ]}
        onCreateEditor={(view) => {
          props.ref.current = view;
        }}
      />
    </div>
  );
}

export default CodeViewer;
