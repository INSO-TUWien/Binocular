'use strict';

import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';

import styles from '../styles.scss';
import _ from 'lodash';

import Legend from '../../../components/Legend';
import * as zoomUtils from '../../../utils/zoom.js';

export default class DependencyGraph extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};

    this.state = {
      filesAndLinks: props.filesAndLinks      
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      filesAndLinks: nextProps.filesAndLinks
    });
  }

  render() {
    if(!!this.state.filesAndLinks) {
      return <div style={{overflow: "scroll", width: "100%", height: "100vh", display: "inline-block", position: "absolute"}}>
                <svg width="3000" height="3000" ref="graphSvg"></svg>
              </div>;
    } else {
      return <p>Loading data...</p>;
    }
  }

  componentDidUpdate() {
    var svg = d3.select(this.refs.graphSvg),
    width = 2000,
    height = 2000;

    svg.html("");

    if(!!this.state.filesAndLinks 
        && !!this.state.filesAndLinks.nodes 
        && !!this.state.filesAndLinks.links) {

      var nodes = this.state.filesAndLinks.nodes;
      var links = this.state.filesAndLinks.links;

      var minLineCount = this.state.filesAndLinks.minLineCount;
      var maxLineCount = this.state.filesAndLinks.maxLineCount;
      var minCommitCount = this.state.filesAndLinks.minCommitCount;
      var maxCommitCount = this.state.filesAndLinks.maxCommitCount;
      var meanCommitCount = this.state.filesAndLinks.meanCommitCount;

      var minFolderLineCount = this.state.filesAndLinks.minFolderLineCount;
      var maxFolderLineCount = this.state.filesAndLinks.maxFolderLineCount;
      var minFolderCommitCount = this.state.filesAndLinks.minFolderCommitCount;
      var maxFolderCommitCount = this.state.filesAndLinks.maxFolderCommitCount;
      var meanFolderCommitCount = this.state.filesAndLinks.meanFolderCommitCount;

      var color = d3.scaleOrdinal(d3.schemeCategory20);
      
      var simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(1000))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));
      
        var link = svg.append("g")
            .attr("class", "links")
          .selectAll("line")
          .data(links)
          .enter().append("line")
            .attr("stroke-width", function(d) { return d.commitCount > 20 ? d.commitCount/20 : "0"; })
            .attr("stroke", "black")
            .attr("stroke-opacity", "0.6");
      
        var node = svg.append("g")
            .attr("class", "nodes")
          .selectAll("g")
          .data(nodes)
          .enter().append("g");

        var fileColor = d3.scaleLinear()
          .domain([minCommitCount, maxCommitCount])
          .range(["lightblue", "darkblue"]);

        var folderColor = d3.scaleLinear()
          .domain([minFolderCommitCount, maxFolderCommitCount])
          .range(["lightblue", "darkblue"]);

        var circles = node.append("circle")
            .attr("r", function(d) {
              var offset = 10 - minLineCount;
              var scale = (60 - 10) / (maxLineCount - minLineCount);
              var r = offset + scale * d.lineCount;
              
              if(d.type == "folder") {
                var offset = 10 - minFolderLineCount;
                var scale = (60 - 10) / (maxFolderLineCount - minFolderLineCount);
                var r = offset + scale * d.lineCount;
              }

              r = r < 10 ? 10 : r;
              r = r > 60 ? 60 : r;

              return r;
            })
            .attr("fill", function(d) { return d.type == "file" ? fileColor(d.commitCount) : folderColor(d.commitCount); })
            .attr("stroke", function(d) {
              if(d.type == "file") {
                return "black";
              } else {
                return "red";
              }
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
      
        var lables = node.append("text")
            .text(function(d) {
              'text';
            })
            .attr('x', 6)
            .attr('y', 3);
      
        node.append("title")
            .text(function(d) { return d.path + " (" + d.lineCount + " lines, " + d.commitCount + " commits)"; });
      
        simulation
            .nodes(nodes)
            .on("tick", ticked);
      
        simulation.force("link")
            .links(links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            })
      }
      
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
    
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  }
};
