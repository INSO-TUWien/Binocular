import * as d3 from 'd3';
import { Package, SubPackage } from './type.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import chroma from 'chroma-js';
import { round } from 'lodash';

type ColorScheme = {
  grid: string;
  text: string;
};

/**
 * Positions a tooltip relative to the mouse cursor and SVG boundaries.
 * Ensures the tooltip stays within visible bounds by adjusting position based on cursor location.
 *
 * @param tooltip - D3 selection of the tooltip element
 * @param svgRef - Reference to the SVG element for boundary calculations
 * @param e - Mouse event containing cursor position
 */
function positionTooltip(tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>, svgRef: SVGGElement, e: MouseEvent) {
  const visRect = svgRef.getBoundingClientRect();
  const middleX = visRect.x + visRect.width / 2;
  const middleY = visRect.y + visRect.height / 2;
  const tooltipRect = (tooltip.node() as HTMLDivElement).getBoundingClientRect();

  if (middleX < e.pageX) {
    tooltip.style('left', e.pageX - tooltipRect.width + 'px');
  } else {
    tooltip.style('left', e.pageX + 'px');
  }
  if (middleY < e.pageY) {
    tooltip.style('top', e.pageY - tooltipRect.height + 'px');
  } else {
    tooltip.style('top', e.pageY + 20 + 'px');
  }
}

/**
 * Sets the content of a tooltip with package name and developer expertise data.
 * Displays developers sorted by score with color-coded information.
 *
 * @param tooltip - D3 selection of the tooltip element
 * @param packageName - Name of the package to display
 * @param developersData - Array of developer expertise data with scores
 */
function setTooltipContent(
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  packageName: string,
  developersData: { developer: AuthorType; score: number }[],
) {
  tooltip.select('.tooltip-label').text(packageName);

  const developersContainer = tooltip.select('.tooltip-developers');
  developersContainer.selectAll('*').remove();

  developersData
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .forEach(({ developer, score }) => {
      const devDiv = developersContainer
        .append('div')
        .style('display', 'flex')
        .style('justify-content', 'space-between')
        .style('align-items', 'center')
        .style('margin', '2px 0')
        .style('padding', '2px 4px')
        .style('border-radius', '4px')
        .style('background-color', chroma(developer.color.main).alpha(0.05).css());

      devDiv
        .append('span')
        .style('font-size', '10px')
        .style('color', chroma(developer.color.main).darken(1).hex())
        .style('font-weight', 'bold')
        .text(developer.user.gitSignature);

      devDiv
        .append('span')
        .style('font-size', '10px')
        .style('color', chroma(developer.color.main).darken(3).hex())
        .text(`${round(score * 100)}%`);
    });
}

/**
 * Main function for drawing a radar chart visualization of developer knowledge.
 * Creates an interactive radar chart with tooltips, click handlers, and animations.
 *
 * @param svg - D3 selection of the SVG group element to draw on
 * @param developersData - Array of developer data with their package expertise
 * @param radius - Radius of the radar chart
 * @param colorScheme - Color scheme for grid and text elements
 * @param options - Configuration options for the chart behavior
 */
