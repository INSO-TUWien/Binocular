import React from 'react';
import * as styles from './ConflictDetailsModal.scss';
import FileOverview from './FileOverview/FileOverview';

export default class ConflictDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    const { show, close, selectedConflict } = this.props;
    if (show === false) return null;

    const closeModal = e => {
      console.log(e.target);
      if (e.target.className.indexOf('darkBG') >= 0) {
        close();
      }
    };

    const content = <FileOverview selectedConflict={selectedConflict} />;

    return (
      <div className={this.styles.darkBG} onClick={e => closeModal(e)}>
        <div className={this.styles.modal}>
          <div className={this.styles.header}>
            <b>Conflict Details</b>
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
