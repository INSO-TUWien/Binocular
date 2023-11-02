import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';
import ColorMixer from '../../helper/colorMixer';
import ListGeneration from '../../helper/listGeneration';

const HEATMAP_LOW_COLOR = '#ABEBC6';
const HEATMAP_HIGH_COLOR = '#E6B0AA';
const HEATMAP_MAX_COLOR = '#d5796f';

const lineHeight = 22.4;

export default class rowChartGeneration {
  static generateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps) {
    d3.select('#chartRow').remove();
    d3.select('#tooltipRow').remove();
    //let maxValue = 0;
    switch (mode) {
      case 1:
        currThis.combinedRowData = d3Collection
          .nest()
          .key((d) => d.row)
          .rollup(function (v) {
            const devs = v.map((g) => g.dev);
            const values = v.map((g) => g.value);
            return {
              column: v[0].column,
              value: d3.sum(v, (g) => g.value),
              developer: devs
                .map(function (v, i) {
                  return { dev: v, value: values[i] };
                })
                .filter((d) => d.value !== 0),
            };
          })
          .entries(data)
          .map(function (d) {
            const row = d.key;
            const res = d.value;
            res.row = row;
            return res;
          });
        break;
      case 2:
        currThis.combinedRowData = d3Collection
          .nest()
          .key((d) => d.row)
          .rollup(function (v) {
            const titles = v.map((g) => g.title);
            const values = v.map((g) => g.value);
            return {
              column: v[0].column,
              value: d3.sum(v, (g) => g.value),
              issues: titles
                .map(function (v, i) {
                  return { title: v, value: values[i] };
                })
                .filter((d) => d.value !== 0),
            };
          })
          .entries(data)
          .map(function (d) {
            const row = d.key;
            const res = d.value;
            res.row = row;
            return res;
          });
        break;
      default:
        currThis.combinedRowData = d3Collection
          .nest()
          .key((d) => d.row)
          .rollup(function (v) {
            return {
              column: v[0].column,
              value: d3.sum(v, (g) => g.value),
            };
          })
          .entries(data)
          .map(function (d) {
            const row = d.key;
            const res = d.value;
            res.row = row;
            return res;
          });
        break;
    }

    const width = 28,
      height = lineHeight * lines,
      margins = { top: 28, right: 0, bottom: 0, left: 2 };

    //Setting chart width and adjusting for margins
    d3.select('.chartRowSummary')
      .append('svg')
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .attr('id', 'chartRow')
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

    d3.select('.chartRowSummary')
      .append('div')
      .attr('class', 'tooltipRow')
      .attr('id', 'tooltipRow')
      .style('position', 'absolute')
      .style('display', 'none')
      .style('background-color', '#FFFFFFDD')
      .style('box-shadow', '0px 0px 10px #555555')
      .style('width', '40rem')
      .style('border-radius', '4px')
      .style('padding', '1rem')
      .style('backdrop-filter', 'blur(2px)')
      .style('-webkit-backdrop-filter', 'blur(2px)');

    //chart
    setTimeout(
      function () {
        this.updateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps);
      }.bind(this)
    );
  }

  static updateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps) {
    const chart = d3.select('#chartRow');
    const tooltipp = d3.select('#tooltipRow');

    let maxValue = d3.max(currThis.combinedRowData, (d) => d.value);

    const legendData = [];

    if (displayProps.customDataScale) {
      maxValue = displayProps.dataScaleRows;
    } else {
      displayProps.dataScaleRows = maxValue;
    }

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({
        interval: (maxValue / legendSteps) * i,
        color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, (1.0 / legendSteps) * i),
      });
    }

    const barWidth = 28,
      barHeight = lineHeight;
    const colorScale = (d) => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return HEATMAP_MAX_COLOR;
    };

    const bars = chart.selectAll('rect').data(currThis.combinedRowData);

    //tooltip

    switch (mode) {
      case 1:
        bars
          .enter()
          .append('rect')
          .attr('x', 0)
          .attr('y', (d) => {
            return (d.row - firstLineNumber + 1) * barHeight;
          })
          .style('fill', colorScale)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('z-index', '10')
          .on('mouseover', function (event, d) {
            tooltipp.transition().duration(200).style('display', 'block');
            tooltipp
              .html(
                "<div style='font-weight: bold'>Row: " +
                  (parseInt(d.row) + 1) +
                  '</div>' +
                  '<div>Changes: ' +
                  d.value +
                  '</div>' +
                  '<hr>' +
                  ListGeneration.generateDeveloperList(d.developer)
              )
              .style('right', 30 + 'px')
              .style('top', (d.row - firstLineNumber + 1) * barHeight + 'px');
          })
          .on('mouseout', function () {
            tooltipp.transition().duration(500).style('display', 'none');
          });

        break;
      case 2:
        bars
          .enter()
          .append('rect')
          .attr('x', 0)
          .attr('y', (d) => {
            return (d.row - firstLineNumber + 1) * barHeight;
          })
          .style('fill', colorScale)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('z-index', '10')
          .on('mouseover', function (event, d) {
            tooltipp.transition().duration(200).style('display', 'block');
            tooltipp
              .html(
                "<div style='font-weight: bold'>Row: " +
                  (parseInt(d.row) + 1) +
                  '</div>' +
                  '<div>Changes: ' +
                  d.value +
                  '</div>' +
                  (d.issues.length > 0 ? '<hr>' + ListGeneration.generateIssueList(d.issues) : '')
              )
              .style('right', 30 + 'px')
              .style('top', (d.row - firstLineNumber + 1) * barHeight + 'px');
          })
          .on('mouseout', function () {
            tooltipp.transition().duration(500).style('display', 'none');
          });

        break;
      default:
        bars
          .enter()
          .append('rect')
          .attr('x', 0)
          .attr('y', (d) => {
            return (d.row - firstLineNumber + 1) * barHeight;
          })
          .style('fill', colorScale)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('z-index', '10')
          .on('mouseover', function (event, d) {
            tooltipp.transition().duration(200).style('display', 'block');
            tooltipp
              .html("<div style='font-weight: bold'>Row: " + (parseInt(d.row) + 1) + '</div>' + '<div>Changes: ' + d.value + '</div>')
              .style('right', 30 + 'px')
              .style('top', (d.row - firstLineNumber + 1) * barHeight + 'px');
          })
          .on('mouseout', function () {
            tooltipp.transition().duration(500).style('display', 'none');
          });

        break;
    }
    bars.exit().remove();
  }
}
