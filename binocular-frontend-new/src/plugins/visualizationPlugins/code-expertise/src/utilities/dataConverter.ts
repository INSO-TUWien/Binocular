import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import chroma from 'chroma-js';
import _ from 'lodash';
import { ChartData, Palette } from '../../../simpleVisualizationPlugin/src/chart/chart.tsx';
import { DataPluginCommitBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts';


export function convertToChartData(
  commits: DataPluginCommitBuild[],
  props: Properties<SettingsType, DataPluginCommitBuild>
): {
  chartData: ChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!commits || commits.length === 0) {
    return { 
      chartData: [{ date: Date.now() }], 
      scale: [0, 0], 
      palette: {} 
    };
  }

  const palette: Palette = generatePalette(props.authorList);
  
  // Create a single data point for the chart (since we're not tracking over time)
  const chartData: ChartData[] = [{
    date: Date.now() // Current timestamp as the date
  }];
  
  // Calculate total commits for relative metrics
  const totalCommits = commits.length || 1; // Avoid division by zero
  
  // Group data by developer's git signature
  const groupedByDeveloper = _.groupBy(commits, commit => commit.user.gitSignature);
  
  // Track min/max values for scaling
  let maxValue = 0;
  
  // Process data for each selected author
  props.authorList.forEach(author => {
    if (!author.selected) return;
    
    const displayName = author.displayName || author.user.gitSignature;
    const developerCommits = groupedByDeveloper[author.user.gitSignature] || [];
    
    // Calculate metrics
    const totalAdditions = _.sumBy(developerCommits, commit => commit.stats?.additions || 0);
    const linesOwned = totalAdditions;
    const relativeCommits = developerCommits.length / totalCommits;
    
    // Add metrics to chart data
    chartData[0][`${displayName} - Total Additions`] = totalAdditions;
    chartData[0][`${displayName} - Lines Owned`] = linesOwned;
    chartData[0][`${displayName} - Relative Commits`] = relativeCommits;
    
    // Update max value for scaling
    maxValue = Math.max(maxValue, totalAdditions, linesOwned, relativeCommits);
  });
  
  // Set scale with some padding
  const scale = [0, Math.ceil(maxValue * 1.1) || 1];
  
  return { chartData, scale, palette };
}

function generatePalette(authors: AuthorType[]): Palette {
  const palette: Palette = {};

  authors.forEach((author) => {
    if (!author.selected) return;

    const displayName = author.displayName || author.user.gitSignature;

    // Create palette entries for each metric
    palette[`${displayName}`] = {
      main: chroma(author.color.main).hex(),
      secondary: chroma(author.color.secondary).hex()
    };
  });

  return palette;
}
