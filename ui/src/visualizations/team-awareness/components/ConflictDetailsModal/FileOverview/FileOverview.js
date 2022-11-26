import React from 'react';
import * as styles from './FileOverview.scss';
import ConflictFile from '../ConflictFile/ConflictFile';

export default class FileOverview extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  getUniqueFiles(selectedConflict) {
    const files = new Map();

    selectedConflict.conflicts.forEach(c => {
      if (!files.has(c.file.path)) {
        files.set(c.file.path, []);
      }

      files.get(c.file.path).push(c);
    });

    return files;
  }

  render() {
    const { selectedConflict, displayConflictDetails, startFileConflictDetails } = this.props;

    const fileEntries = [];
    for (const [filePath, conflicts] of this.getUniqueFiles(selectedConflict)) {
      fileEntries.push(
        <ConflictFile
          startFileConflictDetails={startFileConflictDetails}
          displayConflictDetails={displayConflictDetails}
          filePath={filePath}
          key={`conflicted_file_${filePath}`}
          conflicts={conflicts}
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
