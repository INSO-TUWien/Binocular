import { RefObject } from 'react';

export function getSVGData(chartContainerRef: RefObject<HTMLDivElement | undefined>): string {
  if (!chartContainerRef.current) {
    return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  }

  const children = Array.from(chartContainerRef.current.children);
  const svgElement = children.find((child) => child instanceof SVGElement);

  if (!svgElement) {
    return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  }

  return svgElement.outerHTML;
}
