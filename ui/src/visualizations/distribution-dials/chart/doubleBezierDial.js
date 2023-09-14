import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';

function DoubleBezierDial({ innerRadius, outerRadius, dataOutside, dataInside }) {
  return <circle cx="0" cy="0" r={outerRadius} stroke="black" fill="white" />;
}

export default DoubleBezierDial;
