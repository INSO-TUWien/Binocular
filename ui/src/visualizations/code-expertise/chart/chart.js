"use strict";

import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux'
import _ from 'lodash'
import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import ChartContainer from '../../../components/svg/ChartContainer.js';
import { getChartColors } from '../../../utils';
import * as zoomUtils from '../../../utils/zoom.js';
import * as d3 from "d3"
import styles from "../styles.scss"

import Segment from "./Segment.js" 
import FullScreenMessage from "./full-screen-message.js";

const Chart = () => {

  const chartSizeFactor = 0.85


  //global state from redux store
  const data = useSelector((state) => state.visualizations.codeExpertise.state.data.data)
  const config = useSelector((state) => state.visualizations.codeExpertise.state.config)
  const isFetching = useSelector((state) => state.visualizations.codeExpertise.state.data.isFetching)

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions())
  const [radius, setRadius] = useState((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor)
  const [segments, setSegments] = useState([])
  
  const center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2
  };


  //functions to handle zooming and resizing of the chart
  const onResize = (evt) => {setDimensions(zoomUtils.onResizeFactoryForFunctional(0.7,0.7)(evt))}
  const onZoom = (evt) => {setTransform(evt.transform)}


  //update radius when dimensions change.
  useEffect(() => {
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions])
  

  //only (re-)create segments if data changes
  useEffect(() => {
    //total number of added lines by all stakeholders of the currently selected issue
    const additionsTotal = _.reduce(data.devData, (sum, adds) => {
      return sum + adds.additions
    }, 0)

    //get max number of either good or bad commits. Used in segments
    let max = 0
    Object.entries(data.devData).map(item => {
      const commits = item[1].commits
      const goodCommits = commits.filter(c => c.build == 'success').length
      const badCommits = commits.filter(c => c.build != null && c.build != 'success').length

      if(goodCommits > max) max = goodCommits
      if(badCommits > max) max = badCommits
    })

    //get colors
    const devColors = getChartColors('spectral', _.range(0, Object.entries(data.devData).length));

    let segments = []
    let totalPercent = 0

    Object.entries(data.devData).map((item, index) => {
      const name = item[0]
      const devData = item[1]
      const devAdditions = devData.additions

      //at which point in a circle should the segment start
      const startPercent = totalPercent
      //adds the percentage of additions of the dev relative to all additions to the current percentage state
      totalPercent += (devAdditions/additionsTotal)
      //at which point in a circle should the segment end
      const endPercent = totalPercent

      segments.push(
        <Segment
        key={index}
        rad={radius} 
        startPercent={startPercent} 
        endPercent={endPercent} 
        devName={name}
        devData={devData}
        maxCommits={max}
        devColor={devColors[index]}/>
      )
    })

    setSegments(segments)
  
  }, [data, radius])
  

  // let testText
  // if(focussed != null && getDataForSegmentId(focussed)) {
  //   testText = <div>Currently focussed: {getDataForSegmentId(focussed)[0]}</div>
  // } else {
  //   testText = <div>No Segment focussed</div>
  // }


  if(config.currentBranch == null) {
    return(
      <FullScreenMessage message={'Please select a Branch!'}/>
    )
  }

  if(config.mode == 'issues' && config.activeIssueId == null) {
    return(
      <FullScreenMessage message={'Please select an Issue to be visualized!'}/>
    )
  }

  if(config.mode == 'modules' && (config.activeFiles == null || config.activeFiles.length == 0)) {
    return(
      <FullScreenMessage message={'Please select a File to be visualized!'}/>
    )
  }

  if(isFetching) {
    return(
      <FullScreenMessage message={'Loading...'}/>
    )
  }

  //if there are no commits to be shown
  //(for example if a branch/issue combination is selected where no commits on the branch are tagged with the respective issueId)
  if(segments.length == 0) {
    return (
      <FullScreenMessage message={'There are no commits for your current selection!'}/>
    )
  }

  

  return (
    <ChartContainer onResize={evt => onResize(evt)} className={styles.chartContainer}>
      <GlobalZoomableSvg
        className={styles.chart}
        scaleExtent={[1, 10]}
        onZoom={evt => onZoom(evt)}
        transform={transform}>
        <OffsetGroup dims={dimensions} transform={transform}>
        <g
        transform={`translate(${center.x}, ${center.y})`}>
          {segments}
          <circle cx="0" cy="0" r={radius/3} stroke="black" fill="white"/>
        </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );

};

export default Chart


