import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';
import ColorMixer from '../../helper/colorMixer';
import Loading from '../../helper/loading';

const HEATMAP_LOW_COLOR = '#ABEBC6';
const HEATMAP_HIGH_COLOR = '#E6B0AA';
const HEATMAP_MAX_COLOR = '#d5796f';
const EVEN_COLOR = '#FFFFFFFF';
const ODD_COLOR = '#EEEEEE55';

export default class heatmapChartGeneration {
  static generateHeatmap(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    d3.select('.chartHeatmap > *').remove();
    currThis.combinedHeatmapData = data;
    const width = document.getElementById('barChartContainer').clientWidth,
      height = 24 * lines,
      margins = { top: 24, right: 0, bottom: 0, left: 0 };
    //Setting chart width and adjusting for margins
    const chart = d3
      .select('.chartHeatmap')
      .attr('width', 'calc(100% - 105px)')
      .attr('height', height + margins.top + margins.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margins.top + margins.bottom))
      .attr('preserveAspectRatio', 'none')
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')
      .attr('id', 'heatmapChart');
    for (const rowKey of d3Collection.nest().key(d => d.row).entries(currThis.combinedHeatmapData).map(d => d.key)) {
      chart.append('g').attr('id', 'row' + rowKey);
    }
    setTimeout(
      function() {
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

    const width = document.getElementById('barChartContainer').clientWidth;
    const barWidth = width / columns,
      barHeight = 24;
    const legendData = [];

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({
        interval: maxValue / legendSteps * i,
        color: ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HIGH_COLOR, 1.0 / legendSteps * i)
      });
    }
    const colorScale = d => {
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
    const rowDataArray = d3Collection.nest().key(d => d.row).entries(currThis.combinedHeatmapData).map(d => d.values);
    for (const [i, rowData] of rowDataArray.entries()) {
      setTimeout(function() {
        const cells = d3.select('#row' + rowData[0].row).selectAll('rect').data(rowData);
        if (displayProps.heatMapStyle === 2 || displayProps.heatMapStyle === 0) {
          cells
            .enter()
            .append('rect')
            .attr('x', d => {
              return (importantColumns.indexOf(d.column) - 0) * barWidth;
            })
            .attr('y', d => {
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
            .attr('x', d => {
              return (importantColumns.indexOf(d.column) - 0) * barWidth;
            })
            .attr('y', d => {
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
}
