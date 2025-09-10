'use strict';

import { useEffect, useState } from 'react';
import _ from 'lodash';
import * as zoomUtils from '../../../../../components/utils/zoom';
import Segment, { DevData } from './Segment';
import { BranchSettings } from '../settings/settings.tsx';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles.module.scss';
import { DataState } from '../reducer';
import { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { getBranches } from '../saga/helper.ts';
import { setCurrentBranch } from '../reducer';
import chroma from 'chroma-js';

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

function Chart(properties: VisualizationPluginProperties<BranchSettings, DataPluginCommit>) {
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
    if (!data?.ownership || data.ownership.length === 0) return;

    const { currentOwnership, totalLinesAdded } = calculateOwnershipMetrics(data.ownership);
    const devDataMap: Record<string, DevData> = {};
    let maxCommitsPerDev = 0;

    // Group builds by developer
    const commitsByDev = _.groupBy(data.builds, 'user.gitSignature');
    const devsWithCommits = Object.entries(commitsByDev).filter(([, commits]) => commits.length > 0);

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
  }, [radius, data, properties.settings, properties.plugin?.branch]);

  return (
    <>
      <div
        ref={properties.chartContainerRef}
        className={styles.chartContainer}
        style={{ width: '100%', height: '100%', position: 'relative' }}>
        {dataState === DataState.EMPTY && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE && (!data?.ownership || data.ownership.length === 0) && (
          <div>No data available for this branch</div>
        )}
        {dataState === DataState.COMPLETE && data?.ownership && data.ownership.length > 0 && (
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

function calculateOwnershipMetrics(ownershipData: DataPluginOwnership[]): {
  currentOwnership: { [developer: string]: number };
  totalLinesAdded: { [developer: string]: number };
} {
  const currentOwnership: { [filePath: string]: { [developer: string]: number } } = {};
  const developerCurrentTotals: { [developer: string]: number } = {};
  const developerAddedTotals: { [developer: string]: number } = {};

  for (const commit of ownershipData) {
    for (const file of commit.files) {
      if (!currentOwnership[file.path]) {
        currentOwnership[file.path] = {};
      }

      if (file.action === 'deleted') {
        delete currentOwnership[file.path];
        continue;
      }

      const fileOwnership: { [developer: string]: number } = {};

      for (const ownership of file.ownership) {
        if (!fileOwnership[ownership.user]) {
          fileOwnership[ownership.user] = 0;
        }

        for (const hunk of ownership.hunks) {
          for (const lineRange of hunk.lines) {
            const lineCount = lineRange.to - lineRange.from + 1;
            fileOwnership[ownership.user] += lineCount;

            if (!developerAddedTotals[ownership.user]) {
              developerAddedTotals[ownership.user] = 0;
            }
            developerAddedTotals[ownership.user] += lineCount;
          }
        }
      }

      currentOwnership[file.path] = fileOwnership;
    }
  }

  for (const filePath in currentOwnership) {
    for (const developer in currentOwnership[filePath]) {
      if (!developerCurrentTotals[developer]) {
        developerCurrentTotals[developer] = 0;
      }
      developerCurrentTotals[developer] += currentOwnership[filePath][developer];
    }
  }

  return {
    currentOwnership: developerCurrentTotals,
    totalLinesAdded: developerAddedTotals,
  };
}

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
