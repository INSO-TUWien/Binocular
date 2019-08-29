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

  recomputeData(commitData){
    let data = commitData;

    //Build data array
    let keys = Object.keys(data[0]).slice(1);

    let stack = d3.stack()
      .offset(d3.stackOffsetSilhouette)
      .keys(keys);

    let stackedData = stack(data);

    this.setState({chartData: stackedData, contentLength: commitData.length});
  }

  drawChart(data) {
    let svg = d3.select(this.ref);
    let clientRect = svg.node().getBoundingClientRect();
    let width = clientRect.width;
    let height = clientRect.height;

    //Remove old data
    svg.selectAll("*").remove();

    let x = d3.scaleTime()
      .domain([data[0][0].data.date, data[0][data[0].length-1].data.date])
      .range([0, width]);
    //let x = this.state.xScale;

    let y = d3.scaleLinear()
      .domain([this.props.maxChange/-2, this.props.maxChange/2])
      .range([height, 0]);

    let area = d3.area()
      .x(function(d) {return x(d.data.date)})
      .y0(function(d) {return y(d[0])})
      .y1(function(d) {return y(d[1])})
      .curve(d3.curveMonotoneX);

    let palette = this.props.palette;

    svg.selectAll()
      .data(data)
      .enter().append("path")
      .attr("class","layer")
      .style("fill", function(d){return palette[d.key];})
      .attr("d", area);

    svg.append("g")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(d3.axisBottom(x));
  }

  render() {
    if(this.props.content && this.props.palette && this.state.componentMounted && this.props.content.length > 0){
      if(this.state.contentLength !== this.props.content.length)
        this.recomputeData(this.props.content);
    }

    if(this.state.chartData.length > 0 && this.state.componentMounted){
      this.drawChart(this.state.chartData);
    }

    return <svg className={styles.chartSvg}
      ref={(svg) => (this.ref = svg)}/>;

  }
}
