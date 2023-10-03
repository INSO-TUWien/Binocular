'use strict';

import React from 'react';
import * as d3 from 'd3';

import '../css/codeMirror.css';

export default class FileEvolutionDendrogram extends React.PureComponent {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {
      branch: 'main',
      checkedOutBranch: 'main',
      path: '',
      fileURL: '',
      files: props.files,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, path, files } = nextProps;
    this.setState({ path: path, branch: branch, fileURL: fileURL, files: files });
  }

  componentDidMount() {}

  render() {
     // Specify the chart’s dimensions.
  const width = 928;
  const height = width;
  const cx = width * 0.5; // adjust as needed to fit
  const cy = height * 0.59; // adjust as needed to fit
  const radius = Math.min(width, height) / 2 - 30;

  const convertedData = this.convertData(this.state.files);

  // Create a radial tree layout. The layout’s first dimension (x)
  // is the angle, while the second (y) is the radius.
  const tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

  // Sort the tree and apply the layout.
  const root = tree(d3.hierarchy(convertedData), d => getChildren(d));

  // Creates the SVG container.
  this.svg = d3.select(this.chartRef)
  .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-cx, -cy, width, height])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

  // Append links.
  this.svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
    .selectAll()
    .data(root.links())
    .join("path")
      .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y));

  // Append nodes.
  this.svg.append("g")
    .selectAll()
    .data(root.descendants())
    .join("circle")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .attr("fill", d => d.data ? "#555" : "#999")
      .attr("r", 2.5);

  // Append labels.
  this.svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("text")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})`)
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.data ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.data ? "start" : "end")
      .attr("paint-order", "stroke")
      .attr("stroke", "white")
      .attr("fill", "currentColor")
      .text(d => d.data.name);

  return (
    <div>
      <svg ref={svg => this.chartRef = svg}></svg>
    </div>
  );
  }

  // needs subfiles to be named children, it does not work wth content
  getChildren(data) {
    return data?.children ?? [];
  }

  // taken from code hotspots, changed by giving base folder a name
  // needs subfiles to be named children, it does not work wth content
  convertData(data) {
    const convertedData = { name: "root", children: [] };
    for (const file of data) {
      const pathParts = file.key.split('/');
      this.genPathObjectString(convertedData.children, pathParts, file.webUrl, file.key);
    }

    return convertedData;
  }

  genPathObjectString(convertedData, pathParts, Url, Path) {
    const currElm = pathParts.shift();

    if (pathParts.length === 0) {
      convertedData.push({ name: currElm, type: 'file', url: Url, path: Path });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: 'folder', children: [] };
        this.genPathObjectString(elem.children, pathParts, Url, Path);
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.children, pathParts, Url, Path);
      }
    }
  }

}
