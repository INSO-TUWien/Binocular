import React from 'react';
import Modal from 'react-modal';
import styles from '../styles.scss';
import * as eventHandlers from  '../chart/eventHandlers';

export default class MergeModal extends React.Component {
  originatesFrom = (branchName, organizedCommits, crossBranchParents) => {
    const firstCommit = organizedCommits[branchName][0];

    const erg = crossBranchParents.filter((r) => r.to === firstCommit.sha);
    if (erg.length === 0) {
      return "This is the initial branch."
    } else {
      const searchFor = erg[0].from;

      for (const branch in organizedCommits) {
        const value = organizedCommits[branch];

        for (const c of value) {
          if (c.sha === searchFor) {
            return branch;
          }
        }
      }
    }
  }

  checkForMerge = (targetCommit, originCommit, state) => {
    //Check if TargetBranch is Origin Branch
    const targetBranch = targetCommit.branch;
    const sourceBranch = originCommit.branch;
    const originBranch = this.originatesFrom(sourceBranch, state.graph_konva.organizedCommits, state.graph_konva.crossBranchParents);

    if (originBranch === targetBranch) {

      // Check for type of merge , 3 way or fast-forward
      const commitsInOrigin = state.graph_konva.organizedCommits[originBranch];
      const firstCommitInSource =  state.graph_konva.organizedCommits[sourceBranch][0];
      const originCommitInOrigin = state.graph_konva.crossBranchParents.filter((x) => x.to === firstCommitInSource.sha)[0].from;
      const indexOfOriginCommitInOrigin =  state.graph_konva.organizedCommits[targetBranch].findIndex((x) => x.sha === originCommitInOrigin);

      const commitsSinceBranch = ( commitsInOrigin.length - 1) - indexOfOriginCommitInOrigin
      let merge_content;
      let rebase_content = null;
      if (commitsSinceBranch === 0) {
        // Fast forward
        merge_content = (<div>
          If so you can perform a <b>fast-forward</b> merge because there haven't been any commits
          in <b>{targetBranch}</b> since <b>{sourceBranch}</b> was created.
        </div>);
      } else {
        // Three-way or rebase
        merge_content = (<div>
          If so you can perform a <b>three-way</b> merge but keep in mind that there could potentially be merge conflicts because
          there have been <b>{commitsSinceBranch}</b> Commits in <b>{targetBranch}</b> since <b>{sourceBranch}</b> was created.
        </div>);

        rebase_content = (<div>
          Another way to apply the changes from <b>{sourceBranch}</b> to <b>{targetBranch}</b> is a <b>rebase</b>. A rebase applies the
          changes into a linear timeline in <b>{targetBranch}</b>. To achieve this run the following command and resolve potential conflicts
          in the IDE of your choice.
          <br/>
        </div>);
      }
      return <div>
        {merge_content}
        <br/>
        {(state.checkoutPointer?.branchName !== targetBranch) && (
          <div>
            You additionally have to checkout the target branch before merging!
            <br/>
            * <div id="switchCMD" className={styles.terminal}>$ git checkout {targetBranch}</div>
            <br/><br/>
          </div>
        )}
        * <div id="switchCMD" className={styles.terminal}>$ git merge {sourceBranch}</div>
        {(rebase_content !== null) && (<div>
          <br/>
          {rebase_content}
          <br/>
          {(state.checkoutPointer?.branchName !== sourceBranch) && (
            <div>
              You additionally have to checkout the branch containing the changes before rebasing!
              <br/>
              * <div id="switchCMD" className={styles.terminal}>$ git checkout {sourceBranch}</div>
              <br/><br/>
            </div>
          )}
          * <div id="switchCMD" className={styles.terminal}>$ git rebase {originBranch}</div>
        </div>)}
      </div>;
    }

    if (targetBranch === sourceBranch) {
      return (<div> Same branch </div>);
    }
    return "Type of requested merge is not implemented yet";
  }
  customMergeModalStyles = {
    content: {
      width: '50%',  // Adjust the width as needed
      height: '70%', // Let the height adjust based on content
      margin: 'auto',
    },
  };
  render() {
    const {
      isOpen,
      originNode,
      targetNode,
      chartComponent,
    } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={() => eventHandlers.closeModal(chartComponent)}
        contentLabel="Merge Modal"
        style={this.customMergeModalStyles}
      >
        {originNode && targetNode && (
          <div>
            <b>Would you like to perform a merge?</b>
            <br /> <br />
            {this.checkForMerge(targetNode, originNode, chartComponent.state)}
            <button
              className={styles.switchButton}
              onClick={() => eventHandlers.createNewBranch(chartComponent)}
            >
              Merge
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
