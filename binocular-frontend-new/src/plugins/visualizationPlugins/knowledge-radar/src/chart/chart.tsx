import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
import { colorScheme } from './colorScheme';
import { drawTopLevel, drawSubpackages } from './drawRadarChart.ts';
import { createGradients } from './utils';
import { Center, Dimensions, Package, PackageHistory, SubPackage } from "./type.ts";
import { Properties } from "../../../../interfaces/visualizationPluginInterfaces/properties.ts";
import { SettingsType } from "../settings/settings.tsx";
import AuthorSelection from './authorSelection.tsx';
import {AuthorType} from "../../../../../types/data/authorType.ts";
import {useDispatch, useSelector} from "react-redux";
import { dataSlice, DataState } from '../reducer';
import chroma from "chroma-js";
import {FileListElementType} from "../../../../../types/data/fileListType.ts";
import {DataPluginCommitFile} from "../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts";
// Removing unused import
import _ from 'lodash';

function RadarChart(properties: Properties<SettingsType, DataPluginCommitFile>) {
  const chartSizeFactor = 0.62;

  // Redux setup
  type RootState = ReturnType<typeof properties.store.getState>;
  type AppDispatch = typeof properties.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.data);
  const dataState = useSelector((state: RootState) => state.dataState);

  // Chart state
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);

  // Navigation state
  const [currentView, setCurrentView] = useState<'topLevel' | 'subpackage'>('topLevel');
  const [selectedPackage, setSelectedPackage] = useState<Package | SubPackage | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['./']);

  // Data state
  const [developerKnowledge, setDeveloperKnowledge] = useState<Package[]>([]);
  const [authorList, setAuthorList] = useState<AuthorType[]>(properties.authorList);
  const [selectedDeveloper, setSelectedDeveloper] = useState<AuthorType | null>(
    properties.authorList.filter(author => author.selected)[0] || null
  );

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

  // Process data for selected developer
  useEffect(() => {
    if (!selectedDeveloper) return;

    // Extract files touched by selected developer
    const touchedFiles = extractTouchedFiles(data, selectedDeveloper, properties.fileList);

    // Convert to package structure
    setDeveloperKnowledge(convertToPackageStructure(touchedFiles));

    // Reset navigation
    resetNavigation();
  }, [data, properties, selectedDeveloper]);

  // Handle author list changes
  useEffect(() => {
    setAuthorList(properties.authorList);
    updateSelectedDeveloper(properties.authorList);
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

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || !selectedDeveloper) return;
    drawChart(svgRef.current, {
      center,
      radius,
      dimensions,
      currentView,
      selectedPackage,
      breadcrumbs,
      developerKnowledge,
      selectedDeveloper,
      colorScheme,
      handlePackageSelect,
      handleBackNavigation
    });
  }, [
    dimensions,
    radius,
    currentView,
    selectedPackage,
    breadcrumbs,
    packageHistory,
    developerKnowledge,
    selectedDeveloper
  ]);

  function extractTouchedFiles(
    data: DataPluginCommitFile[],
    developer: AuthorType,
    fileList?: FileListElementType[]
  ): FileListElementType[] {
    // Filter data for the selected developer
    const filteredData = data.filter(
      (file: DataPluginCommitFile) => file.user.gitSignature === developer.user.gitSignature
    );

    // Extract all file paths from the filtered commits
    let touchedFiles: FileListElementType[] = [];
    filteredData.forEach((commit: DataPluginCommitFile) => {
      if (commit.files && Array.isArray(commit.files)) {
        commit.files.forEach((fileEntry: any) => {
          if (fileEntry.file && fileEntry.file.path) {
            touchedFiles.push({checked: true, element: fileEntry.file});
          }
        });
      }
    });

    // Remove duplicates
    touchedFiles = _.uniqBy(touchedFiles, file => file.element.path);

    if (fileList) {
      // Find which of these touched files are enabled in fileList
      const touchedPaths = new Set(touchedFiles.map(file => file.element.path));
      touchedFiles = fileList.filter(fileItem =>
        fileItem.checked && touchedPaths.has(fileItem.element.path)
      );
    }

    return touchedFiles;
  }

  function resetNavigation() {
    setSelectedPackage(null);
    setPackageHistory([]);
    setBreadcrumbs(['./']);
    setCurrentView('topLevel');
  }

  function updateSelectedDeveloper(authorList: AuthorType[]) {
    // Check if the current selectedDeveloper still exists
    const developerStillExists = authorList.some(
      author => selectedDeveloper && author.user.gitSignature === selectedDeveloper.user.gitSignature
    );

    if (!developerStillExists) {
      const selectedAuthors = authorList.filter(author => author.selected);
      setSelectedDeveloper(selectedAuthors[0] || null);
    }
  }

  function setupResizeObserver(element: HTMLElement, setDimensions: Function) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions((prevDimensions: Dimensions) => ({
          ...prevDimensions,
          width,
          height,
        }));
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }

  function convertToPackageStructure(fileList: FileListElementType[]): Package[] {
    const root: Record<string, any> = {};

    fileList.forEach(fileItem => {
      if (!fileItem.checked) return;

      const file = fileItem.element;
      const parts = file.path.split('/');
      let current = root;

      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          // File node
          current[part] = { name: part, score: Number((Math.random() * 0.9 + 0.1).toFixed(2)) };
        } else {
          // Directory node
          if (!current[part]) {
            current[part] = {
              name: part,
              score: Number((Math.random() * 0.9 + 0.1).toFixed(2)),
              children: {}
            };
          }
          current = current[part].children;
        }
      });
    });

    // Convert to array format
    return Object.values(root).map(convertNodeToPackage);
  }

  function convertNodeToPackage(node: any): Package {
    const pkg = {
      name: node.name,
      score: node.score,
      subpackages: [] as SubPackage[]
    };

    if (node.children && Object.keys(node.children).length > 0) {
      pkg.subpackages = Object.values(node.children).map(convertNodeToPackage);
    }

    return pkg;
  }

  // Handler functions
  const handleAuthorSelect = (author: AuthorType): void => {
    setSelectedDeveloper(author);
  };

  const handlePackageSelect = (pkg: Package | SubPackage) => {
    if (selectedPackage) {
      setPackageHistory([...packageHistory, {
        package: selectedPackage,
        parentName: breadcrumbs[breadcrumbs.length - 1]
      }]);
    }

    setSelectedPackage(pkg);
    setCurrentView('subpackage');
    setBreadcrumbs([...breadcrumbs, pkg.name]);
  };

  const handleBackNavigation = () => {
    if (packageHistory.length === 0) {
      resetNavigation();
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
        overflow: 'hidden'
      }}
    >
      {renderContent()}
    </div>
  );

  function renderContent() {
    if (dataState === DataState.EMPTY) {
      return <div>NoData</div>;
    }

    if (dataState === DataState.FETCHING) {
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
          }}
        >
          <AuthorSelection
            authorList={authorList}
            selectedAuthor={selectedDeveloper}
            onAuthorSelect={handleAuthorSelect}
            containerWidth={dimensions.width}
          />
        </div>
        <div style={{
          flex: 1,
          position: 'relative',
          minHeight: 0
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

// Separate function for drawing the chart to reduce component complexity
function drawChart(
  svgElement: SVGSVGElement,
  options: {
    center: Center,
    radius: number,
    dimensions: Dimensions,
    currentView: string,
    selectedPackage: Package | SubPackage | null,
    breadcrumbs: string[],
    developerKnowledge: Package[],
    selectedDeveloper: AuthorType,
    colorScheme: any,
    handlePackageSelect: (pkg: Package | SubPackage) => void,
    handleBackNavigation: () => void
  }
) {
  const {
    center, radius, dimensions, currentView, selectedPackage, breadcrumbs,
    developerKnowledge, selectedDeveloper, colorScheme, handlePackageSelect, handleBackNavigation
  } = options;

  // Clear previous chart
  d3.select(svgElement).selectAll("*").remove();

  const svg = d3.select(svgElement)
    .append("g")
    .attr("transform", `translate(${center.x}, ${center.y+radius*0.2})`);

  // Add gradient definitions
  const defs = d3.select(svgElement).append("defs");
  createGradients(defs, selectedDeveloper);

  // Add background circle
  svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius * 1.2)
    .style("fill", "url(#radar-background-gradient)")
    .style("opacity", 0.8);

  // Draw breadcrumbs
  drawBreadcrumbs(svgElement, {
    radius,
    dimensions,
    breadcrumbs,
    center,
    selectedDeveloper
  });

  // Draw appropriate chart view
  if (currentView === 'topLevel') {
    drawTopLevel(svg, developerKnowledge, radius, colorScheme, selectedDeveloper, handlePackageSelect);
  } else if (currentView === 'subpackage' && selectedPackage) {
    drawSubpackages(svg, selectedPackage, radius, colorScheme, selectedDeveloper,
      handleBackNavigation, handlePackageSelect);
  }
}

// Separate function for drawing breadcrumbs
function drawBreadcrumbs(
  svgElement: SVGSVGElement,
  options: {
    radius: number,
    dimensions: Dimensions,
    breadcrumbs: string[],
    center: Center,
    selectedDeveloper: AuthorType
  }
) {
  const { radius, dimensions, breadcrumbs, center, selectedDeveloper } = options;
  const titleY = -radius * 1.35;

  const titleGroup = d3.select(svgElement)
    .append("g")
    .attr("class", "title-group");

  // Calculate responsive breadcrumb display
  const maxBreadcrumbLength = Math.max(20, Math.floor(dimensions.width / 20));
  const fullBreadcrumbText = breadcrumbs.join("/").replace(/^\.\/\//, './');
  const shortenedBreadcrumbs = fullBreadcrumbText.length > maxBreadcrumbLength
    ? "... / " + breadcrumbs.slice(Math.max(1, breadcrumbs.length - 2)).join("/")
    : fullBreadcrumbText;

  titleGroup.selectAll(".breadcrumbs-container").remove();

  const breadcrumbGroup = titleGroup.append("g")
    .attr("class", "breadcrumbs-container")
    .attr("transform", `translate(${dimensions.width / 2}, ${center.y + titleY})`);

  const responsiveFontSize = Math.max(radius * 0.07, 10);
  const charWidth = responsiveFontSize * 0.6;
  const textWidth = Math.max(100, Math.min(shortenedBreadcrumbs.length * charWidth, dimensions.width * 0.8));
  const padding = Math.max(10, dimensions.width * 0.02);

  // Background for breadcrumbs
  breadcrumbGroup.append("rect")
    .attr("x", -textWidth / 2 - padding / 2)
    .attr("y", -15)
    .attr("width", textWidth + padding)
    .attr("height", 25)
    .attr("rx", 12)
    .attr("ry", 12)
    .style("fill", chroma(selectedDeveloper?.color.main || "#666").alpha(0.2).css())
    .style("stroke", selectedDeveloper?.color.main || "#666")
    .style("stroke-width", "1px");

  const textGroup = breadcrumbGroup.append("g");

  if (fullBreadcrumbText.length > maxBreadcrumbLength) {
    textGroup.append("title").text(fullBreadcrumbText);
  }

  textGroup.append("text")
    .attr("class", "breadcrumbs")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", `${responsiveFontSize}px`)
    .style("fill", "#333")
    .style("font-weight", "bold")
    .text(shortenedBreadcrumbs)
    .style("opacity", 0)
    .transition()
    .duration(600)
    .style("opacity", 1);
}

export default RadarChart;
