import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';

import { getCoordinatesForBucket } from './utils';

function BezierDial({ label, innerRad, outerRad, data, color, onHoverData }) {
  const gutter = 3;

  const [area, setArea] = useState(null);
  const [indicatorCircles, setIndicatorCircles] = useState([]);
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
    onHoverData(label, data);
  };

  const hideTooltip = () => {
    onHoverData();
  };

  useEffect(() => {
    if (!outerRadius || !innerRadius) return;

    const circles = [];

    const aggregatedNumbersForBuckets = data.map((bucket) => bucket.reduce((prev, curr) => prev + curr.data, 0));

    const maxValue = Math.max(...aggregatedNumbersForBuckets);
    const bucketsNum = data.length;

    const path = d3.path();

    for (let i = 0; i < bucketsNum; i++) {
      const bucketData = data[i];
      const aggregatedNumber = aggregatedNumbersForBuckets[i];

      const coordinates = getCoordinatesForBucket(i, bucketsNum, aggregatedNumber, maxValue, innerRadius, outerRadius);
      i === 0 ? path.moveTo(...coordinates) : path.lineTo(...coordinates);

      //circles that indicate where the mouse should hover for the tooltip to appear
      circles.push(<circle cx={coordinates[0]} cy={coordinates[1]} r={3} stroke="DarkGray" fill="none" />);

      //larger, invisible circle that actually triggers the tooltip when hovered over
      circles.push(
        <circle
          cx={coordinates[0]}
          cy={coordinates[1]}
          r={10}
          stroke="none"
          fill="white"
          fillOpacity={0}
          onMouseEnter={() => showTooltip(bucketData)}
          onMouseLeave={() => hideTooltip()}
        />
      );
    }
    path.closePath();

    setArea(<path stroke="DarkGray" fill={color} d={path.toString()} />);
    setIndicatorCircles(circles);
  }, [data, outerRadius, innerRadius]);

  return (
    <>
      <circle cx="0" cy="0" r={outerRad} stroke="none" fill="white" />
      {area}
      {indicatorCircles}
    </>
  );
}

export default BezierDial;
