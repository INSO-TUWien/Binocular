'use strict';

import * as d3 from 'd3';
import chroma from 'chroma-js';
import { BuildStat, RiverData } from './RiverData';
import styles from './data-river-chart.component.scss';
import ScalableBaseChartComponent from '../ScalableBaseChart';
import { NoImplementationException } from '../../utils/exception/NoImplementationException';
import _ from 'lodash';
import { RiverDataContainer } from './RiverDataContainer';
import { InvalidArgumentException } from '../../utils/exception/InvalidArgumentException';
import { formatDate } from '../../utils/date';

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
  // eslint-disable-next-line no-unused-vars
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
    const streamData = _.flatMap(reorganizedData.grouped);

    //Data formatted for d3
    stackedData = streamData.reduce((stack, stream, index) => {
      const additionStream = this.createStack(stream, index * 2, record => [
        this.calcYDim(record.y),
        this.calcYDim(record.y) + record.additions
      ]);
      const deletionStream = this.createStack(stream, index * 2 + 1, record => [
        this.calcYDim(record.y) - record.deletions,
        this.calcYDim(record.y)
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

    const colors = chroma.scale('spectral').mode('lch').colors(stackedData.length).map(color => chroma(color).alpha(0.85).hex('rgba'));

    stackedData.forEach((stack, index) => (stack.color = colors[index]));

    const keys = /*this.props.keys && this.props.keys.length > 0
        ? this.props.keys
        : */ stackedData
      .filter(stream => stream.length)
      .map(stream => createStreamId(stream[0]));

    d3.stackOffsetDiverging(stackedData, Object.keys(keys));

    return { stackedData, data };
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

  /**
   *
   * @param data
   * @returns {*}
   */
  preprocessData(data) {
    const maxDiff = d3.max(data, d => d.additions + d.deletions);

    return data.reduce((current, record) => {
      const container = current.getValue(record.name).getValue(record.attribute);
      const previous = container.values.length ? container.values[container.values.length - 1].value : undefined;
      const leaf = container.getValue(record.date.getTime());
      record.y =
        (previous ? previous.y : 0.0) +
        (record.buildStat === BuildStat.Success
          ? record.buildWeight * record.totalDiff / maxDiff
          : record.buildStat === BuildStat.Failed ? -record.buildWeight * record.totalDiff / maxDiff : 0.0);
      leaf.value = record;
      return current;
    }, new RiverDataContainer(''));
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
    if (Math.abs(mouseoverDate - candidate1.date) < Math.abs(mouseoverDate - candidate2.date)) {
      nearestDataPoint = candidate1;
    } else {
      nearestDataPoint = candidate2;
    }
    const key = d3.select(path).attr('id');
    const text = key.split(' <', 1); //Remove git signature email
    let value = nearestDataPoint[key];
    const chartValues = this.findChartValues(data, key, nearestDataPoint.date);
    const formattedDate = formatDate(new Date(nearestDataPoint.date), resolution);
    if (value < 0) {
      value *= -1;
    }

    //Render tooltip
    tooltip
      .html(formattedDate + '<hr/>' + '<div style="background: ' + palette[key] + '">' + '</div>' + text + ': ' + Math.round(value))
      .style('position', 'absolute')
      .style('left', event.layerX - 20 + 'px')
      .style('top', event.layerY + (node.getBoundingClientRect() || { y: 0 }).y - 70 + 'px');
    brushArea.select('.' + this.styles.indicatorLine).remove();
    brushArea.selectAll('.' + this.styles.indicatorCircle).remove();
    brushArea
      .append('line')
      .attr('class', this.styles.indicatorLine)
      .attr('x1', x(nearestDataPoint.date))
      .attr('x2', x(nearestDataPoint.date))
      .attr('y1', y(chartValues.y1))
      .attr('y2', y(chartValues.y2))
      .attr('clip-path', 'url(#clip)');

    brushArea
      .append('circle')
      .attr('class', this.styles.indicatorCircle)
      .attr('cx', x(nearestDataPoint.date))
      .attr('cy', y(chartValues.y2))
      .attr('r', 5)
      .attr('clip-path', 'url(#clip)')
      .style('fill', palette[key]);

    brushArea
      .append('circle')
      .attr('class', this.styles.indicatorCircle)
      .attr('cx', x(nearestDataPoint.date))
      .attr('cy', y(chartValues.y1))
      .attr('r', 5)
      .attr('clip-path', 'url(#clip)')
      .style('fill', palette[key]);
  }

  // eslint-disable-next-line no-unused-vars
  getBrushId(data) {
    return data.key;
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
