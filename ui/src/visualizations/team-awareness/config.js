'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { setActivityDimensions, setActivityScale, setBranch } from './sagas';
import * as d3 from 'd3';
import { getState } from './util/util';
import _ from 'lodash';
import ActivityTimeline from './components/Timeline/ActivityTimeline';
import styles from './styles.scss';

const mapStateToProps = (appState /*, ownProps*/) => {
  const { config, data } = getState(appState);
  return {
    config: {
      selectedActivityScale: config.selectedActivityScale,
      selectedBranch: config.selectedBranch
    },
    data: {
      branches: data.data.branches,
      activityTimeline: data.data.activityTimeline,
      yDims: data.data.dataBoundaries
    }
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onSelectActivityScale: selectActivity => dispatch(setActivityScale(selectActivity)),
    onActivityDimensionsRestricted: restrictActivity => dispatch(setActivityDimensions(restrictActivity)),
    onSelectBranch: selectActivity => dispatch(setBranch(selectActivity))
  };
};

class ConfigComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onActivityDimensionsRestricted, onSelectActivityScale, config, onSelectBranch } = this.props;
    const { activityTimeline, yDims, branches } = this.props.data;
    console.log(activityTimeline);
    return (
      <div className={styles.configContainer}>
        <form>
          <div className="field">
            <label className="label">Activity</label>
            <div className="control">
              <div className={'select ' + styles.activitySelect}>
                <select
                  className={styles.activitySelect}
                  value={config.selectedActivityScale}
                  onChange={event => onSelectActivityScale(event.target.value)}>
                  <option value="commits">Commits</option>
                  <option value="activity">Additions & Deletions</option>
                  <option value="additions">Additions</option>
                  <option value="deletions">Deletions</option>
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Branches</label>
            <div className={'select ' + styles.branchesSelect}>
              <select
                className={styles.branchesSelect}
                value={config.selectedBranch}
                onChange={event => onSelectBranch(event.target.value)}>
                <option value="all">All Branches</option>
                {_.sortBy(branches, 'branch').map(branch =>
                  <option key={'branch_' + branch.id} value={branch.branch}>
                    {branch.branch}
                  </option>
                )}
              </select>
            </div>
          </div>
        </form>
        <div>
          <label className="label">Timeline</label>
          <ActivityTimeline
            palette={{ activity: '#00bcd4' }}
            paddings={{ top: 5, left: 30, bottom: 30, right: 30 }}
            resolution={'weeks'}
            xAxisCenter={true}
            content={activityTimeline && activityTimeline.length > 0 ? activityTimeline : [{ date: 0, activity: 0 }]}
            d3offset={d3.stackOffsetDiverging}
            yDims={_.values(yDims)}
            onDimensionsRestricted={dims => onActivityDimensionsRestricted(dims)}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
