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

    chart.append('g').attr('id', 'commitBackground');
    let filteredData = data.data;

    if (currThis.state.selectedCompareCommit.sha !== '') {
      filteredData = filteredData.filter((d, i) => {
        let earlierVersion, laterVersion;
        if (currThis.state.selectedCommit.commitID <= currThis.state.selectedCompareCommit.commitID) {
          earlierVersion = currThis.state.selectedCommit.commitID;
          laterVersion = currThis.state.selectedCompareCommit.commitID;
        } else {
          earlierVersion = currThis.state.selectedCompareCommit.commitID;
          laterVersion = currThis.state.selectedCommit.commitID;
        }
        return i >= earlierVersion + 1 && i <= laterVersion + 1;
      });
    }
    for (const commitKey in filteredData) {
      chart.append('g').attr('id', 'commit' + commitKey);
    }
    setTimeout(
      function() {
        this.updateHunkChart(
          { data: filteredData },
          lines,
          importantColumns,
          currThis,
          mode,
          maxValue,
          legendSteps,
          firstLineNumber,
          displayProps
        );
      }.bind(this)
    );
  }

  static updateHunkChart(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    let columns = data.data.length;
    const width = document.getElementById('barChartContainer').clientWidth;
    let barWidth = width / columns;
    const barHeight = 24;
    Loading.showBackgroundRefresh('HunkChart generation in progress!');

    if (columns < importantColumns.length) {
      columns = columns - 1;
      barWidth = width / 2 / columns;
    }

    d3
      .select('#commitBackground')
      .selectAll('rect')
      .data(Array.from(Array(lines).keys()))
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => {
        return d * barHeight;
      })
      .style('fill', d => {
        return d % 2 === 1 ? '#FFFFFF' : '#FAFAFA';
      })
      .attr('width', width)
      .attr('height', barHeight);

    for (const commitKey in data.data) {
      d3
        .select('#commit' + commitKey)
        .selectAll('rect')
        .data(data.data[commitKey].file.hunks)
        .enter()
        .append('path')
        .attr('d', d => {
          console.log(commitKey === columns ? width / 2 : barWidth);
          const x1 = commitKey * barWidth;
          const y11 = (d.oldStart - firstLineNumber - 1) * barHeight;
          const y12 = (d.oldStart - firstLineNumber - 1 + d.oldLines) * barHeight;
          const x2 = commitKey * barWidth + (parseInt(commitKey) === parseInt(columns) ? width / 2 : barWidth);
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

      Loading.hideBackgroundRefresh();
    }
  }
}
