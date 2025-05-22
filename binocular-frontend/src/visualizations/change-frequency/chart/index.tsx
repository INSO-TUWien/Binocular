import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import styles from '../styles.module.scss';
import { setChangeFrequencyState } from '../sagas';
import { HierarchyNode } from '../utils/hierarchy';

interface ChartDimensions {
  width: number;
  height: number;
}

const ChartComponent: React.FC = () => {
  const dispatch = useDispatch();
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Getting the loading state from the Redux store
  const isLoading = useSelector((state: any) => 
    state.visualizations.changeFrequency.state.data.loading || false
  );
  
  // Getting the hierarchy state from the Redux store
  const hierarchyState = useSelector((state: any) => 
    state.visualizations.changeFrequency.state.state
  );
  
  // Getting the preprocessed hierarchy data from the Redux store
  const hierarchyData = useSelector((state: any) => 
    state.visualizations.changeFrequency.state.state.hierarchyData || []
  );
  
  const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: 0 });
  
  // Function for handling the resizing of the chart when the user resizes the browser window
  useEffect(() => {
    function handleResize() {
      if (chartRef.current && chartRef.current.parentElement) {
        setDimensions({
          width: chartRef.current.parentElement.clientWidth,
          height: chartRef.current.parentElement.clientHeight,
        });
      }
    }
    
    handleResize();
        
    window.addEventListener('resize', handleResize);
    
    return function() {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Function for handling the navigation to a directory
  function handleNavigateToDirectory(path: string) {
    const newStack = [...hierarchyState.hierarchyStack, path];
    
    dispatch(setChangeFrequencyState({
      currentPath: path,
      hierarchyStack: newStack
    }));
  }
  
  // Function for drawing the scatter plot
  useEffect(() => {
    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;
    
    if (hierarchyData.length === 0) {
      return;
    }
    
    d3.select(chartRef.current).selectAll('*').remove();
    
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', '100%') 
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(80, 40)`);
    
    const width = chartWidth - 110; 
    const height = chartHeight - 110;
    
    const xMax = d3.max(hierarchyData as HierarchyNode[], d => d.averageChangesPerCommit) ?? 1;
    const yMax = d3.max(hierarchyData as HierarchyNode[], d => d.commitCount) ?? 1;
    
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(xMax * 1.1, 1)])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(yMax * 1.1, 1)])
      .range([height, 0]);
    
    // Function to generate the color gradient based on the ratio of additions to deletions
    function colorGradient(additions: number, deletions: number) {
      const total = additions + deletions;
      if (total === 0) return '#a0a0a0';
      
      const ratio = additions / total;
      
      if (ratio <= 0.5) {
        return d3.interpolateRgb('#ff1a1a', '#ffcc00')(ratio * 2);
      } else {
        return d3.interpolateRgb('#ffcc00', '#2ecc40')((ratio - 0.5) * 2);
      }
    }
    
    const sizeScale = d3.scaleLog()
      .domain([10, Math.max(d3.max(hierarchyData as HierarchyNode[], d => d.lineCount || 10) || 10000, 10000)])
      .range([6, 25])
      .clamp(true);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Average Changes Per Commit (Additions + Deletions)');
    
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Number of Commits');
    
    const tooltip = d3.select(tooltipRef.current);
    
    svg.selectAll('circle')
      .data(hierarchyData as HierarchyNode[])
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.averageChangesPerCommit))
      .attr('cy', d => yScale(d.commitCount))
      .attr('r', d => {
        const lineCount = d.lineCount || 1;
        return sizeScale(lineCount);
      })
      .attr('fill', d => colorGradient(d.totalAdditions, d.totalDeletions))
      .attr('opacity', 0.7)
      .attr('stroke', '#000')
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d: HierarchyNode) => {
        d3.select(event.target)
          .attr('opacity', 1)
          .attr('stroke-width', 2);
          
        const tooltipHtml = `
          <div>
            <strong>${d.isDirectory ? 'Module' : 'File'}:</strong> ${d.path}<br>
            <strong>First Modification:</strong> ${d.firstModification ? new Date(d.firstModification).toLocaleString() : 'Unknown'}<br>
            <strong>Last Modification:</strong> ${d.lastModification ? new Date(d.lastModification).toLocaleString() : 'Unknown'}<br>
            <strong>Total Lines of Code:</strong> <span style="color: #9c27b0">${d.lineCount?.toLocaleString() || 'Unknown'}</span><br>
            <strong>Additions:</strong> <span style="color: #4caf50">${d.totalAdditions.toLocaleString()}</span><br>
            <strong>Deletions:</strong> <span style="color: #f44336">${d.totalDeletions.toLocaleString()}</span><br>
            <hr style="margin: 5px 0">
            <strong>Modification ownership:</strong><br>
            ${d.owners ? Object.entries(d.owners)
              .map(([author, stats]) => ({
                author, 
                additions: stats.additions,
                deletions: stats.deletions,
                percentage: ((stats.changes / d.totalChanges) * 100).toFixed(2)
              }))
              .filter(item => Number(item.percentage) >= 5)
              .sort((a, b) => Number(b.percentage) - Number(a.percentage))
              .map(item => 
                `<div>${item.author}: <span style="color: #4caf50">${item.additions.toLocaleString()}</span> <span style="color: #f44336">${item.deletions.toLocaleString()}</span> ${item.percentage}%</div>`
              ).join('') : 'No ownership data available'}
          </div>
        `;

        tooltip
          .style('visibility', 'visible')
          .html(tooltipHtml);
          
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
        d3.select(event.target)
          .attr('opacity', 0.7)
          .attr('stroke-width', 1);
        
          tooltip.style('visibility', 'hidden');
      })
      .on('click', (_event, d: HierarchyNode) => {
        tooltip.style('visibility', 'hidden');

        if (d.isDirectory) {
          handleNavigateToDirectory(d.path);
        }
      });
    
  }, [hierarchyData, dimensions, hierarchyState, dispatch]);
  
  return (
    <div className={styles.chartContainer}>
      {isLoading && <div className={styles.loadingHintContainer}><h1>Loading...</h1></div>}
      
      {!isLoading && hierarchyData.length === 0 && 
        <div className={styles.loadingHintContainer}><h2>No data available</h2></div>
      }
      
      <div 
        ref={chartRef} 
        className={styles.chart}
        style={{ 
          display: hierarchyData.length > 0 ? 'block' : 'none',
          height: '100%',
          width: '100%'
        }}
      ></div>
      
      <div 
        ref={tooltipRef} 
        className={styles.tooltip} 
        style={{ visibility: 'hidden' }}
      ></div>
    </div>
  );
};

export default ChartComponent; 