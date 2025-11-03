'use strict';

import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import Segment from './Segment';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles.module.scss';
import { getBranches } from '../saga/helper.ts';
import { setCurrentBranch, DataState } from '../reducer';
import type { ExpertiseData } from '../reducer';
import chroma from 'chroma-js';

import type { DevData } from './Segment';
import type { BranchSettings } from '../settings/settings.tsx';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { DataPluginCommitBuild, DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { AuthorType } from '../../../../../types/data/authorType.ts';
import type { FileListElementType } from '../../../../../types/data/fileListType.ts';

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

interface Center {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Main chart component that renders a pie chart visualization showing code ownership and expertise metrics.
 * Uses segments to represent different developers' contributions with sizing based on lines added.
 *
 * @param props - Visualization plugin properties containing settings, data connection, and store
 * @returns JSX element containing the chart visualization
 */
function Chart(props: VisualizationPluginProperties<BranchSettings, ExpertiseData>): React.JSX.Element {
  const chartSizeFactor = 0.68;

  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);

  // Local state for processed data
  const [rawData, setrawData] = useState<ExpertiseData | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [segments, setSegments] = useState<React.JSX.Element[]>([]);

  const center: Center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  // Process Redux data into local state when it changes
  useEffect(() => {
    if (data && data.ownershipData && data.buildsData && data.ownershipData.rawData) {
      setrawData({
        ownershipData: data.ownershipData,
        buildsData: data.buildsData,
      });
    }
  }, [data]);

  // Use ResizeObserver to update dimensions when container size changes
  useEffect(() => {
    if (!props.chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Only update if dimensions are valid
        if (width > 0 && height > 0) {
          setDimensions((prevDimensions) => ({
            ...prevDimensions,
            width,
            height,
          }));
        }
      }
    });

    resizeObserver.observe(props.chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [props.chartContainerRef]);

  // Update radius when dimensions change
  useEffect(() => {
    const newRadius = (Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor;
    setRadius(Math.max(newRadius, 10));
  }, [dimensions]);

  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataConnection]);

  useEffect(() => {
    void getBranches(props.dataConnection).then((branches) => (props.settings.allBranches = branches));
  }, [props.dataConnection]);

  useEffect(() => {
    dispatch(setCurrentBranch(props.settings.currentBranch ? props.settings.currentBranch : 0));
  }, [props.settings.currentBranch]);

  useEffect(() => {
    if (!rawData?.ownershipData?.rawData || rawData.ownershipData.rawData.length === 0) return;

    drawChart({
      data: rawData,
      props,
      radius,
      setSegments,
    });
  }, [dimensions, radius, rawData, props]);

  /**
   * Renders the appropriate content based on current data state.
   * Shows loading spinner, no data message, or the main chart interface.
   */
  function renderContent(): React.JSX.Element {
    if (dataState === DataState.FETCHING) {
      return (
        <div className="flex justify-center items-center h-full">
          <span className="loading loading-spinner loading-lg text-accent"></span>
        </div>
      );
    }

    // Check rawData instead of data for rendering decisions
    if (dataState !== DataState.FETCHING && (!rawData?.ownershipData?.rawData || rawData.ownershipData.rawData.length === 0)) {
      return <div>No data available for this branch</div>;
    }

    if (dataState !== DataState.FETCHING && rawData?.ownershipData?.rawData && rawData.ownershipData.rawData.length > 0) {
      return (
        <svg
          className={styles.chart}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet">
          <g transform={`translate(${center.x}, ${center.y})`}>
            {segments}
            <circle cx="0" cy="0" r={radius / 3} stroke={'#666666'} fill={'var(--color-base-100)'} />
          </g>
        </svg>
      );
    }

    return <div>No data available</div>;
  }

  return (
    <div ref={props.chartContainerRef} className={styles.chartContainer} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {renderContent()}
    </div>
  );
}

/**
 * Main chart drawing function that orchestrates the visualization rendering.
 * Processes ownership data and creates chart segments for each developer.
 */
