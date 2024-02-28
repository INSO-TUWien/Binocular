'use strict';

import React from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import '../css/codeMirror.css';
import styles from '../styles.scss';
import * as zoomUtils from '../../../../utils/zoom.js';
import GlobalZoomableSvg from '../../../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../../../components/svg/ChartContainer.js';

// TODOS:
// - cleanup the code, chart still has unnecessary stuff in it
// - changing to author view does reset the tree - try to prevent this (e.g. collapsed nodes should stay collapsed)
// - filter for certain files and jump to it
// - change size depending on the project size
// - after calculating the authors with most commits/linesChanged, remove the statsbyAuthors on nodes to save on memory
// - add information when hovering over nodes displaying how many linesChanged/commits and who is the author if authorview
// - make the config look nicer
// - author config component doesnt allow to exclude authors
// - config changes recalculate convertedFiles and reload the tree - make it smart

export default class FileEvolutionDendrogram extends React.PureComponent {
  constructor(props) {
    super(props);

    const convertedFiles = this.convertData(props.files, props.omitFiles);

    this.state = {
      palette: props.palette,
      convertedFiles: convertedFiles,
      transform: d3.zoomIdentity,
      displayMetric: props.displayMetric,
      displayByAuthors: props.displayByAuthors,
      linesChangedScale: this.getColorScale(convertedFiles.totalStats.linesChanged),
      commitScale: this.getColorScale(convertedFiles.totalStats.count), 
      omitFiles: props.omitFiles,
    };


    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  componentWillReceiveProps(nextProps) {
    const { files, palette, displayMetric, displayByAuthors, omitFiles } = nextProps;
    const convertedFiles = this.convertData(files, omitFiles);

    // setState is async - call createChart on callback
    // createChart is used seperately from render(), since render is called on zoom
    this.setState({
      convertedFiles: convertedFiles,
      palette: palette,
      displayMetric: displayMetric,
      displayByAuthors: displayByAuthors,
      linesChangedScale: this.getColorScale(convertedFiles.totalStats.linesChanged),
      commitScale: this.getColorScale(convertedFiles.totalStats.count),
      omitFiles: omitFiles,
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
    if (collapseOuter && !this.state.omitFiles) {
      const leaves = root.leaves();
      const parents = new Set();

      // get all parents that have only leave nodes as children
      for (let leaf of leaves) {
        if (leaf.parent !== null) {
          parents.add(leaf.parent);
          for (let child of leaf.parent.children) {
            if (child.data.children !== undefined && child.data.children.length > 0) {
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
      .style("stroke", (d) => this.getColor(d.target.data))
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(10));

    let t = d3.transition()
      .duration(animate ? 600 : 0)
      .ease(d3.easeLinear);

    this.linkgroup.selectAll("path")
      .transition(t)
      .style("stroke", (d) => this.getColor(d.target.data))
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));


    let nodes_data = root.descendants();

    let nodes = this.nodegroup
      .selectAll("g")
      .data(nodes_data, (d) => d.data.path);

    // remove dom elements without data attached after updating
    nodes.exit().remove();

    // nodes that have to be drawn
    let newnodes = nodes
      .enter().append("g")
      .on("click", function (event, d) {
        if (d.data.children) {
          // switch out children, to not draw them in the next update
          let altChildren = d.data.altChildren || [];
          let children = d.data.children;
          d.data.children = altChildren;
          d.data.altChildren = children;
          _this.update(true, false);
        }
        console.log(d);
        
      });

    let allnodes = animate ? this.nodegroup.selectAll("g").transition(t) : this.nodegroup.selectAll("g");
    allnodes.attr("transform", d => `
         rotate(${d.x * 180 / Math.PI - 90})
         translate(${d.y},0)`)
         .attr("r", d => d.data.children ? 6 : 3);

    allnodes.select("circle")
      .attr("r", d => d.data.children ? 6 : 3)
      .style("fill", (d) => this.getColor(d.data));
    
    newnodes.append("circle")
      .attr("r", d => d.data.children ? 6 : 3)
      .style("fill", (d) => this.getColor(d.data));

      // instead of just adding text to newnodes, redraw all the text
      // resets the text orienation -> would be destroyed when collapsing nodes
      this.nodegroup.selectAll("text").remove();
      this.nodegroup.selectAll("g").append("text")
      .text(d => d.data.name)
      .attr("x", 10)
      .attr("dy", ".31em")
      .style("fill", (d) => this.getColor(d.data));

      this.nodegroup.selectAll("text")
      .attr("text-anchor", d => d.x < Math.PI === !d.data.children ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .attr("x", d => d.x < Math.PI === !d.data.children ? 10 : -10)
      .style("fill", (d) => this.getColor(d.data));

     // draw the updated parents
     if(collapseOuter && !this.state.omitFiles) {
      this.update(true, false)
     }
  }

  // taken from code hotspots, changed by giving base folder a name
  // needs subfiles to be named children, it does not work with content
  convertData(data, omitFiles) {
    const convertedData = { name: "root", children: [] };
    for (const file of data) {
      const pathParts = file.key.split('/');
      this.genPathObjectString(convertedData.children, pathParts, file.webUrl, file.key, file.totalStats,
        file.statsByAuthor, "");
    }

    this.fillInFolderStats(convertedData);

    if (omitFiles) {
      this.removeFiles(convertedData);
    }

    return convertedData;
  }

  // traversedPath is needed to give all folders a unique path
  // only path is not enough, since there is no way to differentiate between 
  // two folders of the same name in a path, e.g. -> a/b/a/c/...
  genPathObjectString(convertedData, pathParts, Url, Path, totalStats, statsByAuthor, traversedPath ) {
    const currElm = pathParts.shift();

    if (pathParts.length === 0) {
      const authorMostLinesChanged = _.maxBy(_.values(statsByAuthor), "linesChanged");
      const authorMostCommits = _.maxBy(_.values(statsByAuthor), "count");
      convertedData.push({ name: currElm, type: 'file', url: Url, path: Path, totalStats: totalStats,
       authorMostLinesChanged: authorMostLinesChanged, authorMostCommits: authorMostCommits, statsByAuthor });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: 'folder', path: this.updateTraversedPath(traversedPath, currElm), children: [] };
        this.genPathObjectString(elem.children, pathParts, Url, Path, totalStats, statsByAuthor, this.updateTraversedPath(traversedPath, currElm));
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.children, pathParts, Url, Path, totalStats, statsByAuthor, this.updateTraversedPath(traversedPath, currElm));
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

  fillInFolderStats(data) {
    if (data.children) {

      const totalStats = {
      count: 0,
      linesChanged: 0,
      };

      const totalStatsByAuthor = {};

      _.each(data.children, (child) => {
        const childData = this.fillInFolderStats(child);
        // total stats
        totalStats.linesChanged = totalStats.linesChanged + childData.totalStats.linesChanged;
        totalStats.count = totalStats.count + childData.totalStats.count;
        data.totalStats = totalStats;

        // stats for each author
        _.each(childData.statsByAuthor, (authorStats) => {
          let stats = totalStatsByAuthor[authorStats.author];
          if (!stats) {
            totalStatsByAuthor[authorStats.author] = authorStats;
          } else {
            totalStatsByAuthor[authorStats.author].count = totalStatsByAuthor[authorStats.author].count + authorStats.count;
            totalStatsByAuthor[authorStats.author].linesChanged = totalStatsByAuthor[authorStats.author].linesChanged + authorStats.linesChanged;
          }

        });
      });

      const authorMostLinesChanged = _.maxBy(_.values(totalStatsByAuthor), "linesChanged");
      const authorMostCommits = _.maxBy(_.values(totalStatsByAuthor), "count");

      data.authorMostLinesChanged = authorMostLinesChanged;
      data.authorMostCommits = authorMostCommits;

      data.totalStats = totalStats;
      data.statsByAuthor = totalStatsByAuthor;
      return data;
    } else { // basecase
      return data;
    }
  }

  removeFiles(data) {
    data.children = data.children.filter((child) => child.type == "folder");
    _.each(data.children, (child) => {
      this.removeFiles(child);
    });
  }

  getColor(file) {
    let color = "#000000";

    if (this.state.displayByAuthors === true) {
      if (this.state.palette === undefined) {
        return "#000000";
      }

      if (this.state.displayMetric === 'linesChanged') {
        _.each(Object.keys(this.state.palette), (key) => {
          if (key === file.authorMostLinesChanged?.author) {
            color = this.state.palette[key];
          }
        });
      } else if (this.state.displayMetric === 'commits') {
        _.each(Object.keys(this.state.palette), (key) => {
          if (key === file.authorMostCommits?.author) {
            color = this.state.palette[key];
          }
        });
      }
      
    } else {
      if (this.state.displayMetric === 'linesChanged') {
        
        if (file.totalStats.linesChanged == 0) { // 0 should be black
          color = '#000000'
        } else {
          const scaleEntry = this.state.linesChangedScale.find((color) => file.totalStats.linesChanged <= color.value);
          if (scaleEntry === undefined) {
            return '#000000';
          }
          color = scaleEntry.color;
        }
      } else if (this.state.displayMetric === 'commits') {
        if (file.totalStats.count == 0) { // 0 should be black
          color = '#000000'
        } else {
          const scaleEntry = this.state.commitScale.find((color) => file.totalStats.count <= color.value);
          if (scaleEntry === undefined) {
            return '#000000';
          }
          color = scaleEntry.color;
        }
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