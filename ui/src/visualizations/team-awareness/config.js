'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { setSelectActivity } from './sagas';

const mapStateToProps = (appState /*, ownProps*/) => {
  const awarenessState = appState.visualizations.teamAwareness.state.config;
  return {
    config: {
      selectedActivity: awarenessState.selectedActivity
    }
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onSelectActivity: selectActivity => dispatch(setSelectActivity(selectActivity))
  };
};

class ConfigComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div>
          <div>Activity:</div>
          <div>
            <select value={this.props.config.selectedActivity} onChange={value => this.props.onSelectActivity(value)}>
              <option value="commits">Commits</option>
              <option value="activity">Additions & Deletions</option>
              <option value="additions">Additions</option>
              <option value="deletions">Deletions</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
