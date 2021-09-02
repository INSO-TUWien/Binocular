import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';
import ColorMixer from '../../helper/colorMixer';
import ListGeneration from '../../helper/listGeneration';

const HEATMAP_LOW_COLOR = '#ABEBC6';
const HEATMAP_HIGH_COLOR = '#E6B0AA';
const HEATMAP_MAX_COLOR = '#d5796f';

export default class columnChartGeneration {
  static updateColumnData(data, currThis, mode) {
    let combinedColumnData;
    switch (mode) {
      case 1:
        combinedColumnData = d3Collection
          .nest()
          .key(d => d.column)
          .rollup(function(v) {
            return {
              column: v[0].column,
              value: d3.sum(v, g => g.value),
              message: v[0].message,
              sha: v[0].sha,
              dev: v[0].dev
            };
          })
          .entries(data)
          .map(d => d.value);
        break;
      case 2:
        combinedColumnData = d3Collection
          .nest()
          .key(d => d.column)
          .rollup(function(v) {
            return {
              column: v[0].column,
              value: d3.sum(v, g => g.value),
              message: v[0].message,
              sha: v[0].sha,
              title: v[0].title,
              description: v[0].description,
              iid: v[0].iid,
              commits: v[0].commits
            };
          })
          .entries(data)
          .map(d => d.value)
          .filter(d => d.value !== 0);
        break;
      default:
        combinedColumnData = d3Collection
          .nest()
          .key(d => d.column)
          .rollup(function(v) {
            return {
              column: v[0].column,
              value: d3.sum(v, g => g.value),
              message: v[0].message,
              date: v[0].date,
              sha: v[0].sha,
              branch: v[0].branch,
              parents: v[0].parents,
              signature: v[0].signature
            };
          })
          .entries(data)
          .map(d => d.value);
        break;
    }
    return combinedColumnData;
  }

