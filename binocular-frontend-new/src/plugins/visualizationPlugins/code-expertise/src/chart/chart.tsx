'use strict';

import { useEffect, useState } from 'react';
import _ from 'lodash';
import * as zoomUtils from '../../../../../components/utils/zoom';
import Segment, { DevData } from './Segment';
import { BranchSettings } from '../settings/settings.tsx';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles.module.scss';
import { DataState, ExpertiseData } from '../reducer';
import { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { DataPluginCommitBuild, DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { getBranches } from '../saga/helper.ts';
import { setCurrentBranch } from '../reducer';
import chroma from 'chroma-js';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { FileListElementType } from '../../../../../types/data/fileListType.ts';

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

interface Center {
  x: number;
  y: number;
}

/**
 * Main chart component that renders a pie chart visualization showing code ownership and expertise metrics.
 * Uses segments to represent different developers' contributions with sizing based on lines added.
 *
 * @param properties - Visualization plugin properties containing settings, data connection, and store
 * @returns JSX element containing the chart visualization
 */
function Chart(properties: VisualizationPluginProperties<BranchSettings, ExpertiseData>) {
  const chartSizeFactor = 0.68;

  type RootState = ReturnType<typeof properties.store.getState>;
  type AppDispatch = typeof properties.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  // Local state
  const [dimensions, setDimensions] = useState<zoomUtils.Dimensions>(zoomUtils.initialDimensions());
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [segments, setSegments] = useState<JSX.Element[]>([]);

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

    resizeObserver.observe(properties.chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [properties.chartContainerRef]);

  // Update radius when dimensions change
  useEffect(() => {
    const newRadius = (Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor;
    setRadius(Math.max(newRadius, 10));
  }, [dimensions]);

  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [properties.dataConnection]);

  useEffect(() => {
    void getBranches(properties.dataConnection).then((branches) => (properties.settings.allBranches = branches));
  }, [properties.dataConnection]);

  useEffect(() => {
    dispatch(setCurrentBranch(properties.settings.currentBranch ? properties.settings.currentBranch : 0));
  }, [properties.settings.currentBranch]);

  useEffect(() => {
    if (!data?.ownershipData?.rawData || data.ownershipData.rawData.length === 0) return;

    const { currentOwnership, totalLinesAdded } = calculateOwnershipMetrics(
      data.ownershipData.rawData,
      data.buildsData,
      properties.fileList,
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

    const newSegments: JSX.Element[] = [];
    let totalPercent = 0;

    const totalAdditions = Object.values(devDataMap).reduce((total, dev) => total + (dev.additions || 0), 0);
    const sortedDevs = Object.entries(devDataMap).sort((a, b) => (b[1].additions || 0) - (a[1].additions || 0));

    sortedDevs.forEach(([devName, devData]) => {
      if (!devData.additions || devData.additions === 0) return;

      const segmentSize = devData.additions / totalAdditions;
      const startPercent = totalPercent;
      const endPercent = totalPercent + segmentSize;
      totalPercent = endPercent;
      const palette = generatePalette(properties.authorList);
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
  }, [dimensions, radius, data, properties.settings]);

  return (
    <>
      <div
        ref={properties.chartContainerRef}
        className={styles.chartContainer}
        style={{ width: '100%', height: '100%', position: 'relative' }}>
        {dataState === DataState.FETCHING && (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE && (!data?.ownershipData?.rawData || data.ownershipData.rawData.length === 0) && (
          <div>No data available for this branch</div>
        )}
        {dataState === DataState.COMPLETE && data?.ownershipData?.rawData && data.ownershipData.rawData.length > 0 && (
          <svg
            className={styles.chart}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet">
            <g transform={`translate(${center.x}, ${center.y})`}>
              {segments}
              <circle cx="0" cy="0" r={radius / 3} stroke="black" fill="white" />
            </g>
          </svg>
        )}
      </div>
    </>
  );
}

/**
 * Calculates ownership metrics for developers based on commit history and current file ownership.
 * Processes ownership data sequentially to determine current line ownership and total additions.
 *
 * @param ownershipData - Array of ownership data from commits showing file ownership changes
 * @param commitsWithBuilds - Array of commits with build information for calculating additions
 * @param fileList - List of files with selection status to filter relevant files
 * @returns Object containing current ownership totals and total lines added per developer
 */
function calculateOwnershipMetrics(
  ownershipData: DataPluginOwnership[],
  commitsWithBuilds: DataPluginCommitBuild[],
  fileList: FileListElementType[],
): {
  currentOwnership: { [developer: string]: number };
  totalLinesAdded: { [developer: string]: number };
} {
  const developerCurrentTotals: { [developer: string]: number } = {};
  const developerAddedTotals: { [developer: string]: number } = {};

  // Extract file paths from FileListElementType[] where checked is true
  const checkedFilePaths = fileList.filter((item) => item.checked).map((item) => item.element.path);
  const activeFiles: { [id: string]: boolean } = {};
  fileList.forEach((item) => {
    activeFiles[item.element.path] = item.checked;
  });

  // Calculate total additions from commits with builds
  for (const commit of commitsWithBuilds) {
    const developer = commit.user.gitSignature;

    if (!developerAddedTotals[developer]) {
      developerAddedTotals[developer] = 0;
    }

    if (commit.files.data.length === 0) continue;

    const affectedFiles = commit.files?.data?.filter((file) => checkedFilePaths.includes(file.file.path)) || [];

    if (affectedFiles.length > 0) {
      developerAddedTotals[developer] += commit.stats.additions || 0;
    }
  }

  // Stores the current ownership distribution for each file
  const fileCache: { [filePath: string]: { [developer: string]: number } } = {};

  // Step through the commits sequentially, starting with the oldest one
  for (const commit of ownershipData) {
    // Update fileCache for each file this commit touches
    for (const file of commit.files) {
      // If the file was deleted in this commit, delete it from the filecache
      if (file.action === 'deleted') {
        delete fileCache[file.path];
      } else {
        // If the file was either added or modified, we add it to the filecache (if it is relevant)
        const relevant = activeFiles[file.path];

        if (relevant) {
          // Reset file ownership for this commit
          const fileOwnership: { [developer: string]: number } = {};

          // Process ownership data using the new structure
          for (const ownership of file.ownership) {
            if (!fileOwnership[ownership.user]) {
              fileOwnership[ownership.user] = 0;
            }

            // Sum up lines from all hunks for this user
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

  // Now fileCache stores the final ownership for each file that exists and is active
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
