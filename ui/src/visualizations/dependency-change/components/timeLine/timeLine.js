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
            .domain([new Date(2015,0,1), new Date()])
            .range([0,500]);
      

        const yScale = d3.scaleLinear().range([100,0]);

        const xAxis = d3.axisBottom(xScale);

        svg.append("g").attr("transform", "translate(0,100)").call(xAxis);

        svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("fill", "blue")
        .attr("title", d => d.label)
        .append("text")
        .text(d => d.label)
        .attr("x", d => xScale(d.date))
        .attr("y", d => yScale(d.value) - 10)
        .attr("dx", 0)
        .attr("dy", -50) // adjust this value to move the label above the circle
        .style("font-size", "12px")
        .style("fill", "black")
        .style("writing-mode", "vertical-rl")
        .style("glyph-orientation-vertical", 0)
        .style("font-weight", "bold")
        .style("text-anchor", "start");
     
        const circles = document.querySelectorAll(".timeLine circle");
        circles.forEach(elem => {
          const textSelection = elem.querySelector("text");
          elem.parentNode.insertBefore(textSelection, elem.nextSibling);
        })

    }

  render() {
    return (
        <div>
          <svg style={{width: '100%', marginLeft: '15px', marginTop: '50px'}} className="timeline" ref={g => (this.g = g)}></svg>
          <label style={{ paddingLeft: '15px', fontWeight: '300'}}>{ this.props.dep }</label>
        </div>
    );
  }
}
