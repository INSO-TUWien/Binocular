import * as d3 from 'd3';
const _ = require('lodash');
import React, { useState, useEffect } from 'react';
import { getAngle, getAngleAdjusted } from './utils';

function StackedDial({ innerRad, outerRad, data, colors }) {
  const sizeFactor = 0.95;

  const [outerRadius, setOuterRadius] = useState(0);
  const [innerRadius, setInnerRadius] = useState(0);
  const [middleRadius, setMiddleRadius] = useState(0);

  const [paths, setPaths] = useState({});
  const [innerOuterColors, setInnerOuterColors] = useState(colors);
  const [middlePaths, setMiddlePaths] = useState([]);
  const [middleColor, setMiddleColor] = useState('');

  useEffect(() => {
    setOuterRadius(outerRad * sizeFactor);
    setInnerRadius(innerRad * (2 - sizeFactor));
    setMiddleRadius(innerRad + (outerRad * sizeFactor - innerRad) / 2);
  }, [outerRad, innerRad]);

  if (!data || data.length === 0) return;

  const bucketNum = data[0].length;
  const categoryNum = data.length;
  const innerOuterCategoryNum = categoryNum - (categoryNum % 2);

  useEffect(() => {
    const innerOuterData = _.cloneDeep(data);
    let middleData = [];
    const middlePaths = [];

    //this stores all paths. Each category has its own array so colors can be used later on
    const resultPaths = {};
    let outerStartingRadius = middleRadius;
    let innerStartingRadius = middleRadius;

    //TODO scaling does not work perfectly yet. See granularity: Month, split changes
    let maxValue = 0;
    let ratioOfMaxVal = 0;

    for (const bucket of _.unzip(data)) {
      for (const cat of bucket) {
        if (cat > maxValue) {
          maxValue = cat;
          ratioOfMaxVal = cat / bucket.reduce((p, c) => p + c, 0);

          console.log(
            cat,
            bucket,
            bucket.reduce((p, c) => p + c, 0),
            _.unzip(data)
          );
        }
      }
    }

    //this means we have an uneven number of categories.
    //the middle category will be directly on the middle line (middleRadius).
    //Half of the remaining categories will be outside the middle category, half inside
    if (categoryNum % 2 === 1) {
      //get middle category
      //example: data.length is 5, then 2 is the middle index
      const middleIndex = Math.floor(data.length / 2);
      middleData = data[middleIndex];
      setMiddleColor(colors[middleIndex]);
      //remove the middle data from the array for the inner and outer categories
      innerOuterData.splice(middleIndex, 1);
      setInnerOuterColors(colors.filter((c, i) => i !== middleIndex));
    }

    //now stack up the categories outside/inside the middle line (or middle category if there is one)
    let currentPercent = 0.0;
    for (let i = 0; i < bucketNum; i++) {
      const startAngle = getAngle(currentPercent);
      currentPercent = (i + 1.0) / bucketNum;
      const endAngle = getAngle(currentPercent);

      if (categoryNum % 2 === 1) {
        const middleSegment = middleData[i];
        const middleSegmentSize = (middleSegment / maxValue) * ((outerRadius - innerRadius) * ratioOfMaxVal);
        const middleSegmentOuterRadius = middleRadius + middleSegmentSize / 2;
        const middleSegmentInnerRadius = middleRadius - middleSegmentSize / 2;

        middlePaths.push(
          d3.arc().innerRadius(middleSegmentInnerRadius).outerRadius(middleSegmentOuterRadius).startAngle(startAngle).endAngle(endAngle)
        );

        //set the starting radii for the outer and inner categories so they are properly stacked on the middle segment
        outerStartingRadius = middleSegmentOuterRadius;
        innerStartingRadius = middleSegmentInnerRadius;
      }

      //array containing each category's value for this bucket
      const dataInBucket = innerOuterData.map((d) => d[i]);
      //half of it will be displayed inside the middle line
      const innerData = dataInBucket.slice(0, innerOuterCategoryNum / 2).toReversed();
      const innerDataCategories = _.range(0, innerOuterCategoryNum / 2).toReversed();
      //the other half outside the middle line
      const outerData = dataInBucket.slice(innerOuterCategoryNum / 2, innerOuterCategoryNum);
      const outerDataCategories = _.range(innerOuterCategoryNum / 2, innerOuterCategoryNum);

      //stack up the outer data points
      let currentRad = outerStartingRadius;
      for (let j = 0; j < outerData.length; j++) {
        const categoryId = outerDataCategories[j];
        const d = outerData[j];
        const innerR = currentRad;
        const outerR = currentRad + (d / maxValue) * ((outerRadius - innerRadius) * ratioOfMaxVal);

        const arc = d3.arc().innerRadius(innerR).outerRadius(outerR).startAngle(startAngle).endAngle(endAngle);

        if (!resultPaths[categoryId]) {
          resultPaths[categoryId] = [];
        }
        resultPaths[categoryId].push(arc);
        currentRad = outerR;
      }

      //stack up the inner data points
      //from the middle line inwards
      currentRad = innerStartingRadius;
      for (let j = 0; j < innerData.length; j++) {
        const categoryId = innerDataCategories[j];
        const d = innerData[j];
        const innerR = currentRad - (d / maxValue) * ((outerRadius - innerRadius) * ratioOfMaxVal);
        const outerR = currentRad;

        const arc = d3.arc().innerRadius(innerR).outerRadius(outerR).startAngle(startAngle).endAngle(endAngle);

        if (!resultPaths[categoryId]) {
          resultPaths[categoryId] = [];
        }
        resultPaths[categoryId].push(arc);
        currentRad = innerR;
      }
    }

    setPaths(resultPaths);
    setMiddlePaths(middlePaths);
  }, [data, innerRadius, outerRadius, middleRadius]);

  return (
    <>
      <circle cx="0" cy="0" r={outerRad} stroke="DarkGray" fill="white" />
      {middlePaths.map((m, index) => (
        <path stroke="none" fill={middleColor} d={m().toString()} key={`middle-${index}`}></path>
      ))}
      {_.flatten(
        Object.entries(paths).map(([category, pathArray]) => {
          return pathArray.map((p, index) => {
            return <path stroke="none" fill={innerOuterColors[category]} d={p().toString()} key={`${category}-${index}`}></path>;
          });
        })
      )}
    </>
  );
}

export default StackedDial;
