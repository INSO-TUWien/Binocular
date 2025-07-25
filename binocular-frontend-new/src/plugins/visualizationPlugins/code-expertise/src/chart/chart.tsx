"use strict";

import { useState, useEffect, useRef } from "react";
import _ from "lodash";
import * as zoomUtils from "../../../../../components/utils/zoom";
import Segment from "./Segment";
import { SettingsType } from "../settings/settings.tsx";
import { useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.scss";
import { dataSlice, DataState } from "../reducer";
import { DevData } from "./Segment";
import { DataPluginCommitBuild } from "../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts";
import { VisualizationPluginProperties } from "../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts";

// Define types
export interface ChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

interface Center {
  x: number;
  y: number;
}

function Chart(
  properties: VisualizationPluginProperties<
    SettingsType,
    DataPluginCommitBuild
  >,
) {
  const chartSizeFactor = 0.68;

  type RootState = ReturnType<typeof properties.store.getState>;
  type AppDispatch = typeof properties.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  // Local state
  const [dimensions, setDimensions] = useState<zoomUtils.Dimensions>(
    zoomUtils.initialDimensions(),
  );
  const [radius, setRadius] = useState<number>(
    (Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor,
  );
  const [segments, setSegments] = useState<JSX.Element[]>([]);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [palette, setChartPalette] = useState<Palette>({});

  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);

  const center: Center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
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
    setRadius(
      (Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor,
    );
  }, [dimensions]);

  useEffect(() => {
    dispatch({
      type: "REFRESH",
    });
  }, [properties.dataConnection]);

  useEffect(() => {
    dispatch(
      dataSlice.actions.setDateRange(properties.parameters.parametersDateRange),
    );
  }, [properties.parameters]);

  useEffect(() => {
    const { chartData, scale, palette } = properties.dataConverter(
      data,
      properties,
    );
    console.log(chartData);
    setChartData(chartData);
    setChartPalette(palette);
  }, [data, properties]);

  // Process chartData into devData format
  useEffect(() => {
    if (!chartData || chartData.length === 0 || !data || data.length === 0)
      return;

    // Extract the data point (we're only using one timestamp)
    const dataPoint = chartData[0];

    // Get unique developer names from the data
    const developerNames = new Set<string>();
    Object.keys(dataPoint).forEach((key) => {
      if (key === "date") return;

      // Extract developer name from the key (format: "Developer Name - Metric")
      const parts = key.split(" - ");
      if (parts.length === 2) {
        developerNames.add(parts[0]);
      }
    });

    // Group commits by developer
    const commitsByDev = _.groupBy(data, "user.gitSignature");

    // Create a map of developer data
    const devDataMap: Record<string, DevData> = {};
    let maxCommitsPerDev = 0;
    // Initialize devData for each developer
    developerNames.forEach((devName) => {
      const devCommits = commitsByDev[devName] || [];

      devDataMap[devName] = {
        commits: devCommits,
        additions: dataPoint[`${devName} - Total Additions`] || 0,
        linesOwned: dataPoint[`${devName} - Lines Owned`] || 0,
      };
      // Calculate max commits per developer
      if (devCommits.length > maxCommitsPerDev) {
        maxCommitsPerDev = devCommits.length;
      }
    });
    // Create segments
    const newSegments: JSX.Element[] = [];
    let totalPercent = 0;

    // Calculate total additions for percentage calculation
    const totalAdditions = Object.values(devDataMap).reduce(
      (total, dev) => total + (dev.additions || 0),
      0,
    );

    // Sort developers by additions to ensure consistent ordering
    const sortedDevs = Object.entries(devDataMap).sort(
      (a, b) => (b[1].additions || 0) - (a[1].additions || 0),
    );

    // Create a segment for each developer with additions
    sortedDevs.forEach(([devName, devData]) => {
      // Skip developers with no additions
      if (!devData.additions || devData.additions === 0) return;

      // Calculate segment percentages
      const segmentSize = devData.additions / totalAdditions;
      const startPercent = totalPercent;
      const endPercent = totalPercent + segmentSize;
      totalPercent = endPercent;

      // Get color from palette
      const metricKey = `${devName}`;
      const devColor = palette[metricKey]?.main || "#cccccc";
      newSegments.push(
        <Segment
          key={devName}
          rad={radius}
          startPercent={startPercent}
          endPercent={endPercent}
          devName={devName}
          devData={devData}
          devColor={devColor}
          maxCommitsPerDev={maxCommitsPerDev}
        />,
      );
    });

    setSegments(newSegments);
  }, [chartData, palette, radius, data, properties.settings]);

  return (
    <>
      <div
        ref={properties.chartContainerRef}
        className={styles.chartContainer}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        {dataState === DataState.EMPTY && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE && (
          <svg
            className={styles.chart}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform={`translate(${center.x}, ${center.y})`}>
              {segments}
              <circle
                cx="0"
                cy="0"
                r={radius / 3}
                stroke="black"
                fill="white"
              />
            </g>
          </svg>
        )}
      </div>
    </>
  );
}

export default Chart;
