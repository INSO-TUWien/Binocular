import React from 'react';
import * as styles from './ConflictDetailsModal.scss';

export default class ConflictDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    return (
      <div className={this.styles.darkBG}>
        <div className={this.styles.modal}>
          <div className={this.styles.modalHeader}>
            <b>Conflict Details</b>
          </div>
          <div className={this.styles.modalBody}>Here comes the content</div>
          <div className={this.styles.modalFooter}>
            <button>Close</button>
          </div>
        </div>
      </div>
    );
  }
}
