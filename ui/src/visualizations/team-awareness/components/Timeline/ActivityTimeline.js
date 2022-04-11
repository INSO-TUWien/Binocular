import StackedAreaChart from '../../../../components/StackedAreaChart';
import _ from 'lodash';

export default class ActivityTimeline extends StackedAreaChart {
  constructor(props) {
    super(props);
  }

  // eslint-disable-next-line no-unused-vars
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const zoomedChanged = this.state.zoomed !== nextState.zoomed;
    const zoomDimsDifference = _.difference(this.state.zoomedDims, nextState.zoomedDims);
    const { onDimensionsRestricted } = this.props;

    if (zoomedChanged || zoomDimsDifference.length > 0) {
      onDimensionsRestricted({
        activityRestricted: nextState.zoomed,
        activityDims: nextState.zoomedDims
      });
    }
    return true;
  }
}
