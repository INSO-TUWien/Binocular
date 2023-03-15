import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';
import ColorMixer from '../../helper/colorMixer';
import Loading from '../../helper/loading';
import styles from '../../../styles.scss';

const HEATMAP_LOW_COLOR = '#ABEBC6';
const HEATMAP_HIGH_COLOR = '#E6B0AA';
const HEATMAP_MAX_COLOR = '#d5796f';
const EVEN_COLOR = '#FFFFFFFF';
const ODD_COLOR = '#EEEEEE55';

let commitData = [];
let developerData = [];
let issueData = [];

let commitMaxValue = 0;
let developerMaxValue = 0;
let issueMaxValue = 0;

let commitLegendSteps = [];
let developerLegendSteps = [];
let issueLegendSteps = [];

export default class heatmapChartGeneration {
  static generateHeatmap(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    d3.select('.chartMain > *').remove();
    d3.select('.chartMainToolTip > *').remove();
    d3.select('.chartMainSubToolTip > *').remove();

    switch (mode) {
      case 1:
        developerData = data;
        break;
      case 2:
        issueData = data;
        break;
      default:
        commitData = data;
        break;
    }

    currThis.combinedHeatmapData = data;
    const width = document.getElementById('barChartContainer').clientWidth,
      height = 24 * lines,
      margins = { top: 24, right: 0, bottom: 0, left: 0 };
    //Setting chart width and adjusting for margins
    const chart = d3
      .select('.chartMain')
      .attr('width', 'calc(100% - 105px)')
      .attr('height', height + margins.top + margins.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margins.top + margins.bottom))
      .attr('preserveAspectRatio', 'none')
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')
      .attr('id', 'chartMain');

