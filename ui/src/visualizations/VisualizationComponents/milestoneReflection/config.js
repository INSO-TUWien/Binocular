'use strict';

import { connect } from 'react-redux';
// import { Tooltip } from 'react-tippy';
// import TabCombo from '../../components/TabCombo.js';

// import { setCategory, setSplitCommits, setIssueField } from './sagas';

import styles from './styles.scss';
import SearchBox from '../../../components/SearchBox';
import { setIssueInfo, setMilestone } from './sagas';
import Promise from "bluebird";
import {graphQl} from "../../../utils";

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.milestoneReflection.state;

  return {
    issueInfo: dashboardState.config.issueInfo,
    milestone: dashboardState.config.milestone,
    issues: dashboardState.config.issues,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onIssueInfoChange: (issueInfo) => dispatch(setIssueInfo(issueInfo)),
    onMilestoneChange: (milestone) => dispatch(setMilestone(milestone)),
  };
};

const MilestoneReflectionConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <label className="label">Displayed Issue Information:</label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.issueInfo === 'loc'}
                onChange={() => props.onIssueInfoChange('loc')}
              />
              LOC
            </label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.issueInfo === 'time'}
                onChange={() => props.onIssueInfoChange('time')}
              />
              Time
            </label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.issueInfo === 'ciBuild'}
                onChange={() => props.onIssueInfoChange('ciBuild')}
              />
              CI Build
            </label>
          </div>
        </div>
        <div className="field">
          <label className="label">Choose issue to visualize:</label>
          <SearchBox
            placeholder="Select issue..."
            renderOption={(i) => `# ${i.title}`}
            search={(text) => {
              return [
                { iid: 1, title: 'Milestone 1', rangeBegin: 0, rangeEnd: 4 },
                { iid: 2, title: 'Milestone 2', rangeBegin: 5, rangeEnd: 13 },
                { iid: 3, title: 'Milestone 3', rangeBegin: 13, rangeEnd: 25 },
              ];
            }}
            value={props.milestone}
            onChange={(milestone) => {
              if (milestone !== null) {
                props.onMilestoneChange(milestone);
              }
            }}
          />
        </div>
      </form>
    </div>
  );
};
/*
<div className="field">
  <label className="label">Select Milestone: </label>
<SearchBox
  placeholder="Milestone..."
  renderOption={(i) => `# milestone ${i}`}
  search={(text) => {
    debugger;
    const p1 = new Promise((res) =>
      setTimeout(() => {
        return [{ id: 1 }, { id: 2 }, { id: 3 }];
      }, 1000)
    );

    return p1.then((i) => {
      return i;
    });

    new Promise(() => {
      return [{ id: 1 }, { id: 2 }, { id: 3 }];
    });
  }}
  value={props.config.issueInfo}
  onChange={(issue) => {
    if (issue !== null) {
      console.log('issue');
      console.log(issue);
      // set issue in state
      // props.onSetIssue(issue);
    }
  }}
  // onChange={(milestone) => props.onSetHighlightedIssue(milestone)}
/>
</div>
*/
const MilestoneReflectionConfig = connect(mapStateToProps, mapDispatchToProps)(MilestoneReflectionConfigComponent);

export default MilestoneReflectionConfig;

/*
    <div className={styles.configContainer}>
      <div className={styles.field}>
        <div className="control">
          <TabCombo
            value={props.showIssues}
            options={[
              { label: 'All', icon: 'database', value: 'all' },
              { label: 'Open', icon: 'folder-open', value: 'open' },
              { label: 'Closed', icon: 'folder', value: 'closed' },
            ]}
            onChange={(value) => props.onClickIssues(value)}
          />
        </div>
      </div>

 <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <label className="label">Categorize commits by:</label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'count'}
                onChange={() => props.onChangeCommitAttribute('count')}
              />
              Count
            </label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'changes'}
                onChange={() => props.onChangeCommitAttribute('changes')}
              />
              Changes
            </label>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Overlay:</label>
            <TabCombo
              value={props.overlay}
              onChange={value => props.onSetOverlay(value)}
              options={[
                { label: 'None', icon: 'times', value: 'none' },
                { label: 'Issues', icon: 'ticket-alt', value: 'issues' },
                { label: 'CI Builds', icon: 'server', value: 'builds' }
              ]}
            />
          </div>
        </div>

        {props.overlay === 'issues' &&
          <div className="field">
            <SearchBox
              placeholder="Highlight issue..."
              renderOption={i => `#${i.iid} ${i.title}`}
              search={text => {
                return Promise.resolve(
                  graphQl.query(
                    `
                  query($q: String) {
                    issues(page: 1, perPage: 50, q: $q, sort: "DESC") {
                      data { iid title createdAt closedAt }
                    }
                  }`,
                    { q: text }
                  )
                )
                  .then(resp => resp.issues.data)
                  .map(i => {
                    i.createdAt = new Date(i.createdAt);
                    i.closedAt = i.closedAt && new Date(i.closedAt);
                    return i;
                  });
              }}
              value={props.highlightedIssue}
              onChange={issue => props.onSetHighlightedIssue(issue)}
            />
          </div>}
      </form>
    </div>



 */
