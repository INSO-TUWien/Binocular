import React from 'react';
import styles from './timeLine.scss';
import * as d3 from 'd3';
import cx from 'classnames';


export default class TimeLineComponent extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.updateD3();
  }

  updateD3(){
        
        let data = [];

        let startDate = new Date(this.props.start.date);
        startDate.setFullYear(startDate.getFullYear() - 1);


        for(const commit of this.props.data){
            data.push({date: new Date(commit.date), value: 0, label: commit.version, committer: commit.committer});
        }
        
        const svg = d3.select(this.g);
        var width = d3.select(".timeLine").node().getBoundingClientRect().width - 80;

        const xScale = d3
            .scaleTime()
            .domain([startDate, new Date()])
            .range([0,width]);
      

        const yScale = d3.scaleLinear().range([100,0]);

        const xAxis = d3.axisBottom(xScale);

        svg.append("g").attr("transform", "translate(0,100)").call(xAxis);

        const tooltip = d3.select('.tooltip');

        

        svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .style("cursor", "pointer")
        .attr("r", 5)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("fill", "blue")
        .attr("title", d => d.label)
        .on('mouseover', function(e) {
          const data = d3.select(this).datum();
          d3.select(".tooltip").style("display","flex");
          tooltip
            .style('top', (e.pageY + 10) + 'px')
            .style('left', e.pageX + 'px');

            const dateOptions = {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            };
            
            const timeOptions = {
              hour: '2-digit',
              minute: '2-digit'
            };

            const formattedDate = data.date.toLocaleDateString('de-DE', dateOptions);
            const formattedTime = data.date.toLocaleTimeString('de-DE', timeOptions);

          tooltip.html(`<span>${data.committer}</span><span>${formattedDate} ${formattedTime}</span>`);
        })
        .on('mouseout', function() {
          d3.select(".tooltip").style("display", "none");
        })
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
        circles.item(0).style.fill = 'green';
        circles.forEach(elem => {
          const textSelection = elem.querySelector("text");
          elem.parentNode.insertBefore(textSelection, elem.nextSibling);
        })

    }

  render() {
    return (
        <div className={cx(styles.chartDiv, 'timeLine')}>
          <svg className={styles.chartSvg} ref={g => (this.g = g)}></svg>
          <div className={cx(styles.tooltip, 'tooltip')}>Hallo</div>
        </div>
    );
  }
}
