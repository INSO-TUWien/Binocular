'use strict';

import React from 'react';
import codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import styles from '../styles.scss';
import Overlay from './Overlay';

export default class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.codeMirror = codemirror(this.editor, {
      mode: 'javascript',
      lineNumbers: 'true',
      value: '',
      viewportMargin: Infinity,
      readOnly: true
    });
    const codeMirrorScroll = document.getElementsByClassName('CodeMirror-vscrollbar')[0];
    this.codeMirror.on('scroll', () => {
      const overlay = document.getElementById('overlay');
      if (overlay) {
        overlay.scrollTop = codeMirrorScroll.scrollTop;
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.receiveUpdateCode.code) {
      this.codeMirror.getDoc().setValue(nextProps.receiveUpdateCode.code);
    } else if (!nextProps.receiveCodeFileData.isFetching) {
      this.codeMirror.getDoc().setValue(nextProps.receiveCodeFileData.data.code);
    }
  }

  render() {
    return (
      <div className={styles.codeEditorContainer}>
        <div className={styles.codeEditor} ref={self => (this.editor = self)}>
          <Overlay id={'overlay'} data={this.props.receiveOverlay} />
        </div>
      </div>
    );
  }
}
