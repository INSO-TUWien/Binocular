import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import DotsPattern from '../../../../../components/svg/patterns/dots';
import HatchPattern from '../../../../../components/svg/patterns/hatch';

// Implement getChartColors function
const getChartColors = (colorScheme: string, range: number[]): string[] => {
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

  return range.map((i) => {
    const normalizedValue = i / (range.length - 1 || 1);
    return colorScale(normalizedValue);
  });
};

// Custom legend item component
// eslint-disable-next-line react/prop-types
const LegendItem: React.FC<{ color: string; color2?: string; color3?: string; text: string }> = ({ color, color2, color3, text }) => {
  const ICON_WIDTH = 15;
  const ICON_HEIGHT = 15;

  const rects = [];

  if (color2) {
    if (color3) {
      rects.push(<rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} fill={color} key={`${color}-1`} />);
      rects.push(<rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} x={ICON_WIDTH / 3} fill={color2} key={`${color2}-2`} />);
      rects.push(<rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} x={(ICON_WIDTH / 3) * 2} fill={color3} key={`${color3}-3`} />);
    } else {
      rects.push(<rect width={ICON_WIDTH / 2} height={ICON_HEIGHT} fill={color} key={`${color}-1`} />);
      rects.push(<rect width={ICON_WIDTH / 2} height={ICON_HEIGHT} x={ICON_WIDTH / 2} fill={color2} key={`${color2}-2`} />);
    }
  } else {
    rects.push(<rect width={ICON_WIDTH} height={ICON_HEIGHT} fill={color} key={color} />);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
      <svg width={ICON_WIDTH} height={ICON_HEIGHT} style={{ marginRight: '4px' }}>
        {rects}
      </svg>
      <span style={{ fontSize: '0.85em' }}>{text}</span>
    </div>
  );
};

// Chart Legend Component
// eslint-disable-next-line react/prop-types
const ChartLegend: React.FC<{ mode?: string }> = ({ mode = 'files' }) => {
  const legendGoodCommitsColor = chroma('green').brighten().brighten().hex();
  const legendBadCommitsColor = chroma('red').brighten().brighten().hex();
  const legendColor = getChartColors('spectral', _.range(0, 4))[0];
  const legendDotsId = 'legend_dots';
  const legendHatchId = 'legend_hatch';

  return (
    <div style={{ margin: '6px 0' }}>
      <svg width={0} height={0}>
        <defs>
          {DotsPattern(legendColor, legendDotsId)}
          {HatchPattern(legendColor, legendHatchId)}
        </defs>
      </svg>

      <LegendItem text="Good Commits rel. to all Commits of Dev" color={legendGoodCommitsColor} />
      <LegendItem text="Bad Commits rel. to all Commits of Dev" color={legendBadCommitsColor} />
      <LegendItem text="# of Commits rel. to others" color={`url(#${legendDotsId})`} />

      {mode === 'issues' && <LegendItem text="Added lines of code" color={`url(#${legendHatchId})`} />}

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
      <h2>Code Expertise Help</h2>

      <h3>Data</h3>
      <p>
        This chart shows data points to assess developer expertise across the codebase, including code contributions, ownership, and commit
        quality.
      </p>

      <h3>Chart Elements</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Added Code:</span> Segment size shows relative code contribution
          </li>
          <li>
            <span className={'font-bold'}>Owned Code:</span> Middle section shows:
            <ul className={'list-disc ml-5'}>
              <li>Colored part: code currently owned</li>
              <li>Hashed part: code added but later deleted/replaced</li>
            </ul>
          </li>
          <li>
            <span className={'font-bold'}>Commits Quality:</span>
            <ul className={'list-disc ml-5'}>
              <li>Green outer arc: successful CI-Pipeline commits</li>
              <li>Red inner arc: failed CI-Pipeline commits</li>
            </ul>
          </li>
          <li>
            <span className={'font-bold'}>Commit Count:</span> Inner dotted part shows relative number of commits
          </li>
        </ul>
      </div>

      <h3>Chart Legend</h3>
      <ChartLegend />

      <h3>Interaction</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>Hover over segments to view absolute line counts</li>
          <li>Click on segments to open the details panel</li>
          <li>Details panel shows comprehensive developer commit information</li>
          <li>Select different developers via the dropdown menu in the details panel</li>
        </ul>
      </div>
    </>
  );
}

export default Help;
