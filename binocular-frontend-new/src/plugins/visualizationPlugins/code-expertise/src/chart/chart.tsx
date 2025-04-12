// src/plugins/visualizationPlugins/code-expertise/src/chart/chart.tsx

'use strict';

import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import * as zoomUtils from '../../../../../components/utils/zoom';
import Segment from './Segment';
import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';
import { useSelector, useDispatch } from 'react-redux';
import styles from '../styles.module.scss';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { dataSlice } from '../reducer';
// Define types
export interface ChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

interface DevData {
  [key: string]: {
    additions: number;
    linesOwned?: number;
    commits: number;
    [key: string]: any;
  };
}


interface Center {
  x: number;
  y: number;
}

function Chart( properties: Properties<SettingsType, DataPluginCommit>) {
  const chartSizeFactor = 0.68;
  const containerRef = useRef<HTMLDivElement>(null);
  
  type RootState = ReturnType<typeof properties.store.getState>;
  type AppDispatch = typeof properties.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  // Local state
  const [dimensions, setDimensions] = useState<zoomUtils.Dimensions>(zoomUtils.initialDimensions());
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [segments, setSegments] = useState<JSX.Element[]>([]);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [palette, setChartPalette] = useState<Palette>({});

  const data = useSelector((state: RootState) => state.data);
  const dataState = useSelector((state: RootState) => state.dataState);

  const center: Center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  // Use ResizeObserver to update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions(prevDimensions => ({
          ...prevDimensions,
          width,
          height
        }));
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Update radius when dimensions change
  useEffect(() => {
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions]);

  useEffect(() => {
    console.log("data connection changed")
    dispatch({
      type: 'REFRESH',
    });
  }, [properties.dataConnection]);

  useEffect(() => {
    console.log(properties.parameters)
    dispatch(dataSlice.actions.setDateRange(properties.parameters.parametersDateRange));
  }, [properties.parameters]);

  useEffect(() => {
    console.log("data changed")
    console.log(data)
    const { chartData, scale, palette } = properties.dataConverter(data, properties);
    setChartData(chartData);
    setChartScale(scale);
    setChartPalette(palette);
  }, [data, properties]);

  // Process chartData into devData format
  useEffect(() => {
    console.log(chartData)
    if (!chartData || chartData.length === 0) return;
    
    // Extract the data point (we're only using one timestamp)
    const dataPoint = chartData[0];
    
    // Convert chartData to devData format
    const devData: DevData = {};
    
    // Get unique developer names from the data
    const developerNames = new Set<string>();
    Object.keys(dataPoint).forEach(key => {
      if (key === 'date') return;
      
      // Extract developer name from the key (format: "Developer Name - Metric")
      const parts = key.split(' - ');
      if (parts.length === 2) {
        developerNames.add(parts[0]);
      }
    });
    
    // Populate devData with metrics for each developer
    developerNames.forEach(devName => {
      devData[devName] = {
        additions: dataPoint[`${devName} - Total Additions`] || 0,
        linesOwned: dataPoint[`${devName} - Lines Owned`] || 0,
        commits: dataPoint[`${devName} - Relative Commits`] || 0
      };
    });
    
    // Calculate totals for percentages
    const additionsTotal = _.reduce(
      devData,
      (sum, data) => sum + data.additions,
      0
    );
    
    const linesOwnedTotal = _.reduce(
      devData,
      (sum, data) => sum + (data.linesOwned || 0),
      0
    );
    
    // Get the maximum relative commits value
    let maxCommitsValue = 0;
    Object.values(devData).forEach(data => {
      if (data.commits > maxCommitsValue) {
        maxCommitsValue = data.commits;
      }
    });
    
    // Create segments
    const newSegments: JSX.Element[] = [];
    let totalPercent = 0;
    
    // Config from properties
    const config = {
      onlyDisplayOwnership: false
    };
    
    Object.entries(devData).forEach(([name, data], index) => {
      const devAdditions = data.additions;
      const devLinesOwned = data.linesOwned;
      
      // Skip developers with no additions
      if (devAdditions === 0) return;
      
      // Calculate segment percentages
      const startPercent = totalPercent;
      
      if (config.onlyDisplayOwnership) {
        // Don't display a segment for a dev who does not own lines
        if (!devLinesOwned) return;
        totalPercent += devLinesOwned / linesOwnedTotal;
      } else {
        totalPercent += devAdditions / additionsTotal;
      }
      
      const endPercent = totalPercent;
      
      // Get color from palette
      const metricKey = `${name} - Total Additions`;
      const devColor = palette[metricKey]?.main || '#cccc';
      
      newSegments.push(
        <Segment
          key={index}
          rad={radius}
          startPercent={startPercent}
          endPercent={endPercent}
          devName={name}
          devData={data}
          devColor={devColor}
          maxCommitsPerDev={maxCommitsValue}
        />
      );
    });
    
    setSegments(newSegments);
  }, [chartData, palette, radius, properties.settings]);

  return (
    <>
      <div ref={containerRef} className={styles.chartContainer} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <svg 
          className={styles.chart} 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${center.x}, ${center.y})`}>
            {segments}
            <circle cx="0" cy="0" r={radius / 3} stroke="black" fill="white" />
          </g>
        </svg>
      </div>
    </>
  );
};



export default Chart;