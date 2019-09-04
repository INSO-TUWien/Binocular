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
      componentMounted: false,
      zooming: false,
      zoomed: false,
      zoomedDims: [0,0]
    };
    window.addEventListener("resize", () => this.setState({zooming: false, zoomed: false}));
  }

  componentDidMount() {
    //Needed to restrict d3 to only access DOM when the component is already mounted
    this.setState({componentMounted: true});
  }


  componentWillUnmount() {
    this.setState({componentMounted: false});
  }

  /**
   * Update the chart element. May only be called if this.props.content is not empty and the component is mounted.
   */
  updateElement() {
    //Initialization
    let data = this.props.content;                                //Rename for less writing
    let stackedData = this.calculateChartData(data);              //Get d3-friendly data
    let yScale = this.props.yScale;                               //Multiplicator for the values on the y-scale
    let svg = d3.select(this.ref);                                //Select parent svg from render method
    let {width, height, paddings} = this.getDimsAndPaddings(svg); //Get width and height of svg in browser

    //Get X and Y scales, which translate data values into pixel values
    let {x, y} = this.createScales([data[0].date, data[data.length - 1].date],
      [paddings.left, width - paddings.right],
      this.props.yDims,
      [height - paddings.bottom, paddings.top]);

    //Area generator for the chart
    let area = d3.area()
      .x(function (d) { return x(d.data.date) })
      .y0(function (d) { return y(d[0]) })
      .y1(function (d) { return y(d[1]) })
      .curve(d3.curveMonotoneX);

    //Brush generator for brush-zoom functionality, with referenced callback-function
    let brush = d3.brushX()
      .extent([[0,0], [width,height]]);

    //Draw the chart (and brush box) using everything provided
    let {brushArea, xAxis} = this.drawChart(svg, stackedData, area, brush, yScale, x, y, height, width, paddings);

    //Set callback for brush-zoom functionality
    brush.on("end", () => {
      this.updateZoom(d3.event.selection, x, y, xAxis, height, width, paddings, brush, brushArea, area)
    });

    //Set callback to reset zoom on double-click
    svg.on("dblclick", () => {
      x.domain([stackedData[0][0].data.date, stackedData[0][stackedData[0].length - 1].data.date]);
      xAxis.transition(500).call(d3.axisBottom(x));
      brushArea
        .selectAll('.layer')
        .transition(500)
        .attr("d", area).on("end", this.setState({zooming: false, zoomed: false}));
    });
  }

  /**
   * Calculate data for the chart.
   * @param data Chart data in the format [{date: timestamp(ms), series1: value, series2: value, series3: value, series4: value, ...}, ...]
   * @returns Stacked chart data for d3 functions
   */
  calculateChartData(data){
    //Keys are the names of the developers, date is excluded
    let keys;
    if(this.props.keys)
      keys = (this.props.keys.length > 0) ? this.props.keys : Object.keys(data[0]).slice(1);
    else
      keys = Object.keys(data[0]).slice(1);

    //Stack function for a ThemeRiver chart, using the keys provided
    let stack = d3.stack()
      .offset(this.props.d3offset)
      .order(d3.stackOrderInsideOut)
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

    return stackedData;
  }

  /**
   * Get dimensions and padding of element
   * @param svg Svg-Element to get dimensions and paddings of
   * @returns {width, height, {paddings: {top: *, left: *, bottom: *, right: *}, width: *, height: *}} Values self-explanatory. All values in pixels.
   */
  getDimsAndPaddings(svg){
    let clientRect = svg.node().getBoundingClientRect();
    let width = clientRect.width;
    let height = clientRect.height;
    let paddingLeft = (this.props.paddings.left) ? this.props.paddings.left : 0;
    let paddingBottom = (this.props.paddings.bottom) ? this.props.paddings.bottom : 0;
    let paddingTop = (this.props.paddings.top) ? this.props.paddings.top : 0;
    let paddingRight = (this.props.paddings.right) ? this.props.paddings.right : 0;

    return {width, height, paddings: {left: paddingLeft, bottom: paddingBottom, top: paddingTop, right: paddingRight}};
  }

  /**
   *
   * @param xDims Dimensions of x-data in format [timestamp, timestamp] (timestamp = .getTime(), e.g. timestamp in milliseconds)
   * @param xRange Range of x-data in format [xLeft, xRight] (values in pixels relative to parent, e.g. insert left padding/right padding to have spacing)
   * @param yDims Dimensions of y-data in format [lowestNumber, highestNumber] (number = e.g. max/min values of data)
   * @param yRange Range of y-data in format [yBottom, yTop] (values in pixels relative to parent, e.g. insert top padding/bottom padding to have spacing.
   *        CAUTION: y-pixels start at the top, so yBottom should be e.g. width-paddingBottom and yTop should be e.g. paddingTop)
   * @returns {{x: *, y: *}} d3 x and y scales. x scale as time scale, y scale as linear scale.
   */
  createScales(xDims, xRange, yDims, yRange){
    let x = d3.scaleTime()
      .domain(xDims)
      .range(xRange);

    if(this.state.zoomed === true){
      x.domain(this.state.zoomedDims);
    }

    //Y axis scaled with the maximum amount of change (half in each direction)
    let y = d3.scaleLinear()
      .domain(yDims)
      .range(yRange);

    return {x, y};
  }

  /**
   * Draw the chart onto the svg element.
   * @param svg element to draw on (e.g. d3.select(this.ref))
   * @param data stacked data from the calculateChartData function
   * @param area d3 area generator
   * @param brush d3 brush generator
   * @param yScale yScale factor from props (for applying formatting to the y axis)
   * @param x d3 x-scale from method createScales
   * @param y d3 y-scale from method createScales
   * @param height element height from getDimsAndPaddings method (required for axis formatting)
   * @param width element width from getDimsAndPaddings method (required for axis formatting)
   * @param paddings paddings of element from getDimsAndPaddings method ()
   * @returns {{brushArea: *, xAxis: *}} brushArea: Area that has all the contents appended to it, xAxis: d3 x-Axis for later transitioning (for zooming)
   */
  drawChart(svg, data, area, brush, yScale, x, y, height, width, paddings){
    //Remove old data
    svg.selectAll('*').remove();

    //Color palette with the form {author1: color1, ...}
    let palette = this.props.palette;
    let brushArea = svg.append('g');

    //Append data to svg using the area generator and palette
    brushArea.selectAll()
      .data(data)
      .enter().append('path')
      .attr('class', 'layer')
      .style('fill', function (d) { return palette[d.key]; })
      .attr('d', area)
      .attr("clip-path", "url(#clip)");

    let clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width - paddings.left - paddings.right )
      .attr("height", height - paddings.top - paddings.bottom )
      .attr("x", paddings.left)
      .attr("y", paddings.top);

    //Append visible x-axis on the bottom, with an offset so it's actually visible
    let xAxis;
    if(this.props.xAxisCenter) {
      xAxis = brushArea.append('g')
        .attr('transform', 'translate(0,' + y(0) + ')')
        .call(d3.axisBottom(x));
    }else {
      xAxis = brushArea.append('g')
        .attr('transform', 'translate(0,' + (height - paddings.bottom) + ')')
        .call(d3.axisBottom(x));
    }

    brushArea.append('g')
      .attr('transform', 'translate(' + paddings.left + ',0)')
      .call(d3.axisLeft(y).tickFormat(function (d) {
        if (d > 0)
          return d * yScale;
        else
          return d * (-1) * yScale;
      }));

    brushArea.append('g')
      .attr("class", "brush")
      .call(brush);

    return {brushArea, xAxis};
  }

  /**
   * Callback function for brush-zoom functionality. Should be called when brush ends. (.on("end"...)
   * @param extent Call d3.event.selection inside an anonymous/arrow function, put that anonymous/arrow function as the .on callback method
   * @param x d3 x Scale provided by createScales function
   * @param y d3 y Scale provided by createScales function
   * @param xAxis d3 x-Axis provided by drawChart function
   * @param height height provided by getDimsAndPaddings function
   * @param width width provided by getDimsAndPaddings function
   * @param paddings paddings provided by getDimsAndPaddings function
   * @param brush brush generator
   * @param brushArea Area that the path, x/y-Axis and brush-functionality live on (see drawChart)
   * @param area d3 Area generator (for area graphs)
   */
  updateZoom(extent, x, y, xAxis, height, width, paddings, brush, brushArea, area) {
    let zoomedDims;
    if(extent){
      zoomedDims = [x.invert(extent[0]), x.invert(extent[1])];
      x.domain([x.invert(extent[0]), x.invert(extent[1])])
        .range([paddings.left, width - paddings.right]);
      brushArea.select(".brush").call(brush.move, null);
    }else{
      return;
    }

    this.setState({zooming: true}, () => {
      xAxis.transition().duration(500).call(d3.axisBottom(x));
      brushArea
        .selectAll('.layer')
        .transition()
        .duration(500)
        .attr("d", area)
        .on("end", () => this.setState({zoomed: true, zooming: false, zoomedDims: zoomedDims}));
    })
  }

  render() {
    //Only update the chart if there is data for it and the component is mounted and it is not currently in a zoom transition (d3 requirement)
    if (this.state.componentMounted && this.props.content && !this.state.zooming) {
      this.updateElement();
    }

    return <svg className={styles.chartSvg}
                ref={(svg) => (this.ref = svg)}/>;

  }
}
