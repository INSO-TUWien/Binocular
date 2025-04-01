import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import DotsPattern from '../../../../../components/svg/patterns/dots';
import HatchPattern from '../../../../../components/svg/patterns/hatch';


// Implement getChartColors function directly (copied from chart.tsx)
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

// Custom legend item component
const LegendItem = ({ color, color2, color3, text }: { color: string, color2?: string, color3?: string, text: string }) => {
  const ICON_WIDTH = 15;
  const ICON_HEIGHT = 15;
  
  const rects = [];
  
  if (color2) {
    if (color3) {
      rects.push(<rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} fill={color} key={`${color}-1`} />);
      rects.push(
        <rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} x={ICON_WIDTH / 3} fill={color2} key={`${color2}-2`} />
      );
      rects.push(
        <rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} x={(ICON_WIDTH / 3) * 2} fill={color3} key={`${color3}-3`} />
      );
    } else {
      rects.push(<rect width={ICON_WIDTH / 2} height={ICON_HEIGHT} fill={color} key={`${color}-1`} />);
      rects.push(
        <rect width={ICON_WIDTH / 2} height={ICON_HEIGHT} x={ICON_WIDTH / 2} fill={color2} key={`${color2}-2`} />
      );
    }
  } else {
    rects.push(<rect width={ICON_WIDTH} height={ICON_HEIGHT} fill={color} key={color} />);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <svg width={ICON_WIDTH} height={ICON_HEIGHT} style={{ marginRight: '8px' }}>
        {rects}
      </svg>
      <span>{text}</span>
    </div>
  );
};

// Chart Legend Component
const ChartLegend = ({ mode = 'files' }) => {
  const legendGoodCommitsColor = chroma('green').brighten().brighten().hex();
  const legendBadCommitsColor = chroma('red').brighten().brighten().hex();
  const legendColor = getChartColors('spectral', _.range(0, 4))[0];
  const legendDotsId = 'legend_dots';
  const legendHatchId = 'legend_hatch';

  return (
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      <svg width={0} height={0}>
        <defs>
          {DotsPattern(legendColor, legendDotsId)}
          {HatchPattern(legendColor, legendHatchId)}
        </defs>
      </svg>

      <LegendItem text="Good Commits rel. to all Commits of Dev" color={legendGoodCommitsColor} />
      <LegendItem text="Bad Commits rel. to all Commits of Dev" color={legendBadCommitsColor} />
      <LegendItem text="# of Commits rel. to others" color={`url(#${legendDotsId})`} />
      
      {mode === 'issues' && 
        <LegendItem text="Added lines of code" color={`url(#${legendHatchId})`} />
      }
      
      {!(mode === 'issues') && (
        <>
          <LegendItem text="Added lines of code" color={`url(#${legendHatchId})`} color2={legendColor} />
          <LegendItem text="Added lines of code (still in the Project)" color={legendColor} />
        </>
      )}
    </div>
  );
};

function Help() {
  return (
    <>
      <h2>Code Expertise Visualization</h2>
      <p>
        This visualization shows the distribution of code expertise among developers in the project.
        Each segment in the circular chart represents a developer's contribution to the codebase.
      </p>
      
      <h3>Chart Legend</h3>
      <ChartLegend />
      
      <h3>How to Read the Chart</h3>
      <ul>
        <li>The size of each segment represents the developer's relative contribution</li>
        <li>Different patterns and colors indicate different types of contributions</li>
        <li>Good commits are shown in green, bad commits in red</li>
        <li>The density of dots indicates the number of commits relative to other developers</li>
        <li>The central circle provides a visual anchor for the chart</li>
      </ul>
    </>
  );
}

export default Help;