    if (displayProps.heatmapTooltips) {
      d3.select('.chartMainToolTip')
        .append('div')
        .style('position', 'absolute')
        .style('display', 'none')
        .style('background-color', '#FFFFFFDD')
        .style('box-shadow', '0px 0px 10px #555555')
        .style('width', '90%')
        .style('border-radius', '4px')
        .style('padding', '1rem')
        .style('z-index', '9')
        .style('max-height', '70vh')
        .style('overflow-y', 'scroll')
        .style('backdrop-filter', 'blur(2px)')
        .style('-webkit-backdrop-filter', 'blur(2px)');
      d3.select('.chartMainSubToolTip')
        .append('div')
        .style('position', 'absolute')
        .style('display', 'none')
        .style('background-color', '#FFFFFFDD')
        .style('box-shadow', '0px 0px 10px #555555')
        .style('max-width', '80vh')
        .style('border-radius', '4px')
        .style('padding', '1rem')
        .style('z-index', '9')
        .style('max-height', '80vh')
        .style('overflow-y', 'scroll')
        .style('backdrop-filter', 'blur(2px)')
        .style('-webkit-backdrop-filter', 'blur(2px)');
    }
    for (const rowKey of d3Collection
      .nest()
      .key((d) => d.row)
      .entries(currThis.combinedHeatmapData)
      .map((d) => d.key)) {
      chart.append('g').attr('id', 'row' + rowKey);
    }
    setTimeout(
      function () {
        this.updateHeatmap(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps);
      }.bind(this)
    );
  }

  static updateHeatmap(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    const columns = importantColumns.length;
    if (displayProps.customDataScale) {
      maxValue = displayProps.dataScaleHeatmap;
    } else {
      displayProps.dataScaleHeatmap = maxValue;
    }

    switch (mode) {
      case 1:
        developerMaxValue = maxValue;
        developerLegendSteps = legendSteps;
        break;
      case 2:
        issueMaxValue = maxValue;
        issueLegendSteps = legendSteps;
        break;
      default:
        commitMaxValue = maxValue;
        commitLegendSteps = legendSteps;
        break;
    }

    const width = document.getElementById('barChartContainer').clientWidth;
    const barWidth = width / columns,
      barHeight = 24;
    const legendData = [];

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({
        interval: (maxValue / legendSteps) * i,
        color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, (1.0 / legendSteps) * i),
      });
    }
    const colorScale = (d) => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value === 0) {
          switch (displayProps.heatMapStyle) {
            case 2:
            case 1:
              return ODD_COLOR;
            default:
              if (d.row % 2 === 0) {
                return EVEN_COLOR;
              } else {
                return ODD_COLOR;
              }
          }
        }

        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return HEATMAP_MAX_COLOR;
    };
    Loading.showBackgroundRefresh('Heatmap generation in progress!');
    const rowDataArray = d3Collection
      .nest()
      .key((d) => d.row)
      .entries(currThis.combinedHeatmapData)
      .map((d) => d.values);
    for (const [i, rowData] of rowDataArray.entries()) {
      setTimeout(function () {
        const cells = d3
          .select('#row' + rowData[0].row)
          .selectAll('rect')
          .data(rowData);
        if (displayProps.heatMapStyle === 2 || displayProps.heatMapStyle === 0) {
          cells
            .enter()
            .append('rect')
            .attr('x', (d) => {
              return (importantColumns.indexOf(d.column) - 0) * barWidth;
            })
            .attr('y', (d) => {
              return (d.row - firstLineNumber) * barHeight;
            })
            .style('fill', colorScale)
            .attr('width', barWidth)
            .attr('height', barHeight)
            .style('opacity', displayProps.heatMapStyle === 2 ? 0.2 : 1.0);
        }
        if (displayProps.heatMapStyle === 2 || displayProps.heatMapStyle === 1) {
          cells
            .enter()
            .append('rect')
            .attr('x', (d) => {
              return (importantColumns.indexOf(d.column) - 0) * barWidth;
            })
            .attr('y', (d) => {
              return (d.row - firstLineNumber) * barHeight + barHeight - 2;
            })
            .style('fill', colorScale)
            .attr('width', barWidth)
            .attr('height', 2);
        }

        cells.exit().remove();
        if (i === rowDataArray.length - 1) {
          Loading.hideBackgroundRefresh();
        }
      });
    }
  }

  static interact(line, currThis) {
    if (!currThis.heatmapTooltipLocked) {
      if (d3.select('.chartMainToolTip > div').size() !== 0) {
        const rowCommitData = commitData.filter((d) => d.row === line);
        const rowDeveloperData = developerData.filter((d) => d.row === line);
        const rowIssueData = issueData.filter((d) => d.row === line);
        const commitLegendData = [];
        const width = document.getElementById('barChartContainer').clientWidth * 0.9;
        for (let i = 1; i <= commitLegendSteps; i++) {
          commitLegendData.push({
            interval: (commitMaxValue / commitLegendSteps) * i,
            color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, (1.0 / commitLegendSteps) * i),
          });
        }
        const commitColorScale = (d) => {
          for (let i = 0; i < commitLegendData.length; i++) {
            if (d.value === 0) {
              return ODD_COLOR;
            }
            if (d.value < commitLegendData[i].interval) {
              return commitLegendData[i].color;
            }
          }
          return HEATMAP_MAX_COLOR;
        };

        const developerLegendData = [];

        for (let i = 1; i <= developerLegendSteps; i++) {
          developerLegendData.push({
            interval: (developerMaxValue / developerLegendSteps) * i,
            color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, (1.0 / developerLegendSteps) * i),
          });
        }
        const developerColorScale = (d) => {
          for (let i = 0; i < developerLegendData.length; i++) {
            if (d.value === 0) {
              return ODD_COLOR;
            }
            if (d.value < developerLegendData[i].interval) {
              return developerLegendData[i].color;
            }
          }
          return HEATMAP_MAX_COLOR;
        };

        const issueLegendData = [];

        for (let i = 1; i <= issueLegendSteps; i++) {
          issueLegendData.push({
            interval: (issueMaxValue / issueLegendSteps) * i,
            color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, (1.0 / issueLegendSteps) * i),
          });
        }
        const issueColorScale = (d) => {
          for (let i = 0; i < issueLegendData.length; i++) {
            if (d.value === 0) {
              return ODD_COLOR;
            }
            if (d.value < issueLegendData[i].interval) {
              return issueLegendData[i].color;
            }
          }
          return HEATMAP_MAX_COLOR;
        };

        rowIssueData.map((d, i) => {
          d.i = i;
          return d;
        });

        const toolTip = d3
          .select('.chartMainToolTip > div')
          .style('display', 'block')
          .style('top', '' + (line + 2) * 24 + 'px')
          .html('');
        toolTip
          .append('span')
          .attr('class', styles.label)
          .text('Line: ' + (line + 1));
        toolTip.append('hr');
        toolTip.append('span').attr('class', styles.label).text('Changes/Version:');
        if (!rowCommitData.length) {
          toolTip.append('span').text('Data Not Loaded! Open the Tab once to load data.');
        } else {
          const rowCommitDataTooltip = toolTip
            .append('svg')
            .attr('width', width)
            .attr('height', '48px')
            .append('g')
            .selectAll('rect')
            .data(rowCommitData)
            .enter()
            .append('g');
          rowCommitDataTooltip
            .append('rect')
            .attr('x', (d, i) => {
              return '' + (width / rowCommitData.length) * i + '';
            })
            .attr('y', '24px')
            .style('fill', commitColorScale)
            .attr('width', '' + width / rowCommitData.length + '')
            .attr('height', '24px')
            .on('mouseover', function (event, d) {
              const subToolTip = d3.select('.chartMainSubToolTip > div');
              subToolTip.transition().duration(200).style('display', 'block');
              subToolTip
                .style('border', '3px solid transparent')
                .style('left', ((d.column + 1) * width) / rowCommitData.length + 'px')
                .style('top', '' + ((line + 2) * 24 + 170) + 'px');
              subToolTip.selectAll('*').remove();
              subToolTip
                .append('div')
                .style('font-weight', 'bold')
                .html('Version: ' + d.column);
              subToolTip
                .append('div')
                .style('font-style', 'italic')
                .style('color', '#AAAAAA')
                .html(
                  d.date
                    .substring(0, d.date.length - 5)
                    .split('T')
                    .join(' ')
                );
              subToolTip.append('hr');
              subToolTip.append('div').html(d.message);
            })
            .on('mouseout', function () {
              const subToolTip = d3.select('.chartMainSubToolTip > div');
              subToolTip.transition().duration(500).style('display', 'none');
            });
          rowCommitDataTooltip
            .append('text')
            .attr('x', (d, i) => {
              return '' + (width / rowCommitData.length) * i + '';
            })
            .attr('y', '0')
            .attr('dy', '24px')
            .style('fill', 'black')
            .text(function (d) {
              return d.column;
            });
        }
        toolTip.append('hr');
        toolTip.append('span').attr('class', styles.label).text('Changes/Developer:');
        if (!rowDeveloperData.length) {
          toolTip.append('span').text('Data Not Loaded! Open the Tab once to load data.');
        } else {
          const rowDeveloperDataTooltip = toolTip
            .append('svg')
            .attr('width', width)
            .attr('height', '174px')
            .append('g')
            .selectAll('rect')
            .data(rowDeveloperData)
            .enter()
            .append('g');
          rowDeveloperDataTooltip
            .append('rect')
            .attr('x', (d, i) => {
              return '' + (width / rowDeveloperData.length) * i + '';
            })
            .attr('y', '150')
            .style('fill', developerColorScale)
            .attr('width', '' + width / rowDeveloperData.length + '')
            .attr('height', '24px')
            .on('mouseover', function (event, d) {
              const subToolTip = d3.select('.chartMainSubToolTip > div');
              subToolTip.transition().duration(200).style('display', 'block');
              subToolTip
                .style('border', '3px solid transparent')
                .style('left', ((d.column + 1) * width) / rowDeveloperData.length + 'px')
                .style('top', '' + ((line + 2) * 24 + 430) + 'px');
              subToolTip.selectAll('*').remove();
              subToolTip.append('div').style('font-weight', 'bold').text(d.dev.split('<')[0]);
              subToolTip
                .append('div')
                .style('font-style', 'italic')
                .style('color', '#AAAAAA')
                .text('<' + d.dev.split('<')[1]);
              subToolTip.append('hr');
              subToolTip.append('div').text('Changes: ' + d.value);
            })
            .on('mouseout', function () {
              const subToolTip = d3.select('.chartMainSubToolTip > div');
              subToolTip.transition().duration(500).style('display', 'none');
            });
          rowDeveloperDataTooltip
            .append('text')
            .attr('x', '0')
            .attr('y', '0')
            .attr('transform', (d, i) => {
              return 'translate( ' + (width / rowDeveloperData.length) * i + ', ' + 126 + '),' + 'rotate(-45)';
            })
            .attr('dy', '24px')
            .style('fill', 'black')
            .text(function (d) {
              return d.dev.split('<')[0];
            });
        }
        toolTip.append('hr');
        toolTip.append('span').attr('class', styles.label).text('Changes/Issue:');
        if (!rowIssueData.length) {
          toolTip.append('span').text('Data Not Loaded! Open the Tab once to load data.');
        } else {
          const rowIssueDataTooltip = toolTip
            .append('svg')
            .attr('width', width)
            .attr('height', '48px')
            .append('g')
            .selectAll('rect')
            .data(rowIssueData)
            .enter()
            .append('g');
          rowIssueDataTooltip
            .append('rect')
            .attr('x', (d, i) => {
              return '' + (width / rowIssueData.length) * i + '';
            })
            .attr('y', '24')
            .style('fill', issueColorScale)
            .attr('width', '' + width / rowIssueData.length + '')
            .attr('height', '24px')
            .on('mouseover', function (event, d) {
              console.log(d);
              const subToolTip = d3.select('.chartMainSubToolTip > div');
              subToolTip.transition().duration(200).style('display', 'block');
              subToolTip
                .style('border', '3px solid transparent')
                .style('left', ((d.i + 1) * width) / rowIssueData.length + 'px')
                .style('top', '' + ((line + 2) * 24 + 570) + 'px');
              subToolTip.selectAll('*').remove();
              subToolTip
                .append('div')
                .style('font-weight', 'bold')
                .text('Issue: ' + d.iid);
              subToolTip.append('div').text(d.title);
              subToolTip.append('hr');
              subToolTip.append('div').text('Changes: ' + d.value);
            })
            .on('mouseout', function () {
              const subToolTip = d3.select('.chartMainSubToolTip > div');
              subToolTip.transition().duration(500).style('display', 'none');
            });
          rowIssueDataTooltip
            .append('text')
            .attr('x', (d, i) => {
              return '' + (width / rowIssueData.length) * i + '';
            })
            .attr('y', '0')
            .attr('dy', '24px')
            .style('fill', 'black')
            .text(function (d) {
              return d.iid;
            });
        }
      }
    }
  }

  static disInteract(currThis) {
    if (!currThis.heatmapTooltipLocked) {
      d3.select('.chartMainToolTip > div').style('display', 'none');
    }
  }

  static fixToolTip(line, currThis) {
    const toolTip = d3.select('.chartMainToolTip > div');
    currThis.heatmapTooltipLocked = !currThis.heatmapTooltipLocked;
    toolTip.style('border', currThis.heatmapTooltipLocked ? '3px solid #3498db' : '3px solid transparent');
  }
}
