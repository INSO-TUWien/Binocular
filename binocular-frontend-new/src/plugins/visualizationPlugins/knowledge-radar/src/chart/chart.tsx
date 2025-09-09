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

type ColorScheme = {
  grid: string;
  text: string;
};

function RadarChart(properties: VisualizationPluginProperties<SettingsType, DataPluginCommit>) {
  const chartSizeFactor = 0.62;

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
  const [packageHistory, setPackageHistory] = useState<PackageHistory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['./']);

  const [developerKnowledge] = useState<Package[]>([]);
  const [individualDeveloperData, setIndividualDeveloperData] = useState<Map<string, Package[]>>(new Map());
  const [authorList, setAuthorList] = useState<AuthorType[]>(properties.authorList);
  const [selectedDevelopers, setSelectedDevelopers] = useState<AuthorType[]>([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const center: Center = { x: dimensions.width / 2, y: dimensions.height / 2 };
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (properties.dataConnection && properties.parameters.parametersDateRange) {
      dispatch(dataSlice.actions.setDateRange(properties.parameters.parametersDateRange));
    }
  }, [properties.parameters]);

  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [properties.dataConnection]);

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

  useEffect(() => {
    setAuthorList(properties.authorList);
    updateSelectedDevelopers(properties.authorList);
  }, [properties.authorList]);

  useEffect(() => {
    if (!properties.chartContainerRef.current) return;
    setupResizeObserver(properties.chartContainerRef.current, setDimensions);
    return () => {
      if (properties.chartContainerRef.current) {
        // cleanup handled in setupResizeObserver
      }
    };
  }, [properties.chartContainerRef]);

  useEffect(() => {
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions]);

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

  function updateSelectedDevelopers(authorList: AuthorType[]) {
    setSelectedDevelopers((prev) =>
      prev.filter((developer) => authorList.some((author) => author.user.gitSignature === developer.user.gitSignature)),
    );
  }

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

  const handleAuthorsChange = (authors: AuthorType[]): void => {
    setSelectedDevelopers((prev) => (_.isEqual(prev, authors) ? prev : authors));
  };

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

  d3.select(svgElement).selectAll('*').remove();

  const svg = d3
    .select(svgElement)
    .append('g')
    .attr('transform', `translate(${center.x}, ${center.y + radius * 0.2})`);

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

  const formatDevelopersData = () => {
    if (currentView === 'topLevel') {
      const allPackageNames = new Set<string>();
      selectedDevelopers.forEach((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        devData.forEach((pkg) => allPackageNames.add(pkg.name));
      });
      const unifiedPackages = Array.from(allPackageNames).map((name) => ({
        name,
        score: 0,
        subpackages: [] as SubPackage[],
      }));
      return selectedDevelopers.map((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const alignedData = unifiedPackages.map((unifiedPkg) => {
          const devPkg = devData.find((p) => p.name === unifiedPkg.name);
          return devPkg || { ...unifiedPkg, score: 0 };
        });
        return { developer, data: alignedData };
      });
    } else if (currentView === 'subpackage' && selectedPackage) {
      const allSubpackageNames = new Set<string>();
      selectedDevelopers.forEach((developer) => {
        const devData = individualDeveloperData.get(developer.user.gitSignature) || [];
        const devPackage = findPackageByPath(devData, breadcrumbs.slice(1));
        devPackage?.subpackages?.forEach((subPkg) => allSubpackageNames.add(subPkg.name));
      });
      const unifiedSubpackages = Array.from(allSubpackageNames).map((name) => ({
        name,
        score: 0,
        subpackages: [] as SubPackage[],
      }));
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
