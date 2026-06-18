import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import styles from '../../styles.module.scss';
import { setNavigation, type ChangeFrequencyState } from '../reducer';
import { colorGradient, escapeHtml } from '../utilities/utilities';
import type { HierarchyNode } from '../utilities/hierarchy';
import HierarchyTab from '../tabs/hierarchyTab';
import Breadcrumb from '../tabs/breadcrumb';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';
import type { ChangeFrequencySettings } from '../../index';

interface ChartDimensions {
  width: number;
  height: number;
}

const ChartComponent = (props: VisualizationPluginProperties<ChangeFrequencySettings, unknown>) => {
  const { store } = props;
  type RootState = { plugin: ChangeFrequencyState };

  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const loading = useSelector((state: RootState) => state.plugin.loading);
  const currentPath = useSelector((state: RootState) => state.plugin.currentPath);
  const hierarchyStack = useSelector((state: RootState) => state.plugin.hierarchyStack);
  const hierarchyData = useSelector((state: RootState) => state.plugin.hierarchyData);

  // Push the resolved global date range into the per-instance store so the saga can (re)load data.
  useEffect(() => {
    if (props.parameters?.parametersDateRange) {
      store.dispatch({ type: 'changeFrequency/setDateRange', payload: props.parameters.parametersDateRange });
    }
  }, [props.parameters.parametersDateRange, store]);

  // Trigger an initial load (and a reload when the data plugin changes).
  useEffect(() => {
    store.dispatch({ type: 'REFRESH' });
  }, [store, props.dataConnection]);

  const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: 0 });
  const [directoryOpen, setDirectoryOpen] = useState(false);

  useEffect(() => {
    if (chartRef.current && props.chartContainerRef) {
      props.chartContainerRef.current = chartRef.current;
    }
  }, [props.chartContainerRef]);

  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        const newWidth = chartRef.current.offsetWidth;
        const newHeight = chartRef.current.offsetHeight;

        setDimensions((prev) => {
          if (prev.width !== newWidth || prev.height !== newHeight) {
            return { width: newWidth, height: newHeight };
          }
          return prev;
        });
      }
    });

    resizeObserver.observe(chartRef.current);

    const initialWidth = chartRef.current.offsetWidth;
    const initialHeight = chartRef.current.offsetHeight;
    setDimensions({ width: initialWidth, height: initialHeight });

    return () => resizeObserver.disconnect();
  }, []);

  function handleNavigateToDirectory(path: string) {
    const newStack = [...(hierarchyStack || []), path];
    store.dispatch(setNavigation({ currentPath: path, hierarchyStack: newStack }));
  }

  // Function for drawing the scatter plot
  useEffect(() => {
    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;

    if (hierarchyData.length === 0) {
      return;
    }

    if (chartWidth === 0 || chartHeight === 0) {
      return;
    }

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', 'translate(80, 40)');

    const width = chartWidth - 110;
    const height = chartHeight - 110;

    const xMax = d3.max(hierarchyData as HierarchyNode[], (d) => d.averageChangesPerCommit) ?? 1;
    const yMax = d3.max(hierarchyData as HierarchyNode[], (d) => d.commitCount) ?? 1;

    // Means
    const xMean = d3.mean(hierarchyData as HierarchyNode[], (d) => d.averageChangesPerCommit) ?? 0;
    const yMean = d3.mean(hierarchyData as HierarchyNode[], (d) => d.commitCount) ?? 0;

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(xMax * 1.1, 1)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(yMax * 1.1, 1)])
      .range([height, 0]);

    // Axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Average Changes Per Commit (Additions + Deletions)');

    svg
      .append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Number of Commits');

    // Mean lines (theme-aware: inherit the text color at reduced opacity)
    svg
      .append('line')
      .attr('x1', xScale(xMean))
      .attr('x2', xScale(xMean))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(yMean))
      .attr('y2', yScale(yMean))
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    const sizeScale = d3
      .scaleLog()
      .domain([10, Math.max(d3.max(hierarchyData as HierarchyNode[], (d) => d.lineCount || 10) || 10000, 10000)])
      .range([6, 25])
      .clamp(true);

    const tooltip = d3.select(tooltipRef.current);

    svg
      .selectAll('circle')
      .data(hierarchyData as HierarchyNode[])
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.averageChangesPerCommit))
      .attr('cy', (d) => yScale(d.commitCount))
      .attr('r', (d) => {
        // lineCount can be missing (e.g. GitHub) -> fall back to net change, clamped to a positive
        // value so the log size scale never receives <= 0.
        const lineCount = Math.max(d.lineCount || d.totalAdditions - d.totalDeletions, 1);
        return sizeScale(lineCount);
      })
      .attr('fill', (d) => colorGradient(d.totalAdditions, d.totalDeletions))
      .attr('opacity', 0.7)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.6)
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d: HierarchyNode) => {
        d3.select(event.target).attr('opacity', 1).attr('stroke-width', 2);

        const tooltipHtml = `
          <div>
            <strong>${d.isDirectory ? 'Module' : 'File'}:</strong> ${escapeHtml(d.path)}<br>
            <strong>First Modification:</strong> ${d.firstModification ? new Date(d.firstModification).toLocaleString() : 'Unknown'}<br>
            <strong>Last Modification:</strong> ${d.lastModification ? new Date(d.lastModification).toLocaleString() : 'Unknown'}<br>
            <strong>Total Lines of Code:</strong> <span style="color: #9c27b0">${Math.max(d.lineCount || d.totalAdditions - d.totalDeletions, 0)?.toLocaleString() || 'Unknown'}</span><br>
            <strong>Additions:</strong> <span style="color: #4caf50">${d.totalAdditions.toLocaleString()}</span><br>
            <strong>Deletions:</strong> <span style="color: #f44336">${d.totalDeletions.toLocaleString()}</span><br>
            <hr style="margin: 5px 0">
            <strong>Modification ownership:</strong><br>
            ${
              d.owners
                ? Object.entries(d.owners)
                    .map(([author, stats]) => ({
                      author,
                      additions: stats.additions,
                      deletions: stats.deletions,
                      percentage: ((stats.changes / d.totalChanges) * 100).toFixed(2),
                    }))
                    .filter((item) => Number(item.percentage) >= 5)
                    .sort((a, b) => Number(b.percentage) - Number(a.percentage))
                    .map(
                      (item) =>
                        `<div>${escapeHtml(item.author)}: <span style="color: #4caf50">${item.additions.toLocaleString()}</span>
                           <span style="color: #f44336">${item.deletions.toLocaleString()}</span> ${item.percentage}%
                         </div>`,
                    )
                    .join('')
                : 'No ownership data available'
            }
          </div>
        `;

        tooltip.style('visibility', 'visible').html(tooltipHtml);

        const tooltipNode = tooltip.node() as HTMLElement;
        if (tooltipNode) {
          const rect = tooltipNode.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          let left = event.pageX + 15;
          let top = event.pageY - 15;

          if (left + rect.width > viewportWidth) left = event.pageX - rect.width - 15;
          if (top + rect.height > viewportHeight) top = event.pageY - rect.height - 15;
          if (top < 0) top = 10;
          if (left < 0) left = 10;

          tooltip.style('left', `${left}px`).style('top', `${top}px`);
        }
      })
      .on('mouseout', (event) => {
        d3.select(event.target).attr('opacity', 0.7).attr('stroke-width', 1);

        tooltip.style('visibility', 'hidden');
      })
      .on('click', (_event, d: HierarchyNode) => {
        tooltip.style('visibility', 'hidden');

        if (d.isDirectory) {
          handleNavigateToDirectory(d.path);
        }
      });
  }, [hierarchyData, dimensions, currentPath]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Current navigation scope of the chart, so the scatter plot's level stays clear. */}
      <div className={styles.chartBreadcrumb}>
        <Breadcrumb />
      </div>

      <div className={styles.chartArea}>
        {loading && (
          <div className={styles.loadingHintContainer}>
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}

        {!loading && hierarchyData.length === 0 && (
          <div className={styles.loadingHintContainer}>
            <h2>No data available</h2>
          </div>
        )}

        <div
          ref={chartRef}
          style={{
            display: hierarchyData.length > 0 ? 'block' : 'none',
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}></div>

        {/* Vertical handle pinned to the right edge; rides on the drawer's left edge when open. */}
        <button
          className={styles.directoryHandle}
          style={{ right: directoryOpen ? '20rem' : 0 }}
          onClick={() => setDirectoryOpen((open) => !open)}>
          Directory
        </button>

        {/* Directory listing slides in from the right; overlays the chart so its width stays stable. */}
        <div className={`${styles.directoryDrawer} ${directoryOpen ? styles.directoryDrawerOpen : ''}`}>
          <HierarchyTab />
        </div>
      </div>

      <div ref={tooltipRef} className={styles.tooltip} style={{ visibility: 'hidden' }}></div>
    </div>
  );
};

export default ChartComponent;
