'use strict';

// Define interfaces for our data structure with recursive subpackages
export interface SubPackage {
  name: string;
  score: number;
  subpackages?: SubPackage[]; // Make subpackages optional and recursive
}

export interface Package {
  name: string;
  score: number;
  subpackages: SubPackage[];
}

// Define types for navigation
export interface PackageHistory {
  package: Package | SubPackage;
  parentName: string;
}

// Define types for the chart
export interface Center {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface RadarChartProps {
  chartContainerRef: React.RefObject<HTMLDivElement>;
  developerName?: string;
}
