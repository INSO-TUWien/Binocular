// File: RadarChart.tsx
// -------------------
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';

// Import from our files
import { colorScheme } from './colorScheme';
import { drawTopLevel, drawSubpackages } from './drawRadarChart.ts'; // Updated import from combined file
import { createGradients } from './utils';
import { developerKnowledge } from './sampleData.ts';
import {Center, Dimensions, Package, PackageHistory, SubPackage} from "./type.ts";
import {DataPluginCommitBuild} from "../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts";
import {Properties} from "../../../../interfaces/visualizationPluginInterfaces/properties.ts";
import {SettingsType} from "../settings/settings.tsx";

function RadarChart(properties: Properties<SettingsType, DataPluginCommitBuild>) {
  const chartSizeFactor = 0.64;

  // Local state
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [currentView, setCurrentView] = useState<'topLevel' | 'subpackage'>('topLevel');
  const [selectedPackage, setSelectedPackage] = useState<Package | SubPackage | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Binocular']);

  const svgRef = useRef<SVGSVGElement>(null);

  const center: Center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
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
      setBreadcrumbs(['Home']);
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
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${center.x}, ${center.y*1.12})`);

    // Add gradient definitions
    const defs = d3.select(svgRef.current).append("defs");
    createGradients(defs, colorScheme);

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

    // Main title
    titleGroup.append("text")
      .attr("class", "chart-title")
      .attr("x", dimensions.width / 2)
      .attr("y", center.y + titleY)
      .attr("text-anchor", "middle")
      .style("font-size", `${radius * 0.13}px`)
      .style("font-weight", "bold")
      .style("fill", colorScheme.text)
      .text(`${properties.authorList[0].user.gitSignature}'s Knowledge`);

    // Breadcrumbs
    titleGroup.append("text")
      .attr("class", "breadcrumbs")
      .attr("x", dimensions.width / 2)
      .attr("y", center.y + titleY + radius * 0.15)
      .attr("text-anchor", "middle")
      .style("font-size", `${radius * 0.10}px`)
      .style("fill", colorScheme.secondary)
      .text(breadcrumbs.join(" > "));

    if (currentView === 'topLevel') {
      drawTopLevel(svg, developerKnowledge, radius, colorScheme, handlePackageSelect);
    } else if (currentView === 'subpackage' && selectedPackage) {
      drawSubpackages(svg, selectedPackage, radius, colorScheme, handleBackNavigation, handlePackageSelect);
    }
  }, [dimensions, radius, currentView, selectedPackage, properties.authorList[0].displayName, breadcrumbs, packageHistory]);

  return (
    <div
      ref={properties.chartContainerRef}
      className={styles.chartContainer}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <svg
        ref={svgRef}
        className={styles.chart}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}

export default RadarChart;
