'use strict';

import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import * as zoomUtils from '../../../../../components/utils/zoom';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
import Segment from './Segment';

// Define types
interface DevData {
  [key: string]: {
    additions: number;
    linesOwned?: number;
    commits: any[];
    [key: string]: any;
  };
}

interface ChartProps {}

interface Center {
  x: number;
  y: number;
}

// Implement getChartColors function directly
const getChartColors = (colorScheme: string, range: number[]): string[] => {
  // Using d3 color scales based on the provided scheme
  let colorScale;
  
  switch (colorScheme.toLowerCase()) {
    case 'spectral':
    colorScale = d3.scaleSequential(d3.interpolateSpectral);
    break;
    case 'viridis':
    colorScale = d3.scaleSequential(d3.interpolateViridis);
    break;
    case 'blues':
    colorScale = d3.scaleSequential(d3.interpolateBlues);
    break;
    case 'reds':
    colorScale = d3.scaleSequential(d3.interpolateReds);
    break;
    default:
    colorScale = d3.scaleSequential(d3.interpolateSpectral);
  }
  
  // Map the range to colors
  return range.map(i => {
    const normalizedValue = i / (range.length - 1 || 1);
    return colorScale(normalizedValue);
  });
};

const Chart: React.FC<ChartProps> = () => {
  const chartSizeFactor = 0.68;
  const containerRef = useRef<HTMLDivElement>(null);

  // Create dummy data for 2 developers
  const devData: DevData = {
    'Developer A': {
    additions: 1200,
    linesOwned: 800,
    commits: [
    { sha: 'abc123', message: 'Fix login bug', additions: 150, deletions: 50, status: 'success' },
    { sha: 'def456', message: 'Add new feature', additions: 300, deletions: 20, status: 'success' },
    { sha: 'ghi789', message: 'Refactor code', additions: 200, deletions: 100, status: 'failed' }
    ]
    },
    'Developer B': {
    additions: 800,
    linesOwned: 500,
    commits: [
    { sha: 'jkl012', message: 'Update documentation', additions: 250, deletions: 10, status: 'success' },
    { sha: 'mno345', message: 'Fix styling issues', additions: 100, deletions: 80, status: 'pending' }
    ]
    }
  };

  // Mock configuration
  const config = {
    mode: 'files',
    onlyDisplayOwnership: false
  };

  // Mock author colors with proper type definition to fix the indexing error
  const authorColors: Record<string, string> = {
    'Developer A': '#4882e0',
    'Developer B': '#e04848'
  };

  // Local state
  const [dimensions, setDimensions] = useState<zoomUtils.Dimensions>(zoomUtils.initialDimensions());
  const [radius, setRadius] = useState<number>((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [segments, setSegments] = useState<JSX.Element[]>([]);

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
    // Set radius to 40% of the container's smallest dimension
    // This ensures the chart only takes up 80% of the container (diameter = 2*radius)
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions]);

  // Only (re-)create segments if data changes
  useEffect(() => {
    // Total number of added lines by all users of the currently selected issue
    const additionsTotal = _.reduce(
    devData,
    (sum, adds) => {
    return sum + adds.additions;
    },
    0
    );

    const linesOwnedTotal = _.reduce(
    devData,
    (sum, data) => {
    if (data.linesOwned) {
    return sum + data.linesOwned;
    } else {
    return sum;
    }
    },
    0
    );

    // Get the maximum number of commits over all currently relevant devs
    let maxCommitsPerDev = 0;
    Object.entries(devData).forEach(([_, data]) => {
    const commits = data.commits.length;
    if (commits > maxCommitsPerDev) {
    maxCommitsPerDev = commits;
    }
    });

    const newSegments: JSX.Element[] = [];
    let totalPercent = 0;

    Object.entries(devData).forEach(([name, devData], index) => {
    const devAdditions = devData.additions;
    const devLinesOwned = devData.linesOwned;

    // We don't care about users that for example only have deletions for selected files
    if (devAdditions === 0) return;

    // At which point in a circle should the segment start
    const startPercent = totalPercent;

    // Adds the percentage of additions/ownership of the dev relative to all additions to the current percentage state
    if (config.onlyDisplayOwnership) {
    // Don't display a segment for a dev who does not own lines
    if (!devLinesOwned) {
    return;
    }
    totalPercent += devLinesOwned / linesOwnedTotal;
    } else {
    totalPercent += devAdditions / additionsTotal;
    }

    // At which point in a circle should the segment end
    const endPercent = totalPercent;

    // Get the color for this developer, with a fallback color if not found
    const devColor = authorColors[name] || '#cccc';

    newSegments.push(
    <Segment
    key={index}
    rad={radius}
    startPercent={startPercent}
    endPercent={endPercent}
    devName={name}
    devData={devData}
    devColor={devColor}
    maxCommitsPerDev={maxCommitsPerDev}
    />
    );
    });

    setSegments(newSegments);
  }, [radius]); // Only depend on radius since other dependencies are now constants

  return (
    <div ref={containerRef} className={styles.chartContainer} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* SVG container takes up 100% of parent to provide space for enlarged segments */}
      <svg 
        className={styles.chart} 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Center the chart in the SVG */}
        <g transform={`translate(${center.x}, ${center.y})`}>
          {segments}
          <circle cx="0" cy="0" r={radius / 3} stroke="black" fill="white" />
        </g>
      </svg>
    </div>
  );
};

export default Chart;