import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';

import { getAngle, getCoordinatesForBucket, smoothCurve } from './utils';
import { useSelector } from 'react-redux';

function BezierDial({ label, innerRad, outerRad, data, color, onHoverData, colorSegmentsForAuthors }) {
  const gutter = 3;
  const curveId = `${label}_curve`;

  //global state
  const universalSettings = useSelector((state) => state.universalSettings);
  const authorColors = universalSettings.universalSettingsData.data.palette;

  const [area, setArea] = useState(null);
  const [indicatorCircles, setIndicatorCircles] = useState([]);
  const [onHoverPaths, setHoverPaths] = useState([]);
  const [authorPaths, setAuthorPaths] = useState([]);
  const [outerRadius, setOuterRadius] = useState(0);
  const [innerRadius, setInnerRadius] = useState(0);

  useEffect(() => {
    const newOuter = outerRad - gutter;
    const newInner = innerRad + gutter;
    setOuterRadius(newOuter);
    setInnerRadius(newInner);
  }, [outerRad, innerRad]);

  if (!data || data.length === 0) return;

  const showTooltip = (data) => {
    onHoverData(label, data, [color]);
  };

  const hideTooltip = () => {
    onHoverData();
  };

  useEffect(() => {
    if (!outerRadius || !innerRadius) return;

    const circles = [];
    const authorSegments = [];
    const hoverPaths = [];

    const aggregatedNumbersForBuckets = [];
    const authorsWithMaxContributionPerBucket = [];

    //get the aggregated data for each bucket and which author contributed the most for each bucket
    for (const bucket of data) {
      const bucketVal = bucket.reduce((prev, curr) => prev + curr.data, 0);
      let localMax = 0;
      let localMaxAuthor = '';

      for (const author of bucket) {
        const name = author.name;
        const contribution = author.data;

        if (contribution > localMax) {
          localMax = contribution;
          localMaxAuthor = name;
        }
      }
      aggregatedNumbersForBuckets.push(bucketVal);
      authorsWithMaxContributionPerBucket.push(localMaxAuthor);
    }

    const maxValue = Math.max(...aggregatedNumbersForBuckets);
    const bucketsNum = data.length;

    const points = [];

    for (let i = 0; i < bucketsNum; i++) {
      const bucketData = data[i];
      const aggregatedNumber = aggregatedNumbersForBuckets[i];

      const coordinates = getCoordinatesForBucket(i, bucketsNum, aggregatedNumber, maxValue, innerRadius, outerRadius);
      //push coordinates to point array for drawing the curve
      points.push({ x: coordinates[0], y: coordinates[1] });

      //circles that indicate the data point
      circles.push(<circle key={'circle' + i} cx={coordinates[0]} cy={coordinates[1]} r={3} stroke="DarkGray" fill="none" />);

      //start- and end angles for this bucket
      const startAngle = getAngle(i / bucketsNum);
      const endAngle = getAngle(((i + 0.999999) % bucketsNum) / bucketsNum);

      //segment that will be intersected with the curve,
      // coloring this part of the curve in the color of the author with the most contributions (for this bucket)
      const authorCol = authorColors[authorsWithMaxContributionPerBucket[i]];
      const authorP = d3.arc().innerRadius(0).outerRadius(outerRadius).startAngle(startAngle).endAngle(endAngle);
      authorSegments.push(
        <path stroke="DarkGray" fill={authorCol} d={authorP().toString()} clipPath={`url(#${curveId})`} key={`${label}_${i}-author`} />,
      );

      //paths that trigger the onHover function
      //space between hover-fields
      const hoverGutter = 0.01;
      const hoverP = d3
        .arc()
        .innerRadius(innerRad)
        .outerRadius(outerRad)
        .startAngle(startAngle + hoverGutter)
        .endAngle(endAngle - hoverGutter);
      hoverPaths.push(
        <path
          stroke="none"
          fill="white"
          fillOpacity={0}
          onMouseEnter={() => showTooltip(bucketData)}
          onMouseLeave={() => hideTooltip()}
          d={hoverP().toString()}
          key={`${label}_${i}-hover`}
        />,
      );
    }

    setArea(<path stroke="DarkGray" fill={colorSegmentsForAuthors ? 'none' : color} d={smoothCurve(points)} />);
    setIndicatorCircles(circles);
    setAuthorPaths(authorSegments);
    setHoverPaths(hoverPaths);
  }, [data, outerRadius, innerRadius]);

  return (
    <>
      {/* white background for this segment */}
      <circle cx="0" cy="0" r={outerRad} stroke="none" fill="white" />

      {/* curve for clipping the segments (if colored segments should be displayed) */}
      <defs>
        <clipPath id={curveId}>{area}</clipPath>
      </defs>

      {/* each segment is filled with the color of the author with the most contributions in this bucket */}
      {colorSegmentsForAuthors && authorPaths}

      {/* curve, either only the outline if the colored segments are displayed, or filled with a specified color */}
      {area}

      {/* inner circle so the "bottom" of the curve is also outlined */}
      <circle cx="0" cy="0" r={innerRad} stroke="DarkGray" fill="none" />

      {/* small circles at the points that correspond to the data of this bucket relative to the other buckets */}
      {indicatorCircles}

      {/* segments that trigger the showTooltip function */}
      {onHoverPaths}
    </>
  );
}

export default BezierDial;
