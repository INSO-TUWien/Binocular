import React from 'react';
import Modal from 'react-modal';
import styles from '../styles.scss';
import * as eventHandlers from  '../chart/eventHandlers';
import copyToClipboard from '../../../dashboard/assets/copyToClipboardIcon.svg';

export default class BranchAwayModal extends React.Component {

  copyToClipboard(text) {
    // Copy the text inside the text field
    navigator.clipboard.writeText(text).then(
      () => {
        /* clipboard successfully set */
        alert("Copied the text: " + text);
      },
      () => {
        /* clipboard write failed */
        alert("Error occurred when trying to copy to clipboard");
      },
    );
  }

  customBranchAwayInfoModalStyles = {
    content: {
      width: '50%',  // Adjust the width as needed
      height: '35%', // Let the height adjust based on content
      margin: 'auto',
    },
  };

  render() {
    const {
      isOpen,
      originNode,
      branchName,
      chartComponent,
    } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={() => eventHandlers.closeModal(chartComponent)}
        contentLabel="Branch Away Modal"
        style={this.customBranchAwayInfoModalStyles}
      >
        {originNode && (
          <div>
            <b>Would you like to create a new Branch from this Commit?</b>
            <br />
            Origin Node: {originNode.id}
            <br /> <br />
            <label> What should be the new branch's name? </label>
            <br />
            <input
              className={styles.inputBox}
              id="branchNameInput"
              onChange={(e) => eventHandlers.handleInputChange(e, chartComponent)}
              type="text"
              placeholder="e.g.: feature/XX"
            />
            <br /> <br />
            <div id="switchCMD" className={styles.terminal}>
              $ git branch {branchName} {originNode.id}
            </div>
            <button
              onClick={() =>
                this.copyToClipboard(`git branch ${branchName} ${originNode.id}`)
              }
            >
              <img
                src={copyToClipboard}
                alt="CopyToClipboard"
                className={styles.svgIcon}
              />
            </button>
            <br /><br />

            <button
              className={styles.switchButton}
              onClick={() => eventHandlers.createNewBranch(chartComponent)}
            >
              Create new Branch
            </button>
          </div>
        )}
        <button
          className={styles.cancelButton}
          onClick={() => eventHandlers.closeModal(chartComponent)}
        >
          Cancel
        </button>
      </Modal>
    );
  }
}
