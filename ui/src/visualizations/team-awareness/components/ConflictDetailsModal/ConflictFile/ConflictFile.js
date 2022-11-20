import React from 'react';
import * as styles from './ConflictFile.scss';
import { EMPTY_DOCUMENT_ICON, GIT_BRANCH_ICON, MAGNIFY_DOCUMENT_ICON, TEXT_DOCUMENT_ICON } from '../Icons';

export default class ConflictFile extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    const { filePath, conflicts } = this.props;
    console.log(conflicts);

    const fileIcon = filePath.endsWith('.js') ? TEXT_DOCUMENT_ICON : EMPTY_DOCUMENT_ICON;
    const showInfoIcon = filePath.endsWith('.js');

    return (
      <div>
        <div className={this.styles.item}>
          <div className={this.styles.header}>
            <div className={this.styles.headerIcon}>
              {fileIcon}
            </div>
            <div className={this.styles.headerText}>
              {filePath}
            </div>
          </div>
          <div className={this.styles.fileBody}>
            <small>
              Conflicts on {conflicts.length} branch{conflicts.length === 1 ? '' : 'es'}
            </small>
            <div>
              {conflicts.map(c =>
                <div className={this.styles.branch}>
                  <div className={this.styles.branchIcon}>
                    {GIT_BRANCH_ICON}
                  </div>
                  <div className={this.styles.branchTextContainer}>
                    <div className={this.styles.branchText}>
                      {c.otherStakeholder.branch}
                    </div>
                    {showInfoIcon &&
                      <button className={this.styles.branchInfoIcon} title="View conflicts">
                        {MAGNIFY_DOCUMENT_ICON}
                      </button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={this.styles.separator} />
      </div>
    );
  }
}
