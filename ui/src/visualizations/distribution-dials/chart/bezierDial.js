import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';

function BezierDial({ innerRadius, outerRadius, data }) {
  //TODO use d3.curveBumpX
  return <circle cx="0" cy="0" r={outerRadius} stroke="black" fill="white" />;
}

export default BezierDial;
