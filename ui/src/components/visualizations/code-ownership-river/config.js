'use strict';

import _ from 'lodash';
import { connect } from 'react-redux';
import {
  setShowIssues,
  setHighlightedIssue,
  setCommitAttribute
} from '../../../sagas/CodeOwnershipRiver.js';
import SearchBox from '../../SearchBox';
import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    issues: _.get(state, 'codeOwnershipData.data.issues'),
    showIssues: state.codeOwnershipConfig.showIssues,
    highlightedIssue: state.codeOwnershipConfig.highlightedIssue,
    commitAttribute: state.codeOwnershipConfig.commitAttribute
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetShowIssues: isShown => dispatch(setShowIssues(isShown)),
    onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr))
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
            options={props.issues}
            renderOption={i => `#${i.iid} ${i.title}`}
            value={props.highlightedIssue}
            onChange={issue => props.onSetHighlightedIssue(issue)}
          />
        </div>

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
      </form>
    </div>
  );
};

const CodeOwnershipRiverConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeOwnershipRiverConfigComponent
);

export default CodeOwnershipRiverConfig;
