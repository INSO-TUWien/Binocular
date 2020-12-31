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
import { hash } from '../../utils/crypto-utils';

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
      ? [d3.min(this.state.data.stackedData[0], d => d.data.date), new Date()]
      : [d3.min(data, d => d.date), new Date()];
  }

  /**
   *
   * @param data
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getYDims(data) {
    const maxDiff = d3.max(data, d => d.totalDiff) || 1;
    return [-maxDiff, maxDiff];
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

    const keys = this.props.keys ? this.props.keys : stackedData.filter(stream => stream.length).map(stream => createStreamKey(stream[0]));
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

    const attributes = Array.from(new Set(data.map(record => record.attribute)));
    const colors = chroma
      .scale(['#88fa6e', '#10a3f0'])
      .mode('lch')
      .colors(attributes.length)
      .map(color => chroma(color).alpha(0.9).hex('rgba'));

    stackedData.forEach(stack => {
      const nameColorKey = Object.keys(this.props.palette).find(
        colorKey =>
          colorKey.toLowerCase().includes(stack.key.name.toLowerCase()) &&
          colorKey.toLowerCase().includes(stack.key.direction.toLowerCase())
      );
      return (stack.color = {
        attribute: chroma(colors[attributes.indexOf(stack.key.attribute)]).alpha(0.9).hex('rgba'),
        name: chroma(this.props.palette[nameColorKey]).alpha(0.9).hex('rgba')
      });
    });

    //d3.stackOffsetDiverging(stackedData, Object.keys(keys));

    // console.log({ stackedData, data });
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
        const additionStream = this.createStack(stream, index * 2, record => [
          this.calcYDim(record.buildSuccessRate),
          this.calcYDim(record.buildSuccessRate) + record.additions + (record.sha === null ? 0.001 : 0)
        ]);
        const deletionStream = this.createStack(stream, index * 2 + 1, record => [
          this.calcYDim(record.buildSuccessRate) - record.deletions - (record.sha === null ? 0.001 : 0),
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
      new Date(data[0].date.getTime() + dateDiff)
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
      dataPoint.key = createStreamKey(record);
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
    return y * 1000;
  }

  /**
   *
   * @param brushArea
   * @param pathStreams
   * @param data
   */
  additionalPathDefs(brushArea, pathStreams, data) {
    const gradients = brushArea
      .append('defs')
      .selectAll('pattern')
      .data(data)
      .enter()
      .append('pattern')
      .attr('width', 20)
      .attr('height', 20)
      .attr('id', d => `color-${d.key.toId()}`)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('x', (d, i) => `${i * 15}`)
      .attr('y', (d, i) => `${i * 25}`)
      .attr('patternTransform', (d, i) => `rotate(${(i * 360 / data.length + 1 * i) % 360} 50 50)`);

    gradients.append('rect').attr('fill', d => d.color.attribute).attr('width', '100%').attr('height', '100%');

    gradients.append('circle').attr('fill', d => d.color.name).attr('cx', 10).attr('cy', 10).attr('r', 10.5);

    pathStreams.attr('opacity', 0.9);
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
    tooltip.attr('color', `${stream.color.name} repeat`);
    tooltip.attr('borderColor', stream.color.attribute);
    this.paintDataPoint(brushArea, x(nearestDataPoint.data.date), y(nearestDataPoint[0]), y(nearestDataPoint[1]), stream.color.name);
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
    this.state.data.stackedData.filter(dataStream => dataStream.key.eqPrimKey(stream.key)).forEach(dataStream => {
      d3.select(`#${this.getBrushId(dataStream)}`).raise();
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
    brushArea.selectAll('.layer').sort((streamA, streamB) => {
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

/**
 *
 * @param node
 * @returns {{name: *, attribute: ((function(): (undefined|*))|{boundary: string, values: string[]}), direction: string}}
 */
export const createStreamKey = node => {
  const record = {
    attribute: node.attribute,
    name: node.name,
    direction: ''
  };
  record.eq = function(item) {
    return record === item || !Object.keys(record).filter(key => typeof record[key] === 'function').find(key => record[key] !== item[key]);
  };
  record.eqPrimKey = function(item) {
    return record === item || (record.name === item.name && record.attribute === item.attribute);
  };
  record.toString = function() {
    return `${record.direction}-${record.attribute}-${record.name}`;
  };
  record.toId = function() {
    return hash(`${record.direction}-${record.attribute}-${record.name}`);
  };
  return record;
};

export default DataRiverChartComponent;
