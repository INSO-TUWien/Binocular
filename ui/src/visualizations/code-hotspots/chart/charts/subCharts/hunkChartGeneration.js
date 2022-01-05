import * as d3 from 'd3';
import Loading from '../../helper/loading';

const HUNK_ADDITION_COLOR = '#ABEBC655';
const HUNK_CHANGE_COLOR = '#7FB9FE55';
const HUNK_DELETION_COLOR = '#d5796f55';
const HUNK_ADDITION_COLOR_STROKE = '#ABEBC6';
const HUNK_CHANGE_COLOR_STROKE = '#7FB9FE';
const HUNK_DELETION_COLOR_STROKE = '#d5796f';

export default class hunkChartGeneration {
  static generateHunkChart(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    d3.select('.chartMain > *').remove();
    const width = document.getElementById('barChartContainer').clientWidth,
      height = 24 * lines,
      margins = { top: 24, right: 0, bottom: 0, left: 0 };
    const chart = d3
      .select('.chartMain')
      .attr('width', 'calc(100% - 105px)')
      .attr('height', height + margins.top + margins.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margins.top + margins.bottom))
      .attr('preserveAspectRatio', 'none')
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')
      .attr('id', 'chartMain');
    console.log(data);
    for (const commitKey in data.data) {
      chart.append('g').attr('id', 'commit' + commitKey);
    }
    setTimeout(
      function() {
        this.updateHunkChart(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps);
      }.bind(this)
    );
  }

  static updateHunkChart(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    const columns = importantColumns.length;

    const width = document.getElementById('barChartContainer').clientWidth;
    const barWidth = width / columns,
      barHeight = 24;
    Loading.showBackgroundRefresh('HunkChart generation in progress!');

    for (const commitKey in data.data) {
      d3
        .select('#commit' + commitKey)
        .selectAll('rect')
        .data(data.data[commitKey].file.hunks)
        .enter()
        .append('path')
        .attr('d', d => {
          const x1 = commitKey * barWidth + 1;
          const y11 = (d.oldStart - firstLineNumber - 1) * barHeight;
          const y12 = (d.oldStart - firstLineNumber - 1 + d.oldLines) * barHeight;
          const x2 = commitKey * barWidth + barWidth - 1;
          const y21 = (d.newStart - firstLineNumber - 1) * barHeight;
          const y22 = (d.newStart - firstLineNumber - 1 + d.newLines) * barHeight;
          return (
            'M ' +
            x1 +
            ' ' +
            y11 +
            ' V' +
            y12 +
            ' C ' +
            (x1 + barWidth / 2) +
            ' ' +
            y12 +
            ' ' +
            (x2 - barWidth / 2) +
            ' ' +
            y22 +
            ' ' +
            x2 +
            ' ' +
            y22 +
            ' V' +
            y21 +
            ' C ' +
            (x2 - barWidth / 2) +
            ' ' +
            y21 +
            ' ' +
            (x1 + barWidth / 2) +
            ' ' +
            y11 +
            ' ' +
            x1 +
            ' ' +
            y11 +
            'Z'
          );
        })
        .attr('fill', d => {
          return d.newLines < d.oldLines ? HUNK_DELETION_COLOR : d.newLines > d.oldLines ? HUNK_ADDITION_COLOR : HUNK_CHANGE_COLOR;
        })
        .attr('stroke', d => {
          return d.newLines < d.oldLines
            ? HUNK_DELETION_COLOR_STROKE
            : d.newLines > d.oldLines ? HUNK_ADDITION_COLOR_STROKE : HUNK_CHANGE_COLOR_STROKE;
        });

      /*d3
        .select('#commit' + commitKey)
        .selectAll('rect')
        .data(data.data[commitKey].file.hunks)
        .enter()
        .append('path')
        .attr('d', d => {
          return d3.line().curve(d3.curveBasis)([
            [commitKey * barWidth, (d.oldStart - firstLineNumber - 1) * barHeight],
            [commitKey * barWidth + barWidth / 3, (d.oldStart - firstLineNumber - 1) * barHeight],
            [commitKey * barWidth + barWidth - barWidth / 3, (d.newStart - firstLineNumber - 1) * barHeight],
            [commitKey * barWidth + barWidth, (d.newStart - firstLineNumber - 1) * barHeight]
          ]);
        })
        .attr('fill', 'none')
        .attr('stroke', 'green');*/

      /*d3
        .select('#commit' + commitKey)
        .selectAll('rect')
        .data(data.data[commitKey].file.hunks)
        .enter()
        .append('path')
        .attr('d', d => {
          return d3.line()([
            [commitKey * barWidth, (d.oldStart - firstLineNumber - 1) * barHeight],
            [commitKey * barWidth, (d.oldStart - firstLineNumber - 1 + d.oldLines) * barHeight],
            [commitKey * barWidth + barWidth, (d.newStart - firstLineNumber - 1 + d.newLines) * barHeight],
            [commitKey * barWidth + barWidth, (d.newStart - firstLineNumber - 1) * barHeight]
          ]);
        })
        .style('fill', d => {
          return d.newLines > d.oldLines ? HUNK_DELETION_COLOR : d.newLines < d.oldLines ? HUNK_ADDITION_COLOR : HUNK_CHANGE_COLOR;
        });*/
      Loading.hideBackgroundRefresh();
    }
  }
}
