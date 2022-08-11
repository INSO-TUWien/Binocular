'use strict';

import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';

import GlobalZoomableSvg from '../../../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../../../components/svg/ChartContainer.js';
import OffsetGroup from '../../../../components/svg/OffsetGroup.js';
import styles from '../styles.scss';
import * as zoomUtils from '../../../../utils/zoom.js';

const CHART_FILL_RATIO = 0.65;

export default class CoChangeGraph extends React.Component {  
  constructor(props) {
    super(props);

    this.state = {
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions(),
    };

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  componentDidMount() {
    const svg = d3.select("." + styles.graphHolder);

    //create dummy data
    const dataset =  {
      nodes: [
        {id: 1},
        {id: 2},
        {id: 3},
        {id: 4},
        {id: 5},
        {id: 6}
      ], 
      links: [
        {source: 1, target: 5},
        {source: 4, target: 5},
        {source: 3, target: 2},
        {source: 5, target: 2},
        {source: 1, target: 2},
        {source: 3, target: 4}
      ]
    };
  
    console.log("dataset is ...",dataset);

    function ticked() {
      node.attr("cx", d => d.x)
          .attr("cy", d => d.y);

      link.attr("x1", d => {return d.source.x})
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      text.attr("x", d => d.x - 5) //position of the lower left point of the text
          .attr("y", d => d.y + 5); //position of the lower left point of the text
    }
  
    // Initialize the links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(dataset.links)
      .enter().append("line");
  
    // Initialize the nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(dataset.nodes)
      .enter().append("circle")
      .attr("r", 20)
      .call(d3.drag()  //sets the event listener for the specified typenames and returns the drag behavior.
        .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
        .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
        .on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
      );

      // Text to nodes
    const text = svg.append("g")
      .attr("class", "text")
      .selectAll("text")
      .data(dataset.nodes)
      .enter().append("text")
      .text(d => d.id)

    //Listen for tick events to render the nodes as they update in your Canvas or SVG.
    const simulation = d3.forceSimulation(dataset.nodes)
      .force('links', d3.forceLink().links(dataset.links).distance(200))
      .force('charge', d3.forceManyBody().strength(-30))
      .on("tick", ticked); 


    //When the drag gesture starts, the targeted node is fixed to the pointer
    //The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3);
      console.log("dragged!")
      d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
      d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
    }

    //When the drag gesture starts, the targeted node is fixed to the pointer
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    //the targeted node is released when the gesture ends
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      
      console.log("dataset after dragged is ...",dataset);
    }
  }


  render() {
    const dims = this.state.dimensions;
    const radius = Math.min(dims.width, dims.height) * CHART_FILL_RATIO;
    const center = {
      x: dims.width / 2,
      y: dims.height / 2,
    };

    return (
      <ChartContainer onResize={(evt) => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={(evt) => this.onZoom(evt)}
          transform={this.state.transform}
          unzoomed={null}>
            <g className={styles.graphHolder} transform={`translate(${center.x}, ${center.y})`}>
            </g>
        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }
}