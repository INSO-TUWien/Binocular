import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';
import { getCoordinatesForBucket } from './utils';
import chroma from 'chroma-js';

function BezierDial({ innerRad, outerRad, data, color }) {
  const sizeFactor = 0.95;

  const [area, setArea] = useState(null);
  const [outerRadius, setOuterRadius] = useState(0);
  const [innerRadius, setInnerRadius] = useState(0);

  useEffect(() => {
    setOuterRadius(outerRad * sizeFactor);
    setInnerRadius(innerRad);
  }, [outerRad, innerRad]);

  if (!data || data.length === 0) return;

  useEffect(() => {
    if (!outerRadius || !innerRadius) return;

    const maxValue = Math.max(...data);
    const bucketsNum = data.length;

    const path = d3.path();
    path.moveTo(...getCoordinatesForBucket(0, bucketsNum, data[0], maxValue, innerRadius, outerRadius));

    for (let i = 1; i < data.length; i++) {
      path.lineTo(...getCoordinatesForBucket(i, bucketsNum, data[i], maxValue, innerRadius, outerRadius));
    }
    path.closePath();

    setArea(<path stroke="DarkGray" fill={color} d={path.toString()} />);
  }, [data, outerRadius, innerRadius]);

  return (
    <>
      <circle cx="0" cy="0" r={outerRad} stroke="none" fill="white" />
      {area}
    </>
  );
}

export default BezierDial;
