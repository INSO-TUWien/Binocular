'use strict';

import * as d3 from 'd3';
import chroma from 'chroma-js';
import { BuildStat, RiverData } from './RiverData';
import styles from './data-river-chart.component.scss';
import ScalableBaseChartComponent from '../ScalableBaseChart';
import _ from 'lodash';
import { RiverDataContainer } from './RiverDataContainer';
import { InvalidArgumentException } from '../../utils/exception/InvalidArgumentException';
import RiverTooltip from './river-tooltip';

export class DataRiverChartComponent extends ScalableBaseChartComponent {
  constructor(props) {
    super(props, styles);
  }

  /**
   *
   * @param scaleX
   * @param scaleY
   * @returns {*}
   */
  // eslint-disable-next-line no-unused-vars
  createAreaFunction(scaleX, scaleY) {
    //Area generator for the chart
    return d3
      .area()
      .x(function(d) {
        return scaleX(d.data.date);
      })
      .y0(function(d) {
        return scaleY(d[0]);
      })
      .y1(function(d) {
        return scaleY(d[1]);
      })
      .curve(d3.curveMonotoneX);
  }

  /**
   *
   * @param data
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getXDims(data) {
    return [d3.min(data, d => d.date), d3.max(data, d => d.date)];
  }

  /**
   *
   * @param data
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getYDims(data) {
    const maxDiff = d3.max(data, d => d.totalDiff);
    return [-maxDiff, maxDiff];
  }

  getColor(palette, d) {
    return d.color;
  }

  /**
   *
   * @param x
   * @param stackedData
   * @param xAxis
   * @param brushArea
   * @param area
   * @param data
   */
  // eslint-disable-next-line no-unused-vars
  resetZoom(x, stackedData, xAxis, brushArea, area, data) {
    x.domain(this.getXDims(data));
    xAxis.call(d3.axisBottom(x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: false });
  }

  /**
   * Calculate data for the chart.
   * @param data Chart data in the format [{date: timestamp(ms), series1: value, series2: value, series3: value, series4: value, ...}, ...]
   * @param order
   * @returns Stacked chart data for d3 functions and preprocessed data { stackedData, data }
   */
  calculateChartData(data, order) {
    //Keys are the names of the developers, date is excluded
    //const keys = this.props.keys && this.props.keys.length > 0 ? this.props.keys : Object.keys(data[0]).slice(1);
    let stackedData = [];

    if (!data.length) {
      return { stackedData, data };
    }

    if (data.find(record => !(record instanceof RiverData))) {
      throw new InvalidArgumentException('The provided data are not of the type RiverData!');
    }

    data = data.map(record => new RiverData(record)).sort((o1, o2) => (o1 < o2 ? -1 : o1 > o2 ? 1 : 0));

    const reorganizedData = this.preprocessData(data);
    const streamData = _.flatMap(reorganizedData.grouped.map(record => record.sort()));

    //Data formatted for d3
    stackedData = this.createStackedData(streamData);

    const colors = chroma.scale('spectral').mode('lch').colors(stackedData.length).map(color => chroma(color).alpha(0.85).hex('rgba'));

    stackedData.forEach((stack, index) => (stack.color = colors[index]));

    const keys = /*this.props.keys && this.props.keys.length > 0
        ? this.props.keys
        : */ stackedData
      .filter(stream => stream.length)
      .map(stream => createStreamId(stream[0]));

    d3.stackOffsetDiverging(stackedData, Object.keys(keys));

    // console.log({ stackedData, data });
    return { stackedData, data };
  }

