'use strict';

import { connect } from 'react-redux';
import { setShowIssues } from '../../../sagas/CodeOwnershipRiver.js';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    showIssues: state.codeOwnershipConfig.showIssues
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetShowIssues: isShown => dispatch(setShowIssues(isShown))
  };
};

const CodeOwnershipRiverConfigComponent = props => {
  return (
    <div>
      <form>
        <label className="checkbox" htmlFor="show-issues">
          <input
            type="checkbox"
            id="show-issues"
            checked={props.showIssues}
            onChange={e => props.onSetShowIssues(e.target.checked)}
          />
          Show issues
        </label>
      </form>
    </div>
  );
};

const CodeOwnershipRiverConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeOwnershipRiverConfigComponent
);

export default CodeOwnershipRiverConfig;
