import * as d3 from 'd3';
import { Package, SubPackage } from './type.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import chroma from 'chroma-js';

/**
 * Draws a radar chart for multiple developers with their respective data
 */
const drawRadarChart = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  developersData: {
    developer: AuthorType;
    data: Package[] | SubPackage[];
  }[],
  radius: number,
  colorScheme: unknown,
  options: {
    isSubpackageView?: boolean;
    parentName?: string;
    handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void;
    handleBackNavigation?: () => void;
  },
) => {
  const { isSubpackageView = false, handlePackageSelect, handleBackNavigation } = options;

  // Clear existing gradients
  d3.select(svg.node()?.parentNode).selectAll('defs').remove();

  // Create defs for multiple gradients
  const defs = d3.select(svg.node()?.parentNode).append('defs');

  // Create gradient for each developer
  developersData.forEach((devData, index) => {
    const gradientId = `radar-area-gradient-${index}`;
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', chroma(devData.developer.color.main).alpha(0.7).css());

    gradient.append('stop').attr('offset', '100%').attr('stop-color', chroma(devData.developer.color.secondary).alpha(0.1).css());
  });

  // Use the first developer's data for axis and structure
  const primaryDevData = developersData[0].data;

  // For subpackage view, we need a single package as the parent
  const parentPackage = isSubpackageView ? primaryDevData[0] : null;

  // Use appropriate data based on view type
  const chartData = isSubpackageView ? parentPackage?.subpackages || [] : (primaryDevData as Package[]);

  const features = chartData.map((d) => d.name);
  const n = features.length;

  // Calculate angles for each axis
  const angles = features.map((_, i) => i * ((2 * Math.PI) / n));

  // Define center circle radius
  const centerRadius = radius * 0.25;

  // Create scales - adjust to ensure small values are visible and start from center circle
  const rScale = d3.scaleLinear().domain([0, 1]).range([centerRadius, radius]);

  // Add background circle
  svg
    .append('circle')
    .attr('class', 'radar-background')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius)
    .style('fill', '#f0f0f0') // Light grey color
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 1);

  // Draw axis lines
  const axisGrid = svg.append('g').attr('class', 'axis-grid');

  axisGrid
    .selectAll('.axis-line')
    .data(angles)
    .enter()
    .append('line')
    .attr('class', 'axis-line')
    .attr('x1', (d) => centerRadius * Math.cos(d - Math.PI / 2))
    .attr('y1', (d) => centerRadius * Math.sin(d - Math.PI / 2))
    .attr('x2', (d) => rScale(1.1) * Math.cos(d - Math.PI / 2))
    .attr('y2', (d) => rScale(1.1) * Math.sin(d - Math.PI / 2))
    .style('stroke', colorScheme.grid)
    .style('stroke-width', '1px')
    .style('stroke-dasharray', '3,3')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 0.7);

  // Draw concentric circles
  const levels = 5;
  axisGrid
    .selectAll('.level')
    .data(d3.range(0, levels + 1).map((i) => i / levels))
    .enter()
    .append('circle')
    .attr('class', 'level')
    .attr('r', 0)
    .style('fill', 'none')
    .style('stroke', colorScheme.grid)
    .style('stroke-width', '0.5px')
    .transition()
    .duration(800)
    .delay((_, i) => i * 100)
    .attr('r', (d) => rScale(d));

  // Add level labels (percentages)
  axisGrid
    .selectAll('.level-label')
    .data(d3.range(0, levels + 1).map((i) => i / levels))
    .enter()
    .append('text')
    .attr('class', 'level-label')
    .attr('x', 10)
    .attr('y', (d) => -rScale(d) - 5)
    .attr('dy', '0.35em')
    .style('font-size', `${centerRadius * 0.15}px`)
    .style('fill', colorScheme.text)
    .style('opacity', 0)
    .text((d) => `${Math.round(d * 100)}%`)
    .transition()
    .duration(800)
    .delay((_, i) => 500 + i * 100)
    .style('opacity', 0.7);

  // Add axis labels with background
  const axisLabels = axisGrid
    .selectAll<SVGGElement, string>('.axis-label-group')
    .data(features)
    .enter()
    .append('g')
    .attr('class', 'axis-label-group')
    .attr('transform', (_: string, i: number) => {
      const x = rScale(1.4) * Math.cos(angles[i] - Math.PI / 2);
      const y = rScale(1.4) * Math.sin(angles[i] - Math.PI / 2);
      return `translate(${x}, ${y})`;
    })
    .style('cursor', (d: string) => {
      const subpkg = chartData.find((p) => p.name === d);
      return subpkg && subpkg.subpackages && subpkg.subpackages.length > 0 ? 'pointer' : 'default';
    })
    .style('opacity', 0)
    .on('click', (_event: MouseEvent, d: string) => {
      if (isSubpackageView) {
        const subpkg = chartData.find((p) => p.name === d);
        if (subpkg && subpkg.subpackages && subpkg.subpackages.length > 0) {
          handlePackageSelect(subpkg, parentPackage?.name || 'Unknown');
        }
      } else {
        const pkg = chartData.find((p) => p.name === d);
        if (pkg && pkg.subpackages && pkg.subpackages.length > 0) {
          handlePackageSelect(pkg, './');
        }
      }
    });

  // Add text first (to measure it)
  axisLabels
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('class', 'label-text')
    .text((d: string) => {
      // Truncate text if longer than 10 characters
      return d.length > 15 ? d.substring(0, 15) + '...' : d;
    })
    .style('font-size', `${Math.min(centerRadius * 0.25, 12)}px`)
    .style('font-weight', 'bold')
    .style('fill', colorScheme.text);

  // Add tooltip for truncated text
  axisLabels.append('title').text((d: string) => {
    const pkg = chartData.find((p) => p.name === d);
    return d + ' > ' + (pkg?.score !== undefined ? pkg.score * 100 + '%' : 'N/A');
  });

  // Add label background sized to text and account for indicator circle
  axisLabels.each(function (d: string) {
    const textElement = this.querySelector('.label-text') as SVGTextElement;
    const textWidth = textElement.getBBox().width;
    const padding = 10; // Padding on each side

    // Check if this package has subpackages (needs indicator)
    const pkg = chartData.find((p) => p.name === d);
    const hasSubpackages = pkg && pkg.subpackages && pkg.subpackages.length > 0;

    // Add extra width for the indicator circle if needed
    const indicatorSpace = hasSubpackages ? 10 : 0; // Space for circle + margin

    d3.select<SVGGElement, string>(this)
      .insert('rect', 'text')
      .attr('x', -textWidth / 2 - padding)
      .attr('y', -10)
      .attr('width', textWidth + padding * 2 + indicatorSpace)
      .attr('height', 20)
      .attr('rx', 10)
      .attr('ry', 10)
      .style('fill', 'white')
      .style('stroke', () => {
        return hasSubpackages ? chroma(developersData[0].developer.color.main).hex() : colorScheme.grid;
      })
      .style('stroke-width', '2px')
      .style('opacity', 0.8);
  });

  // Add nested indicator for packages with subpackages
  axisLabels
    .append('circle')
    .attr('cx', function (this: SVGCircleElement, _d: string) {
      const parentNode = this.parentNode as SVGGElement;
      const textElement = parentNode.querySelector('.label-text') as SVGTextElement;
      const textWidth = textElement.getBBox().width;
      return textWidth / 2 + 5; // Position circle at the end of text + 5px
    })
    .attr('cy', 0)
    .attr('r', 3)
    .style('fill', (d: string) => {
      const pkg = chartData.find((p) => p.name === d);
      return pkg && pkg.subpackages && pkg.subpackages.length > 0
        ? chroma(developersData[0].developer.color.main).saturate(5).hex()
        : 'transparent';
    });

  // Apply transition to the group
  axisLabels.transition().duration(800).delay(300).style('opacity', 1);

  // Draw radar paths for each developer with animation
  const radarLine = d3
    .lineRadial<unknown>()
    .angle((_, i) => angles[i])
    .radius((d) => rScale(d.score || 0)) // Handle undefined scores
    .curve(d3.curveCardinalClosed.tension(0.7));

  // Draw radar paths for each developer
  developersData.forEach((devData, index) => {
    // Get the developer's data
    const devChartData = isSubpackageView ? (devData.data[0] as Package | SubPackage)?.subpackages || [] : (devData.data as Package[]);

    // Create path for animation
    const radarPath = svg
      .append('path')
      .datum(devChartData)
      .attr('class', `radar-path radar-path-dev-${index}`)
      .attr('d', radarLine)
      .style('fill', `url(#radar-area-gradient-${index})`)
      .style('stroke', chroma(devData.developer.color.secondary).darken(2).hex())
      .style('stroke-width', '2px')
      .style('opacity', 0);

    // Animate the path
    radarPath.transition().duration(1000).style('opacity', 0.6);

    // Add data points with animation
    svg
      .selectAll(`.radar-point-dev-${index}`)
      .data(devChartData.filter((d) => (d.score || 0) > 0)) // Filter out zero scores
      .enter()
      .append('circle')
      .attr('class', `radar-point radar-point-dev-${index}`)
      .attr('cx', (d) => {
        // Find the original index in the unfiltered array
        const originalIndex = devChartData.findIndex((item) => item.name === d.name);
        return rScale(d.score || 0) * Math.cos(angles[originalIndex] - Math.PI / 2);
      })
      .attr('cy', (d) => {
        // Find the original index in the unfiltered array
        const originalIndex = devChartData.findIndex((item) => item.name === d.name);
        return rScale(d.score || 0) * Math.sin(angles[originalIndex] - Math.PI / 2);
      })
      .attr('r', 0)
      .style('fill', chroma(devData.developer.color.main).saturate(5).hex())
      .style('stroke', 'white')
      .style('stroke-width', '2px')
      .style('cursor', (d) => {
        return d.subpackages && d.subpackages.length > 0 ? 'pointer' : 'default';
      })
      .transition()
      .duration(800)
      .delay(300)
      .attr('r', 6)
      .on('end', function () {
        d3.select(this)
          .transition()
          .duration(1000)
          .attr('r', 5)
          .transition()
          .duration(1000)
          .attr('r', 6)
          .on('end', function () {
            d3.select(this).transition().duration(1000).attr('r', 5);
          });
      });

    // Add score labels with animation - only for non-zero scores
    svg
      .selectAll(`.score-label-dev-${index}`)
      .data(devChartData.filter((d) => (d.score || 0) > 0)) // Filter out zero scores
      .enter()
      .append('text')
      .attr('class', `score-label score-label-dev-${index}`)
      .attr('x', (d, _) => {
        // Find the original index in the unfiltered array
        const originalIndex = devChartData.findIndex((item) => item.name === d.name);
        return rScale((d.score || 0) + 0.15) * Math.cos(angles[originalIndex] - Math.PI / 2);
      })
      .attr('y', (d, _) => {
        // Find the original index in the unfiltered array
        const originalIndex = devChartData.findIndex((item) => item.name === d.name);
        return rScale((d.score || 0) + 0.15) * Math.sin(angles[originalIndex] - Math.PI / 2);
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => `${Math.round((d.score || 0) * 100)}%`)
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', chroma(devData.developer.color.main).darken().hex())
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay(1000)
      .style('opacity', 1);
  });

  // Add center circle
  const centerGroup = svg.append('g').attr('class', 'center-group');

  // Add click handler for back navigation if in subpackage view
  if (isSubpackageView && handleBackNavigation) {
    centerGroup.style('cursor', 'pointer').on('click', handleBackNavigation);
  }

  // Center circle background
  centerGroup
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 0)
    .style('fill', 'white')
    .style('stroke', developersData[0].developer.color.main)
    .style('stroke-width', '3px')
    .transition()
    .duration(800)
    .attr('r', centerRadius);

  if (isSubpackageView && handleBackNavigation) {
    // Add a back button for subpackage view
    const backButton = centerGroup.append('g').attr('class', 'back-button').style('opacity', 0);

    // Button background
    backButton
      .append('rect')
      .attr('x', -centerRadius * 0.7)
      .attr('y', -15)
      .attr('width', centerRadius * 1.4)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('ry', 15)
      .style('fill', developersData[0].developer.color.main)
      .style('opacity', 0.9);

    // Back text
    backButton
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text('Back')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'white');

    // Animate the back button
    backButton
      .transition()
      .duration(800)
      .delay(400)
      .style('opacity', 1)
      .on('end', function () {
        // Add pulsing animation to the button
        d3.select(this)
          .select('rect')
          .transition()
          .duration(1000)
          .style('opacity', 0.7)
          .transition()
          .duration(1000)
          .style('opacity', 0.9)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(1000)
              .style('opacity', 0.7)
              .transition()
              .duration(1000)
              .style('opacity', 0.9)
              .on('end', repeat);
          });
      });
  } else {
    // Add center text for top-level view
    centerGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', `${centerRadius * 0.28}px`)
      .style('font-weight', 'bold')
      .style('fill', colorScheme.text)
      .text('Knowledge')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay(400)
      .style('opacity', 1);

    centerGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', `${centerRadius * 0.25}px`)
      .style('fill', colorScheme.text)
      .text('Overview')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay(600)
      .style('opacity', 1);
  }
};

// Export convenience functions that use the main function with appropriate settings
export const drawTopLevel = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  developersData: {
    developer: AuthorType;
    data: Package[];
  }[],
  radius: number,
  colorScheme: unknown,
  handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void,
) => {
  drawRadarChart(svg, developersData, radius, colorScheme, {
    isSubpackageView: false,
    handlePackageSelect,
  });
};

export const drawSubpackages = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  developersData: {
    developer: AuthorType;
    data: Package[] | SubPackage[];
  }[],
  radius: number,
  colorScheme: unknown,
  handleBackNavigation: () => void,
  handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void,
) => {
  drawRadarChart(svg, developersData, radius, colorScheme, {
    isSubpackageView: true,
    parentName: developersData[0].data[0]?.name,
    handlePackageSelect,
    handleBackNavigation,
  });
};
