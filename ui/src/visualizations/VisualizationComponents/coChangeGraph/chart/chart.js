'use strict';

import React from 'react';
import * as d3 from 'd3';

import GlobalZoomableSvg from '../../../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../../../components/svg/ChartContainer.js';
import styles from '../styles.scss';
import * as zoomUtils from '../../../../utils/zoom.js';
import {computeFileDependencies, computeModuleDependencies, assignModuleIndicesToFiles, createSubModuleLinks, removeIntraModuleLinks} from './computeUtils.js';

const CHART_FILL_RATIO = 0.65;

// graph parameters
let _dataset = undefined;
let _simulation = undefined;
let _showIntraModuleDeps = true;
let _nodeToHighlight = "";
let _activateNodeHighlighting = false;
let _fixedHighlighting = false;
let _minSharedCommits = 1;

let _nodes = undefined;
let _links = undefined;
let _text = undefined;

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

  /**
  * Update computed commit data
  * @param nextProps props that are passed
  */
  componentWillReceiveProps(nextProps) {
    //console.log("Props:");
    //console.log(nextProps);

    const configChanged = this.updateConfigProperties(nextProps);
    if(configChanged === true){
      return; // only update config
    }

    const newDataset = computeFileDependencies(nextProps);
    const {fileToModuleLinks, moduleToModuleLinks} = assignModuleIndicesToFiles(newDataset.nodes, nextProps.moduleData);

    if(_showIntraModuleDeps === false){
      newDataset.links = removeIntraModuleLinks(newDataset);
    }

    // (invisible) links solely used to generate force layout
    newDataset.fileToModuleLinks = fileToModuleLinks;
    newDataset.moduleToModuleLinks = moduleToModuleLinks;

    const module_dataset = computeModuleDependencies(nextProps);
    module_dataset.fileToModuleLinks = [];
    module_dataset.moduleToModuleLinks = createSubModuleLinks(nextProps.moduleData, module_dataset.nodes);

    if (nextProps.entitySelection === "files"){
      _dataset = newDataset;
    } else {
      _dataset = module_dataset;
    }

    if(_dataset != undefined) {
      if(_simulation != undefined){
        _simulation.stop();
      }

      this.removeGraph();
      this.drawGraph();
    }
  }

  removeGraph(){
    const svg = d3.select("." + styles.graphHolder).selectChildren();
    svg.remove();
  }

  drawGraph() {
    const svg = d3.select("." + styles.graphHolder);
  
    // Initialize definitions
    const defs = svg.append("defs");

    // Initialize the links
    _links = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(_dataset.links)
      .enter().append("line");
  
    // Initialize the nodes
    _nodes = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(_dataset.nodes)
      .enter().append("circle")
      .attr("r", 20)
      .style("fill", (d) => {return d.type == "m" ? "yellow" : "pink"});

    // Text to nodes
    _text = svg.append("g")
      .attr("class", "text")
      .selectAll("text")
      .data(_dataset.nodes)
      .enter().append("text")
      .text(d => d.name)

    // Initialize the simualtion
    _simulation = d3.forceSimulation(_dataset.nodes)
      .force('links', d3.forceLink().links(_dataset.links).strength(0))
      .force('fileToModuleLinks', d3.forceLink().links(_dataset.fileToModuleLinks).distance(80))
      .force('moduleToModuleLinks', d3.forceLink().links(_dataset.moduleToModuleLinks).strength(0.15))
      .force('repellent force near', d3.forceManyBody().strength(-1000).distanceMin(0).distanceMax(400))
      .force('repellent force far', d3.forceManyBody().strength(-200).distanceMin(400).distanceMax(1000))
      .on("tick", ticked); 

    let debouncer;
    let time = Date.now();

    // advance simulation
    function ticked() {
      clearTimeout(debouncer);

      // only update the view once the simulation didn't have a new step in 1 second
      debouncer = setTimeout(_ => {
        _nodes.attr("cx", d => d.x)
        .attr("cy", d => d.y);

        _links.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        _text.attr("x", d => d.x - 5) //position of the lower left point of the text
            .attr("y", d => d.y + 5); //position of the lower left point of the text

        _links.each(function(d){refreshGradient(this, d)});
        let timeToRender = Date.now() - time;
        console.log("rendered in: " + timeToRender);

      }, 1000)
    }

    // node highlighting functionality
    _nodes.on('mouseover', 
      function(event, d) {   
        if(_fixedHighlighting || _activateNodeHighlighting) return;

        // Highlight the connections
        _links.style('stroke-width', function (link_d) {return link_d.source.id === d.id || link_d.target.id === d.id ? 5 : 0.1;})
        const filteredLinks = _links.filter(_ => _.source.id === d.id || _.target.id === d.id);
        filteredLinks.raise();
      
        let targetNodes = new Set();
        filteredLinks.each(_ => {targetNodes.add(_.target.id); targetNodes.add(_.source.id)});
      
        let targetModuls = new Set();
        _dataset.fileToModuleLinks.forEach(element => {
          if (targetNodes.has(element.source.id)) {
            targetModuls.add(element.target.id)
          }
        });

        _text.style("fill", function (link_d) {
          return targetNodes.has(link_d.id) || targetModuls.has(link_d.id) ? 'black' : 'transparent'
        })
        _nodes.style('stroke-width', function (node_d) {return targetNodes.has(node_d.id) ? 1 : 0.1})
        _nodes.style('fill', function (node_d) {
          return targetNodes.has(node_d.id) ? "orange" : targetModuls.has(node_d.id) ? "yellow" : "transparent"
        })
      
        d3.select(this).style('fill', 'red');
    })
    .on('mouseout', (d) => {
      if(!_activateNodeHighlighting) this.disableHighlighting(_fixedHighlighting);
    })
    .on('click', function(d){
      if(!_activateNodeHighlighting) _fixedHighlighting = _fixedHighlighting ? false : true;
    });

    // link color functions
    // create the baseline gradient for the links
    function createGradient(line, d){
      var self = d3.select(line);
      var gradientId = "gradient_" + d.uuid;

      defs.append("linearGradient")                
          .attr("id", gradientId)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", d.source.x)
          .attr("y1", d.source.y)
          .attr("x2", d.target.x)
          .attr("y2", d.target.y)    
          .selectAll("stop")                      
          .data([                             
              {offset: "0%", color: createColorGradient(d.sourceColor)},       
              {offset: "49%", color: createColorGradient(d.sourceColor)},
              {offset: "50%", color: createColorGradient(d.targetColor)}, 
              {offset: "100%", color: createColorGradient(d.targetColor)}
          ])                  
          .enter().append("stop")         
          .attr("offset", function(d) { return d.offset; })   
          .attr("stop-color", function(d) { return d.color; }); 
                  
      self.style("stroke", "url(#" + gradientId + ")")
    }

    // create color for gradient strength must be a value between 0 and 1
    // the gradient goes from red to yellow to green
    function createColorGradient(strength) {
      if(strength >= 0.5) {
        return d3.rgb(255, (1 - strength) * 2 * 255, 0)
      } else {
        return d3.rgb(strength * 2 * 255, 255, 0)
      }
    }
  
    function refreshGradient(line, d){
      let gradientId = "gradient_" + d.uuid;
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

  disableHighlighting(fixedHighlighting) {
    if(fixedHighlighting || _simulation === undefined) return;

    _nodes.style('fill', function (node_d) {return node_d.type == "m" ? "yellow" : "pink"})
    _nodes.style('stroke-width', 1);
    _links.style('stroke-width', '1');
    _text.style("fill", 'black');
    _text.style('font-size', '16');
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

  // returns true if config properties were changed
  updateConfigProperties(nextProps){
    if(_showIntraModuleDeps != nextProps.showIntraModuleDeps 
      || _nodeToHighlight != nextProps.nodeToHighlight
      || _activateNodeHighlighting != nextProps.activateNodeHighlighting
      || _minSharedCommits != nextProps.minSharedCommits) {

      _showIntraModuleDeps = nextProps.showIntraModuleDeps;
      _nodeToHighlight = nextProps.nodeToHighlight;
      _activateNodeHighlighting = nextProps.activateNodeHighlighting;
      _minSharedCommits = nextProps.minSharedCommits;

      if(_activateNodeHighlighting){
        this.highlightNodes(_nodeToHighlight);
      } else {
        this.disableHighlighting(_fixedHighlighting);
      }

      return true;
    } 

    return false;
  }

  highlightNodes(filter) {
    if(_simulation == undefined) return;
    
    _fixedHighlighting = false;
    this.disableHighlighting(_fixedHighlighting);

    _nodes.style('fill', function (node_d) {
      if(filter != "" && node_d.id.includes(filter)) {
        return node_d.type == "m" ? "orange" : "aqua";
      }

      return node_d.type == "m" ? "yellow" : "pink"
    })
  }

}