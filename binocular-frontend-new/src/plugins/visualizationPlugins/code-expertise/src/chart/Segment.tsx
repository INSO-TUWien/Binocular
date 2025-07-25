import * as d3 from 'd3';
import chroma from 'chroma-js';
import React, { useEffect, useRef, useState } from 'react';
import DotsPattern from '../../../../../components/svg/patterns/dots';
import HatchPattern from '../../../../../components/svg/patterns/hatch';
import { DataPluginCommitBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits';


export interface DevData {
  commits: DataPluginCommitBuild[];
  additions?: number;
  linesOwned?: number;
}

interface SegmentProps {
  rad: number;
  startPercent: number;
  endPercent: number;
  devName: string;
  devData: DevData;
  devColor: string;
  maxCommitsPerDev: number;
}

function Segment({ rad, startPercent, endPercent, devName, devData, devColor, maxCommitsPerDev }: SegmentProps): JSX.Element {
  // Mock configuration that was previously from Redux
  const config = {
    details: '', // No developer selected by default
    onlyDisplayOwnership: false,
    mode: 'files',
  };

  //local state
  const [isDevSelected] = useState(config.details === devName);
  const [radius, setRadius] = useState(rad);
  const [focus, setFocus] = useState(false);
  const [readyToAnimate, setReadyToAnimate] = useState(false);

  // #### COLORS ####

  const devColorDark = chroma(devColor).darken().hex();
  const goodCommitsColor = chroma('green').brighten().brighten().hex();
  const badCommitsColor = chroma('red').brighten().brighten().hex();

  // #### D3 REFERENCES ####

  const segmentRef = useRef<SVGPathElement>(null);
  const contourRef = useRef<SVGPathElement>(null);
  const goodCommitsArcRef = useRef<SVGPathElement>(null);
  const badCommitsArcRef = useRef<SVGPathElement>(null);
  const additionsArcRef = useRef<SVGPathElement>(null);
  const ownershipArcRef = useRef<SVGPathElement>(null);
  const additionsTextArcRef = useRef<SVGPathElement>(null);
  const devNameArcRef = useRef<SVGPathElement>(null);
  const devNameTextRef = useRef<SVGTextElement>(null);
  const additionsTextRef = useRef<SVGTextElement>(null);
  const commitsRef = useRef<SVGPathElement>(null);

  // #### D3 PATHS ####

  const [circleSegment, setCircleSegment] = useState<d3.Path>(d3.path());
  const [goodCommitsArc, setGoodCommitsArc] = useState<d3.Arc<any, any>>(d3.arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(0));
  const [badCommitsArc, setBadCommitsArc] = useState<d3.Arc<any, any>>(d3.arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(0));
  const [additionsArc, setAdditionsArc] = useState<d3.Arc<any, any>>(d3.arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(0));
  const [ownershipArc, setOwnershipArc] = useState<d3.Arc<any, any>>(d3.arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(0));
  const [additionsTextArc, setAdditionsTextArc] = useState<d3.Arc<any, any>>(
    d3.arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(0),
  );
  const [devNameArc, setDevNameArc] = useState<d3.Arc<any, any>>(d3.arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(0));
  const [commitsPath, setCommitsPath] = useState<d3.Path>(d3.path());
  const [devNameCoordinates, setDevNameCoordiantes] = useState<[number, number]>([0, 0]);
  const [animationFlag, setAnimationFlag] = useState(false);

  // #### SETTINGS GENERAL ####

  //duration in ms for the animation when the size changes
  const animationDuration = 100;

  //controls how much the segment enlarges when hovered / focused
  const growthFactor = 1.2;

  //for some reason, arc() starts at another point that path().arc(),
  // so we have to offset the startAngle and endAngle by PI/2
  const offset = Math.PI / 2;
  const arcStartAngle = getAngle(startPercent) + offset;
  const arcEndAngle = getAngle(endPercent) + offset;

  //is used for various ids in the JSX
  const devNameId = devName.replace(/\s/g, '');

  // #### TEXT SETTINGS ####

  //the text will eventually land on the angle halfway between startAngle and endAngle.
  const middleAngle = getAngle(startPercent + (endPercent - startPercent) / 2);

  //decide which direction the path will be (from startAngle to endAngle or vice versa).
  //this affects  if the text is upside down or not
  //if middleAngle is < 180° (PI), reverse text (because then we are at the lower half of the diagram)
  let reverseText = false;
  if (middleAngle < Math.PI) {
    reverseText = true;
  }

  //if the segment is small, the dev name probably wont fit in an arc at the outer border.
  //in this case, write the text besides the segment
  let smallSegment = false;
  if (arcEndAngle - arcStartAngle < Math.PI / 4) {
    smallSegment = true;
  }

  //in case segment is large enought for the text to be in an arc
  const displayName = devName.split(' <')[0];

  //if text is at the right side of the diagram, the textanchor should be start, otherwise end
  //(so that the text does not overlap with the diagram)
  let textAnchorStart = false;
  if (middleAngle < Math.PI / 2 || middleAngle > Math.PI * 1.5) {
    textAnchorStart = true;
  }

  //additions/ownership arc text
  const additionsText = devData.additions !== undefined ? devData.additions : '0';

  // #### FUNCTIONS ####

  //enlarge segment and show additional information in the chart if mouse hovers over segment
  const mouseEnter = (): void => {
    if (!focus) {
      setFocus(true);
    }
  };

  //only decrease size if segment is not selected (has not been clicked on to show details in the side panel)
  const mouseLeave = (): void => {
    if (!isDevSelected) {
      setFocus(false);
    }
  };

  //smoothly animate the d3 components
  //attributeNames and newAttributes should both be arrays
  const animate = (ref: React.RefObject<SVGElement>, attributeNames: string[], newAttributes: any[]): void => {
    if (!ref.current) return;

    let selection = d3.select(ref.current);

    //anly animate a smooth transition if the flag is set
    if (readyToAnimate) {
      selection = selection.transition().duration(animationDuration) as any;
    }

    const length = Math.min(attributeNames.length, newAttributes.length);
    for (let i = 0; i < length; i++) {
      const name = attributeNames[i];
      const value = newAttributes[i];
      selection = selection.attr(name, value) as any;
    }
  };

  //Is called when the size of the segment changes.
  //Recalculates the d3 components and change the animation flag, causing a rerender
  const setD3Components = (animateSmoothly: boolean): void => {
    setOuterBorderPath();
    setCommitPath();
    setInnerCommitsSegment();
    setAdditionsPath();
    setDevNamePath();

    if (!animateSmoothly) {
      setReadyToAnimate(false);
    }
    setAnimationFlag(!animationFlag);
  };

  // #### EFFECTS ####

  //is called when the animation flag changes.
  //this means that the d3 components have changed and need to be animated to display their new state.
  useEffect(() => {
    animate(segmentRef, ['d'], [circleSegment.toString()]);
    animate(contourRef, ['d'], [circleSegment]);
    animate(goodCommitsArcRef, ['d'], [goodCommitsArc]);
    animate(badCommitsArcRef, ['d'], [badCommitsArc]);
    animate(commitsRef, ['d'], [commitsPath]);
    animate(additionsArcRef, ['d'], [additionsArc]);
    animate(ownershipArcRef, ['d'], [ownershipArc]);
    animate(additionsTextArcRef, ['d'], [additionsTextArc]);
    animate(devNameArcRef, ['d'], [devNameArc]);
    animate(devNameTextRef, ['x', 'y'], devNameCoordinates);

    //text fades in when segment is focused
    animate(additionsTextRef, ['opacity'], focus ? [1] : [0]);

    //allow animations after first time of displaying the chart
    if (radius !== 0 && !readyToAnimate) {
      setReadyToAnimate(true);
    }
  }, [animationFlag]);

  //when focus changes, change size of segment
  useEffect(() => {
    if (focus) {
      setRadius(rad * growthFactor);
    } else {
      setRadius(rad);
    }
  }, [focus, rad]);

  //when radius changes, update d3 components with a smooth animation
  useEffect(() => {
    setD3Components(true);
  }, [radius, startPercent, endPercent, maxCommitsPerDev]);

  //when dev data changes (for example when other files were selected), update components but without a smooth animation
  useEffect(() => {
    setD3Components(false);
  }, [devData]);

  //Since rad (a prop) is 0 at the beginning, radius and focus are set correctly everytime rad changes
  // because we want to render it correctly at the beginning.
  //Also run this everytime isDevSelected changes.
  useEffect(() => {
    if (isDevSelected) {
      setFocus(true);
      setRadius(rad * growthFactor);
    } else {
      setFocus(false);
      setRadius(rad);
    }
  }, [rad, isDevSelected]);

  // #### OUTER BORDER ####

  //path for the outer boarder of the segment
  const setOuterBorderPath = (): void => {
    const newCircleSegment = d3.path();
    newCircleSegment.moveTo(0, 0);
    newCircleSegment.arc(0, 0, radius, getAngle(startPercent), getAngle(endPercent));
    newCircleSegment.closePath();

    setCircleSegment(newCircleSegment);
  };

  // #### BUILD ARCS ####

  //good commits are shown in an arc outside the circle segment, bad commits inside.
  //this displays the ratio of good/bad commits to the number of total commits
  //this sets the bounds for this section of the chart
  const buildWeight = radius * 0.2;
  const commitsNumber = devData.commits.length;
  const goodCommits = devData.commits.filter(
    (c) => c.builds !== undefined && c.builds.length > 0 && c.builds[0]?.status === 'success',
  ).length;
  const badCommits = devData.commits.filter(
    (c) => c.builds !== undefined && c.builds.length > 0 && c.builds[0]?.status !== 'success',
  ).length;

  const setCommitPath = (): void => {
    const goodCommitsRadius = radius + buildWeight * (goodCommits / commitsNumber);
    const badCommitsRadius = radius - buildWeight * (badCommits / commitsNumber);

    setGoodCommitsArc(d3.arc().innerRadius(radius).outerRadius(goodCommitsRadius).startAngle(arcStartAngle).endAngle(arcEndAngle));

    setBadCommitsArc(d3.arc().innerRadius(badCommitsRadius).outerRadius(radius).startAngle(arcStartAngle).endAngle(arcEndAngle));
  };

  // #### ADDITIONS AND OWNERSHIP ARCS ####

  const setAdditionsPath = (): void => {
    const additionsArcWeight = radius / 12;
    const additionsArcInnerRadius = radius * 0.7 - additionsArcWeight;
    const additionsArcOuterRadius = radius * 0.7 + additionsArcWeight;

    setAdditionsArc(
      d3.arc().innerRadius(additionsArcInnerRadius).outerRadius(additionsArcOuterRadius).startAngle(arcStartAngle).endAngle(arcEndAngle),
    );

    let ownershipEndAngle;

    if (config.onlyDisplayOwnership) {
      ownershipEndAngle = arcEndAngle;
    } else {
      ownershipEndAngle = arcStartAngle;
      if (devData.linesOwned) {
        ownershipEndAngle += getAngle((endPercent - startPercent) * (devData.linesOwned / (devData.additions || 1)));
        if (ownershipEndAngle > arcEndAngle) {
          ownershipEndAngle = arcEndAngle;
        }
      }
    }

    setOwnershipArc(
      d3
        .arc()
        .innerRadius(additionsArcInnerRadius)
        .outerRadius(additionsArcOuterRadius)
        .startAngle(arcStartAngle)
        .endAngle(ownershipEndAngle),
    );

    const additionsTextArcRadius = additionsArcInnerRadius + additionsArcWeight;

    setAdditionsTextArc(
      d3
        .arc()
        .innerRadius(additionsTextArcRadius)
        .outerRadius(additionsTextArcRadius)
        .startAngle(reverseText ? arcEndAngle : arcStartAngle)
        .endAngle(reverseText ? arcStartAngle : arcEndAngle),
    );
  };

  // #### COMMITS ####

  const setInnerCommitsSegment = (): void => {
    const newRadius = radius / 3 + radius * 0.2 * (devData.commits.length / maxCommitsPerDev);

    const newCommitsPath = d3.path();
    newCommitsPath.moveTo(0, 0);
    newCommitsPath.arc(0, 0, newRadius, getAngle(startPercent), getAngle(endPercent));
    newCommitsPath.closePath();

    setCommitsPath(newCommitsPath);
  };

  // #### DEV NAME OUTSIDE OF SEGMENT ####

  const setDevNamePath = (): void => {
    //in case segment is small, get the coordinates for the point in between startP end endP, just outside the segment.
    //used as anchor point for the text
    const coordinatesRadius = radius + buildWeight * (goodCommits / commitsNumber) + radius * 0.06;
    setDevNameCoordiantes(getCoordinatesForPercent(coordinatesRadius, middleAngle));

    //otherwise, show text in an arc outside of the segment
    const goodCommitsRadius = radius + buildWeight * (goodCommits / commitsNumber);
    const devNameRadius = goodCommitsRadius + radius * 0.06;

    setDevNameArc(
      d3
        .arc()
        .innerRadius(devNameRadius)
        .outerRadius(devNameRadius)
        .startAngle(reverseText ? arcEndAngle : arcStartAngle)
        .endAngle(reverseText ? arcStartAngle : arcEndAngle),
    );
  };

  // #### RENDER ####

  return (
    <g onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
      {/*dev name outside of segment*/}
      {!smallSegment && (
        <g>
          <defs>
            <path ref={devNameArcRef} id={devNameId + '_namePath'} />
          </defs>
          <text>
            <textPath href={'#' + devNameId + '_namePath'} startOffset="25%" textAnchor="middle" alignmentBaseline="middle">
              {displayName}
            </textPath>
          </text>
        </g>
      )}

      {smallSegment && (
        <text ref={devNameTextRef} textAnchor={textAnchorStart ? 'start' : 'end'} alignmentBaseline="middle">
          {displayName}
        </text>
      )}

      {/*actual segment*/}

      {/*hatch pattern for the middle arc*/}
      <defs>{HatchPattern(devColorDark, `hatch_${devNameId}`)}</defs>

      {/*outer border*/}
      <path ref={segmentRef} stroke="black" fill="white" />

      {/*additions arc*/}
      <path ref={additionsArcRef} fill={`url(#hatch_${devNameId})`} />

      {/*ownership arc*/}
      {config.mode !== 'issues' && <path ref={ownershipArcRef} fill={devColorDark} />}

      {/*additions number in additions/ownership arc. Only display this when mouse hovers on segment*/}
      <g>
        <defs>
          <path ref={additionsTextArcRef} id={devNameId + '_additionsPath'} />
        </defs>
        <text ref={additionsTextRef}>
          <textPath
            href={'#' + devNameId + '_additionsPath'}
            startOffset="25%"
            textAnchor="middle"
            alignmentBaseline="middle"
            stroke={devColorDark}
            fill="white"
            strokeWidth={3}
            paintOrder="stroke">
            {additionsText}
          </textPath>
        </text>
      </g>

      {/*bad commits arc*/}
      <path ref={badCommitsArcRef} fill={badCommitsColor} />

      {/*good commits arc*/}
      <path ref={goodCommitsArcRef} fill={goodCommitsColor} />

      {/*inner commits path with dot-pattern*/}
      <defs>{DotsPattern(devColor, `dots_${devNameId}`)}</defs>
      <path id={devName + '_commitsPath'} ref={commitsRef} fill={`url(#dots_${devNameId})`} />

      {/*outer border without fill, just for contours*/}
      <path ref={contourRef} stroke="black" fill="none" />
    </g>
  );
}

// #### HELPER FUNCTIONS ####

//given a circle at (0,0) and specified radius, get the coordinates of a point on the outside line for the specified angle
function getCoordinatesForPercent(r: number, angle: number): [number, number] {
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  return [x, y];
}

function getAngle(percent: number): number {
  return 2 * Math.PI * percent;
}

export default Segment;
