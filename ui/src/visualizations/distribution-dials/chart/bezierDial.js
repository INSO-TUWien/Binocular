import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';
import { getCoordinatesForBucket } from './utils';
import chroma from 'chroma-js';

function BezierDial({ innerRad, outerRad, data, color }) {
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

  useEffect(() => {
    if (!outerRadius || !innerRadius) return;

    const circles = [];

    const maxValue = Math.max(...data);
    const bucketsNum = data.length;

    const path = d3.path();

    for (let i = 0; i < data.length; i++) {
      const coordinates = getCoordinatesForBucket(i, bucketsNum, data[i], maxValue, innerRadius, outerRadius);
      i === 0 ? path.moveTo(...coordinates) : path.lineTo(...coordinates);
      circles.push(<circle cx={coordinates[0]} cy={coordinates[1]} r={3} stroke="DarkGray" fill="none" />);
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
