'use strict';

import _ from 'lodash';
import { connect } from 'react-redux';
import { setShowIssues, setHighlightedIssue } from '../../../sagas/CodeOwnershipRiver.js';
import SearchBox from '../../SearchBox';
import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    issues: _.get(state, 'codeOwnershipData.data.issues'),
    showIssues: state.codeOwnershipConfig.showIssues,
    highlightedIssue: state.codeOwnershipConfig.highlightedIssue
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetShowIssues: isShown => dispatch(setShowIssues(isShown)),
    onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue))
  };
};

const CodeOwnershipRiverConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <label className="checkbox" htmlFor="show-issues">
            <input
              type="checkbox"
              id="show-issues"
              checked={props.showIssues}
              onChange={e => props.onSetShowIssues(e.target.checked)}
            />
            Show issues
          </label>
        </div>
        <div className="field">
          <SearchBox
            placeholder="Highlight issue..."
            options={props.issues.map(i => ({ value: i, label: `#${i.iid} ${i.title}` }))}
            onChange={issue => props.onSetHighlightedIssue(issue)}
          />
        </div>
      </form>
    </div>
  );
};

const CodeOwnershipRiverConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeOwnershipRiverConfigComponent
);

export default CodeOwnershipRiverConfig;
