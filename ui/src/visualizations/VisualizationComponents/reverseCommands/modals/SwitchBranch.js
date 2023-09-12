import React from 'react';
import Modal from 'react-modal';
import styles from '../styles.scss';
import * as eventHandlers from '../chart/eventHandlers';
import copyToClipboard from '../../../dashboard/assets/copyToClipboardIcon.svg';

export default class CheckoutModal extends React.Component {
  originatesFrom = (branchName, organizedCommits, crossBranchParents) => {
    const firstCommit = organizedCommits[branchName][0];
    console.log(firstCommit);
    console.log(crossBranchParents);
    const erg = crossBranchParents.filter((r) => r.to === firstCommit.sha);
    if (erg.length === 0) {
      return "This is the initial branch."
    } else {
      const searchFor = erg[0].from;

      for (const branch in organizedCommits) {
        const value = organizedCommits[branch];

        for (const c of value) {
          if (c.sha === searchFor) {
            return branch; // Return the branch directly from here
          }
        }
      }
    }
  }

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

  customBranchInfoModalStyles = {
    content: {
      width: '35%',  // Adjust the width as needed
      height: '35%', // Let the height adjust based on content
      margin: 'auto',
    },
  };

  render() {
    const { isOpen, selectedBranch, graph_konva, chartComponent } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={() => eventHandlers.closeModal(chartComponent)}
        contentLabel="Checkout Modal"
        style={this.customBranchInfoModalStyles}>
        {selectedBranch ? (
          <div>
            <b>Branch Name: {selectedBranch.name}</b>
            <br /> <br />
            #Commits: {graph_konva.organizedCommits[selectedBranch.name].length} <br />
            Originated from: {this.originatesFrom(selectedBranch.name, graph_konva.organizedCommits, graph_konva.crossBranchParents)}
            <br /> <br />
            To Checkout this Branch:
            <br />
            <div id="switchCMD" className={styles.terminal}>
              $ git switch {selectedBranch.name}
            </div>
            <button onClick={() => this.copyToClipboard(`git switch ${selectedBranch.name}`)}>
              <img src={copyToClipboard} alt="CopyToClipboard" className={styles.svgIcon} />
            </button>
            <br />
            <br />
            <button className={styles.switchButton} onClick={() => eventHandlers.handleCheckout(chartComponent)}>
              Switch
            </button>
          </div>
        ) : (
          <div>
            <p>No branch selected.</p>
          </div>
        )}
        <button className={styles.cancelButton} onClick={() => eventHandlers.closeModal(chartComponent)}>
          Cancel
        </button>
      </Modal>
    );
  }
}
