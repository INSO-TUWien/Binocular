'use strict';

import Promise from 'bluebird';
import _ from 'lodash';
import { connect } from 'react-redux';
import { inflect } from 'inflection';

import { setActiveIssue, setFilteredCommits, setFilteredFiles } from './sagas';
import SearchBox from '../../../components/SearchBox';
import FilterBox from '../../../components/FilterBox';
import styles from './styles.scss';

import { graphQl, emojify } from '../../../utils';
import Database from '../../../database/database';

const mapStateToProps = (state /*, ownProps*/) => {
  const iiState = state.visualizations.issueImpact.state;

  return {
    issue: iiState.data.data.issue,
    filteredCommits: iiState.config.filteredCommits,
    files: iiState.config.files,
    filteredFiles: iiState.config.filteredFiles,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetIssue: (issue) => dispatch(setActiveIssue(issue)),
    onSetFilteredCommits: (commits) => dispatch(setFilteredCommits(commits)),
    onSetFilteredFiles: (files) => dispatch(setFilteredFiles(files)),
  };
};

const IssueImpactConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <label className="label">Choose issue to visualize:</label>
          <SearchBox
            placeholder="Select issue..."
            renderOption={(i) => `#${i.iid} ${i.title}`}
            search={(text) => {
              return Promise.resolve(Database.searchIssues(text)).map((i) => {
                i.createdAt = new Date(i.createdAt);
                i.closedAt = i.closedAt && new Date(i.closedAt);
                return i;
              });
            }}
            value={props.issue}
            onChange={(issue) => {
              if (issue !== null) {
                props.onSetIssue(issue);
              }
            }}
          />
          {props.issue && (
            <a href={props.issue.webUrl} target="_blank">
              View #{props.issue.iid} on ITS
            </a>
          )}
        </div>

        {props.issue && (
          <div className="field">
            <label className="label">
              Filter {props.issue.commits.length} {inflect('commit', props.issue.commits.length)}
            </label>
            <FilterBox
              options={_(props.issue.commits.data)
                .uniqBy((c) => c.sha)
                .map((c) => ({
                  label: `${c.shortSha} ${emojify(c.messageHeader)}`,
                  value: c.sha,
                }))
                .value()}
              checkedOptions={props.filteredCommits}
              onChange={props.onSetFilteredCommits}
            />
          </div>
        )}

        {props.issue && (
          <div className="field">
            <label className="label">
              Filter {props.files.length} {inflect('file', props.files.length)}
            </label>
            <FilterBox
              options={_(props.files)
                .map((f) => ({
                  label: f,
                  value: f,
                }))
                .sortBy('label')
                .value()}
              checkedOptions={props.filteredFiles}
              onChange={props.onSetFilteredFiles}
            />
          </div>
        )}
      </form>
    </div>
  );
};

const IssueImpactConfig = connect(mapStateToProps, mapDispatchToProps)(IssueImpactConfigComponent);

export default IssueImpactConfig;
