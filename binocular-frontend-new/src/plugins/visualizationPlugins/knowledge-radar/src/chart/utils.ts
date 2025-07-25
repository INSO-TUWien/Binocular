import { AuthorType } from '../../../../../types/data/authorType.ts';
import { Center, Dimensions } from './type.ts';
import * as d3 from 'd3';
import chroma from 'chroma-js';

export const createGradients = (defs: d3.Selection<SVGDefsElement, unknown, null, undefined>, colorScheme: AuthorType) => {
  // Radial gradient for background
  const radialGradient = defs
    .append('radialGradient')
    .attr('id', 'radar-background-gradient')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '50%');

  radialGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff');

  radialGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f0f0f0');

  // Linear gradient for radar area
  const linearGradient = defs
    .append('linearGradient')
    .attr('id', 'radar-area-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '100%');

  linearGradient.append('stop').attr('offset', '0%').attr('stop-color', `${colorScheme.color.main}`).attr('stop-opacity', '0.7');

  linearGradient.append('stop').attr('offset', '100%').attr('stop-color', `${colorScheme.color.secondary}`).attr('stop-opacity', '0.5');
};

export function drawBreadcrumbs(
  svgElement: SVGSVGElement,
  options: {
    radius: number;
    dimensions: Dimensions;
    breadcrumbs: string[];
    center: Center;
    selectedDeveloper: AuthorType;
  },
) {
  const { radius, dimensions, breadcrumbs, center, selectedDeveloper } = options;
  const titleY = -radius * 1.35;

  const titleGroup = d3.select(svgElement).append('g').attr('class', 'title-group');

  // Calculate responsive breadcrumb display
  const maxBreadcrumbLength = Math.max(20, Math.floor(dimensions.width / 20));
  const fullBreadcrumbText = breadcrumbs.join('/').replace(/^\.\/\//, './');
  const shortenedBreadcrumbs =
    fullBreadcrumbText.length > maxBreadcrumbLength
      ? '... / ' + breadcrumbs.slice(Math.max(1, breadcrumbs.length - 2)).join('/')
      : fullBreadcrumbText;

  titleGroup.selectAll('.breadcrumbs-container').remove();

  const breadcrumbGroup = titleGroup
    .append('g')
    .attr('class', 'breadcrumbs-container')
    .attr('transform', `translate(${dimensions.width / 2}, ${center.y + titleY})`);

  const responsiveFontSize = Math.max(radius * 0.07, 10);
  const charWidth = responsiveFontSize * 0.6;
  const textWidth = Math.max(100, Math.min(shortenedBreadcrumbs.length * charWidth, dimensions.width * 0.8));
  const padding = Math.max(10, dimensions.width * 0.02);

  // Background for breadcrumbs
  breadcrumbGroup
    .append('rect')
    .attr('x', -textWidth / 2 - padding / 2)
    .attr('y', -15)
    .attr('width', textWidth + padding)
    .attr('height', 25)
    .attr('rx', 12)
    .attr('ry', 12)
    .style(
      'fill',
      chroma(selectedDeveloper?.color.main || '#666')
        .alpha(0.2)
        .css(),
    )
    .style('stroke', selectedDeveloper?.color.main || '#666')
    .style('stroke-width', '1px');

  const textGroup = breadcrumbGroup.append('g');

  if (fullBreadcrumbText.length > maxBreadcrumbLength) {
    textGroup.append('title').text(fullBreadcrumbText);
  }

  textGroup
    .append('text')
    .attr('class', 'breadcrumbs')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', `${responsiveFontSize}px`)
    .style('fill', '#333')
    .style('font-weight', 'bold')
    .text(shortenedBreadcrumbs)
    .style('opacity', 0)
    .transition()
    .duration(600)
    .style('opacity', 1);
}
