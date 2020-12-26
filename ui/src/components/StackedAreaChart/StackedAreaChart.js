'use strict';

import styles from './stackedAreaChart.scss';
import ScalableBaseChartComponent from '../ScalableBaseChart';
import * as d3 from 'd3';
import _ from 'lodash';
import { formatDate } from '../../utils/date';

/**
 * Stacked area chart
 * Takes the following props:
 *  - content (Format: [{date: timestamp(ms), seriesName1: number, seriesName2, number, ...}, ...],
 *             e.g. array of data points with date and series values)
 *  - palette (Format: {seriesName1: color1, seriesName2: color2, ...}, color in format "#ffffff" as string)
 *  - paddings (optional) (Format: {top: number, left: number, right: number, bottom: number},
 *             number being amount of pixels) Each field in the object is optional and can be left out)
 *  - xAxisCenter (optional) (Format: true/false,
 *             whether the x axis should be at the 0 line (true), or at the bottom (false/unspecified))
 *  - yDims (Format: [topValue, bottomValue],
 *             limits of the y-Axis on top/bottom, should correspond to data.)
 *  - d3offset (Format: d3.stackOffsetNone/d3.stackOffsetDiverging/d3.stackOffsetSilhouette/...
 *             determines the way data is stacked, check d3 docs)
 *  - keys (optional) (Format: [seriesName1, seriesName2, ...])
 *             Filters the chart, only showing the provided keys and leaving everything else out.
 *  - resolution (Format: 'years'/'months'/'weeks'/'days') Needed for date format in tooltips.
 *  - displayNegative (optional) (Format: true/false) Display negative numbers on y-scale.
 *  - order (optional) (Format: [string, string, ...]) Strings containing the keys in desired order (largest to smallest).
 */
export default class StackedAreaChart extends ScalableBaseChartComponent {
  constructor(props) {
    super(props, styles);
  }

  /**
   *
   * @param data
   * @returns {[]}
   */
  getXDims(data) {
    return [d3.min(data, d => d.date), d3.max(data, d => d.date)];
  }

  /**
   *
   * @param scaleX
   * @param scaleY
   * @returns {*}
   */
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
   * Calculate data for the chart.
   * @param data Chart data in the format [{date: timestamp(ms), series1: value, series2: value, series3: value, series4: value, ...}, ...]
   * @param order
   * @returns Stacked chart data for d3 functions
   */
  calculateChartData(data, order) {
    //Keys are the names of the developers, date is excluded
    let keys;
    if (this.props.keys) {
      keys = this.props.keys.length > 0 ? this.props.keys : Object.keys(data[0]).slice(1);
    } else keys = Object.keys(data[0]).slice(1);

    let orderedKeys = [];
    if (order) {
      _.each(order, orderElem => {
        if (keys.includes('(Additions) ' + orderElem) && keys.includes('(Deletions) ' + orderElem)) {
          orderedKeys.push('(Additions) ' + orderElem);
          orderedKeys.push('(Deletions) ' + orderElem);
        } else if (keys.includes(orderElem)) {
          orderedKeys.push(orderElem);
        }
      });
    } else {
      orderedKeys = keys;
    }

    //Stack function for a ThemeRiver chart, using the keys provided
    const stack = d3.stack().offset(this.props.d3offset).order(d3.stackOrderReverse).keys(orderedKeys);

    //Data formatted for d3
    return stack(data);
  }

  /**
   *
   * @param x
   * @param stackedData
   * @param xAxis
   * @param brushArea
   * @param area
   */
  resetZoom(x, stackedData, xAxis, brushArea, area) {
    x.domain([stackedData[0][0].data.date, stackedData[0][stackedData[0].length - 1].data.date]);
    xAxis.call(d3.axisBottom(x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: false });
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

  getBrushId(data) {
    return data.key;
  }
}
