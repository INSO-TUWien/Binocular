import React from 'react';
import styles from './FileDetails.scss';
import { GIT_BRANCH_ICON } from '../Icons';

export default class FileDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  renderError(error) {
    console.log(error);
    return (
      <div className={styles.content}>
        <div className={styles.centerContent}>
          <i className={styles.errorIndicator + ' fa fa-times-circle'} />
          <div>Could not fetch details</div>
        </div>
      </div>
    );
  }

  renderLoadingIndicator() {
    //
    return (
      <div className={styles.content}>
        <div className={styles.centerContent}>
          <p>
            <i className={styles.loadingIndicator + 'fa fa-spinner fa-pulse'} />
          </p>
          <div>Loading file conflict details...</div>
        </div>
      </div>
    );
  }

  renderBranchListItem(repositoryUrl, selectedFile, branch) {
    return (
      <div className={styles.flexRow}>
        <div className={styles.branchIcon}>{GIT_BRANCH_ICON}</div>
        <div>
          <a href={`${repositoryUrl}${branch}/${selectedFile}`}>{branch}</a>
        </div>
      </div>
    );
  }

  renderInvolvedUser(user) {
    return (
      <div className={styles.flexRow}>
        <i className={styles.userIcon + ' fas fa-user'} />
        <div>{user.gitSignature}</div>
      </div>
    );
  }

  render() {
    const {
      isFileDetailsProcessing,
      fileDetails: { selectedConflict, repositoryUrl, error, changes },
    } = this.props;
    const { conflictBranch, selectedBranch, selectedFile, conflictStakeholder, otherStakeholder } = selectedConflict;

    if (isFileDetailsProcessing) {
      return this.renderLoadingIndicator();
    }
    if (error) {
      return this.renderError(error);
    }

    console.log(changes);
    return (
      <div className={styles.content}>
        <div>
          <span>Conflicts in file </span>
          <span className={styles.textConsolas}>{selectedFile}</span>
        </div>
        <div className={styles.paddingLeft}>
          {this.renderBranchListItem(repositoryUrl, selectedFile, conflictBranch)}
          {this.renderBranchListItem(repositoryUrl, selectedFile, selectedBranch)}
        </div>
        <div className={styles.separator} />
        <div>
          <div>Involved Users</div>
          <div className={styles.paddingLeft}>
            {this.renderInvolvedUser(conflictStakeholder)}
            {this.renderInvolvedUser(otherStakeholder)}
          </div>
        </div>
        <div className={styles.separator} />
        <div>
          <div>Detailed changes that cause issues:</div>
          <div className={styles.changeList}>
            {changes.map((c) => (
              <div className={styles.changeItem} key={`${c.type}_${c.start}_${c.end}`}>
                <span className={styles.textConsolas}>{c.type}</span>
                <span> on </span>
                <span>{c.end - c.start <= 1 ? 'line ' : 'lines '}</span>
                <span className={styles.textConsolas}>{c.start}</span>
                {c.end - c.start > 1 && <span> to </span>}
                {c.end - c.start > 1 && <span className={styles.textConsolas}>{c.end}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
