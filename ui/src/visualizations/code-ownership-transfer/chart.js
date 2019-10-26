'use strict';

import React from 'react';
import * as d3 from 'd3';

import MysteriousSankey from "./MysteriousSankey";
import * as zoomUtils from '../../utils/zoom.js';

import styles from './styles.scss';
import {selectedFile} from "./sagas";
import ChartContainer from "../../components/svg/ChartContainer";
import {arrayForVisualization, temp2Node} from "./sagas/getOwner";



export default class TransferCodeOwnership extends React.PureComponent {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0);


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
    console.log('selected file:', selectedFile);
    if (selectedFile === '' || !selectedFile) {
      return (
        <div className={styles.filler}>
          <p>Please select one file to visualize from the sidebar.</p>
        </div>
      );
    }

    console.log('nodes-links array for SankeyD: ', arrayForVisualization);
    if(!arrayForVisualization.nodes.length || !arrayForVisualization.links.length ){
      return (
        <div className={styles.filler}>
          <p>This file does not have owner.</p>
        </div>
      );
    }

    if(arrayForVisualization.links.length === 1) {
      return (
        <ChartContainer onResize={evt => this.onResize(evt)}>
          <div className={styles.filler} >
            <div className={styles.boxChart}  style={{width: 700}} >
              <div className={styles.fileName}>There is only 1 commit. The visualization can not be shown. The owner of the file is <b style={{color:temp2Node[0].color}}>{temp2Node[0].name}</b></div>
              {temp2Node.map((value, index) => {
                return <svg width="550" height="40px"><rect x="50" y="20" width="20" height="20"
                                                            fill={temp2Node[index].color}/>
                  <text x="72" y="37" width="15px" height="15px" fill='black'>{temp2Node[index].name}</text>
                </svg>
              })}
            </div>
          </div>
        </ChartContainer>

      );
    }

    const { data } = this.state;

    //If the number of commits is > 140 the distance between commit should be reduced
    if(arrayForVisualization.links.length > 140){
      return(
        <ChartContainer onResize={evt => this.onResize(evt)}>
          <div className={styles.filler} >
            <div className={styles.boxChart}  style={{width: 40*data.links.length}} >
              {/*<div className={styles.fileName}>{selectedFile.path}</div>*/}
              <svg  width={40*data.links.length} height="120px" className={styles.chart}>
                {data && (
                  <MysteriousSankey data={data} width={40*data.links.length} height={90}/>
                )}
              </svg>
              {temp2Node.map((value, index) => {
                return <p><svg width="550" height="40px"><rect x="50" y="20" width="20" height="20"
                                                               fill={temp2Node[index].color}/>
                  <text x="72" y="37" width="15px" height="15px" fill='black'>{temp2Node[index].name}</text>
                </svg>
                </p>
              })}
            </div>
          </div>
        </ChartContainer>
      );
    }




    return (

      <ChartContainer onResize={evt => this.onResize(evt)}>
        <div className={styles.filler} >
          <div className={styles.boxChart}  style={{width: 70*data.links.length}} >
            {/*<div className={styles.fileName}>{selectedFile.path}</div>*/}
            <svg  width={70*data.links.length} height="120px" className={styles.chart}>
              {data && (
                <MysteriousSankey data={data} width={70*data.links.length} height={80}/>
              )}
            </svg>
              {temp2Node.map((value, index) => {
                return <p><svg width="550" height="40px"><rect x="50" y="20" width="20" height="20"
                             fill={temp2Node[index].color}/>
                  <text x="72" y="37" width="15px" height="15px" fill='black'>{temp2Node[index].name}</text>
                </svg>
                </p>
              })}
          </div>
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

