'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { setActivityDimensions, setActivityScale } from './sagas';
import * as d3 from 'd3';
import { getState } from './util/util';
import _ from 'lodash';
import ActivityTimeline from './components/Timeline/ActivityTimeline';

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
    const { onActivityDimensionsRestricted, onSelectActivityScale } = this.props;
    const { activityTimeline, yDims } = this.props.data;
    return (
      <div>
        <div>
          <div>Timeline</div>
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
        <div>
          <div>Activity:</div>
          <div>
            <select value={this.props.config.selectedActivityScale} onChange={value => onSelectActivityScale(value)}>
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
