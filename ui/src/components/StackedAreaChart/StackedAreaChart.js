'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from './stackedAreaChart.scss';

/**
 * Stacked area chart
 * Takes the following props:
 *  - content (Format: [{date: timestamp(ms), seriesName1: number, seriesName2, number, ...}, ...], e.g. array of data points with date and series values)
 *  - palette (Format: {seriesName1: color1, seriesName2: color2, ...}, color in format "#ffffff" as string)
 *  - paddings (optional) (Format: {top: number, left: number, right: number, bottom: number}, number being amount of pixels) Each field in the object is optional and can be left out)
 *  - xAxisCenter (optional) (Format: true/false, whether the x axis should be at the 0 line (true), or at the bottom (false/unspecified))
 *  - yScale (Format: number, will be multiplied with the y-Axis values. Useful if you want a themeRiver, which extends to both top and bottom, hence a yScale of 2 is needed)
 *  - yDims (Format: [topValue, bottomValue], limits of the y-Axis on top/bottom, should correspond to data.)
 *  - d3offset (Format: d3.stackOffsetNone/d3.stackOffsetDiverging/d3.stackOffsetSilhouette/... determines the way data is stacked, check d3 docs)
 *  - d3bugfix (optional) (Format: {seriesNumber: number}, number being the index of the series that the bugfix should be applied to)
 *    The d3 library has a bug where if you use d3.stackOffsetDiverging and have a series with strictly negative or zero values, it will still put positive values in it for unknown reasons.
 *    To remedy this, if you set the seriesNumber, all positive values in that series index will be set to 0.
 *  - keys (optional) (Format: [seriesName1, seriesName2, ...]) Filters the chart, only showing the provided keys and leaving everything else out.
 */
export default class StackedAreaChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content,   //[{name: "dev1", color: "#ffffff", checked: bool}, ...]
      palette: props.palette,
      componentMounted: false
    };
  }

  componentDidMount() {
    //Needed to restrict d3 to only access DOM when the component is already mounted
    this.setState({componentMounted: true});
  }

  /**
   * Draw the chart onto the svg element
   * @param commitData commit Data in the format [{date: date, author1: changes, author2: changes, author3: changes, author4: changes, ...}, ...]
   */
  drawChart(commitData) {
    let data = commitData;
    let yScale = this.props.yScale;

    //Keys are the names of the developers, date is excluded
    let keys;
    if(this.props.keys)
      keys = (this.props.keys.length > 0) ? this.props.keys : Object.keys(data[0]).slice(1);
    else
      keys = Object.keys(data[0]).slice(1);

    //Stack function for a ThemeRiver chart, using the keys provided
    let stack = d3.stack()
      .offset(this.props.d3offset)
      .keys(keys);

    //Data formatted for d3
    let stackedData = stack(data);

    if (this.props.d3bugfix) {
      _.each(stackedData[this.props.d3bugfix.seriesNumber], function (elem) {
        if (elem[0] > 0 || elem[1] > 0) {
          elem[0] = 0;
          elem[1] = 0;
        }
      })
    }

    let svg = d3.select(this.ref);  //Select svg from render method
    //Get width and height of svg in browser
    let clientRect = svg.node().getBoundingClientRect();
    let width = clientRect.width;
    let height = clientRect.height;
    let paddingLeft = (this.props.paddings.left) ? this.props.paddings.left : 0;
    let paddingBottom = (this.props.paddings.bottom) ? this.props.paddings.bottom : 0;
    let paddingTop = (this.props.paddings.top) ? this.props.paddings.top : 0;
    let paddingRight = (this.props.paddings.right) ? this.props.paddings.right : 0;

    //Remove old data
    svg.selectAll('*').remove();

    //X axis scaled with the first and last date
    let x = d3.scaleTime()
      .domain([stackedData[0][0].data.date, stackedData[0][stackedData[0].length - 1].data.date])
      .rangeRound([paddingLeft, width - paddingRight]);
    //let x = this.state.xScale;

    //Y axis scaled with the maximum amount of change (half in each direction)
    let y = d3.scaleLinear()
      .domain([this.props.yDims[0], this.props.yDims[1]])
      .rangeRound([height - paddingBottom, paddingTop]);

    //Area generator for the chart
    let area = d3.area()
      .x(function (d) { return x(d.data.date) })
      .y0(function (d) { return y(d[0]) })
      .y1(function (d) { return y(d[1]) })
      .curve(d3.curveMonotoneX);

    //Color palette with the form {author1: color1, ...}
    let palette = this.props.palette;

    //Append data to svg using the area generator and palette
    svg.selectAll()
      .data(stackedData)
      .enter().append('path')
      .attr('class', 'layer')
      .style('fill', function (d) { return palette[d.key]; })
      .attr('d', area);

    //Append visible x-axis on the bottom, with an offset so it's actually visible
    if(this.props.xAxisCenter) {
      svg.append('g')
        .attr('transform', 'translate(0,' + y(0) + ')')
        .call(d3.axisBottom(x));
    }else {
      svg.append('g')
        .attr('transform', 'translate(0,' + (height - paddingBottom) + ')')
        .call(d3.axisBottom(x));
    }

    svg.append('g')
      .attr('transform', 'translate(' + paddingLeft + ',0)')
      .call(d3.axisLeft(y).tickFormat(function (d) {
        if (d > 0)
          return d * yScale;
        else
          return d * (-1) * yScale;
      }));
  }

  render() {

    //Only draw the chart if there is data for it and the component is mounted (d3 requirement)
    if (this.state.componentMounted && this.props.content) {
      this.drawChart(this.props.content);
    }

    return <svg className={styles.chartSvg}
                ref={(svg) => (this.ref = svg)}/>;

  }
}
