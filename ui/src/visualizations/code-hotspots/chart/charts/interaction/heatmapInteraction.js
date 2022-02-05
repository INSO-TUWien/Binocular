import * as d3 from 'd3';
import hunkChartGeneration from '../subCharts/hunkChartGeneration';

export default class heatmapInteraction {
  static generateHeatmapInteractionLayer(data, lines, importantColumns, currThis, mode, firstLineNumber, displayProps) {
    d3.select('.rowInteraction > *').remove();
    currThis.combinedHeatmapData = data;
    const width = document.getElementById('barChartContainer').clientWidth,
      height = 24 * lines,
      margins = { top: 24, right: 0, bottom: 0, left: 0 };
    //Setting chart width and adjusting for margins
    const interactionLayer = d3
      .select('.rowInteraction')
      .attr('width', 'calc(100% - 105px)')
      .attr('height', height + margins.top + margins.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margins.top + margins.bottom))
      .attr('preserveAspectRatio', 'none')
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')
      .attr('id', 'rowInteractionLayer');
    for (let i = 0; i < lines; i++) {
      interactionLayer
        .append('rect')
        .attr('x', 0)
        .attr('y', (i - firstLineNumber) * 24)
        .style('fill', 'transparent')
        .attr('width', width)
        .attr('height', 24)
        .on('mouseover', function() {
          if (displayProps.mainVisualizationMode === 1 && mode === 0) {
            hunkChartGeneration.interact(i);
          }
        });
    }
  }
}
