'use strict';

import React from 'react';
import * as d3 from 'd3';

import GlobalZoomableSvg from '../../../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../../../components/svg/ChartContainer.js';
import styles from '../styles.scss';
import * as zoomUtils from '../../../../utils/zoom.js';
import * as exampleDataSet from './exampleDataset.js';
import computeDependencies from './computeUtils.js';
import ClosingPathContext from '../../../../utils/ClosingPathContext.js';

const CHART_FILL_RATIO = 0.65;

export default class CoChangeGraph extends React.Component {  
  constructor(props) {
    super(props);

    console.log(props);

    this.state = {
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions(),
    };

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  /**
  * Update computed commit data
  * @param nextProps props that are passed
  */
  componentWillReceiveProps(nextProps) {
    const dataset = computeDependencies(nextProps);

    console.log(dataset);
    if(dataset != undefined) {
      this.drawgraph(dataset);
    }
  }

  componentDidMount() {

  }

  drawgraph(dataset) {
    const svg = d3.select("." + styles.graphHolder);
  
    // Initialize definitions
    const defs = svg.append("defs");

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
      .call(d3.drag()
        .on("start", dragstarted) 
        .on("drag", dragged)      
        .on("end", dragended)     
      );

    // Text to nodes
    const text = svg.append("g")
      .attr("class", "text")
      .selectAll("text")
      .data(dataset.nodes)
      .enter().append("text")
      .text(d => d.id)

    // Initialize the simualtion
    const simulation = d3.forceSimulation(dataset.nodes)
      .force('links', d3.forceLink().links(dataset.links).distance(500))
      .force('repellent force', d3.forceManyBody().strength(-100))
      .on("tick", ticked); 

    let counter = 0;

    // advance simulation
    function ticked() {
      node.attr("cx", d => d.x)
          .attr("cy", d => d.y);

      link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      text.attr("x", d => d.x - 5) //position of the lower left point of the text
          .attr("y", d => d.y + 5); //position of the lower left point of the text
    
      if(counter >= 10){
        link.each(function(d){refreshGradient(this, d)});
        counter = 0;
      } else {
        counter++;
      }

    }

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
    }

    // node highlighting functionality
    node.on('mouseover', function (event, d) {
      
      node.style('fill', "#B8B8B8")
      d3.select(this).style('fill', '#ff0000')

      // Highlight the connections
      link.style('stroke-width', function (link_d) {return link_d.source.id === d.id || link_d.target.id === d.id ? 6 : 3;})
    })
    .on('mouseout', function (d) {
      node.style('fill', "pink")
      link.style('stroke-width', '3')
    })

    // link color functions
    // create the baseline gradient for the links
    function createGradient(line, d){
      var self = d3.select(line);
      var gradientId = "line-gradient_" + d.source.id + "_" + d.target.id; 
      gradientId = gradientId.replace(/\./g, '');
      gradientId = gradientId.replace(/\//g, '');

      defs.append("linearGradient")                
          .attr("id", gradientId)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", d.source.x)
          .attr("y1", d.source.y)
          .attr("x2", d.target.x)
          .attr("y2", d.target.y)    
          .selectAll("stop")                      
          .data([                             
              {offset: "0%", color: d3.rgb(d.sourceColor * 255, ((1-d.sourceColor) * 255), 0)},       
              {offset: "49%", color: d3.rgb(d.sourceColor * 255, ((1-d.sourceColor) * 255), 0)},
              {offset: "50%", color: d3.rgb(d.targetColor * 255, ((1-d.targetColor) * 255), 0)}, 
              {offset: "100%", color: d3.rgb(d.targetColor * 255, ((1-d.targetColor) * 255), 0)}
          ])                  
          .enter().append("stop")         
          .attr("offset", function(d) { return d.offset; })   
          .attr("stop-color", function(d) { return d.color; }); 
                  
      self.style("stroke", "url(#" + gradientId + ")")
    }
  
    function refreshGradient(line, d){
      let gradientId = "line-gradient_" + d.source.id + "_" + d.target.id;
      gradientId = gradientId.replace(/\./g, '');
      gradientId = gradientId.replace(/\//g, '');

      let gradient = d3.select("#" + gradientId);

      if(!gradient.empty()){
        gradient.attr("x1", d.source.x);
        gradient.attr("y1", d.source.y);
        gradient.attr("x2", d.target.x);
        gradient.attr("y2", d.target.y);
      } else {
        createGradient(line, d);
      }
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