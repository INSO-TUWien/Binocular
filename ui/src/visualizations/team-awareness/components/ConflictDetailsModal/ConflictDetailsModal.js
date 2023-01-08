import React from 'react';
import * as styles from './ConflictDetailsModal.scss';
import FileOverview from './FileOverview/FileOverview';
import FileDetails from './FileDetails/FileDetails';

export default class ConflictDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    const {
      show,
      close,
      selectedConflict,
      displayConflictDetails,
      startFileConflictDetails,
      isFileDetailsProcessing,
      fileDetails
    } = this.props;

    if (show === false) return null;
    const { overviewType } = selectedConflict;
    const closeModal = e => {
      if (!Array.isArray(e.target.className)) return;
      if (e.target.className.indexOf('darkBG') >= 0) {
        close();
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
      <div className={this.styles.darkBG} onClick={e => closeModal(e)}>
        <div className={this.styles.modal}>
          <div className={this.styles.header}>
            {overviewType === 'fileDetails' &&
              <i className={this.styles.backIcon + ' fas fa-caret-left'} title="Go back to file list" onClick={() => navigateToFiles()} />}
            {overviewType === 'files' && <i />}
            <b>Conflict Details</b>
            <i className={this.styles.closeIcon + ' fas fa-times'} onClick={() => close()} title="Close Details Modal" />
          </div>
          {content}
          <div className={this.styles.footer}>
            <button title="Close Details Modal" onClick={() => close()}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}
