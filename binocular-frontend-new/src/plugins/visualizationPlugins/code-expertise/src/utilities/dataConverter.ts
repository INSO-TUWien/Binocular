// src/visualizations/code-expertise/utilities/dataConverter.ts

import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import chroma from 'chroma-js';
import _ from 'lodash';

interface CodeExpertiseChartData {
  developer: string;
  commits: number;
  lines: number;
  ownership: number;
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

export function convertToChartData(
  expertiseData: any[],
  props: Properties<SettingsType, any>,
  authors: AuthorType[]
): {
  chartData: CodeExpertiseChartData[];
  scale: { commits: number[]; lines: number[]; ownership: number[] };
  palette: Palette;
} {
  if (!expertiseData || expertiseData.length === 0) {
    return { 
      chartData: [], 
      scale: { commits: [0, 0], lines: [0, 0], ownership: [0, 0] }, 
      palette: {} 
    };
  }

  const palette: Palette = generatePalette(authors);
  const chartData = processExpertiseData(expertiseData, authors, props.settings);
  const scale = calculateScales(chartData);

  return { chartData, scale, palette };
}

function processExpertiseData(
  data: any[],
  authors: AuthorType[],
  settings: SettingsType
): CodeExpertiseChartData[] {
  const processedData: CodeExpertiseChartData[] = [];

  // Group data by developer
  const groupedByDeveloper = _.groupBy(data, 'developer');

  authors.forEach(author => {
    if (!author.selected) return;

    const developerData = groupedByDeveloper[author.user.gitSignature];
    if (developerData) {
      const aggregatedData = {
        developer: author.displayName || author.user.gitSignature,
        commits: _.sumBy(developerData, 'commits'),
        lines: _.sumBy(developerData, 'lines'),
        ownership: calculateOwnership(developerData)
      };

      processedData.push(aggregatedData);
    }
  });

  return processedData;
}

function calculateOwnership(developerData: any[]): number {
  // Reuse ownership calculation logic
  return developerData.reduce((total, current) => {
    const ownedLines = current.ownership?.reduce((sum: number, hunk: any) => 
      sum + hunk.lines.reduce((lineSum: number, line: any) => 
        lineSum + (line.to - line.from + 1), 0
      ), 0) || 0;
    return total + ownedLines;
  }, 0);
}

function generatePalette(authors: AuthorType[]): Palette {
  const palette: Palette = {};

  authors.forEach(author => {
    if (!author.selected) return;

    const displayName = author.displayName || author.user.gitSignature;
    palette[displayName] = {
      main: chroma(author.color.main).hex(),
      secondary: chroma(author.color.secondary).hex()
    };
  });

  // Add others category
  palette['others'] = {
    main: chroma('#555555').hex(),
    secondary: chroma('#777777').hex()
  };

  return palette;
}

function calculateScales(data: CodeExpertiseChartData[]) {
  return {
    commits: [0, Math.max(...data.map(d => d.commits))],
    lines: [0, Math.max(...data.map(d => d.lines))],
    ownership: [0, Math.max(...data.map(d => d.ownership))]
  };
}