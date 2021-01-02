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
import { formatPercentage } from '../../utils/format';
import StreamKey from './StreamKey';

export class DataRiverChartComponent extends ScalableBaseChartComponent {
  constructor(props) {
    super(props, styles);
  }

  /**
   *
   * @param scales
   * @returns {*}
   */
  createAreaFunction(scales) {
    //Area generator for the chart
    return d3
      .area()
      .x(d => scales.x(d.data.date))
      .y0(d => this.getPoint(scales, d).y0)
      .y1(d => this.getPoint(scales, d).y1)
      .curve(d3.curveMonotoneX);
  }

  /**
   *
   * @param scales
   * @param dataPoint
   * @returns {{y0: number, y1: number}}
   */
  getPoint(scales, dataPoint) {
    const rate = scales.y(dataPoint.data.buildSuccessRate);
    const offset = scales.diff(0);
    return { y0: rate + scales.diff(dataPoint[0]) - offset, y1: rate + scales.diff(dataPoint[1]) - offset };
  }

  /**
   *
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getXDims() {
    return this.state.data.stackedData[0]
      ? [d3.min(this.state.data.stackedData[0], d => d.data.date), new Date()]
      : [d3.min(this.state.data.data, d => d.date), new Date()];
  }

  /**
   *
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getYDims() {
    return this.state.yDims;
  }

  /**
   *
   * @param d
   * @returns {*}
   */
  getColor(d) {
    return `url(#color-${d.key.toId()})`;
  }

  /**
   *
   * @param scales
   * @param axes
   * @param brushArea
   * @param area
   */
  // eslint-disable-next-line no-unused-vars
  resetZoom(scales, axes, brushArea, area) {
    scales.x.domain(this.getXDims());
    axes.x.call(d3.axisBottom(scales.x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: false });
  }

  /**
   * Update the vertical zoom (mouse wheel zoom) with new values
   * @param dims Y-Dimensions for new zoom level
   * @param scales Y-Scale from d3
   * @param axes Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  updateVerticalZoom(dims, scales, axes, area, areaGenerator) {
    scales.diff.domain(dims);

    area.selectAll('.layer').attr('d', areaGenerator);
    this.setState({ zoomedVertical: true, verticalZoomDims: dims });
  }

  /**
   * Reset the vertical zoom to default values.
   * @param scales Y-Scale from d3
   * @param axes Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  resetVerticalZoom(scales, axes, area, areaGenerator) {
    scales.diff.domain(this.getYDims());

    area.selectAll('.layer').attr('d', areaGenerator);

    this.setState({ zoomedVertical: false, verticalZoomDims: [0, 0] });
  }

  /**
   *
   * @param xDims
   * @param xRange
   * @param yDims
   * @param yRange
   * @returns {{issue: *, x: *, y: *}}
   */
  createScales(xDims, xRange, yDims, yRange) {
    //Y axis scaled with the maximum amount of change (half in each direction)
    const scales = super.createScales(xDims, xRange, yDims, yRange);

    const scale = {
      height: d3.scaleLinear().domain([0.0, 100.0]).range(yRange),
      width: d3.scaleLinear().domain([0.0, 100.0]).range(xRange)
    };

    return Object.assign({}, scales, {
      scale,
      issue: d3.scaleOrdinal().domain(['Close', 'Open']).range(yRange),
      y: d3.scaleLinear().domain([-1.0, 1.0]).range([scale.height(25), scale.height(75)]),
      diff: d3.scaleLinear().domain(scales.y.domain()).range([scale.height(70) - scale.height(100), 0])
    });
  }

  /**
   *
   * @param brushArea
   * @param scales
   * @param width
   * @param height
   * @param paddings
   * @returns {*}
   */
  createYAxis(brushArea, scales, width, height, paddings) {
    const yAxis = brushArea.append('g').attr('class', this.styles.axis).attr('transform', 'translate(' + paddings.left + ',0)');

    if (!this.props.hideVertical) {
      yAxis.call(d3.axisLeft(scales.y).tickFormat(d => `${formatPercentage((d * 100 + 100) / 2.0)}%`));
    }
    return yAxis;
  }

  /**
   *
   * @param brushArea
   * @param scales
   * @param width
   * @param height
   * @param paddings
   */
  additionalAxes(brushArea, scales, width, height, paddings) {
    const issueAxis = brushArea
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', 'translate(' + (width - paddings.right) + ',0)');

    if (!this.props.hideVertical) {
      issueAxis.call(d3.axisRight(scales.issue));
    }
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

    const keys = this.props.keys ? this.props.keys : stackedData.filter(stream => stream.length).map(stream => new StreamKey(stream[0]));
    //Data formatted for d3
    stackedData = this.createStackedData(streamData, keys);
    if (order && order.length) {
      stackedData.sort(
        (streamA, streamB) =>
          order.indexOf(streamA.key.name) < order.indexOf(streamB.key.name)
            ? -1
            : order.indexOf(streamA.key.name) > order.indexOf(streamB.key.name) ? 1 : 0
      );
    }

    //TODO: remove mocked
    const attributes = Array.from(new Set(data.map(record => record.attribute)));
    const colors = chroma
      .scale(['#88fa6e', '#10a3f0'])
      .mode('lch')
      .colors(attributes.length)
      .map(color => chroma(color).alpha(0.9).hex('rgba'));

    // add color set to stream
    stackedData.forEach(stack => {
      const nameColorKey = Object.keys(this.props.palette).find(
        colorKey =>
          colorKey.toLowerCase().includes(stack.key.name.toLowerCase()) &&
          colorKey.toLowerCase().includes(stack.key.direction.toLowerCase())
      );
      const color = {
        attribute: chroma(colors[attributes.indexOf(stack.key.attribute)]).alpha(0.9).hex('rgba'),
        name: chroma(this.props.palette[nameColorKey]).alpha(0.9).hex('rgba')
      };
      stack.forEach(node => (node.color = color));
      stack.color = color;
    });

    this.setState(prev =>
      Object.assign({}, prev, {
        yDims: [-d3.max(this.state.data.data, d => d.deletions) || 1, d3.max(this.state.data.data, d => d.additions) || 1]
      })
    );

    return { stackedData, data };
  }