function drawChart(options: {
  data: ExpertiseData;
  props: VisualizationPluginProperties<BranchSettings, ExpertiseData>;
  radius: number;
  setSegments: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>;
}): void {
  const { data, props, radius, setSegments } = options;
  const { currentOwnership, totalLinesAdded } = calculateOwnershipMetrics(
    data.ownershipData.rawData || [],
    data.buildsData,
    props.fileList,
  );
  const devDataMap: Record<string, DevData> = {};
  let maxCommitsPerDev = 0;

  // Group builds by developer
  const commitsByDev = _.groupBy(data.buildsData, 'user.gitSignature');

  // Create DevData for each developer with commits
  Object.keys(currentOwnership).forEach((devName) => {
    const devCommits = commitsByDev[devName] || [];

    // Skip developers with no commits
    if (devCommits.length === 0) return;

    devDataMap[devName] = {
      commits: devCommits,
      additions: totalLinesAdded[devName] || 0,
      linesOwned: currentOwnership[devName] || 0,
    };

    if (devCommits.length > maxCommitsPerDev) {
      maxCommitsPerDev = devCommits.length;
    }
  });

  const newSegments: React.JSX.Element[] = [];
  let totalPercent = 0;

  const totalAdditions = Object.values(devDataMap).reduce((total, dev) => total + (dev.additions || 0), 0);
  const sortedDevs = Object.entries(devDataMap).sort((a, b) => (b[1].additions || 0) - (a[1].additions || 0));

  sortedDevs.forEach(([devName, devData]) => {
    if (!devData.additions || devData.additions === 0) return;

    const segmentSize = devData.additions / totalAdditions;
    const startPercent = totalPercent;
    const endPercent = totalPercent + segmentSize;
    totalPercent = endPercent;
    const palette = generatePalette(props.authorList);
    const devColor = palette[devName]?.main || '#cccccc';
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
}

/**
 * Calculates ownership metrics for developers based on commit history and current file ownership.
 * Processes ownership data sequentially to determine current line ownership and total additions.
 *
 * @param ownershipData - Array of ownership data from commits showing file ownership changes
 * @param commitsWithBuilds - Array of commits with build information for calculating additions
 * @param fileList - List of files with selection status to filter relevant files (optional)
 * @returns Object containing current ownership totals and total lines added per developer
 */
function calculateOwnershipMetrics(
  ownershipData: DataPluginOwnership[],
  commitsWithBuilds: DataPluginCommitBuild[],
  fileList?: FileListElementType[],
): {
  currentOwnership: { [developer: string]: number };
  totalLinesAdded: { [developer: string]: number };
} {
  const developerCurrentTotals: { [developer: string]: number } = {};
  const developerAddedTotals: { [developer: string]: number } = {};

  // Sum up all additions per developer from all commitsWithBuilds
  for (const commit of commitsWithBuilds) {
    // safety check so website does not crash if commit has no user
    if (commit.user) {
      const developer = commit.user.gitSignature;
      if (!developerAddedTotals[developer]) {
        developerAddedTotals[developer] = 0;
      }
      developerAddedTotals[developer] += commit.stats.additions || 0;
    }
  }

  // Stores the current ownership distribution for each file
  const fileCache: { [filePath: string]: { [developer: string]: number } } = {};

  // Step through the commits sequentially, starting with the oldest one
  for (const commit of ownershipData) {
    for (const file of commit.files) {
      if (file.action === 'deleted') {
        delete fileCache[file.path];
      } else {
        // If fileList is not defined, include all files; otherwise check if file is selected
        const relevant = !fileList || fileList.find((item) => item.element.path === file.path)?.checked;
        if (relevant) {
          const fileOwnership: { [developer: string]: number } = {};
          for (const ownership of file.ownership) {
            if (!fileOwnership[ownership.user]) {
              fileOwnership[ownership.user] = 0;
            }
            for (const hunk of ownership.hunks) {
              for (const lineRange of hunk.lines) {
                const lineCount = lineRange.to - lineRange.from + 1;
                fileOwnership[ownership.user] += lineCount;
              }
            }
          }
          fileCache[file.path] = fileOwnership;
        }
      }
    }
  }

  for (const [, fileOwnershipData] of Object.entries(fileCache)) {
    for (const [developer, ownedLines] of Object.entries(fileOwnershipData)) {
      if (!developerCurrentTotals[developer]) {
        developerCurrentTotals[developer] = 0;
      }
      developerCurrentTotals[developer] += ownedLines;
    }
  }

  return {
    currentOwnership: developerCurrentTotals,
    totalLinesAdded: developerAddedTotals,
  };
}

/**
 * Generates a color palette for chart visualization based on selected authors.
 * Creates main and secondary color entries for each selected author.
 *
 * @param authors - Array of author objects with selection status and color information
 * @returns Palette object mapping author names to color schemes
 */
function generatePalette(authors: AuthorType[]): Palette {
  const palette: Palette = {};

  authors.forEach((author) => {
    if (!author.selected) return;

    const displayName = author.displayName || author.user.gitSignature;

    // Create palette entries for each metric
    palette[`${displayName}`] = {
      main: chroma(author.color.main).hex(),
      secondary: chroma(author.color.secondary).hex(),
    };
  });

  return palette;
}

export default Chart;
