import React from 'react';
import styles from './timeLine.scss';
import * as d3 from 'd3';

export default class TimeLineComponent extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.updateD3();
  }

  updateD3(){
        
        let data = [];

        for(const commit of this.props.data){
            data.push({date: new Date(commit.date), value: 0, label: commit.version});
        }
        
        const svg = d3.select(this.g);

        const xScale = d3
            .scaleTime()
            .domain([new Date(2015,0,1), new Date(2023,0,1)])
            .range([0,500]);
      

        const yScale = d3.scaleLinear().range([50,0]);

        const xAxis = d3.axisBottom(xScale);

        svg.append("g").attr("transform", "translate(0,50)").call(xAxis);

        const circles = svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("fill", "green")
        .attr("title", d => d.label)
        .append("text")
        .text(d => d.label)
        .attr("x", d => xScale(d.date))
        .attr("y", d => yScale(d.value) - 10)
        .attr("dx", 0)
        .attr("dy", 0) // adjust this value to move the label above the circle
        .style("font-size", "12px")
        .style("fill", "black")
        .style("text-anchor", "start");
     

    }

  render() {
    return (
        <svg style={{width: '100%', marginLeft: '15px'}} className="timeline" ref={g => (this.g = g)}>
                <g className="x-axis" />
        </svg> 
    );
  }
}
