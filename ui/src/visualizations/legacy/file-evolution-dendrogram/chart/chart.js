'use strict';

import React from 'react';
import * as d3 from 'd3';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { lineNumbers } from '@codemirror/view';
import { Compartment } from '@codemirror/state';
import styles from '../styles.scss';

import '../css/codeMirror.css';
import vcsData from './helper/vcsData';
import chartUpdater from './charts/chartUpdater';
import BluebirdPromise from 'bluebird';
import Loading from './helper/loading';
import ModeSwitcher from './helper/modeSwitcher';
import Settings from '../components/settings/settings';
import BackgroundRefreshIndicator from '../components/backgroundRefreshIndicator/backgroundRefreshIndicator';
import VisualizationSelector from '../components/visualizationSelector/visualizationSelector';
import SearchBar from '../components/searchBar/searchBar';
import searchAlgorithm from '../components/searchBar/searchAlgorithm';
import chartStyles from './chart.scss';
import Database from '../../../../database/database';
import SourceCodeRequest from './helper/sourceCodeRequest';
import GitLabConfig from '../../../../../config/gitlab.json';
import _ from 'lodash';
import ApiKeyEntry from '../components/apiKeyEntry/apiKeyEntry';
import { files } from 'jszip';

export default class FileEvolutionDendrogram extends React.PureComponent {
  constructor(props) {
    super(props);
    console.log("props");
    console.log(props);

    /*
    this.requestFileStructure().then(function (resp) {
      const files = [];
      for (const i in resp) {
        files.push({ key: resp[i].path, webUrl: resp[i].webUrl });
      }
      props.onSetFiles(files);
    });
    console.log("props");
    console.log(props);
    */

    this.elems = {};
    this.state = {
      branch: 'main',
      checkedOutBranch: 'main',
      path: '',
      fileURL: '',
      files: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log("willreceive");
    const { fileURL, branch, path, files } = nextProps;
    console.log(nextProps);
    this.setState({ path: path, branch: branch, fileURL: fileURL, files: files });
  }

  componentDidMount() {}

  render() {
    /*
     // Specify the chart’s dimensions.
  const width = 928;
  const height = width;
  const cx = width * 0.5; // adjust as needed to fit
  const cy = height * 0.59; // adjust as needed to fit
  const radius = Math.min(width, height) / 2 - 30;

  const convertedData = this.convertData(this.state.files);
  console.log(convertedData);

  // Create a radial tree layout. The layout’s first dimension (x)
  // is the angle, while the second (y) is the radius.
  const tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

  // Sort the tree and apply the layout.
  const root = tree(d3.hierarchy(this.state.files));

  // Creates the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-cx, -cy, width, height])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

  // Append links.
  svg.append("g")
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
  svg.append("g")
    .selectAll()
    .data(root.descendants())
    .join("circle")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 2.5);

  // Append labels.
  svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("text")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})`)
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("paint-order", "stroke")
      .attr("stroke", "white")
      .attr("fill", "currentColor")
      .text(d => d.data.name);

  return svg.node();
  */
  }

  /*
  requestFileStructure() {
    return BluebirdPromise.resolve(Database.requestFileStructure()).then((resp) => resp.files.data);
  }
  */

  getChildren(data) {
    return data?.children ?? [];
  }

  convertData(data) {
    const convertedData = { content: [] };
    for (const file of data) {
      const pathParts = file.key.split('/');
      this.genPathObjectString(convertedData.content, pathParts, file.webUrl, file.key);
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
        elem = { name: currElm, type: 'folder', content: [] };
        this.genPathObjectString(elem.content, pathParts, Url, Path);
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.content, pathParts, Url, Path);
      }
    }
  }

}
