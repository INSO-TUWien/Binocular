import React from 'react';
import * as styles from './FileOverview.scss';
import ConflictFile from '../ConflictFile/ConflictFile';

export default class FileOverview extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    const { selectedConflict, displayConflictDetails, startFileConflictDetails } = this.props;

    const fileEntries = [];
    for (const [filePath, file] of selectedConflict.files) {
      fileEntries.push(
        <ConflictFile
          startFileConflictDetails={startFileConflictDetails}
          displayConflictDetails={displayConflictDetails}
          filePath={filePath}
          key={`conflicted_file_${filePath}`}
          conflict={Object.assign(selectedConflict, { selectedFile: file.file.path })}
        />
      );
    }

    return (
      <div className={this.styles.content}>
        {fileEntries}
      </div>
    );
  }
}
