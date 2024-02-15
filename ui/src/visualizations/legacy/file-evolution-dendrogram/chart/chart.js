'use strict';

import React from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import '../css/codeMirror.css';
import styles from '../styles.scss';
import * as zoomUtils from '../../../../utils/zoom.js';
import GlobalZoomableSvg from '../../../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../../../components/svg/ChartContainer.js';

export default class FileEvolutionDendrogram extends React.PureComponent {
  constructor(props) {
    super(props);

    const convertedFiles = this.convertData(props.files);

    this.state = {
      palette: props.palette,
      convertedFiles: convertedFiles,
      transform: d3.zoomIdentity,
      displayMetric: props.displayMetric,
      displayByAuthors: props.displayByAuthors,
      linesChangedScale: this.getColorScale(convertedFiles.totalStats.linesChanged),
      commitScale: this.getColorScale(convertedFiles.totalStats.count), 
    };


    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  componentWillReceiveProps(nextProps) {
    const { files, palette, displayMetric, displayByAuthors } = nextProps;
    const convertedFiles = this.convertData(files);

    // setState is async - call createChart on callback
    // createChart is used seperately from render(), since render is called on zoom
    this.setState({
      convertedFiles: convertedFiles,
      palette: palette,
      displayMetric: displayMetric,
      displayByAuthors: displayByAuthors,
      linesChangedScale: this.getColorScale(convertedFiles.totalStats.linesChanged),
      commitScale: this.getColorScale(convertedFiles.totalStats.count),
    }, () => {
      this.update(false, true);
    });
  }

  componentDidMount() { 
    this.createChart();
  }


  render() {

    return (
      <ChartContainer onResize={(evt) => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={(evt) => this.onZoom(evt)}
          transform={this.state.transform}
        >

          <g ref={g => this.chartRef = g}></g>

        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }

  // render is called while zooming, so this has to be separated from render
  // is called as callback from props changing
  createChart() {
    this.chartSettings = {};
    // Specify the chart’s dimensions.
    this.chartSettings.width = 2500;
    this.chartSettings.height = this.chartSettings.width;
    this.chartSettings.center_x = this.chartSettings.width * 0.5;
    this.chartSettings.center_y = this.chartSettings.height * 0.59;
    this.chartSettings.radius = Math.min(this.chartSettings.width, this.chartSettings.height) / 2 - 30;

    // create a radial tree layout
    this.chartSettings.tree = d3.tree()
      //.nodeSize([2 * Math.PI, 100])
      .size([2 * Math.PI, this.chartSettings.radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    // selects the container for the chart
    this.g = d3.select(this.chartRef)
      .attr("width", this.chartSettings.width)
      .attr("height", this.chartSettings.height)
      .attr("viewBox", [-this.chartSettings.center_x, -this.chartSettings.center_y, this.chartSettings.width, this.chartSettings.height])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

      // prevent creating a new group on each createChart call
      this.linkgroup = this.g.select(".linkgroup");
      if(this.linkgroup.empty()) {
        this.linkgroup = this.g.append("g")
        .classed("linkgroup", true)
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);
      }

      // prevent creating a new group on each createChart call
      this.nodegroup = this.g.select(".nodegroup");
      if(this.nodegroup.empty()) {
        this.nodegroup = this.g.append("g")
        .classed("nodegroup", true)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 1.5);
      }

      // initial update, draws the chart for the first time
      this.update(false, true);
  }

  update(animate = true, collapseOuter = false) {
    // get class context into this function
    const _this = this;
    // sort the tree and apply the layout
    let root = this.chartSettings.tree(d3.hierarchy(this.state.convertedFiles));

    // collapse outer nodes that only have leave nodes as children
    if (collapseOuter) {
      const leaves = root.leaves();
      const parents = new Set();

      // get all parents that have only leave nodes as children
      for (let leaf of leaves) {
        if (leaf.parent !== null) {
          parents.add(leaf.parent);
          for (let child of leaf.parent.children) {
            if (child.children !== undefined && child.children.length > 0) {
              parents.delete(leaf.parent);
              break;
            }
          }
        }
      }

      // collapse all children
      for (let parent of parents) {
        if (parent.data.children.length !== 0) {
          let altChildren = parent.data.altChildren || [];
          let children = parent.data.children;
          parent.data.children = altChildren;
          parent.data.altChildren = children;
        }
      }
    } 

    let links_data = root.links();
    let links = this.linkgroup
      .selectAll("path")
      // keyfunction binds data only to links which should remain
      .data(links_data, d => d.source.data.path + d.target.data.path);

    // remove the links not needed anymore after update
    links.exit().remove();

    links.enter()
      .append("path")
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(10));

    let t = d3.transition()
      .duration(animate ? 600 : 0)
      .ease(d3.easeLinear);

    this.linkgroup.selectAll("path")
      .transition(t)
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));


    let nodes_data = root.descendants();

    let nodes = this.nodegroup
      .selectAll("g")
      .data(nodes_data, (d) => d.data.path)
      .style("fill", (d) => this.getColor(d.data))
      .on('mouseover', function (d) {
        if (d.children) {
          d3.select(this).style("cursor", "pointer")
        }
      })
      .on("click", function (event, d) {
        console.log("dddddddddddddddddddd");
        console.log(d);
        // switch out children, to not draw them in the next update
        let altChildren = d.data.altChildren || [];
        let children = d.data.children;
        d.data.children = altChildren;
        d.data.altChildren = children;
        _this.update(true, false);
      });

    // remove dom elements without data attached after updating
    nodes.exit().remove();

    // nodes that have to be drawn
    let newnodes = nodes
      .enter().append("g");

    let allnodes = animate ? this.nodegroup.selectAll("g").transition(t) : this.nodegroup.selectAll("g");
    allnodes.attr("transform", d => `
         rotate(${d.x * 180 / Math.PI - 90})
         translate(${d.y},0)`);
    
    newnodes.append("circle")
    .attr("r", d => d.children ? 6 : 3);

      // instead of just adding text to newnodes, redraw all the text
      // resets the text orienation -> would be destroyed when collapsing nodes
      this.nodegroup.selectAll("text").remove();
      this.nodegroup.selectAll("g").append("text")
      .text(d => d.data.name)
      .attr("x", 10)
      .attr("dy", ".31em")
      .style("fill", (d) => this.getColor(d.data));

      this.nodegroup.selectAll("text")
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .attr("x", d => d.x < Math.PI === !d.children ? 10 : -10)
      .style("fill", (d) => this.getColor(d.data));
      /*
    .filter(d => d.children)
    .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 1.5);
      */

     // draw the updated parents
     if(collapseOuter) {
      this.update(true, false)
     }
  }

