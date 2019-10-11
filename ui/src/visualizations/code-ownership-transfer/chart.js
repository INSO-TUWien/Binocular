'use strict';

import React from 'react';
import * as d3 from 'd3';

import MysteriousSankey from "./MysteriousSankey";
import * as zoomUtils from '../../utils/zoom.js';

import styles from './styles.scss';
import {selectedFile} from "./sagas";
import ChartContainer from "../../components/svg/ChartContainer";
import GlobalZoomableSvg from "../../components/svg/GlobalZoomableSvg";
import Legend from "../../components/Legend";
import {arrayForVisualization, temp2Node} from "./sagas/getOwner";
import {numOfDevFile} from "./config";






export default class IssueImpact extends React.PureComponent {
  constructor(props) {
    super(props);

    const { commits, issue, chosenFile, files,  start, end, colors } = extractData();

    this.elems = {};
    this.state = {
      dirty: true,
      commits,
      colors,
      data: null,
      width: 30, height: 30,
      issue,
      files,
      chosenFile,
      start,
      end,
      isPanning: false,
      hoveredHunk: null,
      hoveredFile: null,
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions()
    };

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }




  componentWillReceiveProps(nextProps) {
    const { start, end, data } = extractData(nextProps);

    this.setState({
      data,
      start,
      end,
    });
  }



  render() {
    if (selectedFile === '') {
      return (
        <div className={styles.filler}>
          <p>Please select one file to visualize from the sidebar.</p>
        </div>
      );
    }

    const { data } = this.state;
    console.log('Chart of file', selectedFile);

    return (

      <ChartContainer onResize={evt => this.onResize(evt)}>
        <div className={styles.filler} >
            <svg  width='1500px' height="100%">
              {data && (
                <MysteriousSankey data={data} width={1300} height={100} />
              )}
            </svg>
        </div>
      </ChartContainer>

    );
  }
}

function extractData() {
    return {
      data: arrayForVisualization
  }
}

