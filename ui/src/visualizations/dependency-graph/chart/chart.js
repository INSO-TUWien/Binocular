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
      var totalCommitCount = this.state.filesAndLinks.totalCommitCount;

      var meanPercentageOfCombinedCommitsThreshold = this.state.filesAndLinks.meanPercentageOfCombinedCommitsThreshold;
      var meanPercentageOfMaxCommitsThreshold = this.state.filesAndLinks.meanPercentageOfMaxCommitsThreshold;

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
          .enter().append("polygon")
            .attr("stroke", "none")
            .attr("opacity", "0.6")
            .attr("fill", "grey");
      
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

        node.filter(function(d){ return d.type == "file"; }).append("circle")
            .attr("r", function(d) {
              
              var range = (maxLineCount - minLineCount);
              var r = (((d.lineCount - minLineCount) * 40) / (maxLineCount - minLineCount)) + 10;

              r = r < 10 ? 10 : r;
              r = r > 60 ? 60 : r;

              return r;
            })
            .attr("fill", function(d) { return fileColor(d.commitCount); })
            .attr("stroke", function(d) {
              return "black";
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

          node.filter(function(d){ return d.type == "folder"; }).append("rect")
            .attr("width", function(d) {
              
              var range = (maxFolderLineCount - minFolderLineCount);
              var r = (((d.lineCount - minFolderLineCount) * 60) / range) + 20;
              
              r = r < 20 ? 20 : r;
              r = r > 80 ? 80 : r;

              return r;
            })
            .attr("height", function(d) {
              
              var range = (maxFolderLineCount - minFolderLineCount);
              var r = (((d.lineCount - minFolderLineCount) * 60) / range) + 20;
              
              r = r < 20 ? 20 : r;
              r = r > 80 ? 80 : r;

              return r;
            })
            .attr("fill", function(d) { return folderColor(d.commitCount); })
            .attr("stroke", function(d) {
              return "black";
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
          .attr("points", function(d) { return getConnectionPoints(d); })
          .attr("transform", function(d) { return getConnectionTransform(d); });

      node
          .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          })
      }

      function getConnectionPoints(link) {
        var sourceCommits = link.source.commitCount;
        var targetCommits = link.target.commitCount;
        var combinedCommits = link.commitCount;

        var sourcePercentage = 100 / sourceCommits * combinedCommits;
        var targetPercentage = 100 / targetCommits * combinedCommits;

        var sourcePercentageOfMaxCommits = 100 / (link.source.type == "file" ? maxCommitCount : maxFolderCommitCount) * sourceCommits;
        var targetPercentageOfMaxCommits = 100 / (link.target.type == "file" ? maxCommitCount : maxFolderCommitCount) * targetCommits;

        var distance = Math.hypot(link.target.x - link.source.x, link.target.y - link.source.y);

        var offset = 1;
        var scale = (200 - 1) / 100;

        var sourceWidth = offset + scale * sourcePercentage * ((sourcePercentageOfMaxCommits + targetPercentageOfMaxCommits) / 2) / 100;
        var targetWidth = offset + scale * targetPercentage * ((sourcePercentageOfMaxCommits + targetPercentageOfMaxCommits) / 2) / 100;

        if(((sourcePercentage + targetPercentage) / 2 >= meanPercentageOfCombinedCommitsThreshold)
            && ((sourcePercentageOfMaxCommits + targetPercentageOfMaxCommits) / 2 >= meanPercentageOfMaxCommitsThreshold)) {
          return (link.source.x) + "," + (link.source.y + sourceWidth/2)
                + " " + (link.source.x) + "," + (link.source.y - sourceWidth/2) 
                + " " + (link.source.x + distance) + "," + (link.source.y - targetWidth/2)
                + " " + (link.source.x + distance) + "," + (link.source.y + targetWidth/2);
        } else {
          return "";
        }
      }

      function getConnectionTransform(link) {
        var angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x) * 180 / Math.PI;
        return "rotate(" + angle + " " + link.source.x + " " + link.source.y + ")";
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
