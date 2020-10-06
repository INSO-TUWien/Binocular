import * as d3 from 'd3';
import ColorMixer from './colorMixer';
import _ from 'lodash';

let HEATMAP_LOW_COLOR = '#ABEBC6';
let HEATMAP_HEIGHT_COLOR = '#E6B0AA';



export default class charts {
  static updateAllChartsWithChanges(rawData,lines,path){
    let data=[];
    let commits=0;
    for (let i in rawData.data) {
      let commit = rawData.data[i];
      for (let j = 0; j < lines; j++) {
        data.push({"version":i,"row":j,"value":0})
      }


      let files = commit.files.data;
      let file = _.filter(files, {file:{path: path}})[0];
      if(file!==undefined){
        for (let j in file.hunks) {
          let hunk = file.hunks[j];
          for (let k = 0; k < hunk.newLines; k++) {
            let cellIndex = _.findIndex(data,{version:i,row:hunk.newStart+k-1});
            if(cellIndex!==-1){
              data[cellIndex].value += 1;
            }
          }
        }
        commits++;
      }
    }
    this.generateHeatmap(data,lines,commits);
    this.generateRowSummary(data,lines);
    this.generateBarChart(data,commits);
  }

  static generateHeatmap(data,lines,commits){

    d3.select('.chartHeatmap > *').remove();

    const legendData = [
      {'interval': 1, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0)},
      {'interval': 2, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.1)},
      {'interval': 3, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.2)},
      {'interval': 4, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.3)},
      {'interval': 5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.4)},
      {'interval': 6, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.5)},
      {'interval': 7, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.6)},
      {'interval': 8, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.7)},
      {'interval': 9, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.8)},
      {'interval': 10, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.9)}
    ];

    const width = document.getElementsByClassName("CodeMirror")[0].clientWidth-60,
      height = 24*lines,
      margins = {top:28, right: 0, bottom: 0, left: 30};


    //Setting chart width and adjusting for margins
    const chart = d3.select('.chartHeatmap')
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .append('g')
      .attr('transform','translate(' + margins.left + ',' + margins.top + ')');


    const barWidth = width / commits,
      barHeight = 24;

    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,1);
    };

    chart.selectAll('g')
      .data(data).enter().append('g')
      .append('rect')
      .attr('x', d => {return (d.version - 0) * barWidth})
      .attr('y', d => {return (d.row - 1) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight)
  }

  static generateRowSummary(data,lines){
    d3.select('.chartRowSummary > *').remove();

    let combinedData=[]
    let maxValue =0;

    for (let i = 0; i < data.length; i++) {
      if(combinedData[data[i].row]==undefined){
        combinedData[data[i].row]={"version":data[i].version,"row":data[i].row,"value":data[i].value};
      }else{
        combinedData[data[i].row].value += data[i].value;
        if(combinedData[data[i].version].value>maxValue){
          maxValue=combinedData[data[i].version].value;
        }
      }
    }
    const legendData = [
      {'interval': maxValue/10, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0)},
      {'interval': maxValue/10*2, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.1)},
      {'interval': maxValue/10*3, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.2)},
      {'interval': maxValue/10*4, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.3)},
      {'interval': maxValue/10*5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.4)},
      {'interval': maxValue/10*6, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.5)},
      {'interval': maxValue/10*7, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.6)},
      {'interval': maxValue/10*8, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.7)},
      {'interval': maxValue/10*9, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.8)},
      {'interval': maxValue, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.9)}
    ];


    const width = 28,
      height = 24*lines,
      margins = {top:28, right: 0, bottom: 0, left: 2};


    //Setting chart width and adjusting for margins
    const chart = d3.select('.chartRowSummary')
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .append('g')
      .attr('transform','translate(' + margins.left + ',' + margins.top + ')');


    const barWidth = 28,
      barHeight = 24;
    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,1);
    };

    chart.selectAll('g')
      .data(combinedData).enter().append('g')
      .append('rect')
      .attr('x', d => {return (d.version - 0) * barWidth})
      .attr('y', d => {return (d.row - 1) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight)
  }

  static generateBarChart(data,commits) {
    d3.select('.barChart > *').remove();


    let combinedData = []
    let maxValue = 0;

    for (let i = 0; i < data.length; i++) {
      if (combinedData[data[i].version] == undefined) {
        combinedData[data[i].version] = {"version": data[i].version, "row": data[i].row, "value": data[i].value};
      } else {
        combinedData[data[i].version].value += data[i].value;
        if (combinedData[data[i].version].value > maxValue) {
          maxValue = combinedData[data[i].version].value;
        }
      }
    }

    const legendData = [
      {'interval': maxValue / 10, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0)},
      {'interval': maxValue / 10 * 2, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.1)},
      {'interval': maxValue / 10 * 3, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.2)},
      {'interval': maxValue / 10 * 4, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.3)},
      {'interval': maxValue / 10 * 5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.4)},
      {'interval': maxValue / 10 * 6, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.5)},
      {'interval': maxValue / 10 * 7, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.6)},
      {'interval': maxValue / 10 * 8, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.7)},
      {'interval': maxValue / 10 * 9, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.8)},
      {'interval': maxValue, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.9)}
    ];

    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 1);
    };


    const w = document.getElementsByClassName("CodeMirror")[0].clientWidth - 60;
    const h = 100;
    const barChart = d3
      .select('.barChart')
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "bar");
    barChart
      .selectAll("rect")
      .data(combinedData)
      .enter()
      .append("rect")
      .attr("fill", colorScale)
      .attr("class", "sBar")
      .attr("x", (d, i) => i * w / commits)
      .attr("y", (d, i) => {
        return h - h / maxValue * d.value;
      })
      .attr("width", w / commits)
      .attr("height", (d, i) => h / maxValue * d.value);
  }

}
