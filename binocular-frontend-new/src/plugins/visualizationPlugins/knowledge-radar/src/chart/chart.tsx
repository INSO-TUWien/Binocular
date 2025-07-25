import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
import { colorScheme } from './colorScheme';
import { drawSubpackages, drawTopLevel } from './drawRadarChart.ts';
import { createGradients, drawBreadcrumbs } from './utils';
import { Center, Dimensions, Package, PackageHistory, SubPackage } from './type.ts';
import { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { SettingsType } from '../settings/settings.tsx';
import AuthorSelection from './authorSelection.tsx';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { useDispatch, useSelector } from 'react-redux';
import { dataSlice, DataState } from '../reducer';
import _ from 'lodash';
import { calculateExpertiseBrowserScores } from '../utilities/dataConverter.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

function RadarChart(properties: VisualizationPluginProperties<SettingsType, DataPluginCommit>) {
  const chartSizeFactor = 0.62;

  // Redux setup
  type RootState = ReturnType<typeof properties.store.getState>;
  type AppDispatch = typeof properties.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);

  // Chart state
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 800,
    height: 600,
  });
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);

  // Navigation state
  const [currentView, setCurrentView] = useState<'topLevel' | 'subpackage'>('topLevel');
  const [selectedPackage, setSelectedPackage] = useState<Package | SubPackage | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['./']);

  // Data state
  const [developerKnowledge] = useState<Package[]>([]);
  // Store individual developer data for multi-developer view
  const [individualDeveloperData, setIndividualDeveloperData] = useState<Map<string, Package[]>>(new Map());
  const [authorList, setAuthorList] = useState<AuthorType[]>(properties.authorList);
  // Updated from single to multiple developers
  const [selectedDevelopers, setSelectedDevelopers] = useState<AuthorType[]>([]);
  // Add loading state for selection updates
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const center: Center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  // Fetch data when date range changes
  useEffect(() => {
    if (properties.dataConnection && properties.parameters.parametersDateRange) {
      dispatch(dataSlice.actions.setDateRange(properties.parameters.parametersDateRange));
    }
  }, [properties.parameters]);

  // Initial data fetch
  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [properties.dataConnection]);

  useEffect(() => {
    if (selectedDevelopers.length === 0) return;

    setIsProcessingSelection(true);

    // Calculate data for each developer and store individually
    const newIndividualData = new Map<string, Package[]>();
    if (data != undefined) {
      selectedDevelopers.forEach((developer) => {
        const devData = calculateExpertiseBrowserScores(data, developer.user.gitSignature);
        newIndividualData.set(developer.user.gitSignature, devData);
      });
      setIndividualDeveloperData(newIndividualData);

      // Reset navigation
      resetNavigation();

      setIsProcessingSelection(false);
    }
  }, [data, properties, selectedDevelopers]);

  // Handle author list changes
  useEffect(() => {
    setAuthorList(properties.authorList);
    updateSelectedDevelopers(properties.authorList);
  }, [properties.authorList]);

  // Handle resize
  useEffect(() => {
    if (!properties.chartContainerRef.current) return;
    setupResizeObserver(properties.chartContainerRef.current, setDimensions);

    return () => {
      if (properties.chartContainerRef.current) {
        // ResizeObserver cleanup is handled in setupResizeObserver
      }
    };
  }, [properties.chartContainerRef]);

  // Update radius when dimensions change
  useEffect(() => {
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions]);

  // Draw chart - updated to handle multiple developers
  useEffect(() => {
    if (!svgRef.current || selectedDevelopers.length === 0) return;
    drawChart(svgRef.current, {
      center,
      radius,
      dimensions,
      currentView,
      selectedPackage,
      breadcrumbs,
      developerKnowledge,
      individualDeveloperData,
      selectedDevelopers, // Pass all selected developers
      colorScheme,
      handlePackageSelect,
      handleBackNavigation,
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

  function resetNavigation() {
    // Only reset if we have a selected package and it's not in any of the new developer data
    if (selectedPackage && currentView === 'subpackage') {
      const packagePath = breadcrumbs.slice(1);
      let packageExists = false;

      // Check if the package exists in any of the selected developers' data
      for (const [, packages] of individualDeveloperData.entries()) {
        if (findPackageByPath(packages, packagePath)) {
          packageExists = true;
          break;
        }
      }

      // Only reset if the package doesn't exist in any developer's data
      if (!packageExists) {
        setSelectedPackage(null);
        setPackageHistory([]);
        setBreadcrumbs(['./']);
        setCurrentView('topLevel');
      }
    } else if (!selectedPackage) {
      // Always reset if no package is selected
      setSelectedPackage(null);
      setPackageHistory([]);
      setBreadcrumbs(['./']);
      setCurrentView('topLevel');
    }
  }

  // Updated to handle multiple developers
  function updateSelectedDevelopers(authorList: AuthorType[]) {
    // Filter out any developers that no longer exist in the author list
    setSelectedDevelopers((prev) =>
      prev.filter((developer) => authorList.some((author) => author.user.gitSignature === developer.user.gitSignature)),
    );
  }

  function setupResizeObserver(element: HTMLElement, setDimensions: (updater: (prevDimensions: Dimensions) => Dimensions) => void) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions((prevDimensions) => ({
          ...prevDimensions,
          width,
          height,
        }));
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }

  const handleAuthorsChange = (authors: AuthorType[]): void => {
    setSelectedDevelopers((prev) => (_.isEqual(prev, authors) ? prev : authors));
  };

  const handlePackageSelect = (pkg: Package | SubPackage) => {
    if (selectedPackage) {
      setPackageHistory([
        ...packageHistory,
        {
          package: selectedPackage,
          parentName: breadcrumbs[breadcrumbs.length - 1],
        },
      ]);
    }

    setSelectedPackage(pkg);
    setCurrentView('subpackage');
    setBreadcrumbs([...breadcrumbs, pkg.name]);
  };

  const handleBackNavigation = () => {
    if (packageHistory.length === 0) {
      setCurrentView('topLevel');
      setSelectedPackage(null);
      setBreadcrumbs(['/']);
    } else {
      const newHistory = [...packageHistory];
      const lastItem = newHistory.pop();

      if (lastItem) {
        setSelectedPackage(lastItem.package);
        setPackageHistory(newHistory);

        // Update breadcrumbs
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs.pop();
        setBreadcrumbs(newBreadcrumbs);
      }
    }
  };

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

  function renderContent() {
    if (dataState === DataState.EMPTY) {
      return <div>NoData</div>;
    }

    if (dataState === DataState.FETCHING || isProcessingSelection) {
      return (
        <div className="flex justify-center items-center h-full">
          <span className="loading loading-spinner loading-lg text-accent"></span>
        </div>
      );
    }

    return (
      <>
        <div
          className={styles.authorSelectorContainer}
          style={{
            padding: '8px 0',
            display: 'flex',
            justifyContent: 'center',
          }}>
          {/* Updated to use the new multi-select AuthorSelection */}
          <AuthorSelection
            authorList={authorList}
            selectedAuthors={selectedDevelopers}
            onAuthorsChange={handleAuthorsChange}
            containerWidth={dimensions.width}
          />
        </div>
        <div
          style={{
            flex: 1,
            position: 'relative',
            minHeight: 0,
          }}>
          <svg
            ref={svgRef}
            className={styles.chart}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </>
    );
  }
}

function findPackageByPath(packages: Package[], path: string[]): Package | null {
  if (path.length === 0 || packages.length === 0) return null;

  const targetName = path[0];
  const pkg = packages.find((p) => p.name === targetName);

  if (!pkg) return null;

  if (path.length === 1) return pkg;

  if (!pkg.subpackages || pkg.subpackages.length === 0) return null;

  return findPackageByPath(pkg.subpackages as Package[], path.slice(1));
}

// Updated to handle multiple developers with the correct data structure
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
    colorScheme: unknown;
    handlePackageSelect: (pkg: Package | SubPackage, parentName: string) => void;
    handleBackNavigation: () => void;
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
  } = options;

  // Use primary developer for UI elements
  const primaryDeveloper = selectedDevelopers[0];

  // Clear previous chart
  d3.select(svgElement).selectAll('*').remove();

  const svg = d3
    .select(svgElement)
    .append('g')
    .attr('transform', `translate(${center.x}, ${center.y + radius * 0.2})`);

  // Add gradient definitions
  const defs = d3.select(svgElement).append('defs');
  createGradients(defs, primaryDeveloper);

  // Add background circle
  svg
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius * 1.2)
    .style('fill', 'url(#radar-background-gradient)')
    .style('opacity', 0.8);

  // Draw breadcrumbs with primary developer
  drawBreadcrumbs(svgElement, {
    radius,
    dimensions,
    breadcrumbs,
    center,
    selectedDeveloper: primaryDeveloper,
  });

  // Format data for the radar chart based on view
  const formatDevelopersData = () => {
    if (currentView === 'topLevel') {
      // Create a union of all packages across developers
      const allPackageNames = new Set<string>();
      selectedDevelopers.forEach((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        devData.forEach((pkg) => allPackageNames.add(pkg.name));
      });

      // Create a unified structure with all package names
      const unifiedPackages = Array.from(allPackageNames).map((name) => {
        return { name, score: 0, subpackages: [] as SubPackage[] };
      });

      // Return developer data aligned with the unified package structure
      return selectedDevelopers.map((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        // Map developer data to the unified structure
        const alignedData = unifiedPackages.map((unifiedPkg) => {
          const devPkg = devData.find((p) => p.name === unifiedPkg.name);
          return devPkg || { ...unifiedPkg, score: 0 };
        });

        return {
          developer,
          data: alignedData,
        };
      });
    } else if (currentView === 'subpackage' && selectedPackage) {
      // For subpackage view, create a union of all subpackages across developers
      const allSubpackageNames = new Set<string>();

      // Collect all subpackage names from all developers
      selectedDevelopers.forEach((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const devPackage = findPackageByPath(devData, breadcrumbs.slice(1));
        if (devPackage && devPackage.subpackages) {
          devPackage.subpackages.forEach((subPkg) => allSubpackageNames.add(subPkg.name));
        }
      });

      // Create a unified subpackage structure
      const unifiedSubpackages = Array.from(allSubpackageNames).map((name) => {
        return { name, score: 0, subpackages: [] as SubPackage[] };
      });

      return selectedDevelopers.map((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const devPackage = findPackageByPath(devData, breadcrumbs.slice(1));

        // If developer has this package, align its subpackages with the unified structure
        let alignedSubpackages: SubPackage[];
        if (devPackage && devPackage.subpackages) {
          alignedSubpackages = unifiedSubpackages.map((unifiedSub) => {
            const devSub = devPackage.subpackages.find((s) => s.name === unifiedSub.name);
            return devSub || { ...unifiedSub, score: 0 };
          });
        } else {
          // Developer doesn't have this package, use unified structure with zero scores
          alignedSubpackages = unifiedSubpackages;
        }

        // Create a package object with aligned subpackages
        const packageWithAlignedSubs = {
          ...selectedPackage,
          subpackages: alignedSubpackages,
        };

        return {
          developer,
          data: [packageWithAlignedSubs],
        };
      });
    }
    return [];
  };

  const developersDataForChart = formatDevelopersData();

  // Draw appropriate chart view with properly formatted data
  if (currentView === 'topLevel') {
    drawTopLevel(
      svg,
      developersDataForChart as {
        developer: AuthorType;
        data: Package[];
      }[],
      radius,
      colorScheme,
      handlePackageSelect,
    );
  } else if (currentView === 'subpackage' && selectedPackage) {
    drawSubpackages(
      svg,
      developersDataForChart as { developer: AuthorType; data: Package[] }[],
      radius,
      colorScheme,
      handleBackNavigation,
      handlePackageSelect,
    );
  }
}

export default RadarChart;
