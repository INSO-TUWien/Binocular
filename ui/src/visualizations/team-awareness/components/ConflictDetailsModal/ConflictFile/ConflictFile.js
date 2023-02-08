import React from 'react';
import * as styles from './ConflictFile.scss';
import { EMPTY_DOCUMENT_ICON, GIT_BRANCH_ICON, MAGNIFY_DOCUMENT_ICON, TEXT_DOCUMENT_ICON } from '../Icons';

export default class ConflictFile extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    const { filePath, conflict, displayConflictDetails, startFileConflictDetails } = this.props;
    const fileIcon = filePath.endsWith('.js') ? TEXT_DOCUMENT_ICON : EMPTY_DOCUMENT_ICON;
    const showInfoIcon = filePath.endsWith('.js');

    console.log(filePath, conflict);

    const showFileDetails = branch => {
      startFileConflictDetails(Object.assign(conflict, { selectedBranch: branch, selectedFile: filePath }));
      displayConflictDetails(Object.assign(conflict, { overviewType: 'fileDetails', selectedBranch: branch, selectedFile: filePath }));
    };

    const { branches } = conflict.files.get(filePath);

    return (
      <div>
        <div className={this.styles.item}>
          <div className={this.styles.header}>
            <div className={this.styles.headerIcon}>
              {fileIcon}
            </div>
            <div className={this.styles.headerText}>
              {filePath}
            </div>
          </div>
          <div className={this.styles.fileBody}>
            <small>
              Conflicts on {branches.length} branch{branches.length === 1 ? '' : 'es'}
            </small>
            <div>
              {branches.map(branch =>
                <div key={`file_branch_${branch}`} className={this.styles.branch}>
                  <div className={this.styles.branchIcon}>
                    {GIT_BRANCH_ICON}
                  </div>
                  <div className={this.styles.branchTextContainer}>
                    <div className={this.styles.branchText}>
                      {branch}
                    </div>
                    {showInfoIcon &&
                      <button className={this.styles.branchInfoIcon} onClick={() => showFileDetails(branch)} title="View conflicts">
                        {MAGNIFY_DOCUMENT_ICON}
                      </button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={this.styles.separator} />
      </div>
    );
  }
}