  /**
   *
   * @param streamData
   * @returns {[]}
   */
  createStackedData(streamData) {
    return streamData.reduce((stack, stream, index) => {
      const additionStream = this.createStack(stream, index * 2, record => [
        this.calcYDim(record.buildSuccessRate),
        this.calcYDim(record.buildSuccessRate) + record.additions
      ]);
      const deletionStream = this.createStack(stream, index * 2 + 1, record => [
        this.calcYDim(record.buildSuccessRate) - record.deletions,
        this.calcYDim(record.buildSuccessRate)
      ]);

      if (additionStream && additionStream.length) {
        additionStream.key.direction = 'addition';
        additionStream.key[0] = additionStream.index;
        stack.push(additionStream);
      }
      if (deletionStream && deletionStream.length) {
        deletionStream.key.direction = 'deletions';
        deletionStream.key[0] = deletionStream.index;
        stack.push(deletionStream);
      }
      return stack;
    }, []);
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  preprocessData(data) {
    const maxDiff = d3.max(data, d => d.additions + d.deletions);
    const dateTicks = data.map(record => record.date);

    return data.reduce((current, record) => {
      const container = current.getValue(record.name).getValue(record.attribute);

      // init all existing date nodes
      if (!container.length) {
        dateTicks.forEach(date => (container.getValue(date.getTime()).value = new RiverData(date, record.attribute, record.name)));
      }

      const prevIndex = container.indexOf(record.date.getTime()) - 1;
      const previous = prevIndex >= 0 ? container.values[prevIndex].value : undefined;
      const leaf = container.getValue(record.date.getTime());

      // set ci success rate
      record.buildSuccessRate =
        (previous ? previous.buildSuccessRate : 0.0) +
        (record.buildStat === BuildStat.Success
          ? record.buildWeight * record.totalDiff / maxDiff
          : record.buildStat === BuildStat.Failed ? -record.buildWeight * record.totalDiff / maxDiff : 0.0);
      leaf.value = record;

      // set build rate for all future items until a new existing datapoint
      dateTicks.forEach((date, i) => {
        if (i > prevIndex + 1) container.getValue(date.getTime()).value.buildSuccessRate = record.buildSuccessRate;
      });
      return current;
    }, new RiverDataContainer(''));
  }

  /**
   *
   * @param stream
   * @param index
   * @param offset
   * @returns {{length}|*|*[]}
   */
  createStack(stream, index, offset) {
    const dataStream = stream.map((record, pointIndex) => {
      const dataPoint = offset(record);
      dataPoint.index = pointIndex;
      dataPoint.data = record;
      dataPoint.key = createStreamId(record);
      return dataPoint;
    });

    if (!dataStream || !dataStream.length) {
      return [];
    }

    dataStream.index = index;
    dataStream.key = dataStream[0].key;
    return dataStream;
  }

  calcYDim(y) {
    return y * 10000;
  }

  /**
   *
   * @param path
   * @param bisectDate
   * @param rawData
   * @param mouseoverDate
   * @param data
   * @param resolution
   * @param tooltip
   * @param palette
   * @param event
   * @param node
   * @param brushArea
   * @param x
   * @param y
   */
  createdTooltipNode(path, bisectDate, rawData, mouseoverDate, data, resolution, tooltip, palette, event, node, brushArea, x, y) {
    const nearestDateIndex = bisectDate(rawData, mouseoverDate);
    const candidate1 = rawData[nearestDateIndex];
    const candidate2 = rawData[nearestDateIndex - 1];
    let nearestDataPoint;
    if (!candidate1 || !candidate2) {
      return;
    }
    if (Math.abs(mouseoverDate - candidate1.date) < Math.abs(mouseoverDate - candidate2.date)) {
      nearestDataPoint = candidate1;
    } else {
      nearestDataPoint = candidate2;
    }

    if (this.nearestDataPoint && nearestDataPoint === this.nearestDataPoint) {
      return;
    }

    //console.log(nearestDataPoint);
    this.nearestDataPoint = nearestDataPoint;

    this.setState({
      tooltipData: nearestDataPoint,
      tooltipLeft: event.layerX - 20 - (node.getBoundingClientRect() || { x: 0 }).x + 'px',
      tooltipTop: event.layerY + (node.getBoundingClientRect() || { y: 0 }).y + 'px'
    });
  }

  onMouseover(tooltip, event) {
    this.setState({
      tooltipStyle: {
        position: 'absolute',
        display: 'inline'
      }
    });
  }

  onMouseLeave(tooltip, brushArea, event) {
    //
    this.setState({
      tooltipStyle: {}
    });
  }

  // eslint-disable-next-line no-unused-vars
  getBrushId(data) {
    return data.key;
  }

  render() {
    return (
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={svg => (this.svgRef = svg)} />
        <RiverTooltip
          ref={div => (this.tooltipRef = div)}
          data={this.state.tooltipData}
          tooltipTop={this.state.tooltipTop}
          tooltipLeft={this.state.tooltipLeft}
          style={this.state.tooltipStyle}
          attribute={this.props.attribute}
        />
      </div>
    );
  }
}

/**
 *
 * @param node
 * @returns {{name: *, attribute: ((function(): (undefined|*))|{boundary: string, values: string[]}), direction: string}}
 */
const createStreamId = node => {
  const record = {
    attribute: node.attribute,
    name: node.name,
    direction: ''
  };
  record.eq = function(item) {
    return record === item || !Object.keys(record).filter(key => typeof record[key] === 'function').find(key => record[key] !== item[key]);
  };
  record.toString = function() {
    return `${record.direction}-${record.attribute}-${record.name}`;
  };
  return record;
};

export default DataRiverChartComponent;
