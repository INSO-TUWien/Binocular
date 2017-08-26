'use strict';

import { connect } from 'react-redux';
import { setActiveIssue } from '../../../sagas/IssueImpact.js';
import SearchBox from '../../SearchBox';
import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  console.log('setting issue to', state.issueImpactData.data.issue);
  return {
    issue: state.issueImpactData.data.issue,
    issues: state.issueImpactData.data.issues
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetIssue: issue => dispatch(setActiveIssue(issue))
  };
};

const IssueImpactConfigComponent = props => {
  console.log('rendering issue impact config with issue', props.issue);
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <SearchBox
            placeholder="Select issue..."
            options={props.issues}
            renderOption={i => `#${i.iid} ${i.title}`}
            value={props.issue}
            onChange={issue => props.onSetIssue(issue)}
          />
        </div>
      </form>
    </div>
  );
};

const IssueImpactConfig = connect(mapStateToProps, mapDispatchToProps)(IssueImpactConfigComponent);

export default IssueImpactConfig;