const drawRadarChart = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  developersData: {
    developer: AuthorType;
    data: Package[] | SubPackage[];
  }[],
  radius: number,
  colorScheme: ColorScheme,
  options: {
    isSubpackageView?: boolean;
    parentName?: string;
    handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void;
    handleBackNavigation?: () => void;
    tooltipRef?: React.MutableRefObject<HTMLDivElement | null>;
    individualDeveloperData?: Map<string, Package[]>;
    selectedDevelopers?: AuthorType[];
    breadcrumbs?: string[];
  },
) => {
  const {
    isSubpackageView = false,
    handlePackageSelect,
    handleBackNavigation,
    tooltipRef,
    individualDeveloperData,
    selectedDevelopers,
    breadcrumbs,
  } = options;

  const fadeRadarPath = true;
  const fadePoints = true;
  const fadeScoreLabels = true;

  const parentNode = svg.node()?.parentNode as SVGElement | null;
  if (parentNode) d3.select(parentNode).selectAll('defs').remove();

  const hasDevelopers = developersData.length > 0;
  const primaryColor = hasDevelopers ? developersData[0].developer.color.main : colorScheme.grid;

  /**
   * Recursively finds a package by following a path through the package hierarchy.
   *
   * @param packages - Array of packages to search in
   * @param path - Array of package names representing the path
   * @returns The found package or null if not found
   */
  const findPackageByPath = (packages: Package[], path: string[]): Package | null => {
    if (path.length === 0 || packages.length === 0) return null;
    const targetName = path[0];
    const pkg = packages.find((p) => p.name === targetName);
    if (!pkg) return null;
    if (path.length === 1) return pkg;
    if (!pkg.subpackages || pkg.subpackages.length === 0) return null;
    return findPackageByPath(pkg.subpackages as Package[], path.slice(1));
  };

  /**
   * Gets developer expertise scores for a specific package.
   * Returns expertise data for all selected developers.
   *
   * @param packageName - Name of the package to get expertise for
   * @returns Array of developer expertise data with scores
   */
  const getDeveloperExpertise = (packageName: string): { developer: AuthorType; score: number }[] => {
    if (!individualDeveloperData || !selectedDevelopers) return [];

    return selectedDevelopers.map((developer) => {
      const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
      let score = 0;

      if (!isSubpackageView) {
        const pkg = devData.find((p) => p.name === packageName);
        score = pkg?.score || 0;
      } else {
        const parentPath = breadcrumbs?.slice(1) || [];
        const parentPkg = findPackageByPath(devData, parentPath);
        const subPkg = parentPkg?.subpackages?.find((sp) => sp.name === packageName);
        score = subPkg?.score || 0;
      }

      return { developer, score };
    });
  };

  // Gradients per developer (for radar areas)
  if (hasDevelopers && parentNode) {
    const defs = d3.select(parentNode).append('defs');
    developersData.forEach((devData, index) => {
      const gradientId = `radar-area-gradient-${index}`;
      defs.append('linearGradient').attr('id', gradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');

      d3.select(`#${gradientId}`)
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', chroma(devData.developer.color.main).alpha(0.7).css());

      d3.select(`#${gradientId}`)
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', chroma(devData.developer.color.secondary).alpha(0.1).css());
    });
  }

  // Geometry
  const centerRadius = radius * 0.25;
  const rScale = d3.scaleLinear().domain([0, 1]).range([centerRadius, radius]);

  /**
   * Checks if any developer has subpackages for a given top-level package.
   *
   * @param pkgName - Name of the package to check
   * @returns True if any developer has subpackages for this package
   */
  const hasTopLevelSubpackagesForAnyDev = (pkgName: string): boolean =>
    developersData.some((dev) => {
      const pkg = (dev.data as Package[]).find((p) => p.name === pkgName);
      return !!pkg?.subpackages && pkg.subpackages.length > 0;
    });

  /**
   * Finds the first top-level package with subpackages for a given name.
   *
   * @param pkgName - Name of the package to find
   * @returns The package with subpackages or undefined
   */
  const findTopLevelPkgWithSubpackages = (pkgName: string): Package | undefined =>
    developersData
      .map((dev) => (dev.data as Package[]).find((p) => p.name === pkgName))
      .find((pkg): pkg is Package => !!pkg && !!pkg.subpackages && pkg.subpackages.length > 0);

  /**
   * Checks if any developer has nested subpackages for a given subpackage.
   *
   * @param parentPkgName - Name of the parent package
   * @param subpkgName - Name of the subpackage to check
   * @returns True if any developer has nested subpackages
   */
  const hasNestedSubpackagesForAnyDev = (parentPkgName: string, subpkgName: string): boolean =>
    developersData.some((dev) => {
      const parentPkg = (dev.data as Package[]).find((p) => p.name === parentPkgName);
      const sub = parentPkg?.subpackages?.find((sp) => sp.name === subpkgName);
      return !!sub?.subpackages && sub.subpackages.length > 0;
    });

  /**
   * Finds the first nested subpackage with subpackages.
   *
   * @param parentPkgName - Name of the parent package
   * @param subpkgName - Name of the subpackage to find
   * @returns The subpackage with nested subpackages or undefined
   */
  const findNestedSubpackageWithSubpackages = (parentPkgName: string, subpkgName: string): SubPackage | undefined =>
    developersData
      .map((dev) => {
        const parentPkg = (dev.data as Package[]).find((p) => p.name === parentPkgName);
        return parentPkg?.subpackages?.find((sp) => sp.name === subpkgName);
      })
      .find((sp): sp is SubPackage => !!sp && !!sp.subpackages && sp.subpackages.length > 0);

  // Axes/features reference (order)
  let features: string[] = [];
  if (hasDevelopers) {
    if (!isSubpackageView) {
      features = (developersData[0].data as Package[]).map((p) => p.name);
    } else {
      const parentName = options.parentName ?? (developersData[0].data as Package[])[0]?.name ?? '';
      const refParent = developersData
        .map((dev) => (dev.data as Package[]).find((p) => p.name === parentName))
        .find((p): p is Package => !!p);
      features = refParent?.subpackages?.map((sp) => sp.name) ?? [];
    }
  }
  const n = features.length > 0 ? features.length : 8;
  const angles = features.length
    ? features.map((_, i) => i * ((2 * Math.PI) / features.length))
    : d3.range(n).map((i) => i * ((2 * Math.PI) / n));

  // Background circle (static)
  svg
    .append('circle')
    .attr('class', 'radar-background')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius)
    .style('fill', '#f0f0f0')
    .style('opacity', 1);

  // Axis grid (static)
  const axisGrid = svg.append('g').attr('class', 'axis-grid');

  // Spokes
  axisGrid
    .selectAll('.axis-line')
    .data(angles)
    .enter()
    .append('line')
    .attr('class', 'axis-line')
    .attr('x1', (d) => rScale(0) * Math.cos(d - Math.PI / 2))
    .attr('y1', (d) => rScale(0) * Math.sin(d - Math.PI / 2))
    .attr('x2', (d) => rScale(1.1) * Math.cos(d - Math.PI / 2))
    .attr('y2', (d) => rScale(1.1) * Math.sin(d - Math.PI / 2))
    .style('stroke', colorScheme.grid)
    .style('stroke-width', '1px')
    .style('stroke-dasharray', '3,3')
    .style('opacity', 0.7);

  // Level circles
  const levels = 5;
  axisGrid
    .selectAll('.level')
    .data(d3.range(0, levels + 1).map((i) => i / levels))
    .enter()
    .append('circle')
    .attr('class', 'level')
    .attr('r', (d) => rScale(d))
    .style('fill', 'none')
    .style('stroke', colorScheme.grid)
    .style('stroke-width', '0.5px');

  // Level labels
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
    .style('opacity', 0.7)
    .text((d) => `${Math.round(d * 100)}%`);

  // Axis labels (static placement, dynamic clickability with tooltip)
  if (hasDevelopers && features.length > 0) {
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
        if (!isSubpackageView) return hasTopLevelSubpackagesForAnyDev(d) ? 'pointer' : 'default';
        const parentName = options.parentName ?? '';
        return hasNestedSubpackagesForAnyDev(parentName, d) ? 'pointer' : 'default';
      })
      .style('opacity', 1)
      .on('click', (_event: MouseEvent, d: string) => {
        if (!handlePackageSelect) return;
        if (!isSubpackageView) {
          if (!hasTopLevelSubpackagesForAnyDev(d)) return;
          const pkg = findTopLevelPkgWithSubpackages(d);
          if (!pkg) return;
          handlePackageSelect(pkg, pkg.name);
        } else {
          const parentName = options.parentName ?? '';
          if (!hasNestedSubpackagesForAnyDev(parentName, d)) return;
          const sub = findNestedSubpackageWithSubpackages(parentName, d);
          if (!sub) return;
          handlePackageSelect(sub, parentName);
        }
      })
      .on('mouseover', function (_event: MouseEvent, d: string) {
        if (!tooltipRef?.current) return;
        const tooltip = d3.select(tooltipRef.current);
        const expertise = getDeveloperExpertise(d);
        setTooltipContent(tooltip, d, expertise);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function (event: MouseEvent) {
        if (!tooltipRef?.current) return;
        const tooltip = d3.select(tooltipRef.current);
        const svgNode = svg.node()?.closest('svg') as SVGSVGElement;
        if (svgNode) {
          positionTooltip(tooltip, svgNode, event);
        }
      })
      .on('mouseout', function () {
        if (!tooltipRef?.current) return;
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      });

    axisLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('class', 'label-text')
      .text((d: string) => (d.length > 15 ? `${d.substring(0, 15)}...` : d))
      .style('font-size', `${Math.min(centerRadius * 0.25, 12)}px`)
      .style('font-weight', 'bold')
      .style('fill', colorScheme.text);

    axisLabels.each(function (this: SVGGElement, d: string) {
      const textElement = this.querySelector('.label-text') as SVGTextElement;
      const textWidth = textElement.getBBox().width;
      const padding = 10;

      const clickable = !isSubpackageView ? hasTopLevelSubpackagesForAnyDev(d) : hasNestedSubpackagesForAnyDev(options.parentName ?? '', d);

      d3.select(this)
        .insert('rect', 'text')
        .attr('x', -textWidth / 2 - padding)
        .attr('y', -10)
        .attr('width', textWidth + padding * 2 + (clickable ? 10 : 0))
        .attr('height', 20)
        .attr('rx', 10)
        .attr('ry', 10)
        .style('fill', 'white')
        .style('stroke', () => (clickable ? chroma(primaryColor).hex() : colorScheme.grid))
        .style('stroke-width', '2px')
        .style('opacity', 0.8);
    });

    axisLabels
      .append('circle')
      .attr('cx', function (this: SVGCircleElement) {
        const parent = this.parentNode as SVGGElement;
        const textElement = parent.querySelector('.label-text') as SVGTextElement;
        const textWidth = textElement.getBBox().width;
        return textWidth / 2 + 5;
      })
      .attr('cy', 0)
      .attr('r', 3)
      .style('fill', (d: string) => {
        const clickable = !isSubpackageView
          ? hasTopLevelSubpackagesForAnyDev(d)
          : hasNestedSubpackagesForAnyDev(options.parentName ?? '', d);
        return clickable ? chroma(primaryColor).saturate(5).hex() : 'transparent';
      });
  }

  // Radar area path (gradient) + fade
  const radarLine = d3
    .lineRadial<Package | SubPackage>()
    .angle((_, i: number) => angles[i])
    .radius((d) => rScale(d.score ?? 0))
    .curve(d3.curveCardinalClosed.tension(0.7));

  developersData.forEach((devData, index) => {
    // Developer-specific data in current layer
    const devChartData: (Package | SubPackage)[] = !isSubpackageView
      ? (devData.data as Package[]) ?? []
      : (devData.data as Package[]).find((p) => p.name === (options.parentName ?? ''))?.subpackages ?? [];

    // Order data by global feature order; fill missing with score 0
    const orderedData: (Package | SubPackage)[] = features.length
      ? features.map((name) => {
          const found = devChartData.find((d) => d.name === name);
          if (found) return found;
          return { name, score: 0 } as unknown as Package | SubPackage;
        })
      : devChartData;

    const radarPath = svg
      .append('path')
      .datum(orderedData)
      .attr('class', `radar-path radar-path-dev-${index}`)
      .attr('d', radarLine)
      .style('fill', `url(#radar-area-gradient-${index})`)
      .style('stroke', chroma(devData.developer.color.secondary).darken(2).hex())
      .style('stroke-width', '2px')
      .style('opacity', 0);

    if (fadeRadarPath) {
      radarPath.transition().duration(800).style('opacity', 0.6);
    }

    // Datapoints + delayed fade (per-developer color) with tooltip
    const pointsData = orderedData.filter((d) => (d.score ?? 0) > 0);
    const points = svg
      .selectAll<SVGCircleElement, Package | SubPackage>(`.radar-point-dev-${index}`)
      .data(pointsData)
      .enter()
      .append('circle')
      .attr('class', `radar-point radar-point-dev-${index}`)
      .attr('cx', (d) => {
        const i = features.indexOf(d.name);
        const angle = i >= 0 ? angles[i] : 0;
        return rScale(d.score ?? 0) * Math.cos(angle - Math.PI / 2);
      })
      .attr('cy', (d) => {
        const i = features.indexOf(d.name);
        const angle = i >= 0 ? angles[i] : 0;
        return rScale(d.score ?? 0) * Math.sin(angle - Math.PI / 2);
      })
      .attr('r', 5)
      .style('fill', chroma(devData.developer.color.main).saturate(5).hex())
      .style('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0)
      .style('cursor', (d) => {
        if (!isSubpackageView) return hasTopLevelSubpackagesForAnyDev(d.name) ? 'pointer' : 'default';
        const parentName = options.parentName ?? '';
        return hasNestedSubpackagesForAnyDev(parentName, d.name) ? 'pointer' : 'default';
      })
      .on('mouseover', function (_event: MouseEvent, d) {
        if (!tooltipRef?.current) return;
        const tooltip = d3.select(tooltipRef.current);
        const expertise = getDeveloperExpertise(d.name);
        setTooltipContent(tooltip, d.name, expertise);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function (event: MouseEvent) {
        if (!tooltipRef?.current) return;
        const tooltip = d3.select(tooltipRef.current);
        const svgNode = svg.node()?.closest('svg') as SVGSVGElement;
        if (svgNode) {
          positionTooltip(tooltip, svgNode, event);
        }
      })
      .on('mouseout', function () {
        if (!tooltipRef?.current) return;
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      });

    if (fadePoints) {
      points.transition().duration(700).delay(300).style('opacity', 1);
    }

    // Score labels + fade (per-developer color)
    const labels = svg
      .selectAll<SVGTextElement, Package | SubPackage>(`.score-label-dev-${index}`)
      .data(pointsData)
      .enter()
      .append('text')
      .attr('class', `score-label score-label-dev-${index}`)
      .attr('x', (d) => {
        const i = features.indexOf(d.name);
        const angle = i >= 0 ? angles[i] : 0;
        return rScale((d.score ?? 0) + 0.15) * Math.cos(angle - Math.PI / 2);
      })
      .attr('y', (d) => {
        const i = features.indexOf(d.name);
        const angle = i >= 0 ? angles[i] : 0;
        return rScale((d.score ?? 0) + 0.15) * Math.sin(angle - Math.PI / 2);
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => `${Math.round((d.score ?? 0) * 100)}%`)
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', chroma(devData.developer.color.main).darken().hex())
      .style('opacity', 0);

    if (fadeScoreLabels) {
      labels.transition().duration(700).delay(600).style('opacity', 1);
    }
  });

  const centerGroup = svg.append('g').attr('class', 'center-group');

  if (isSubpackageView && handleBackNavigation) {
    centerGroup.style('cursor', 'pointer').on('click', handleBackNavigation);
  }

  const mainColor = hasDevelopers ? developersData[0].developer.color.main : colorScheme.grid;

  centerGroup
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', centerRadius)
    .style('fill', 'white')
    .style('stroke', mainColor)
    .style('stroke-width', '3px');

  if (isSubpackageView && handleBackNavigation) {
    const backButton = centerGroup.append('g').attr('class', 'back-button').style('opacity', 1);

    backButton
      .append('rect')
      .attr('x', -centerRadius * 0.7)
      .attr('y', -15)
      .attr('width', centerRadius * 1.4)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('ry', 15)
      .style('fill', mainColor)
      .style('opacity', 0.9);

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
  } else {
    centerGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', `${centerRadius * 0.28}px`)
      .style('font-weight', 'bold')
      .style('fill', colorScheme.text)
      .text('Knowledge')
      .style('opacity', 1);

    centerGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', `${centerRadius * 0.25}px`)
      .style('fill', colorScheme.text)
      .text('Overview')
      .style('opacity', 1);
  }
};

/**
 * Draws a top-level radar chart showing package-level developer expertise.
 *
 * @param svg - D3 selection of the SVG group element to draw on
 * @param developersData - Array of developer data with their package expertise
 * @param radius - Radius of the radar chart
 * @param colorScheme - Color scheme for grid and text elements
 * @param handlePackageSelect - Callback function for package selection
 * @param tooltipRef - Reference to the tooltip element
 * @param individualDeveloperData - Map of individual developer data
 * @param selectedDevelopers - Array of currently selected developers
 */
export const drawTopLevel = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  developersData: {
    developer: AuthorType;
    data: Package[];
  }[],
  radius: number,
  colorScheme: ColorScheme,
  handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void,
  tooltipRef?: React.MutableRefObject<HTMLDivElement | null>,
  individualDeveloperData?: Map<string, Package[]>,
  selectedDevelopers?: AuthorType[],
) => {
  drawRadarChart(svg, developersData, radius, colorScheme, {
    isSubpackageView: false,
    handlePackageSelect,
    tooltipRef,
    individualDeveloperData,
    selectedDevelopers,
  });
};

/**
 * Draws a subpackage-level radar chart showing detailed developer expertise within a package.
 *
 * @param svg - D3 selection of the SVG group element to draw on
 * @param developersData - Array of developer data with their subpackage expertise
 * @param radius - Radius of the radar chart
 * @param colorScheme - Color scheme for grid and text elements
 * @param handleBackNavigation - Callback function for navigating back to parent view
 * @param handlePackageSelect - Callback function for package selection
 * @param tooltipRef - Reference to the tooltip element
 * @param individualDeveloperData - Map of individual developer data
 * @param selectedDevelopers - Array of currently selected developers
 * @param breadcrumbs - Array representing the current navigation path
 */
export const drawSubpackages = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  developersData: {
    developer: AuthorType;
    data: Package[] | SubPackage[];
  }[],
  radius: number,
  colorScheme: ColorScheme,
  handleBackNavigation: () => void,
  handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void,
  tooltipRef?: React.MutableRefObject<HTMLDivElement | null>,
  individualDeveloperData?: Map<string, Package[]>,
  selectedDevelopers?: AuthorType[],
  breadcrumbs?: string[],
) => {
  const inferredParent = (developersData[0]?.data as Package[] | undefined)?.[0]?.name ?? '';
  drawRadarChart(svg, developersData, radius, colorScheme, {
    isSubpackageView: true,
    parentName: inferredParent,
    handlePackageSelect,
    handleBackNavigation,
    tooltipRef,
    individualDeveloperData,
    selectedDevelopers,
    breadcrumbs,
  });
};