  /**
   *
   * @param streamData
   * @param keys
   * @returns {[]}
   */
  createStackedData(streamData, keys) {
    const streamStack = streamData
      .filter(
        stream => !keys || (keys.length && !!keys.find(key => key && key.name === stream[0].name && key.attribute === stream[0].attribute))
      )
      .reduce((stack, stream, index) => {
        const additionStream = this.createStack(stream, index * 2, record => [0, record.additions + (record.sha === null ? 0.001 : 0)]);
        const deletionStream = this.createStack(stream, index * 2 + 1, record => [
          -record.deletions - (record.sha === null ? 0.001 : 0),
          0
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

      // define range of success rate
      record.buildSuccessRate =
        record.buildSuccessRate >= 0.0 ? Math.min(record.buildSuccessRate, 1.0) : Math.min(record.buildSuccessRate, -1.0);

      record.trend = Math.sign(record.buildSuccessRate - previous.buildSuccessRate);

      leaf.value = record;

      // set build rate for all future items until a new existing datapoint
      dateTicks.forEach(date => {
        if (date.getTime() > record.date.getTime()) container.getValue(date.getTime()).value.buildSuccessRate = record.buildSuccessRate;
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
      dataPoint.key = new StreamKey(record);
      return dataPoint;
    });

    if (!dataStream || !dataStream.length) {
      return [];
    }

    dataStream.index = index;
    dataStream.key = dataStream[0].key;
    return dataStream;
  }

  /**
   *
   * @param brushArea
   * @param pathStreams
   */
  additionalPathDefs(brushArea, pathStreams) {
    const gradients = brushArea
      .append('defs')
      .selectAll('pattern')
      .data(this.state.data.stackedData)
      .enter()
      .append('pattern')
      .attr('width', 20)
      .attr('height', 20)
      .attr('id', d => `color-${d.key.toId()}`)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('x', (d, i) => `${i * 15}`)
      .attr('y', (d, i) => `${i * 25}`)
      .attr('patternTransform', (d, i) => `rotate(${(i * 360 / this.state.data.stackedData.length + 1 * i) % 360} 50 50)`);

    gradients.append('rect').attr('fill', d => d.color.attribute).attr('width', '100%').attr('height', '100%');

    gradients.append('circle').attr('fill', d => d.color.name).attr('cx', 10).attr('cy', 10).attr('r', 10.5);

    pathStreams.attr('opacity', 0.9);
  }

  /**
   *
   * @param path
   * @param bisectDate
   * @param mouseoverDate
   * @param tooltip
   * @param event
   * @param node
   * @param brushArea
   * @param scales
   * @param stream
   */
  createdTooltipNode(path, bisectDate, mouseoverDate, tooltip, event, node, brushArea, scales, stream) {
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
    tooltip.attr('color', `${stream.color.name}`);
    tooltip.attr('attrColor', stream.color.attribute);
    const dataPoint = this.getPoint(scales, nearestDataPoint);
    this.paintDataPoint(brushArea, scales.x(nearestDataPoint.data.date), dataPoint.y0, dataPoint.y1, stream.color.name);
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // eslint-disable-next-line no-unused-vars
  onMouseover(path, tooltip, brushArea, event, stream) {
    this.state.data.stackedData.forEach(dataStream => {
      if (dataStream.key.eqPrimKey(stream.key)) {
        d3.select(`#${this.getBrushId(dataStream)}`).raise().attr('opacity', 1);
      } else {
        d3.select(`#${this.getBrushId(dataStream)}`).attr('opacity', 0.5);
      }
    });
    event.preventDefault();
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // eslint-disable-next-line no-unused-vars
  onMouseLeave(path, tooltip, brushArea, event, stream) {
    tooltip.attr('data', null);
    brushArea.select('.' + this.styles.indicatorLine).remove();
    brushArea.selectAll('.' + this.styles.indicatorCircle).remove();
    brushArea.selectAll('.layer').attr('opacity', 0.9).sort((streamA, streamB) => {
      return streamA.index - streamB.index;
    });
  }

  // eslint-disable-next-line no-unused-vars
  getBrushId(data) {
    return `stream-${data.key.toId()}`;
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

export default DataRiverChartComponent;
