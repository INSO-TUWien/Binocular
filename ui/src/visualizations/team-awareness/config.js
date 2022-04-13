'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { setActivityDimensions, setActivityScale } from './sagas';
import * as d3 from 'd3';
import { getState } from './util/util';
import _ from 'lodash';
import ActivityTimeline from './components/Timeline/ActivityTimeline';
import styles from './styles.scss';

const mapStateToProps = (appState /*, ownProps*/) => {
  const { config, data } = getState(appState);
  return {
    config: {
      selectedActivity: config.selectedActivity
    },
    data: {
      activityTimeline: data.data.activityTimeline,
      yDims: data.data.dataBoundaries
    }
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onSelectActivityScale: selectActivity => dispatch(setActivityScale(selectActivity)),
    onActivityDimensionsRestricted: restrictActivity => dispatch(setActivityDimensions(restrictActivity))
  };
};

class ConfigComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onActivityDimensionsRestricted, onSelectActivityScale, config } = this.props;
    const { activityTimeline, yDims } = this.props.data;
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
                  onChange={value => onSelectActivityScale(value)}>
                  <option value="commits">Commits</option>
                  <option value="activity">Additions & Deletions</option>
                  <option value="additions">Additions</option>
                  <option value="deletions">Deletions</option>
                </select>
              </div>
            </div>
          </div>
        </form>
        <div>
          <label className="label">Timeline</label>
          <ActivityTimeline
            palette={{ activity: '#00bcd4' }}
            paddings={{ top: 20, left: 25, bottom: 30, right: 30 }}
            resolution={'weeks'}
            xAxisCenter={true}
            content={activityTimeline}
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
