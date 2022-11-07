'use strict';

import { connect } from 'react-redux';
// import { Tooltip } from 'react-tippy';
// import TabCombo from '../../components/TabCombo.js';

// import { setCategory, setSplitCommits, setIssueField } from './sagas';

import styles from './styles.scss';
import SearchBox from '../../../components/SearchBox';
import { setIssueInfo, setMilestone } from './sagas';
import { mockMilestone } from './chart/index';

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
        <div className="field" id="milestone-searchbox">
          <label className="label">Choose issue to visualize:</label>
          <SearchBox
            placeholder="Select issue..."
            renderOption={(i) => `# ${i.title}`}
            search={(text) => {
              return mockMilestone;
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

const MilestoneReflectionConfig = connect(mapStateToProps, mapDispatchToProps)(MilestoneReflectionConfigComponent);

export default MilestoneReflectionConfig;
