// File: RadarChart.tsx
// -------------------
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';

// Import from our files
import { colorScheme } from './colorScheme';
import { drawTopLevel, drawSubpackages } from './drawRadarChart.ts';
import { createGradients } from './utils';
import { developerKnowledge } from './sampleData.ts';
import { Center, Dimensions, Package, PackageHistory, SubPackage } from "./type.ts";
import { DataPluginCommitBuild } from "../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts";
import { Properties } from "../../../../interfaces/visualizationPluginInterfaces/properties.ts";
import { SettingsType } from "../settings/settings.tsx";
import AuthorSelection from './authorSelection.tsx';
import {AuthorType} from "../../../../../types/data/authorType.ts";

function RadarChart(properties: Properties<SettingsType, DataPluginCommitBuild>) {
  const chartSizeFactor = 0.65;

  // Local state
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [currentView, setCurrentView] = useState<'topLevel' | 'subpackage'>('topLevel');
  const [selectedPackage, setSelectedPackage] = useState<Package | SubPackage | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['/']);

  // Add selectedDeveloper state and authorList state
  const [authorList, setAuthorList] = useState<AuthorType[]>(properties.authorList);
  const [selectedDeveloper, setSelectedDeveloper] = useState<AuthorType | null>(
    properties.authorList.filter(author => author.selected).length > 0
      ? properties.authorList.filter(author => author.selected)[0]
      : null
  );

  const svgRef = useRef<SVGSVGElement>(null);

  // Update authorList when properties.authorList changes
  useEffect(() => {
    setAuthorList(properties.authorList);

    // Filter for selected authors
    const selectedAuthors = properties.authorList.filter(author => author.selected);

    // If the current selectedDeveloper is no longer in the list, or if there was no selection but now there are authors
    if (selectedAuthors.length > 0) {
      if (!selectedDeveloper || !selectedAuthors.some(author => author.id === selectedDeveloper.id)) {
        setSelectedDeveloper(selectedAuthors[0]);
      }
    } else {
      setSelectedDeveloper(null);
    }
  }, [properties.authorList]);

  const center: Center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  // Handle author selection
  const handleAuthorSelect = (author: AuthorType): void => {
    setSelectedDeveloper(author);
    // You can add additional logic here if needed when an author is selected
  };

  // Handle package selection
  const handlePackageSelect = (pkg: Package | SubPackage) => {
    if (selectedPackage) {
      // Add current package to history before navigating to new one
      setPackageHistory([...packageHistory, {
        package: selectedPackage,
        parentName: breadcrumbs[breadcrumbs.length - 1]
      }]);
    }

    setSelectedPackage(pkg);
    setCurrentView('subpackage');
    setBreadcrumbs([...breadcrumbs, pkg.name]);
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (packageHistory.length === 0) {
      // If no history, go back to top level
      setCurrentView('topLevel');
      setSelectedPackage(null);
      setBreadcrumbs(['/']);
    } else {
      // Pop the last item from history
      const newHistory = [...packageHistory];
      const lastItem = newHistory.pop();

      if (lastItem) {
        setSelectedPackage(lastItem.package);
        setPackageHistory(newHistory);

        // Update breadcrumbs
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs.pop(); // Remove current
        setBreadcrumbs(newBreadcrumbs);
      }
    }
  };

  // Use ResizeObserver to update dimensions when container size changes
  useEffect(() => {
    if (!properties.chartContainerRef.current) return;

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

    resizeObserver.observe(properties.chartContainerRef.current);

    return () => {
      if (properties.chartContainerRef.current) {
        resizeObserver.unobserve(properties.chartContainerRef.current);
      }
    };
  }, [properties.chartContainerRef]);

  // Update radius when dimensions change
  useEffect(() => {
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions]);

  // Draw the radar chart
  useEffect(() => {
    if (!svgRef.current || !selectedDeveloper) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${center.x}, ${center.y+radius*0.15})`);

    // Add gradient definitions
    const defs = d3.select(svgRef.current).append("defs");
    createGradients(defs, selectedDeveloper);

    // Add background circle
    svg.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius * 1.2)
      .style("fill", "url(#radar-background-gradient)")
      .style("opacity", 0.8);

    // Add title at the top with breadcrumbs
    const titleY = -radius * 1.35;
    const titleGroup = d3.select(svgRef.current)
      .append("g")
      .attr("class", "title-group");

    // Breadcrumbs
    titleGroup.append("text")
      .attr("class", "breadcrumbs")
      .attr("x", dimensions.width / 2)
      .attr("y", center.y + titleY)
      .attr("text-anchor", "middle")
      .style("font-size", `${radius * 0.10}px`)
      .style("fill", colorScheme.text)
      .style("font-weight", "bold")
      .text(breadcrumbs.join(" > "));

    if (currentView === 'topLevel') {
      drawTopLevel(svg, developerKnowledge, radius, colorScheme, selectedDeveloper,handlePackageSelect);
    } else if (currentView === 'subpackage' && selectedPackage) {
      drawSubpackages(svg, selectedPackage, radius, colorScheme, selectedDeveloper,handleBackNavigation, handlePackageSelect);
    }
  }, [dimensions, radius, currentView, selectedPackage, selectedDeveloper, breadcrumbs, packageHistory]);

  return (
    <div
      ref={properties.chartContainerRef}
      className={styles.chartContainer}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Prevent content from overflowing
      }}
    >
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
          containerWidth={dimensions.width} // Pass the width from dimensions
        />
      </div>

      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: 0 // Critical for flex child to respect parent boundaries
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
    </div>
  );
}

export default RadarChart;