  // needs subfiles to be named children, it does not work with content
  getChildren(data) {
    return data?.children ?? [];
  }

  // taken from code hotspots, changed by giving base folder a name
  // needs subfiles to be named children, it does not work with content
  convertData(data) {
    const convertedData = { name: "root", children: [] };
    for (const file of data) {
      const pathParts = file.key.split('/');
      this.genPathObjectString(convertedData.children, pathParts, file.webUrl, file.key, file.totalStats,
        file.authorMostLinesChanged, file.authorMostCommits, "");
    }

    this.fillInTotalStats(convertedData);

    this.getColorScale(convertedData.totalStats.linesChanged);

    return convertedData;
  }

  // traversedPath is needed to give all folders a unique path
  // only path is not enough, since there is no way to differentiate between 
  // two folders of the same name in a path, e.g. -> a/b/a/c/...
  genPathObjectString(convertedData, pathParts, Url, Path, totalStats, authorMostLinesChanged, authorMostCommits, traversedPath ) {
    const currElm = pathParts.shift();

    if (pathParts.length === 0) {
      convertedData.push({ name: currElm, type: 'file', url: Url, path: Path, totalStats: totalStats,
       authorMostLinesChanged: authorMostLinesChanged, authorMostCommits:authorMostCommits });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: 'folder', path: this.updateTraversedPath(traversedPath, currElm), children: [] };
        this.genPathObjectString(elem.children, pathParts, Url, Path, totalStats, authorMostLinesChanged, authorMostCommits, this.updateTraversedPath(traversedPath, currElm));
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.children, pathParts, Url, Path, totalStats, authorMostLinesChanged, authorMostCommits, this.updateTraversedPath(traversedPath, currElm));
      }
    }
  }

  updateTraversedPath(traversedPath, currElm) {
    if (traversedPath.length === 0) {
      return currElm;
    } else {
      return traversedPath + "/" + currElm;
    }
  }

  fillInTotalStats(data) {
    if (data.children) {
      let totalStats = {
      count: 0,
      linesChanged: 0,
      };
      _.each(data.children, (child) => {
        const childStats = this.fillInTotalStats(child);
        totalStats.linesChanged = totalStats.linesChanged + childStats.linesChanged;
        totalStats.count = totalStats.count + childStats.count;
      });
      data.totalStats = totalStats;
      return totalStats;
    } else { // basecase
      return data.totalStats;
    }
  }

  getColor(file) {
    let color = "#000000";

    if (this.state.displayByAuthors === true) {
      if (this.state.palette === undefined) {
        return "#000000";
      }

      if (this.state.displayMetric === 'linesChanged') {
        _.each(Object.keys(this.state.palette), (key) => {
          if (key === file.authorMostLinesChanged) {
            color = this.state.palette[key];
          }
        });
      } else if (this.state.displayMetric === 'commits') {
        _.each(Object.keys(this.state.palette), (key) => {
          if (key === file.authorMostCommits) {
            color = this.state.palette[key];
          }
        });
      }
      
    } else {
      if (this.state.displayMetric === 'linesChanged') {
        const scaleEntry = this.state.linesChangedScale.find((color) => file.totalStats.linesChanged <= color.value);
        color = scaleEntry.color;
      } else if (this.state.displayMetric === 'commits') {
        const scaleEntry = this.state.commitScale.find((color) => file.totalStats.count <= color.value);

        color = scaleEntry.color;
      }
    }
    
    return color;
  }

  // returns a colorscale array which scales values from 1 to "highest" on a scale of yellow to red
  getColorScale(highest) {
    const scale = [];
    const start = 1;
    const steps = 256; // possible colors between yellow and red
    const ratio = Math.pow(highest / start, 1 / (steps - 1));
    const chromaScale = chroma.scale(['yellow', 'red']);

    for (let i = 0; i < steps; i++) {
      const value = start * Math.pow(ratio, i);
      let result = {
        value: value,
        color: chromaScale(this.mapNumRange(i + 1, 1, steps, 0, 1)).hex(),
      }
      scale.push(result);
    }
    scale[steps-1].value = scale[steps-1].value + 1; // fight some inaccuracies
    return scale;
  }

  // map value inside one range to value inside another range to the same spot relatively
  mapNumRange(num, inMin, inMax, outMin, outMax) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
}