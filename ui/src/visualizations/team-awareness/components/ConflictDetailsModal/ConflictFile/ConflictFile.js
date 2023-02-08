import React from 'react';
import styles from './ConflictFile.scss';
import { EMPTY_DOCUMENT_ICON, GIT_BRANCH_ICON, MAGNIFY_DOCUMENT_ICON, TEXT_DOCUMENT_ICON } from '../Icons';

export default class ConflictFile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { filePath, conflict, displayConflictDetails, startFileConflictDetails } = this.props;
    const fileIcon = filePath.endsWith('.js') ? TEXT_DOCUMENT_ICON : EMPTY_DOCUMENT_ICON;
    const showInfoIcon = filePath.endsWith('.js');

    console.log(filePath, conflict);

    const showFileDetails = (branch) => {
      startFileConflictDetails(Object.assign(conflict, { selectedBranch: branch, selectedFile: filePath }));
      displayConflictDetails(Object.assign(conflict, { overviewType: 'fileDetails', selectedBranch: branch, selectedFile: filePath }));
    };

    const { branches } = conflict.files.get(filePath);

    return (
      <div>
        <div className={styles.item}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>{fileIcon}</div>
            <div className={styles.headerText}>{filePath}</div>
          </div>
          <div className={styles.fileBody}>
            <small>
              Conflicts on {branches.length} branch{branches.length === 1 ? '' : 'es'}
            </small>
            <div>
              {branches.map((branch) => (
                <div key={`file_branch_${branch}`} className={styles.branch}>
                  <div className={styles.branchIcon}>{GIT_BRANCH_ICON}</div>
                  <div className={styles.branchTextContainer}>
                    <div className={styles.branchText}>{branch}</div>
                    {showInfoIcon && (
                      <button className={styles.branchInfoIcon} onClick={() => showFileDetails(branch)} title="View conflicts">
                        {MAGNIFY_DOCUMENT_ICON}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.separator} />
      </div>
    );
  }
}
