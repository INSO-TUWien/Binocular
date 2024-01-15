'use strict';

import chroma from 'chroma-js';

/**
 * uses offsets to calculate visual differences between colors
 *
 * @param colorNum
 * @param colors
 * @returns {number}
 */
function calculateHue(colorNum, colors) {
  if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
  if (colors > 10) colors /= 10;
  return (colorNum % 4 >= 2 ? colorNum * (360 / colors) : 360 - colorNum * (360 / colors)) % 360;
}

/**
 * uses offsets to calculate visual differences between colors
 *
 * @param colorNum
 * @param colors
 * @returns {number}
 */
function calculateSaturation(colorNum, colors) {
  if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
  return (((((colorNum * 2) / colors) * 100) % 50) + 50.0) / 100.0;
}

/**
 * uses offsets to calculate visual differences between colors
 *
 * @param colorNum
 * @param colors
 * @returns {number}
 */
function calculateLightness(colorNum, colors) {
  if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
  return 0.4 + (((colorNum / colors) * 100.0) % 40) / 100.0;
}

export default function generateColorPattern(colorCount) {
  return Array.from({ length: colorCount }, (_, i) =>
    chroma.hsl(calculateHue(i, colorCount), calculateSaturation(i, colorCount), calculateLightness(i, colorCount)).css(),
  );
}
