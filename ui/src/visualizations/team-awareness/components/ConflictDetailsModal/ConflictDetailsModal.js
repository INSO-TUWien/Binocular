import React from 'react';
import styles from './ConflictDetailsModal.scss';
import FileOverview from './FileOverview/FileOverview';
import FileDetails from './FileDetails/FileDetails';

export default class ConflictDetailsModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { show, close, selectedConflict, displayConflictDetails, startFileConflictDetails, isFileDetailsProcessing, fileDetails } =
      this.props;

    if (show === false) return null;
    const { overviewType } = selectedConflict;
    const closeModal = (e) => {
      console.log('close', e);
      if (e.target.className && typeof e.target.className === 'string') {
        console.log(e.target.className);
        if (e.target.className.indexOf('darkBG') >= 0) {
          close();
        }
      }
    };

    let content = <h1>Unknown content selected</h1>;
    if (overviewType === 'files') {
      content = (
        <FileOverview
          displayConflictDetails={displayConflictDetails}
          startFileConflictDetails={startFileConflictDetails}
          selectedConflict={selectedConflict}
        />
      );
    } else if (overviewType === 'fileDetails') {
      content = <FileDetails fileDetails={fileDetails} isFileDetailsProcessing={isFileDetailsProcessing} />;
    }

    function navigateToFiles() {
      displayConflictDetails(Object.assign(selectedConflict, { overviewType: 'files' }));
    }

    return (
      <div className={styles.darkBG} onClick={(e) => closeModal(e)}>
        <div className={styles.modal}>
          <div className={styles.header}>
            {overviewType === 'fileDetails' && (
              <button
                className={[styles.iconButton, styles.leftButton].join(' ')}
                title="Go back to file list"
                onClick={() => navigateToFiles()}>
                <i className={'fas fa-caret-left ' + styles.fill} />
              </button>
            )}
            {overviewType === 'files' && <i />}
            <b>Conflict Details</b>
            <button className={[styles.iconButton, styles.rightButton].join(' ')} onClick={() => close()} title="Close Details Modal">
              <i className={'fas fa-times ' + styles.fill} />
            </button>
          </div>
          {content}
          <div className={styles.footer}>
            <button title="Close Details Modal" onClick={() => close()}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}
