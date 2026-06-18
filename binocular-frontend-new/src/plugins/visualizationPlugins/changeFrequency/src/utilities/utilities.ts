import * as d3 from 'd3';
import type { RefObject } from 'react';

// Color encoding shared by the chart points and the directory list: red (mostly deletions) →
// yellow (balanced) → green (mostly additions).
export function colorGradient(additions: number, deletions: number): string {
  const total = additions + deletions;
  if (total === 0) return '#a0a0a0';

  const ratio = additions / total;
  if (ratio <= 0.5) {
    return d3.interpolateRgb('#ff1a1a', '#ffcc00')(ratio * 2);
  }
  return d3.interpolateRgb('#ffcc00', '#2ecc40')((ratio - 0.5) * 2);
}

// Escape values that are interpolated into the tooltip's innerHTML (file paths, author signatures),
// so repository data containing &, <, >, " or ' cannot break the markup or inject nodes.
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function getSVGData(chartContainerRef: RefObject<HTMLDivElement | null>): string {
  const svgElement = chartContainerRef.current?.querySelector('svg');

  if (svgElement) {
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const containerWidth = chartContainerRef.current?.offsetWidth || 800;
    const containerHeight = chartContainerRef.current?.offsetHeight || 600;

    clonedSvg.setAttribute('width', containerWidth.toString());
    clonedSvg.setAttribute('height', containerHeight.toString());
    clonedSvg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'white');
    clonedSvg.insertBefore(rect, clonedSvg.firstChild);

    return clonedSvg.outerHTML;
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#666" font-family="Arial, sans-serif" font-size="16">No chart data available</text></svg>';
}
