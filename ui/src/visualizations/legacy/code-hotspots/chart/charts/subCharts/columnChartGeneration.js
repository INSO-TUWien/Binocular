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
    currThis.tooltipLocked = false;
    switch (mode) {
      case 1:
        combinedColumnData = d3Collection
          .nest()
          .key((d) => d.column)
          .rollup(function (v) {
            return {
              column: v[0].column,
              value: d3.sum(v, (g) => g.value),
              message: v[0].message,
              sha: v[0].sha,
              dev: v[0].dev,
              commits: v[0].commits,
            };
          })
          .entries(data)
          .map((d) => d.value);
        break;
      case 2:
        combinedColumnData = d3Collection
          .nest()
          .key((d) => d.column)
          .rollup(function (v) {
            return {
              column: v[0].column,
              value: d3.sum(v, (g) => g.value),
              title: v[0].title,
              description: v[0].description,
              iid: v[0].iid,
              commits: d3Collection
                .nest()
                .key((c) => c.sha)
                .entries(v[0].commits)
                .map((c) => c.values[0]),
            };
          })
          .entries(data)
          .map((d) => d.value)
          .filter((d) => d.value !== 0);
        break;
      default:
        combinedColumnData = d3Collection
          .nest()
          .key((d) => d.column)
          .rollup(function (v) {
            return {
              column: v[0].column,
              value: d3.sum(v, (g) => g.value),
              message: v[0].message,
              date: v[0].date,
              sha: v[0].sha,
              branch: v[0].branch,
              parents: v[0].parents,
              history: v[0].history,
              signature: v[0].signature,
            };
          })
          .entries(data)
          .map((d) => d.value);
        break;
    }
    return combinedColumnData;
  }

  static generateColumnChart(data, columns, currThis, mode, legendSteps, displayProps) {
    d3.select('#chartColumns').remove();
    d3.select('#tooltipColumns').remove();
    const w = document.getElementById('codeViewContainer').clientWidth - 80;
    const h = 100;

    for (let i = 0; i < currThis.combinedColumnData.length; i++) {
      currThis.combinedColumnData[i].i = i;
    }

    const barChart = d3
      .select('.barChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', h + 6)
      .attr('viewBox', '0 0 ' + w + ' ' + (h + 6))
      .attr('preserveAspectRatio', 'none')
      .attr('class', 'chartColumns')
      .attr('id', 'chartColumns');

    //Background
    const groupBack = barChart.append('g').attr('width', w).attr('height', h).attr('id', 'background');

    barChart.append('g').attr('width', w).attr('height', h).attr('id', 'columnChart');
    const selection = barChart.append('g').attr('width', w).attr('height', h).attr('id', 'selection');

    //tooltip
    const tooltip = d3
      .select('.barChart')
      .append('div')
      .attr('class', 'tooltipColumns')
      .attr('id', 'tooltipColumns')
      .style('position', 'absolute')
      .style('display', 'none')
      .style('background-color', '#FFFFFFDD')
      .style('box-shadow', '0px 0px 10px #555555')
      .style('width', '300px')
      .style('border-radius', '4px')
      .style('padding', '1rem')
      .style('z-index', '9')
      .style('max-height', '70vh')
      .style('overflow-y', 'scroll')
      .style('backdrop-filter', 'blur(2px)')
      .style('-webkit-backdrop-filter', 'blur(2px)');

    //Info show
    const groupInfo = barChart.append('g').attr('width', w).attr('height', h).attr('id', 'info');
    switch (mode) {
      case 1:
        groupBack
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#EEEEEE88')
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h);
        groupInfo
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h)
          .on('mouseover', function (event, d) {
            if (!currThis.tooltipLocked) {
              tooltip.transition().duration(200).style('display', 'block');
              const currDev = d.dev.split('>').join('');
              tooltip
                .style('border', '3px solid transparent')
                .style(
                  'right',
                  w - (d.i * w) / currThis.combinedColumnData.length - 300 > 0
                    ? w - (d.i * w) / currThis.combinedColumnData.length - 300
                    : 0 + 'px',
                )
                .style('top', h + 'px');
              tooltip.selectAll('*').remove();
              const hint = tooltip
                .append('div')
                .style('color', '#AAAAAA')
                .style('background-color', '#eeeeee')
                .style('border-radius', '4px');
              hint.append('span').html('(i)').style('margin', '0 1rem').style('font-style', 'bold');
              hint.append('span').html('click to fix tooltip').style('font-style', 'italic');
              tooltip.append('div').style('font-weight', 'bold').html(currDev.split(' <')[0]);
              tooltip.append('div').html(currDev.split(' <')[1]);
              tooltip.append('hr');
              tooltip.append('div').html('Commits linked to this developer: ' + d.commits.length);
              tooltip.append('hr');
              const commitList = tooltip.append('div');
              ListGeneration.generateCommitList(commitList, d.commits, currThis);
              tooltip.append('hr');
              tooltip.append('div').html('Changes: ' + d.value);
            }
          })
          .on('mouseout', function () {
            if (!currThis.tooltipLocked) {
              tooltip.transition().duration(500).style('display', 'none');
            }
          })
          .on('click', function () {
            currThis.tooltipLocked = !currThis.tooltipLocked;
            tooltip.style('border', currThis.tooltipLocked ? '3px solid #3498db' : '3px solid transparent');
          });
        break;
      case 2:
        groupBack
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#EEEEEE88')
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h);
        groupInfo
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h)
          .on('mouseover', function (event, d) {
            if (!currThis.tooltipLocked) {
              tooltip.transition().duration(200).style('display', 'block');
              tooltip
                .style('border', '3px solid transparent')
                .style(
                  'right',
                  w - (d.i * w) / currThis.combinedColumnData.length - 300 > 0
                    ? w - (d.i * w) / currThis.combinedColumnData.length - 300
                    : 0 + 'px',
                )
                .style('top', h + 'px');
              tooltip.selectAll('*').remove();
              const hint = tooltip
                .append('div')
                .style('color', '#AAAAAA')
                .style('background-color', '#eeeeee')
                .style('border-radius', '4px');
              hint.append('span').html('(i)').style('margin', '0 1rem').style('font-style', 'bold');
              hint.append('span').html('click to fix tooltip').style('font-style', 'italic');
              tooltip
                .append('div')
                .style('font-weight', 'bold')
                .html('Issue: ' + d.iid);
              tooltip.append('div').html(d.title);
              tooltip.append('hr');
              if (d.description !== '') {
                tooltip.append('div').html(d.description);
                tooltip.append('hr');
              }
              tooltip.append('div').html('Commits linked to this issue: ' + d.commits.length);
              tooltip.append('hr');
              const commitList = tooltip.append('div');
              ListGeneration.generateCommitList(commitList, d.commits, currThis);
              tooltip.append('hr');
              tooltip.append('div').html('Changes: ' + d.value);
            }
          })
          .on('mouseout', function () {
            if (!currThis.tooltipLocked) {
              tooltip.transition().duration(500).style('display', 'none');
            }
          })
          .on('click', function () {
            currThis.tooltipLocked = !currThis.tooltipLocked;
            tooltip.style('border', currThis.tooltipLocked ? '3px solid #3498db' : '3px solid transparent');
          });
        break;
      default:
        //Background
        groupBack
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', (d) =>
            d.sha.localeCompare(currThis.state.selectedCommit.sha) === 0
              ? '#3273dc22'
              : d.sha.localeCompare(currThis.state.selectedCompareCommit.sha) === 0
                ? '#4cd96422'
                : '#EEEEEE88',
          )
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h);
        selection
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length + 2)
          .attr('y', h + 2)
          .attr('width', w / currThis.combinedColumnData.length - 4)
          .attr('height', 4)
          .attr('fill', (d) =>
            d.sha.localeCompare(currThis.state.selectedCommit.sha) === 0
              ? '#3273dc'
              : d.sha.localeCompare(currThis.state.selectedCompareCommit.sha) === 0
                ? '#4cd964'
                : '#00000000',
          );

        groupInfo
          .selectAll('rect')
          .data(currThis.combinedColumnData)
          .enter()
          .append('rect')
          .attr('fill', '#00000000')
          .attr('class', 'sBar')
          .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
          .attr('y', 0)
          .attr('width', w / currThis.combinedColumnData.length)
          .attr('height', h)
          .style('cursor', 'pointer')
          .on('mousemove', function (event, d) {
            tooltip.transition().duration(200).style('display', 'block');
            tooltip
              .html(
                "<div style='font-weight: bold'>Version: " +
                  d.column +
                  '</div>' +
                  "<div style='font-style: italic;color: #AAAAAA;'>" +
                  d.date
                    .substring(0, d.date.length - 5)
                    .split('T')
                    .join(' ') +
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
                  "<div style='font-style: italic;color: #AAAAAA; word-wrap: anywhere'>" +
                  'Parent(s): ' +
                  d.parents +
                  '</div>' +
                  '<hr>' +
                  '<div>Changes: ' +
                  d.value +
                  '</div>',
              )
              .style(
                'right',
                w - (d.i * w) / currThis.combinedColumnData.length - 300 > 0
                  ? w - (d.i * w) / currThis.combinedColumnData.length - 300
                  : 0 + 'px',
              )
              .style('top', h + 'px');
          })
          .on('mouseout', function () {
            tooltip.transition().duration(500).style('display', 'none');
          })
          .on('click', function (event, d) {
            if (event.shiftKey) {
              currThis.setState({ selectedCompareCommit: { commitID: d.column - 1, sha: d.sha } });
            } else {
              currThis.setState({ selectedCommit: { commitID: d.column - 1, sha: d.sha } });
            }
          });
        setTimeout(
          function () {
            this.generateBranchView(data, columns, currThis);
          }.bind(this),
        );
        break;
    }
    setTimeout(
      function () {
        this.updateColumnChart(data, columns, currThis, mode, legendSteps, displayProps);
      }.bind(this),
    );
  }

  static updateColumnChart(data, columns, currThis, mode, legendSteps, displayProps) {
    const w = document.getElementById('codeViewContainer').clientWidth - 80;
    const h = 100;

    let maxValue = d3.max(currThis.combinedColumnData, (d) => d.value);
    if (displayProps.customDataScale) {
      maxValue = displayProps.dataScaleColumns;
    } else {
      displayProps.dataScaleColumns = maxValue;
    }

    const legendData = [];

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({
        interval: (maxValue / legendSteps) * i,
        color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, (1.0 / legendSteps) * i),
      });
    }
    const colorScale = (d) => {
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
      .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length)
      .attr('y', (d) => {
        return h - (h / maxValue) * d.value;
      })
      .attr('width', w / currThis.combinedColumnData.length)
      .attr('height', (d) => {
        return (h / maxValue) * d.value;
      });
    bars.exit().remove();
  }

  static generateBranchView(data, columns, currThis) {
    d3.select('#chartBranchView').remove();
    const w = document.getElementById('codeViewContainer').clientWidth - 80;
    const h = 50;

    for (let i = 0; i < currThis.combinedColumnData.length; i++) {
      currThis.combinedColumnData[i].i = i;
    }
    const versionSize = Math.min(w / currThis.combinedColumnData.length, 20) - 4;

    const branches = d3Collection
      .nest()
      .key((d) => d.branch.trim())
      .entries(currThis.combinedColumnData);

    d3.select('.branchView')
      .append('svg')
      .attr('width', '100%')
      .attr('height', h)
      .attr('viewBox', '0 0 ' + w + ' ' + h)
      .attr('preserveAspectRatio', 'none')
      .attr('class', 'chartBranchView')
      .attr('id', 'chartBranchView');

    //tooltip
    const tooltip = d3.select('#tooltipColumns');

    //commits
    const commits = d3.select('#chartBranchView').selectAll('rect').data(currThis.combinedColumnData);
    const branchLines = d3.select('#chartBranchView');
    let offset = 0;
    const firstCommitCount = parseInt(branches[0].values[0].i);
    for (const branch of branches) {
      if (branch.values.length === 1) {
        const c1 = parseInt(branch.values[0].i) - firstCommitCount;
        offset = this.drawBranchConnections(0, branch, currThis, c1, branchLines, branches, h, w, firstCommitCount, null, offset);
      } else {
        for (let i = 0; i < branch.values.length - 1; i++) {
          const c1 = parseInt(branch.values[i].i) - firstCommitCount;
          const c2 = parseInt(branch.values[i + 1].i) - firstCommitCount;
          offset = this.drawBranchConnections(i, branch, currThis, c1, branchLines, branches, h, w, firstCommitCount, c2, offset);
        }
      }
    }
    commits
      .enter()
      .append('rect')
      .attr('fill', (d) =>
        ColorMixer.rainbow(
          branches.length,
          branches.findIndex((v) => v.key.trim() === d.branch.trim()),
        ),
      )
      .attr('class', 'sBar')
      .attr('x', (d, i) => (i * w) / currThis.combinedColumnData.length + w / (currThis.combinedColumnData.length * 2) - versionSize / 2)
      .attr('y', h / 2 - versionSize / 2)
      .attr('width', versionSize)
      .attr('height', versionSize)
      .attr('stroke', (d) =>
        d.sha.localeCompare(currThis.state.selectedCommit.sha) === 0
          ? '#3273dc'
          : d.sha.localeCompare(currThis.state.selectedCompareCommit.sha) === 0
            ? '#4cd964'
            : '#00000000',
      )
      .style('stroke-width', '2px')
      .attr('rx', '100%')
      .attr('ry', '100%')
      .on('mousemove', function (event, d) {
        tooltip.transition().duration(200).style('display', 'block');
        tooltip
          .html(
            "<div style='font-weight: bold'>Version: " +
              d.column +
              '</div>' +
              "<div style='font-style: italic;color: #AAAAAA;'>" +
              d.date
                .substring(0, d.date.length - 5)
                .split('T')
                .join(' ') +
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
              "<div style='font-style: italic;color: #AAAAAA; word-wrap: anywhere'>" +
              'Parent(s): ' +
              d.parents +
              '</div>' +
              '<hr>' +
              '<div>Changes: ' +
              d.value +
              '</div>',
          )
          .style(
            'right',
            w - (d.i * w) / currThis.combinedColumnData.length - 300 > 0
              ? w - (d.i * w) / currThis.combinedColumnData.length - 300
              : 0 + 'px',
          )
          .style('top', h + 100 + 'px');
      })
      .on('mouseout', function () {
        tooltip.transition().duration(500).style('display', 'none');
      })
      .on('click', function (event, d) {
        if (event.shiftKey) {
          currThis.setState({ selectedCompareCommit: { commitID: d.column, sha: d.sha } });
        } else {
          currThis.setState({ selectedCommit: { commitID: d.column, sha: d.sha } });
        }
      });
    commits.exit().remove();
  }

  static drawBranchConnections(i, branch, currThis, c1, branchLines, branches, h, w, firstCommitCount, c2, offset) {
    const branchOutHeight = 5;
    //check if commit is first commit of a branch
    if (i === 0) {
      for (const parentSha of branch.values[i].parents) {
        //find parent commit
        let parent = currThis.combinedColumnData.find((d) => d.sha === parentSha);
        //if parent commit is not found look trhough the history to find commit to cpnnect
        if (parent === undefined) {
          for (const historyParentSha of branch.values[i].history.split(',')) {
            parent = currThis.combinedColumnData.find((d) => d.sha === historyParentSha);
            if (parent !== undefined && parent.sha !== branch.values[i].sha) {
              break;
            }
          }
        }

        //draw line when commit co connect is found
        if (parent !== undefined) {
          offset++;
          let currOffset = (offset % 2 === 0 ? -1 : 1) * Math.floor(offset / 2) + (offset % 2);
          currOffset = Math.min(Math.max(currOffset * branchOutHeight, -h / 2 + 5), h / 2 - 5);
          //check if parent is in front of current commit
          if (parseInt(parent.column) + 1 < c1) {
            //diagonal away from prev commit
            branchLines
              .append('line')
              .style(
                'stroke',
                ColorMixer.rainbow(
                  branches.length,
                  branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
                ),
              )
              .style('stroke-width', 5)
              .style('stroke-linecap', 'round')
              .attr('y1', h / 2)
              .attr(
                'x1',
                w / (currThis.combinedColumnData.length * 2) +
                  ((parent.column - firstCommitCount) * w) / currThis.combinedColumnData.length,
              )
              .attr('y2', h / 2 + currOffset)
              .attr(
                'x2',
                w / (currThis.combinedColumnData.length * 2) +
                  ((parent.column - firstCommitCount + 0.25) * w) / currThis.combinedColumnData.length,
              );

            //straight between the diaogonales
            branchLines
              .append('line')
              .style(
                'stroke',
                ColorMixer.rainbow(
                  branches.length,
                  branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
                ),
              )
              .style('stroke-width', 5)
              .style('stroke-linecap', 'round')
              .attr('y1', h / 2 + currOffset)
              .attr(
                'x1',
                w / (currThis.combinedColumnData.length * 2) +
                  ((parent.column - firstCommitCount + 0.25) * w) / currThis.combinedColumnData.length,
              )
              .attr('y2', h / 2 + currOffset)
              .attr('x2', w / (currThis.combinedColumnData.length * 2) + ((c1 - 0.25) * w) / currThis.combinedColumnData.length);

            //diagonal to the current commit
            branchLines
              .append('line')
              .style(
                'stroke',
                ColorMixer.rainbow(
                  branches.length,
                  branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
                ),
              )
              .style('stroke-width', 5)
              .style('stroke-linecap', 'round')
              .attr('y1', h / 2 + currOffset)
              .attr('x1', w / (currThis.combinedColumnData.length * 2) + ((c1 - 0.25) * w) / currThis.combinedColumnData.length)
              .attr('y2', h / 2)
              .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c1 * w) / currThis.combinedColumnData.length);
          } else {
            branchLines
              .append('line')
              .style(
                'stroke',
                ColorMixer.rainbow(
                  branches.length,
                  branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
                ),
              )
              .style('stroke-width', 5)
              .style('stroke-linecap', 'round')
              .attr('y1', h / 2)
              .attr(
                'x1',
                w / (currThis.combinedColumnData.length * 2) +
                  ((parent.column - firstCommitCount) * w) / currThis.combinedColumnData.length,
              )
              .attr('y2', h / 2)
              .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c1 * w) / currThis.combinedColumnData.length);
          }
        }
      }
    }
    if (c2 !== null) {
      if (c1 + 1 === c2) {
        branchLines
          .append('line')
          .style(
            'stroke',
            ColorMixer.rainbow(
              branches.length,
              branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
            ),
          )
          .style('stroke-width', 5)
          .style('stroke-linecap', 'round')
          .attr('y1', h / 2)
          .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c1 * w) / currThis.combinedColumnData.length)
          .attr('y2', h / 2)
          .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c2 * w) / currThis.combinedColumnData.length);
      } else {
        offset++;
        let currOffset = (offset % 2 === 0 ? -1 : 1) * Math.floor(offset / 2) + (offset % 2);

        currOffset = Math.min(Math.max(currOffset * branchOutHeight, -h / 2 + 5), h / 2 - 5);
        branchLines
          .append('line')
          .style(
            'stroke',
            ColorMixer.rainbow(
              branches.length,
              branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
            ),
          )
          .style('stroke-width', 5)
          .style('stroke-linecap', 'round')
          .attr('y1', h / 2)
          .attr('x1', w / (currThis.combinedColumnData.length * 2) + (c1 * w) / currThis.combinedColumnData.length)
          .attr('y2', h / 2 + currOffset)
          .attr('x2', w / (currThis.combinedColumnData.length * 2) + ((c1 + 0.5) * w) / currThis.combinedColumnData.length);

        branchLines
          .append('line')
          .style(
            'stroke',
            ColorMixer.rainbow(
              branches.length,
              branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
            ),
          )
          .style('stroke-width', 5)
          .style('stroke-linecap', 'round')
          .attr('y1', h / 2 + currOffset)
          .attr('x1', w / (currThis.combinedColumnData.length * 2) + ((c1 + 0.5) * w) / currThis.combinedColumnData.length)
          .attr('y2', h / 2 + currOffset)
          .attr('x2', w / (currThis.combinedColumnData.length * 2) + ((c2 - 0.5) * w) / currThis.combinedColumnData.length);

        branchLines
          .append('line')
          .style(
            'stroke',
            ColorMixer.rainbow(
              branches.length,
              branches.findIndex((v) => v.key.trim() === branch.values[i].branch.trim()),
            ),
          )
          .style('stroke-width', 5)
          .style('stroke-linecap', 'round')
          .attr('y1', h / 2 + currOffset)
          .attr('x1', w / (currThis.combinedColumnData.length * 2) + ((c2 - 0.5) * w) / currThis.combinedColumnData.length)
          .attr('y2', h / 2)
          .attr('x2', w / (currThis.combinedColumnData.length * 2) + (c2 * w) / currThis.combinedColumnData.length);
      }
    }
    return offset;
  }
}