  static generateColumnChart(data, columns, currThis, mode, legendSteps, displayProps) {
    d3.select('#chartColumns').remove();
    d3.select('#tooltipColumns').remove();

    const w = document.getElementsByClassName('CodeMirror')[0].clientWidth - 80;
    const h = 100;

    for (let i = 0; i < currThis.combinedColumnData.length; i++) {
      currThis.combinedColumnData[i].i = i;
    }

    const barChart = d3
      .select('.barChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', h)
      .attr('viewBox', '0 0 ' + w + ' ' + h)
      .attr('preserveAspectRatio', 'none')
      .attr('class', 'chartColumns')
      .attr('id', 'chartColumns');

    //Background
    const groupBack = barChart.append('g').attr('width', w).attr('height', h).attr('id', 'background');
    groupBack
      .selectAll('rect')
      .data(currThis.combinedColumnData)
      .enter()
      .append('rect')
      .attr('fill', '#EEEEEE88')
      .attr('class', 'sBar')
      .attr('x', (d, i) => i * w / currThis.combinedColumnData.length)
      .attr('y', 0)
      .attr('width', w / currThis.combinedColumnData.length)
      .attr('height', h);

    barChart.append('g').attr('width', w).attr('height', h).attr('id', 'columnChart');

    //tooltip
    const tooltipp = d3
      .select('.barChart')
      .append('div')
      .attr('class', 'tooltipColumns')
      .attr('id', 'tooltipColumns')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background-color', '#FFFFFFDD')
      .style('box-shadow', '0px 0px 10px #555555')
      .style('width', '300px')
      .style('border-radius', '4px')
      .style('padding', '1rem')
      .style('z-index', '9');
    //Info show
    const groupInfo = barChart.append('g').attr('width', w).attr('height', h).attr('id', 'info');
    switch (mode) {
      case 1:
        groupInfo
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => i * w / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h)
          .on('mousemove', function(event, d) {
            tooltipp.transition().duration(200).style('opacity', 1);
            const currDev = d.dev.split('>').join('');
            tooltipp
              .html(
                "<div style='font-weight: bold'>" +
                  currDev.split(' <')[0] +
                  '</div>' +
                  '<div>' +
                  currDev.split(' <')[1] +
                  '</div>' +
                  '<hr>' +
                  '<div>Changes: ' +
                  d.value +
                  '</div>'
              )
              .style(
                'right',
                w - d.i * w / currThis.combinedColumnData.length - 300 > 0
                  ? w - d.i * w / currThis.combinedColumnData.length - 300
                  : 0 + 'px'
              )
              .style('top', h + 'px');
          })
          .on('mouseout', function() {
            tooltipp.transition().duration(500).style('opacity', 0).style('top', '-1500px');
          });
        break;
      case 2:
        groupInfo
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => i * w / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h)
          .on('mousemove', function(event, d) {
            tooltipp.transition().duration(200).style('opacity', 1);
            tooltipp
              .html(
                "<div style='font-weight: bold'>Issue: " +
                  d.iid +
                  '</div>' +
                  '<div>' +
                  d.title +
                  '</div>' +
                  '<hr>' +
                  (d.description !== '' ? '<div>' + d.description + '</div>' + '<hr>' : '') +
                  '<div> Commits linked to this issue: ' +
                  d.commits.length +
                  '</div>' +
                  '<hr>' +
                  '<div>' +
                  ListGeneration.generateCommitList(d.commits) +
                  '</div>' +
                  '<hr>' +
                  '<div>Changes: ' +
                  d.value +
                  '</div>'
              )
              .style(
                'right',
                w - d.i * w / currThis.combinedColumnData.length - 300 > 0
                  ? w - d.i * w / currThis.combinedColumnData.length - 300
                  : 0 + 'px'
              )
              .style('top', h + 'px');
          })
          .on('mouseout', function() {
            tooltipp.transition().duration(500).style('opacity', 0).style('top', '-1500px');
          });
        break;
      default:
        groupInfo
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => i * w / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h)
          .style('cursor', 'pointer')
          .on('mousemove', function(event, d) {
            tooltipp.transition().duration(200).style('opacity', 1);
            tooltipp
              .html(
                "<div style='font-weight: bold'>Version: " +
                  d.column +
                  '</div>' +
                  "<div style='font-style: italic;color: #AAAAAA;'>" +
                  d.date.substring(0, d.date.length - 5).split('T').join(' ') +
                  '</div>' +
                  '<hr>' +
                  "<div style='word-wrap: break-word'>" +
                  d.message +
                  '</div>' +
                  '<hr>' +
                  '<div>' +
                  d.branch +
                  '</div>' +
                  '<hr>' +
                  '<div>' +
                  d.signature +
                  '</div>' +
                  '<hr>' +
                  "<div style='font-style: italic;color: #AAAAAA; word-wrap: anywhere'>" +
                  d.sha +
                  '</div>' +
                  '<hr>' +
                  '<div>Changes: ' +
                  d.value +
                  '</div>'
              )
              .style(
                'right',
                w - (d.i - 2) * w / currThis.combinedColumnData.length - 300 > 0
                  ? w - (d.i - 2) * w / currThis.combinedColumnData.length - 300
                  : 0 + 'px'
              )
              .style('top', h + 'px');
          })
          .on('mouseout', function() {
            tooltipp.transition().duration(500).style('opacity', 0).style('top', '-1500px');
          })
          .on('click', function(event, d) {
            currThis.setState({ sha: d.sha });
          });
        setTimeout(
          function() {
            this.generateBranchView(data, columns, currThis);
          }.bind(this)
        );
        break;
    }
    setTimeout(
      function() {
        this.updateColumnChart(data, columns, currThis, mode, legendSteps, displayProps);
      }.bind(this)
    );
  }

  static updateColumnChart(data, columns, currThis, mode, legendSteps, displayProps) {
    const w = document.getElementsByClassName('CodeMirror')[0].clientWidth - 80;
    const h = 100;

    let maxValue = d3.max(currThis.combinedColumnData, d => d.value);
    if (displayProps.customDataScale) {
      maxValue = displayProps.dataScaleColumns;
    } else {
      displayProps.dataScaleColumns = maxValue;
    }

    const legendData = [];

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({
        interval: maxValue / legendSteps * i,
        color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, 1.0 / legendSteps * i)
      });
    }
    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return HEATMAP_MAX_COLOR;
    };

    //Bars
    const bars = d3.select('#columnChart').selectAll('rect').data(currThis.combinedColumnData);
    bars
      .enter()
      .append('rect')
      .attr('fill', colorScale)
      .attr('class', 'sBar')
      .attr('x', (d, i) => i * w / currThis.combinedColumnData.length)
      .attr('y', d => {
        return h - h / maxValue * d.value;
      })
      .attr('width', w / currThis.combinedColumnData.length)
      .attr('height', d => {
        return h / maxValue * d.value;
      });
    bars.exit().remove();
  }

  static generateBranchView(data, columns, currThis) {
    d3.select('#chartBranchView').remove();
    const w = document.getElementsByClassName('CodeMirror')[0].clientWidth - 80;
    const h = 50;

    for (let i = 0; i < currThis.combinedColumnData.length; i++) {
      currThis.combinedColumnData[i].i = i;
    }

    const versionSize = Math.min(w / currThis.combinedColumnData.length, 20) - 4;

    const branches = d3Collection.nest().key(d => d.branch).entries(currThis.combinedColumnData);

    d3
      .select('.branchView')
      .append('svg')
      .attr('width', '100%')
      .attr('height', h)
      .attr('viewBox', '0 0 ' + w + ' ' + h)
      .attr('preserveAspectRatio', 'none')
      .attr('class', 'chartBranchView')
      .attr('id', 'chartBranchView');

    //tooltip
    const tooltipp = d3.select('#tooltipColumns');

    //commits
    const commits = d3.select('#chartBranchView').selectAll('rect').data(currThis.combinedColumnData);
    const branchLines = d3.select('#chartBranchView');
    let offset = 0;
    const firstCommitCount = parseInt(branches[0].values[0].column);
    for (const branch of branches) {
      for (let i = 0; i < branch.values.length - 1; i++) {
        const c1 = parseInt(branch.values[i].column) - firstCommitCount;
        const c2 = parseInt(branch.values[i + 1].column) - firstCommitCount;
        if (i === 0) {
          for (const parentSha of branch.values[i].parents.split(',')) {
            const parent = currThis.combinedColumnData.find(d => d.sha === parentSha);
            if (parent !== undefined) {
              if (parseInt(parent.column) + 1 < c1) {
                branchLines
                  .append('line')
                  .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
                  .style('stroke-width', 5)
                  .style('stroke-linecap', 'round')
                  .attr('y1', h / 2)
                  .attr(
                    'x1',
                    w / (currThis.combinedColumnData.length * 2) +
                      (parent.column - firstCommitCount) * w / currThis.combinedColumnData.length
                  )
                  .attr('y2', 5)
                  .attr(
                    'x2',
                    w / (currThis.combinedColumnData.length * 2) +
                      (parent.column - firstCommitCount + 1) * w / currThis.combinedColumnData.length
                  );
                branchLines
                  .append('line')
                  .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
                  .style('stroke-width', 5)
                  .style('stroke-linecap', 'round')
                  .attr('y1', 5)
                  .attr(
                    'x1',
                    w / (currThis.combinedColumnData.length * 2) +
                      (parent.column - firstCommitCount + 1) * w / currThis.combinedColumnData.length
                  )
                  .attr('y2', 5)
                  .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c1 - 1) * w / currThis.combinedColumnData.length);
                branchLines
                  .append('line')
                  .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
                  .style('stroke-width', 5)
                  .style('stroke-linecap', 'round')
                  .attr('y1', 5)
                  .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c1 - 1) * w / currThis.combinedColumnData.length)
                  .attr('y2', h / 2)
                  .attr('x2', w / (currThis.combinedColumnData.length * 2) + c1 * w / currThis.combinedColumnData.length);
              } else {
                branchLines
                  .append('line')
                  .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
                  .style('stroke-width', 5)
                  .style('stroke-linecap', 'round')
                  .attr('y1', h / 2)
                  .attr(
                    'x1',
                    w / (currThis.combinedColumnData.length * 2) +
                      (parent.column - firstCommitCount) * w / currThis.combinedColumnData.length
                  )
                  .attr('y2', h / 2)
                  .attr('x2', w / (currThis.combinedColumnData.length * 2) + c1 * w / currThis.combinedColumnData.length);
              }
            } else {
              branchLines
                .append('line')
                .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
                .style('stroke-width', 5)
                .style('stroke-linecap', 'round')
                .attr('y1', 10)
                .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c1 - 1) * w / currThis.combinedColumnData.length)
                .attr('y2', h / 2)
                .attr('x2', w / (currThis.combinedColumnData.length * 2) + c1 * w / currThis.combinedColumnData.length);

              branchLines
                .append('line')
                .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
                .style('stroke-width', 5)
                .style('stroke-linecap', 'round')
                .style('stroke-dasharray', '1, 10')
                .attr('y1', 10)
                .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c1 - 2) * w / currThis.combinedColumnData.length)
                .attr('y2', 10)
                .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c1 - 1) * w / currThis.combinedColumnData.length);
            }
          }
        }
        if (c1 + 1 === c2) {
          branchLines
            .append('line')
            .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
            .style('stroke-width', 5)
            .style('stroke-linecap', 'round')
            .attr('y1', h / 2)
            .attr('x1', w / (currThis.combinedColumnData.length * 2) + c1 * w / currThis.combinedColumnData.length)
            .attr('y2', h / 2)
            .attr('x2', w / (currThis.combinedColumnData.length * 2) + c2 * w / currThis.combinedColumnData.length);
        } else {
          offset++;
          let currOffset = 0;
          if (offset % 2 === 0) {
            currOffset = -Math.floor(offset / 2);
          } else {
            currOffset = Math.floor(offset / 2) + offset % 2;
          }
          currOffset = Math.min(Math.max(currOffset * 5, -h / 2 + 5), h / 2 - 5);
          branchLines
            .append('line')
            .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
            .style('stroke-width', 5)
            .style('stroke-linecap', 'round')
            .attr('y1', h / 2)
            .attr('x1', w / (currThis.combinedColumnData.length * 2) + c1 * w / currThis.combinedColumnData.length)
            .attr('y2', h / 2 + currOffset)
            .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c1 + 1) * w / currThis.combinedColumnData.length);

          branchLines
            .append('line')
            .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
            .style('stroke-width', 5)
            .style('stroke-linecap', 'round')
            .attr('y1', h / 2 + currOffset)
            .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c1 + 1) * w / currThis.combinedColumnData.length)
            .attr('y2', h / 2 + currOffset)
            .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c2 - 1) * w / currThis.combinedColumnData.length);

          branchLines
            .append('line')
            .style('stroke', ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === branch.values[i].branch)))
            .style('stroke-width', 5)
            .style('stroke-linecap', 'round')
            .attr('y1', h / 2 + currOffset)
            .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c2 - 1) * w / currThis.combinedColumnData.length)
            .attr('y2', h / 2)
            .attr('x2', w / (currThis.combinedColumnData.length * 2) + c2 * w / currThis.combinedColumnData.length);
        }
      }
    }
    commits
      .enter()
      .append('rect')
      .attr('fill', d => ColorMixer.rainbow(branches.length, branches.findIndex(v => v.key === d.branch)))
      .attr('class', 'sBar')
      .attr('x', (d, i) => i * w / currThis.combinedColumnData.length + w / (currThis.combinedColumnData.length * 2) - versionSize / 2)
      .attr('y', h / 2 - versionSize / 2)
      .attr('width', versionSize)
      .attr('height', versionSize)
      .style('stroke', 'whitesmoke')
      .style('stroke-width', '2px')
      .attr('rx', '100%')
      .attr('ry', '100%')
      .on('mousemove', function(event, d) {
        tooltipp.transition().duration(200).style('opacity', 1);
        tooltipp
          .html(
            "<div style='font-weight: bold'>Version: " +
              d.column +
              '</div>' +
              "<div style='font-style: italic;color: #AAAAAA;'>" +
              d.date.substring(0, d.date.length - 5).split('T').join(' ') +
              '</div>' +
              '<hr>' +
              "<div style='word-wrap: break-word'>" +
              d.message +
              '</div>' +
              '<hr>' +
              '<div>' +
              d.branch +
              '</div>' +
              '<hr>' +
              '<div>' +
              d.signature +
              '</div>' +
              '<hr>' +
              "<div style='font-style: italic;color: #AAAAAA; word-wrap: anywhere'>" +
              d.sha +
              '</div>' +
              '<hr>' +
              '<div>Changes: ' +
              d.value +
              '</div>'
          )
          .style(
            'right',
            w - (d.i - 2) * w / currThis.combinedColumnData.length - 300 > 0
              ? w - (d.i - 2) * w / currThis.combinedColumnData.length - 300
              : 0 + 'px'
          )
          .style('top', h + 100 + 'px');
      })
      .on('mouseout', function() {
        tooltipp.transition().duration(500).style('opacity', 0).style('top', '-1500px');
      })
      .on('click', function(event, d) {
        currThis.setState({ sha: d.sha });
      });
    commits.exit().remove();
  }
}
