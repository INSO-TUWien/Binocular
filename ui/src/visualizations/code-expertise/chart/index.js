"use strict";

import React, { useState } from "react";
import { useSelector } from 'react-redux'
import _ from 'lodash'
import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import ChartContainer from '../../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../../utils/zoom.js';
import * as d3 from "d3"
import styles from "../styles.scss"

import Segment from "./Segment.js" 
import FullScreenMessage from "./full-screen-message.js";

const Chart = () => {


  //global state from redux store
  const data = useSelector((state) => state.visualizations.codeExpertise.state.data.data)
  const config = useSelector((state) => state.visualizations.codeExpertise.state.config)
  const isFetching = useSelector((state) => state.visualizations.codeExpertise.state.data.isFetching)

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions())
  const [focussed, setFocussed] = useState(null)

  //TODO dynamically set radius depending on dimensions
  const radius = 250;
  const center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2
  };


  //functions to handle zooming and resizing of the chart
  const onResize = (evt) => {setDimensions(zoomUtils.onResizeFactoryForFunctional(0.7,0.7)(evt))}
  const onZoom = (evt) => {setTransform(evt.transform)}

  

  //other helper functions
  function onHoverOnSegment(segmentId) {
    setFocussed(segmentId)
  }

  function clearHover() {
    setFocussed(null)
  }

  function getDataForSegmentId(segmentId) {
    if (segmentId === null) return null
    return Object.entries(data.devData)[segmentId]
  }

  


  //total number of added lines by all stakeholders of the currently selected issue
  const additionsTotal = _.reduce(data.devData, (sum, adds) => {
    return sum + adds.additions
  }, 0)


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
      radius={radius} 
      startPercent={startPercent} 
      endPercent={endPercent} 
      devName={name}
      onHover={() => onHoverOnSegment(index)}/>
    )
  })

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

  if(config.mode == 'modules' && config.activeFile == null) {
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
    <ChartContainer onResize={evt => onResize(evt)}>
      <GlobalZoomableSvg
        className={styles.chart}
        scaleExtent={[1, 10]}
        onZoom={evt => onZoom(evt)}
        transform={transform}>
        <OffsetGroup dims={dimensions} transform={transform}>
        <g
        transform={`translate(${center.x}, ${center.y})`}
        onMouseLeave = { () => clearHover()}>
          {segments}
          <circle cx="0" cy="0" r={radius/10} stroke="black" fill="white"/>
        </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );

};

export default Chart


