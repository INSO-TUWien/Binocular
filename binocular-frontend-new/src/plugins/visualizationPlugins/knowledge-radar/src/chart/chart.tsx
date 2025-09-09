import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
import { colorScheme } from './colorScheme';
import { drawSubpackages, drawTopLevel } from './drawRadarChart.ts';
import { createGradients, drawBreadcrumbs } from './utils';
import { Center, Dimensions, Package, SubPackage } from './type.ts';
import { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { SettingsType } from '../settings/settings.tsx';
import AuthorSelection from './authorSelection.tsx';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { useDispatch, useSelector } from 'react-redux';
import { dataSlice, DataState } from '../reducer';
import _ from 'lodash';
import { calculateExpertiseBrowserScores } from '../utilities/dataConverter.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

type ColorScheme = {
  grid: string;
  text: string;
};

/**
 * Extended package history type that includes navigation state information.
 */
type ExtendedPackageHistory = {
  package: Package | SubPackage;
  view: 'topLevel' | 'subpackage';
  breadcrumbs: string[];
};

/**
 * Main radar chart component for visualizing developer knowledge across packages.
 * Provides interactive navigation between top-level packages and subpackages.
 *
 * @param properties - Visualization plugin properties containing data connection, settings, and refs
 * @returns JSX element containing the complete radar chart interface
 */
function RadarChart(properties: VisualizationPluginProperties<SettingsType, DataPluginCommit>) {
  const chartSizeFactor = 0.8;

  type RootState = ReturnType<typeof properties.store.getState>;
  type AppDispatch = typeof properties.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);

  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);

  const [currentView, setCurrentView] = useState<'topLevel' | 'subpackage'>('topLevel');
  const [selectedPackage, setSelectedPackage] = useState<Package | SubPackage | null>(null);
  const [packageHistory, setPackageHistory] = useState<ExtendedPackageHistory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['./']);

  const [developerKnowledge] = useState<Package[]>([]);
  const [individualDeveloperData, setIndividualDeveloperData] = useState<Map<string, Package[]>>(new Map());
  const [authorList, setAuthorList] = useState<AuthorType[]>(properties.authorList);
  const [selectedDevelopers, setSelectedDevelopers] = useState<AuthorType[]>([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const center: Center = { x: dimensions.width / 2, y: dimensions.height / 2 };
  const tooltipRef = useRef<HTMLDivElement>(null);

  /**
   * Updates the date range in the data slice when parameters change.
   */
  useEffect(() => {
    if (properties.dataConnection && properties.parameters.parametersDateRange) {
      dispatch(dataSlice.actions.setDateRange(properties.parameters.parametersDateRange));
    }
  }, [properties.parameters]);

  /**
   * Triggers data refresh when data connection changes.
   */
  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [properties.dataConnection]);

  /**
   * Processes selected developers and calculates their expertise scores.
   * Updates individual developer data map with calculated expertise.
   */
  useEffect(() => {
    if (selectedDevelopers.length === 0) return;

    setIsProcessingSelection(true);

    const newIndividualData = new Map<string, Package[]>();
    if (data != undefined) {
      selectedDevelopers.forEach((developer) => {
        const devData = calculateExpertiseBrowserScores(data, developer.user.gitSignature);
        newIndividualData.set(developer.user.gitSignature, devData);
      });
      setIndividualDeveloperData(newIndividualData);
      resetNavigation();
      setIsProcessingSelection(false);
    }
  }, [data, properties, selectedDevelopers]);

  /**
   * Updates author list and selected developers when author list changes.
   */
  useEffect(() => {
    setAuthorList(properties.authorList);
    updateSelectedDevelopers(properties.authorList);
  }, [properties.authorList]);

  /**
   * Sets up resize observer for responsive chart sizing.
   */
  useEffect(() => {
    if (!properties.chartContainerRef.current) return;
    setupResizeObserver(properties.chartContainerRef.current, setDimensions);
    return () => {
      if (properties.chartContainerRef.current) {
        // cleanup handled in setupResizeObserver
      }
    };
  }, [properties.chartContainerRef]);

  /**
   * Updates chart radius when dimensions change.
   */
  useEffect(() => {
    const baseLabelPadding = Math.max(dimensions.width * 0.08, 40);
    const baseBottomPadding = Math.max(dimensions.height * 0.03, 15);
    const labelOverflow = Math.max(dimensions.height * 0.05, 20);

    // Calculate available space more intelligently
    const availableHeight = dimensions.height - baseLabelPadding - baseBottomPadding - labelOverflow;
    const availableWidth = dimensions.width - baseLabelPadding * 2;

    // For tall containers, prioritize height; for wide containers, prioritize width
    const aspectRatio = dimensions.width / dimensions.height;
    let maxRadius;

    if (aspectRatio > 1.2) {
      // Wide container: use height as constraint but ensure width fits
      maxRadius = Math.min(availableHeight / 2, availableWidth / 2) * chartSizeFactor;
    } else {
      // Tall or square container: use available space more effectively
      maxRadius = Math.min(availableHeight / 2, availableWidth / 2) * chartSizeFactor;
    }

    setRadius(Math.max(maxRadius, 100)); // Ensure minimum radius
  }, [dimensions]);

  /**
   * Redraws the chart when any relevant state changes.
   */
  useEffect(() => {
    if (!svgRef.current) return;
    drawChart(svgRef.current, {
      center,
      radius,
      dimensions,
      currentView,
      selectedPackage,
      breadcrumbs,
      developerKnowledge,
      individualDeveloperData,
      selectedDevelopers,
      colorScheme: colorScheme as ColorScheme,
      handlePackageSelect,
      handleBackNavigation,
      tooltipRef,
    });
  }, [
    dimensions,
    radius,
    currentView,
    selectedPackage,
    breadcrumbs,
    packageHistory,
    developerKnowledge,
    individualDeveloperData,
    selectedDevelopers,
  ]);

  /**
   * Resets navigation state when selected package no longer exists in current data.
   * Ensures UI consistency when developer selection changes affect available packages.
   */
  function resetNavigation() {
    if (selectedPackage && currentView === 'subpackage') {
      const packagePath = breadcrumbs.slice(1);
      let packageExists = false;
      for (const [, packages] of individualDeveloperData.entries()) {
        const foundPackage = findPackageByPath(packages, packagePath);
        if (foundPackage) {
          packageExists = true;
          break;
        }
      }
      if (!packageExists) {
        setSelectedPackage(null);
        setPackageHistory([]);
        setBreadcrumbs(['./']);
        setCurrentView('topLevel');
      }
    } else if (!selectedPackage) {
      setSelectedPackage(null);
      setPackageHistory([]);
      setBreadcrumbs(['./']);
      setCurrentView('topLevel');
    }
  }

  /**
   * Updates selected developers list based on current author list.
   * Removes developers that are no longer in the author list.
   *
   * @param authorList - Current list of available authors
   */
  function updateSelectedDevelopers(authorList: AuthorType[]) {
    setSelectedDevelopers((prev) =>
      prev.filter((developer) => authorList.some((author) => author.user.gitSignature === developer.user.gitSignature)),
    );
  }

  /**
   * Sets up a ResizeObserver to monitor container size changes.
   * Updates dimensions state when the container is resized.
   *
   * @param element - HTML element to observe for size changes
   * @param setDimensions - State setter function for updating dimensions
   * @returns Cleanup function to unobserve the element
   */
  function setupResizeObserver(element: HTMLElement, setDimensions: (updater: (prev: Dimensions) => Dimensions) => void) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions((prev) => ({ ...prev, width, height }));
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }

  /**
   * Handles changes in author selection from the AuthorSelection component.
   * Updates selected developers only if the selection has actually changed.
   *
   * @param authors - New array of selected authors
   */
  const handleAuthorsChange = (authors: AuthorType[]): void => {
    setSelectedDevelopers((prev) => (_.isEqual(prev, authors) ? prev : authors));
  };

  /**
   * Handles package selection for drilling down into subpackages.
   * Saves current state to history and navigates to subpackage view.
   *
   * @param pkg - Package or subpackage that was selected
   */
  const handlePackageSelect = (pkg: Package | SubPackage) => {
    if (selectedPackage) {
      setPackageHistory([
        ...packageHistory,
        {
          package: selectedPackage,
          view: currentView,
          breadcrumbs: [...breadcrumbs],
        },
      ]);
    }
    setSelectedPackage(pkg);
    setCurrentView('subpackage');
    setBreadcrumbs([...breadcrumbs, pkg.name]);
  };

  /**
   * Handles navigation back to previous view.
   * Restores previous state from history or returns to top level.
   */
  const handleBackNavigation = () => {
    if (packageHistory.length === 0) {
      setCurrentView('topLevel');
      setSelectedPackage(null);
      setBreadcrumbs(['./']);
    } else {
      const newHistory = [...packageHistory];
      const lastItem = newHistory.pop();
      if (lastItem) {
        setSelectedPackage(lastItem.package);
        setCurrentView(lastItem.view);
        setBreadcrumbs(lastItem.breadcrumbs);
        setPackageHistory(newHistory);
      }
    }
  };

  /**
   * Renders the appropriate content based on current data state.
   * Shows loading spinner, no data message, or the main chart interface.
   *
   * @returns JSX element for the current state
   */
  function renderContent() {
    if (dataState === DataState.EMPTY) {
      return <div>NoData</div>;
    }

    if (dataState === DataState.FETCHING || isProcessingSelection) {
      return (
        <div className="flex justify-center items-center h-full">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    return (
      <>
        <div
          ref={tooltipRef}
          className={'card bg-base-100 rounded border-2 p-2 break-all'}
          style={{
            position: 'fixed',
            visibility: 'hidden',
            minWidth: '10rem',
            maxWidth: '20rem',
            zIndex: 1000,
          }}>
          <div className={'tooltip-label font-bold text-xs'}>Package</div>
          <div className={'tooltip-content'}>
            <div className={'tooltip-developers'}>{/* Developer expertise will be populated dynamically */}</div>
          </div>
        </div>

        <div className={styles.authorSelectorContainer} style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <AuthorSelection selectedAuthors={selectedDevelopers} authorList={authorList} onAuthorsChange={handleAuthorsChange} />
        </div>
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg" />
        </div>
      </>
    );
  }

  return (
    <div
      ref={properties.chartContainerRef}
      className={styles.chartContainer}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {renderContent()}
    </div>
  );
}

/**
 * Recursively finds a package by following a hierarchical path.
 * Navigates through package structure using breadcrumb-style path array.
 *
 * @param packages - Array of packages to search in
 * @param path - Array of package names representing the navigation path
 * @returns The found package or null if path doesn't exist
 */
function findPackageByPath(packages: Package[], path: string[]): Package | null {
  if (path.length === 0 || packages.length === 0) return null;
  const targetName = path[0];
  const pkg = packages.find((p) => p.name === targetName);
  if (!pkg) return null;
  if (path.length === 1) return pkg;
  if (!pkg.subpackages || pkg.subpackages.length === 0) return null;
  return findPackageByPath(pkg.subpackages as Package[], path.slice(1));
}

/**
 * Main chart drawing function that orchestrates the visualization rendering.
 * Clears previous content and draws appropriate chart based on current view state.
 *
 * @param svgElement - SVG element to draw the chart in
 * @param options - Configuration object containing all chart parameters and handlers
 */
function drawChart(
  svgElement: SVGSVGElement,
  options: {
    center: Center;
    radius: number;
    dimensions: Dimensions;
    currentView: string;
    selectedPackage: Package | SubPackage | null;
    breadcrumbs: string[];
    developerKnowledge: Package[];
    individualDeveloperData: Map<string, Package[]>;
    selectedDevelopers: AuthorType[];
    colorScheme: ColorScheme;
    handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void;
    handleBackNavigation: () => void;
    tooltipRef: React.MutableRefObject<HTMLDivElement | null>;
  },
) {
  const {
    center,
    radius,
    dimensions,
    currentView,
    selectedPackage,
    breadcrumbs,
    individualDeveloperData,
    selectedDevelopers,
    colorScheme,
    handlePackageSelect,
    handleBackNavigation,
    tooltipRef,
  } = options;

  // Clear previous chart content
  d3.select(svgElement).selectAll('*').remove();

  const labelPadding = Math.max(dimensions.width * 0.08, 40);
  const bottomPadding = Math.max(dimensions.height * 0.03, 15);

  // Reserve extra space for bottom labels that extend beyond radius
  const labelOverflow = Math.min(dimensions.height * 0.05, 0); // Space for labels that stick out below the chart

  const chartCenterX = center.x;

  const aspectRatio = dimensions.width / dimensions.height;
  let chartCenterY;
  if (aspectRatio > 1.2) {
    // Wide container: center vertically
    chartCenterY = dimensions.height / 2;
  } else {
    // Tall container: position to use available space efficiently
    const topSpace = labelPadding;
    const bottomSpace = bottomPadding + labelOverflow;
    const availableVerticalSpace = dimensions.height - topSpace - bottomSpace;
    chartCenterY = topSpace + availableVerticalSpace / 2;
  }

  // Ensure chart doesn't go outside bounds
  const minY = radius + labelPadding;
  const maxY = dimensions.height - radius - bottomPadding - labelOverflow;
  const finalY = Math.max(minY, Math.min(chartCenterY, maxY));

  const svg = d3.select(svgElement).append('g').attr('transform', `translate(${chartCenterX}, ${finalY})`);

  const primaryDeveloper = selectedDevelopers[0] ?? undefined;
  if (primaryDeveloper) {
    const defs = d3.select(svgElement).append('defs');
    createGradients(defs, primaryDeveloper);
    drawBreadcrumbs(svgElement, {
      radius,
      dimensions,
      breadcrumbs,
      center,
      selectedDeveloper: primaryDeveloper,
    });
  }

  /**
   * Formats developer data for chart rendering based on current view.
   * Aligns data across all developers to ensure consistent chart structure.
   *
   * @returns Array of developer data formatted for chart rendering
   */
  const formatDevelopersData = () => {
    if (currentView === 'topLevel') {
      // Collect all unique package names across developers
      const allPackageNames = new Set<string>();
      selectedDevelopers.forEach((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        devData.forEach((pkg) => allPackageNames.add(pkg.name));
      });

      // Create unified package structure
      const unifiedPackages = Array.from(allPackageNames).map((name) => ({
        name,
        score: 0,
        subpackages: [] as SubPackage[],
      }));

      // Align each developer's data to unified structure
      return selectedDevelopers.map((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const alignedData = unifiedPackages.map((unifiedPkg) => {
          const devPkg = devData.find((p) => p.name === unifiedPkg.name);
          return devPkg || { ...unifiedPkg, score: 0 };
        });
        return { developer, data: alignedData };
      });
    } else if (currentView === 'subpackage' && selectedPackage) {
      // Collect all unique subpackage names across developers
      const allSubpackageNames = new Set<string>();
      selectedDevelopers.forEach((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const devPackage = findPackageByPath(devData, breadcrumbs.slice(1));
        devPackage?.subpackages?.forEach((subPkg) => allSubpackageNames.add(subPkg.name));
      });

      // Create unified subpackage structure
      const unifiedSubpackages = Array.from(allSubpackageNames).map((name) => ({
        name,
        score: 0,
        subpackages: [] as SubPackage[],
      }));

      // Align each developer's subpackage data to unified structure
      return selectedDevelopers.map((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const devPackage = findPackageByPath(devData, breadcrumbs.slice(1));
        const alignedSubpackages = devPackage?.subpackages
          ? unifiedSubpackages.map((unifiedSub) => {
              const devSub = devPackage.subpackages.find((s) => s.name === unifiedSub.name);
              return devSub || { ...unifiedSub, score: 0 };
            })
          : unifiedSubpackages;
        const packageWithAlignedSubs = { ...selectedPackage, subpackages: alignedSubpackages };
        return { developer, data: [packageWithAlignedSubs] };
      });
    }
    return [];
  };

  const developersDataForChart = formatDevelopersData();

  // Render appropriate chart based on current view
  if (currentView === 'topLevel') {
    drawTopLevel(
      svg,
      developersDataForChart as { developer: AuthorType; data: Package[] }[],
      radius,
      colorScheme,
      handlePackageSelect,
      tooltipRef,
      individualDeveloperData,
      selectedDevelopers,
    );
  } else if (currentView === 'subpackage' && selectedPackage) {
    drawSubpackages(
      svg,
      developersDataForChart as { developer: AuthorType; data: Package[] }[],
      radius,
      colorScheme,
      handleBackNavigation,
      handlePackageSelect,
      tooltipRef,
      individualDeveloperData,
      selectedDevelopers,
      breadcrumbs,
    );
  }
}

export default RadarChart;
