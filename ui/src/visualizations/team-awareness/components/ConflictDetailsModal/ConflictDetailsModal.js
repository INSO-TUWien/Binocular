import React from 'react';
import * as styles from './ConflictDetailsModal.scss';

export default class ConflictDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  getUniqueFiles(selectedConflict) {
    return [...new Set(selectedConflict.conflicts.map(c => c.file))];
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

    console.log(selectedConflict);
    return (
      <div className={this.styles.darkBG} onClick={e => closeModal(e)}>
        <div className={this.styles.modal}>
          <div className={this.styles.modalHeader}>
            <b>Conflict Details</b>
          </div>
          <div className={this.styles.modalBody}>Here comes the content</div>
          <div className={this.styles.modalFileContainer}>
            {this.getUniqueFiles(selectedConflict).map((c, i) =>
              <div className={this.styles.modalFileItem} key={`conflicted_file_${i}`}>
                <div className={this.styles.modalFileItemPath}>
                  {c.path}
                </div>
                {c.path.endsWith('.js') && <div className={this.styles.modalFileItemIcon}>+</div>}
              </div>
            )}
          </div>

          <div className={this.styles.modalFooter}>
            <button onClick={() => close()}>Close</button>
          </div>
        </div>
      </div>
    );
  }
}
