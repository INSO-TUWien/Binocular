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
    return this.state.data.stackedData[0]
      ? [d3.min(this.state.data.stackedData[0], d => d.data.date), d3.max(this.state.data.stackedData[0], d => d.data.date)]
      : [d3.min(data, d => d.date), d3.max(data, d => d.date)];
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

  /**
   *
   * @param palette
   * @param d
   * @returns {*}
   */
  getColor(d) {
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

    data = data
      .filter(record => record && record instanceof RiverData)
      .map(record => new RiverData(record))
      .sort((record1, record2) => (record1.date < record2.date ? -1 : record1.date > record2.date ? 1 : 0));

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

    //d3.stackOffsetDiverging(stackedData, Object.keys(keys));

    // console.log({ stackedData, data });
    return { stackedData, data };
  }

  /**
   *
   * @param streamData
   * @returns {[]}
   */
  createStackedData(streamData) {
    const streamStack = streamData.reduce((stack, stream, index) => {
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
        additionStream.forEach(addition => (addition.key.direction = additionStream.key.direction));
        stack.push(additionStream);
      }
      if (deletionStream && deletionStream.length) {
        deletionStream.key.direction = 'deletions';
        deletionStream.key[0] = deletionStream.index;
        stack.push(deletionStream);
      }
      return stack;
    }, []);
    streamStack.forEach(stream => stream.forEach(record => (record.key.direction = stream.key.direction)));
    return streamStack;
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  preprocessData(data) {
    const maxDiff = d3.max(data, d => d.additions + d.deletions);

    //calculate minimum x difference
    const dateDiff =
      data
        .map(record => record.date)
        .filter(date => date && !Number.isNaN(date.getTime()) && !isNaN(date.getTime()))
        .map(date => date.getTime())
        .map((date, i, dates) => date - dates[i - 1])
        .filter(diff => !Number.isNaN(diff) && !isNaN(diff) && diff > 0)
        .sort()[0] || 1;

    const dateTicks = [
      new Date(data[0].date.getTime() - dateDiff),
      ...data.map(record => record.date),
      new Date(data[data.length - 1].date.getTime() + dateDiff)
    ];

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
   * @param tooltip
   * @param event
   * @param node
   * @param brushArea
   * @param x
   * @param y
   * @param stream
   */
  createdTooltipNode(path, bisectDate, rawData, mouseoverDate, data, tooltip, event, node, brushArea, x, y, stream) {
    const realDataStream = stream.filter(record => record && record.data && record.data.sha && record.data.sha.length > 0);
    const nearestDateIndex = bisectDate(realDataStream.map(record => record.data), mouseoverDate);
    const candidate1 = realDataStream[nearestDateIndex] || realDataStream[realDataStream.length - 1];
    const candidate2 = realDataStream[nearestDateIndex - 1] || realDataStream[0];
    let nearestDataPoint;
    if (!candidate1 || !candidate2) {
      return;
    }
    if (Math.abs(mouseoverDate - candidate1.data.date) < Math.abs(mouseoverDate - candidate2.data.date)) {
      nearestDataPoint = candidate1;
    } else {
      nearestDataPoint = candidate2;
    }

    tooltip.attr('data', nearestDataPoint.data);
    tooltip.attr('additional', nearestDataPoint.key.direction);
    tooltip.attr('color', stream.color);
    brushArea
      .append('line')
      .attr('class', this.styles.indicatorLine)
      .attr('x1', x(nearestDataPoint.data.date))
      .attr('x2', x(nearestDataPoint.data.date))
      .attr('y1', y(nearestDataPoint[0]))
      .attr('y2', y(nearestDataPoint[1]))
      .attr('clip-path', 'url(#clip)');

    brushArea
      .append('circle')
      .attr('class', this.styles.indicatorCircle)
      .attr('cx', x(nearestDataPoint.data.date))
      .attr('cy', y(nearestDataPoint[1]))
      .attr('r', 5)
      .attr('clip-path', 'url(#clip)')
      .style('fill', stream.color);

    brushArea
      .append('circle')
      .attr('class', this.styles.indicatorCircle)
      .attr('cx', x(nearestDataPoint.data.date))
      .attr('cy', y(nearestDataPoint[0]))
      .attr('r', 5)
      .attr('clip-path', 'url(#clip)')
      .style('fill', stream.color);
  }

  /**
   *
   * @param tooltip
   * @param event
   * @param stream
   */
  // eslint-disable-next-line no-unused-vars
  onMouseover(tooltip, event, stream) {
    event.preventDefault();
  }

  /**
   *
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // eslint-disable-next-line no-unused-vars
  onMouseLeave(tooltip, brushArea, event, stream) {
    tooltip.attr('data', null);
    brushArea.select('.' + this.styles.indicatorLine).remove();
    brushArea.selectAll('.' + this.styles.indicatorCircle).remove();
  }

  // eslint-disable-next-line no-unused-vars
  getBrushId(data) {
    return data.key;
  }

  render() {
    return (
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={svg => (this.svgRef = svg)} />
        <RiverTooltip ref={div => (this.tooltipRef = div)} attribute={this.props.attribute} />
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
