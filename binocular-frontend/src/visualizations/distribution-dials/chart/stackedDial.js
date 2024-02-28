import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';
import { getAngle, getNumberOfCategories } from './utils';

import _ from 'lodash';

function StackedDial({ label, innerRad, outerRad, data, colors, onHoverData }) {
  const gutter = 3;

  const [outerRadius, setOuterRadius] = useState(0);
  const [innerRadius, setInnerRadius] = useState(0);
  const [middleRadius, setMiddleRadius] = useState(0);

  const [paths, setPaths] = useState({});
  const [innerOuterColors, setInnerOuterColors] = useState(colors);
  const [middlePaths, setMiddlePaths] = useState([]);
  const [middleColor, setMiddleColor] = useState('');

  const [onHoverPaths, setHoverPaths] = useState([]);

  useEffect(() => {
    const newOuter = outerRad - gutter;
    const newInner = innerRad + gutter;
    setOuterRadius(newOuter);
    setInnerRadius(newInner);
    setMiddleRadius(newInner + (newOuter - newInner) / 2);
  }, [outerRad, innerRad]);

  if (!data || data.length === 0) return;

  const showTooltip = (data) => {
    onHoverData(label, data, colors);
  };

  const hideTooltip = () => {
    onHoverData();
  };

  const bucketNum = data.length;
  const categoryNum = getNumberOfCategories(data);

  useEffect(() => {
    const middlePaths = [];
    const hoverPaths = [];

    //this stores all paths. Each category has its own array so colors can be used later on
    const resultPaths = {};
    let outerStartingRadius = middleRadius;
    let innerStartingRadius = middleRadius;

    //handle scaling:
    //get the maximum segment size (from middle radius to outer/inner radius)
    //the goal is that the max bucket reaches this line and everything else scales accordingly
    let maxSegmentSize = 0;
    for (const bucket of data) {
      //get all datapoints for the inner categories. So if there are 5 categories, get the first 2. If there are 4, also get the first 2.
      //for each author object in the bucket, we get the datapoints for the inner categories,
      // which gives us for example an array like this: [[1,2],[3,4],...]
      //we flatten this ([1,2,3,4,...]) and sum everything up up. this is the total "size" of all inner categories
      const innerSegments = _.sum(_.flatten(bucket.map((author) => author.data.slice(0, Math.floor(categoryNum / 2)))));
      //get the middle category if there is one (if the number of categories in uneven)
      const middleSegment = categoryNum % 2 === 1 ? _.sum(bucket.map((author) => author.data[Math.floor(categoryNum / 2)])) : 0;
      //get the categories that are between the middle line and the outer line
      //if there is a middle segment, leave that one out
      const outerSegments = _.sum(
        _.flatten(bucket.map((author) => author.data.slice(Math.floor(categoryNum / 2) + (categoryNum % 2 === 1)))),
      );

      //since the middle segment (if there is one) is directly on the middle line, half of it is in each half of the diagram
      const innerSegmentSize = innerSegments + middleSegment / 2;
      const outerSegmentSize = outerSegments + middleSegment / 2;
      maxSegmentSize = Math.max(maxSegmentSize, innerSegmentSize, outerSegmentSize);
    }

    //this means we have an uneven number of categories.
    //the middle category will be directly on the middle line (middleRadius).
    //Half of the remaining categories will be outside the middle category, half inside
    if (categoryNum % 2 === 1) {
      //get middle category
      //example: categoryNum is 5, then 2 is the middle index
      const middleIndex = Math.floor(categoryNum / 2);
      setMiddleColor(colors[middleIndex]);
      setInnerOuterColors(colors.filter((c, i) => i !== middleIndex));
    }

    //now stack up the categories outside/inside the middle line (or middle category if there is one)
    let currentPercent = 0.0;
    for (let i = 0; i < bucketNum; i++) {
      const bucket = data[i];

      const startAngle = getAngle(currentPercent);
      currentPercent = (i + 1.0) / bucketNum;
      const endAngle = getAngle(currentPercent);

      //if there is a middle category
      if (categoryNum % 2 === 1) {
        const middleSegment = _.sum(bucket.map((author) => author.data[Math.floor(categoryNum / 2)]));
        const middleSegmentSize = (middleSegment / maxSegmentSize) * (outerRadius - middleRadius);
        const middleSegmentOuterRadius = middleRadius + middleSegmentSize / 2;
        const middleSegmentInnerRadius = middleRadius - middleSegmentSize / 2;

        middlePaths.push(
          d3.arc().innerRadius(middleSegmentInnerRadius).outerRadius(middleSegmentOuterRadius).startAngle(startAngle).endAngle(endAngle),
        );

        //set the starting radii for the outer and inner categories so they are properly stacked on the middle segment
        outerStartingRadius = middleSegmentOuterRadius;
        innerStartingRadius = middleSegmentInnerRadius;
      }

      //half of it will be displayed inside the middle line
      //note: we use toReversed() here because we will be drawing the segments from the one closest to the middle line inwards
      const innerDataUnaggregated = bucket.map((author) => author.data.slice(0, Math.floor(categoryNum / 2)));
      const innerData =
        innerDataUnaggregated.length > 0 ? innerDataUnaggregated.reduce((prev, curr) => prev.map((p, i) => p + curr[i])).toReversed() : [];
      const innerDataCategories = _.range(0, Math.floor(categoryNum / 2)).toReversed();
      //the other half outside the middle line
      const outerDataUnaggregated = bucket.map((author) => author.data.slice(Math.floor(categoryNum / 2) + (categoryNum % 2 === 1)));
      const outerData =
        outerDataUnaggregated.length > 0 ? outerDataUnaggregated.reduce((prev, curr) => prev.map((p, i) => p + curr[i])) : [];
      const outerDataCategories = _.range(Math.floor(categoryNum / 2), categoryNum);

      //stack up the outer data points
      let currentOuterRad = outerStartingRadius;
      for (let j = 0; j < outerData.length; j++) {
        const categoryId = outerDataCategories[j];
        const d = outerData[j];
        const innerR = currentOuterRad;
        const outerR = currentOuterRad + (d / maxSegmentSize) * (outerRadius - middleRadius);

        const arc = d3.arc().innerRadius(innerR).outerRadius(outerR).startAngle(startAngle).endAngle(endAngle);

        if (!resultPaths[categoryId]) {
          resultPaths[categoryId] = [];
        }
        resultPaths[categoryId].push(arc);
        currentOuterRad = outerR;
      }

      //stack up the inner data points
      //from the middle line inwards
      let currentInnerRad = innerStartingRadius;
      for (let j = 0; j < innerData.length; j++) {
        const categoryId = innerDataCategories[j];
        const d = innerData[j];
        const innerR = currentInnerRad - (d / maxSegmentSize) * (outerRadius - middleRadius);
        const outerR = currentInnerRad;

        const arc = d3.arc().innerRadius(innerR).outerRadius(outerR).startAngle(startAngle).endAngle(endAngle);

        if (!resultPaths[categoryId]) {
          resultPaths[categoryId] = [];
        }
        resultPaths[categoryId].push(arc);
        currentInnerRad = innerR;
      }

      const hoverP = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(startAngle).endAngle(endAngle);
      hoverPaths.push(
        <path
          stroke="none"
          fill="white"
          fillOpacity={0}
          onMouseEnter={() => showTooltip(bucket)}
          onMouseLeave={() => hideTooltip()}
          d={hoverP().toString()}
          key={`${i}-hover`}
        />,
      );
    }

    setPaths(resultPaths);
    setMiddlePaths(middlePaths);
    setHoverPaths(hoverPaths);
  }, [data, innerRadius, outerRadius, middleRadius]);

  return (
    <>
      <circle cx="0" cy="0" r={outerRad} stroke="none" strokeDasharray={'3,3'} fill="white" />

      {middlePaths.map((m, index) => (
        <path stroke="none" fill={middleColor} d={m().toString()} key={`middle-${index}`}></path>
      ))}
      {_.flatten(
        Object.entries(paths).map(([category, pathArray]) => {
          return pathArray.map((p, index) => {
            return <path stroke="none" fill={innerOuterColors[category]} d={p().toString()} key={`${category}-${index}`}></path>;
          });
        }),
      )}
      {onHoverPaths}
    </>
  );
}

export default StackedDial;
