'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from './themeRiverChart.scss';


export default class ThemeRiverChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content,   //[{name: "dev1", color: "#ffffff", checked: bool}, ...]
      contentLength: -1,
      chartData: [],
      palette: props.palette,
      xScale: props.xScale,
      formattedData: [],
      componentMounted: false
    };
  }

  componentDidMount() {
    //Needed to restrict d3 to only access DOM when the component is already mounted
    this.setState({componentMounted: true});
  }

  /**
   * Recompute the data for the chart
   * @param commitData commit Data in the format [{date: date, author1: changes, author2: changes, author3: changes, author4: changes, ...}, ...]
   */
  recomputeData(commitData){
    let data = commitData;

    //Keys are the names of the developers, date is excluded
    let keys = Object.keys(data[0]).slice(1);

    //Stack function for a ThemeRiver chart, using the keys provided
    let stack = d3.stack()
      .offset(d3.stackOffsetSilhouette)
      .keys(keys);

    //Data formatted for d3
    let stackedData = stack(data);

    //Set the data into the state
    this.setState({chartData: stackedData, contentLength: commitData.length});
  }

  /**
   * Draw the chart onto the svg element
   * @param data Chart data in the format put out by the function recomputeData(commitData)
   */
  drawChart(data) {
    let svg = d3.select(this.ref);  //Select svg from render method
    //Get width and height of svg in browser
    let clientRect = svg.node().getBoundingClientRect();
    let width = clientRect.width;
    let height = clientRect.height;

    //Remove old data
    svg.selectAll("*").remove();

    //X axis scaled with the first and last date
    let x = d3.scaleTime()
      .domain([data[0][0].data.date, data[0][data[0].length-1].data.date])
      .range([0, width]);
    //let x = this.state.xScale;

    //Y axis scaled with the maximum amount of change (half in each direction)
    let y = d3.scaleLinear()
      .domain([this.props.maxChange/-2, this.props.maxChange/2])
      .range([height, 0]);

    //Area generator for the chart
    let area = d3.area()
      .x(function(d) {return x(d.data.date)})
      .y0(function(d) {return y(d[0])})
      .y1(function(d) {return y(d[1])})
      .curve(d3.curveMonotoneX);

    //Color palette with the form {author1: color1, ...}
    let palette = this.props.palette;

    //Append data to svg using the area generator and palette
    svg.selectAll()
      .data(data)
      .enter().append("path")
      .attr("class","layer")
      .style("fill", function(d){return palette[d.key];})
      .attr("d", area);

    //Append visible x-axis on the bottom, with an offset so it's actually visible
    svg.append("g")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(d3.axisBottom(x));
  }

  render() {
    //Only recompute data if content and palette are resolved, and the component is mounted (d3 requires this)
    if(this.props.content && this.props.palette && this.state.componentMounted && this.props.content.length > 0){
      if(this.state.contentLength !== this.props.content.length)
        this.recomputeData(this.props.content);
    }

    //Only draw the chart if there is data for it and the component is mounted (d3 requirement)
    if(this.state.chartData.length > 0 && this.state.componentMounted){
      this.drawChart(this.state.chartData);
    }

    return <svg className={styles.chartSvg}
      ref={(svg) => (this.ref = svg)}/>;

  }
}
