import styles from './stackedAreaChart.module.scss';
import ScalableBaseChartComponent from '../ScalableBaseChart';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { formatDate } from '../../utils/dateUtils.ts';

/**
 * Stacked area chart
 * Takes the following props:
 *  - content (Format: [{date: timestamp(ms), seriesName1: number, seriesName2, number, ...}, ...],
 *             e.g. array of data points with date and series values)
 *  - palette (Format: {seriesName1: color1, seriesName2: color2, ...}, color in format "#ffffff" as string)
 *  - paddings (optional) (Format: {top: number, left: number, right: number, bottom: number},
 *             number being amount of pixels) Each field in the object is optional and can be left out)
 *  - height (optional) height of the chart
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
  constructor(props: any) {
    super(props, styles);
  }

  /**
   *
   * @returns {[]}
   */
  getXDims() {
    return [d3.min(this.state.data.data, (d: any) => d.date), d3.max(this.state.data.data, (d: any) => d.date)];
  }

  getYDims() {
    return this.props.yDims;
  }

  /**
   *
   * @param scales
   * @returns {*}
   */
  createAreaFunction(scales: any) {
    //Area generator for the chart
    return d3
      .area()
      .x(function (d: any) {
        return scales.x(d.data.date);
      })
      .y0(function (d) {
        return scales.y(d[0]);
      })
      .y1(function (d) {
        return scales.y(d[1]);
      })
      .curve(d3.curveMonotoneX);
  }

  /**
   * Calculate data for the chart.
   * @param data Chart data in the format [{date: timestamp(ms), series1: value, series2: value, series3: value, series4: value, ...}, ...]
   * @param order
   * @returns Stacked chart data for d3 functions and preprocessed data { stackedData, data }
   */
  calculateChartData(data: any, order: any) {
    //Keys are the names of the developers, date is excluded
    const keys = this.props.keys && this.props.keys.length > 0 ? this.props.keys : Object.keys(data[0]).slice(1);

    let orderedKeys: any[] = [];
    if (order) {
      _.each(order, (orderElem: any) => {
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
    const stackedData = stack(data);
    return { stackedData, data };
  }

  /**
   *
   * @param scales
   * @param axes
   * @param brushArea
   * @param area
   */
  resetZoom(scales: any, axes: any, brushArea: any, area: any) {
    scales.x.domain([
      this.state.data.stackedData[0][0].data.date,
      this.state.data.stackedData[0][this.state.data.stackedData[0].length - 1].data.date,
    ]);
    axes.x.call(d3.axisBottom(scales.x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: false });
  }

  /**
   *
   * @param path
   * @param bisectDate
   * @param mouseoverDate
   * @param tooltip
   * @param tooltip
   * @param event
   * @param node
   * @param brushArea
   * @param scales
   * @param stream
   */
  //@ts-ignore
  createdTooltipNode(path: any, bisectDate: any, mouseoverDate: any, tooltip: any, event: any, node: any, brushArea: any, scales: any) {
    const palette = this.state.palette;
    const nearestDateIndex = bisectDate(this.state.data.data, mouseoverDate);
    const candidate1 = this.state.data.data[nearestDateIndex % this.state.data.data.length];
    const candidate2 = this.state.data.data[nearestDateIndex - 1];
    let nearestDataPoint;
    if (Math.abs(mouseoverDate - candidate1.date) < Math.abs(mouseoverDate - candidate2.date)) {
      nearestDataPoint = candidate1;
    } else {
      nearestDataPoint = candidate2;
    }
    const key = d3.select(path).attr('id');
    const text = key.split(' <', 1); //Remove git signature email
    let value = nearestDataPoint[key];
    const chartValues = this.findChartValues(this.state.data.stackedData, key, nearestDataPoint.date);
    const formattedDate = formatDate(new Date(nearestDataPoint.date), this.props.resolution);
    if (value < 0) {
      value *= -1;
    }
    //Render tooltip
    tooltip
      .html(
        formattedDate +
          '<hr/>' +
          '<div style="background: ' +
          palette[key] +
          '">' +
          '</div>' +
          text +
          ': ' +
          Math.round((value + Number.EPSILON) * 100) / 100,
      )
      .style('position', 'absolute')
      .style('left', event.layerX - 20 + 'px')
      .style('top', event.layerY - 70 + 'px');

    this.paintDataPoint(brushArea, scales.x(nearestDataPoint.date), scales.y(chartValues.y1), scales.y(chartValues.y2), palette[key]);
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  getBrushId(data: any) {
    return data.key;
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  //@ts-ignore
  onMouseover(path: any, tooltip: any, brushArea: any, event: any, stream: any) {
    tooltip.style('display', 'inline');
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  //@ts-ignore
  onMouseLeave(path: any, tooltip: any, brushArea: any, event: any, stream: any) {
    tooltip.style('display', 'none');
    brushArea.select('.' + this.styles.indicatorLine).remove();
    brushArea.selectAll('.' + this.styles.indicatorCircle).remove();
  }

  /**
   * Finds the chart values (for the displayed line) for the moused-over data-point
   * @param data
   * @param key
   * @param timeValue
   * @returns {{y1: *, y2: *}}
   */
  findChartValues(data: any, key: any, timeValue: any) {
    let foundValues: any[] = [];
    _.each(data, (series) => {
      if (series.key === key) {
        _.each(series, (dataPoint) => {
          if (dataPoint.data.date === timeValue) {
            foundValues = dataPoint;
            return false;
          }
        });
        return false;
      }
    });
    return { y1: foundValues[0], y2: foundValues[1] };
  }
}
