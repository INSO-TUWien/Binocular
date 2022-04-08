'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { setActivityScale } from './sagas';
import StackedAreaChart from '../../components/StackedAreaChart';
import * as d3 from 'd3';
import { getState } from './util/util';
import _ from 'lodash';

const mapStateToProps = (appState /*, ownProps*/) => {
  const dataState = getState(appState).data;
  console.log(dataState);
  return {
    config: {
      selectedActivity: getState(appState).config.selectedActivity
    },
    data: {
      activityTimeline: dataState.data.activityTimeline,
      yDims: dataState.data.dataBoundaries
    }
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onSelectActivityScale: selectActivity => dispatch(setActivityScale(selectActivity))
  };
};

class ConfigComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { activityTimeline, yDims } = this.props.data;
    return (
      <div>
        <div>
          <div>Timeline</div>
          <StackedAreaChart
            palette={{ activity: '#00bcd4' }}
            paddings={{ top: 20, left: 25, bottom: 22, right: 30 }}
            resolution={'weeks'}
            xAxisCenter={true}
            content={activityTimeline}
            d3offset={d3.stackOffsetDiverging}
            yDims={_.values(yDims)}
          />
        </div>
        <div>
          <div>Activity:</div>
          <div>
            <select value={this.props.config.selectedActivityScale} onChange={value => this.props.onSelectActivityScale(value)}>
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
