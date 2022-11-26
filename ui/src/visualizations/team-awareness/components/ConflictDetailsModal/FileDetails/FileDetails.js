import React from 'react';
import * as styles from './FileDetails.scss';
import { LOADING_ICON } from '../Icons';

export default class FileDetails extends React.Component {
  constructor(props) {
    super(props);
    this.styles = Object.assign({}, styles);
  }

  render() {
    const { isFileDetailsProcessing, fileDetails: { selectedConflict } } = this.props;
    const { conflictStakeholder, otherStakeholder } = selectedConflict;

    console.log(this.props);

    if (isFileDetailsProcessing) {
      return (
        <div className={this.styles.loadingWrapper}>
          <div className={this.styles.loadingIcon}>
            {LOADING_ICON}
          </div>
          <div>Loading file conflict details</div>
        </div>
      );
    }
    return (
      <div>
        <div>
          Conflict between branches <a>{conflictStakeholder.branch}</a> and <a>{otherStakeholder.branch}</a>
        </div>
      </div>
    );
  }
}
