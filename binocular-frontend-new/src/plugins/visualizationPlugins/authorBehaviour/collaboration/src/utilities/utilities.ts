import type { RefObject } from 'react';

export function getSVGData(chartContainerRef: RefObject<HTMLDivElement | null>): string {
  const svgData = chartContainerRef.current?.querySelector('svg')?.outerHTML;
  if (svgData === undefined) {
    return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  }
  return svgData;
}
