'use strict';

import { connect } from 'react-redux';
import {
  setActiveIssue,
  setFilteredCommits,
  setFilteredFiles
} from '../../../sagas/IssueImpact.js';
import SearchBox from '../../SearchBox';
import FilterBox from '../../FilterBox';
import styles from './styles.scss';
import emojify from 'emoji-replace';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    issue: state.issueImpactData.data.issue,
    issues: state.issueImpactData.data.issues,
    filteredCommits: state.issueImpactConfig.filteredCommits,
    files: state.issueImpactConfig.files,
    filteredFiles: state.issueImpactConfig.filteredFiles
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetIssue: issue => dispatch(setActiveIssue(issue)),
    onSetFilteredCommits: commits => dispatch(setFilteredCommits(commits)),
    onSetFilteredFiles: files => dispatch(setFilteredFiles(files))
  };
};

const IssueImpactConfigComponent = props => {
  console.log(props);
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <label className="label">Choose issue to visualize:</label>
          <SearchBox
            placeholder="Select issue..."
            options={props.issues}
            renderOption={i => `#${i.iid} ${i.title}`}
            value={props.issue}
            onChange={issue => props.onSetIssue(issue)}
          />
          {props.issue &&
            <a href={props.issue.webUrl} target="_blank">
              View #{props.issue.iid} on GitLab
            </a>}
        </div>

        {props.issue &&
          <div className="field">
            <label className="label">Filter commits</label>
            <FilterBox
              options={props.issue.commits.map(c => ({
                label: `${c.shortSha} ${emojify(c.messageHeader)}`,
                value: c.sha
              }))}
              checkedOptions={props.filteredCommits}
              onChange={props.onSetFilteredCommits}
            />
          </div>}

        {props.issue &&
          <div className="field">
            <label className="label">Filter files</label>
            <FilterBox
              options={props.files.map(f => ({
                label: f,
                value: f
              }))}
              checkedOptions={props.filteredFiles}
              onChange={props.onSetFilteredFiles}
            />
          </div>}
      </form>
    </div>
  );
};

const IssueImpactConfig = connect(mapStateToProps, mapDispatchToProps)(IssueImpactConfigComponent);

export default IssueImpactConfig;
