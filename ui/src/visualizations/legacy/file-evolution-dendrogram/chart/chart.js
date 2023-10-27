'use strict';

import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';

import '../css/codeMirror.css';
import styles from '../styles.scss';
import * as zoomUtils from '../../../../utils/zoom.js';
import GlobalZoomableSvg from '../../../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../../../components/svg/ChartContainer.js';

export default class FileEvolutionDendrogram extends React.PureComponent {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {
      files: props.files,
      convertedFiles: this.convertData(props.files),
      //isPanning: false,
      dimensions: zoomUtils.initialDimensions(),
      transform: d3.zoomIdentity,
    };

    /*
    const zoom_x = d3.scaleTime().rangeRound([0, 0]);
    const zoom_y = d3.scaleLinear().rangeRound([0, 0]);

    this.scales = {
      x: zoom_x,
      y: zoom_y,
      scaledX: zoom_x,
      scaledY: zoom_y,
    };

    this.scales.x.domain([0, 928]);
    this.scales.y.domain([0, 928]);
    */

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
    this.createChart();
  }

  componentWillReceiveProps(nextProps) {
    const { files } = nextProps;
    const convertedFiles = this.convertData(files);

    // setState is async - call createChart on callback
    // createChart is used seperately from render(), since render is called on zoom
    this.setState({
      files: files,
      convertedFiles: convertedFiles,
    }, () => {
      this.createChart();
    });

    //this.createChart();
  }

  componentDidMount() { }


  render() {

    return (
      <ChartContainer onResize={(evt) => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={(evt) => this.onZoom(evt)}
          transform={this.state.transform}
          //unzoomed={<Legend x="10" y="10" categories={legend} />}
        >

          <g ref={g => this.chartRef = g}></g>

        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }

  // render is called while zooming, so this has to be separated from render
  // is called als callback from props changing
  createChart() {
    this.chartSettings = {};
    // Specify the chart’s dimensions.
    this.chartSettings.width = 2000;
    this.chartSettings.height = this.chartSettings.width;
    this.chartSettings.center_x = this.chartSettings.width * 0.5;
    this.chartSettings.center_y = this.chartSettings.height * 0.59;
    this.chartSettings.radius = Math.min(this.chartSettings.width, this.chartSettings.height) / 2 - 30;

    // create a radial tree layout
    this.chartSettings.tree = d3.tree()
      .size([2 * Math.PI, this.chartSettings.radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth*2);

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
    let root = this.chartSettings.tree(d3.hierarchy(this.state.convertedFiles), d => getChildren(d));

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
      .data(nodes_data, function (d) {
        return d.data.path;
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
    .attr("r", d => d.children ? 6 : 3)
      .on('mouseover', function (d) {
        if (d.children) {
          d3.select(this).style("cursor", "pointer")
        }
      })
      .filter(d => d.children)
      .on("click", function (event, d) {
        // switch out children, to not draw them in the next update
        let altChildren = d.data.altChildren || [];
        let children = d.data.children;
        d.data.children = altChildren;
        d.data.altChildren = children;
        _this.update(true, false);
      })

      // instead of just adding text to newnodes, redraw all the text
      // resets the text orienation -> would be destroyed when collapsing nodes
      this.nodegroup.selectAll("text").remove();
      this.nodegroup.selectAll("g").append("text")
      .text(d => d.data.name)
      .attr("x", 10)
      .attr("dy", ".31em");

      this.nodegroup.selectAll("text")
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .attr("x", d => d.x < Math.PI === !d.children ? 10 : -10)
      /*
    .filter(d => d.children)
    .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 1.5);
      */
  }

  // needs subfiles to be named children, it does not work wth content
  getChildren(data) {
    return data?.children ?? [];
  }

  // taken from code hotspots, changed by giving base folder a name
  // needs subfiles to be named children, it does not work with content
  convertData(data) {
    const convertedData = { name: "root", children: [] };
    for (const file of data) {
      const pathParts = file.key.split('/');
      this.genPathObjectString(convertedData.children, pathParts, file.webUrl, file.key, "");
    }

    return convertedData;
  }

  // traversedPath is needed to give all folders a unique path
  // only path is not enough, since there is no way to differentiate between 
  // two folders of the same name in a path, e.g. -> a/b/a/c/...
  genPathObjectString(convertedData, pathParts, Url, Path, traversedPath ) {
    const currElm = pathParts.shift();

    if (pathParts.length === 0) {
      convertedData.push({ name: currElm, type: 'file', url: Url, path: Path });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: 'folder', path: this.updateTraversedPath(traversedPath, currElm),  children: [] };
        this.genPathObjectString(elem.children, pathParts, Url, Path, this.updateTraversedPath(traversedPath, currElm));
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.children, pathParts, Url, Path, this.updateTraversedPath(traversedPath, currElm));
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

}
