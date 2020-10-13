import * as d3 from 'd3';
import ColorMixer from './helper/colorMixer';
import _ from 'lodash';

let HEATMAP_LOW_COLOR = '#ABEBC6';
let HEATMAP_HEIGHT_COLOR = '#E6B0AA';



export default class charts {
  static updateAllChartsWithChanges(rawData,lines,path,currThis){
    let data=[];
    let commits=0;
    for (let i in rawData.data) {
      let commit = rawData.data[i];
      for (let j = 0; j < lines; j++) {
        data.push({"version":i,"row":j,"value":0,"message":commit.message,"sha":commit.sha,"signature":commit.signature})
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
          for (let k = 0; k < hunk.oldLines; k++) {
            let cellIndex = _.findIndex(data,{version:i,row:hunk.oldStart+k-1});
            if(cellIndex!==-1){
              data[cellIndex].value += 1;
            }
          }
        }
        commits++;
      }
    }
    this.generateRowSummary(data,lines);
    this.generateHeatmap(data,lines,commits);
    this.generateBarChart(data,commits,currThis);
  }

  static generateHeatmap(data,lines,commits){

    d3.select('.chartHeatmap > *').remove();

    const legendData = [
      {'interval': 0.5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0)},
      {'interval': 1, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.1)},
      {'interval': 1.5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.2)},
      {'interval': 2, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.3)},
      {'interval': 2.5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.4)},
      {'interval': 3, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.5)},
      {'interval': 3.5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.6)},
      {'interval': 4, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.7)},
      {'interval': 4.5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.8)},
      {'interval': 5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.9)}
    ];

    const width = document.getElementsByClassName("CodeMirror")[0].clientWidth-80,
      height = 24*lines,
      margins = {top:28, right: 0, bottom: 0, left: 40};


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
    d3.select('.chartRow').remove();
    d3.select('.tooltipRow').remove();

    let combinedData=[]
    let maxValue =0;

    for (let i = 0; i < data.length; i++) {
      if(combinedData[data[i].row]==undefined){
        combinedData[data[i].row]={"version":data[i].version,"row":data[i].row,"value":data[i].value};
      }else{
        combinedData[data[i].row].value += data[i].value;
        if(combinedData[data[i].row].value>maxValue){
          maxValue=combinedData[data[i].row].value;
        }
      }
    }
    const legendData = [
      {'interval': maxValue/10, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.1)},
      {'interval': maxValue/10*2, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.2)},
      {'interval': maxValue/10*3, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.3)},
      {'interval': maxValue/10*4, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.4)},
      {'interval': maxValue/10*5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.5)},
      {'interval': maxValue/10*6, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.6)},
      {'interval': maxValue/10*7, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.7)},
      {'interval': maxValue/10*8, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.8)},
      {'interval': maxValue/10*9, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.9)},
      {'interval': maxValue, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,1)}
    ];


    const width = 28,
      height = 24*lines,
      margins = {top:28, right: 0, bottom: 0, left: 2};


    //Setting chart width and adjusting for margins
    const chart = d3.select('.chartRowSummary')
      .append("svg")
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .attr("class", "chartRow")
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

    //tooltip
    let div = d3
      .select('.chartRowSummary')
      .append("div")
      .attr("class", "tooltipRow")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background-color", "#FFFFFFDD")
      .style("box-shadow", "0px 0px 10px #555555")
      .style("max-width","30rem")
      .style("border-radius","4px")
      .style("padding","1rem");

    //chart
    chart.selectAll('g')
      .data(combinedData).enter().append('g')
      .append('rect')
      .attr('x', d => {return (d.version - 0) * barWidth})
      .attr('y', d => {return (d.row - 1) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('z-index', "10")
      .on("mouseover", function(d,i) {
        div.transition()
          .duration(200)
          .style("opacity", 1);
        div	.html("<div style='font-weight: bold'>Row: "+d.row+"</div>" +
          "<div>Changes: "+d.value+"</div>")
          .style("right", (30) + "px")
          .style("top", ((d.row) * barHeight) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  static generateBarChart(data,commits,currThis) {
    d3.select('.chartVersion').remove();
    d3.select('.tooltipVersion').remove();


    let combinedData = []
    let maxValue = 0;

    for (let i = 0; i < data.length; i++) {
      if (combinedData[data[i].version] == undefined) {
        combinedData[data[i].version] = {"version": data[i].version, "row": data[i].row, "value": data[i].value,"message":data[i].message,"sha":data[i].sha,"signature":data[i].signature};
      } else {
        combinedData[data[i].version].value += data[i].value;
        if (combinedData[data[i].version].value > maxValue) {
          maxValue = combinedData[data[i].version].value;
        }
      }
    }

    const legendData = [
      {'interval': maxValue / 10, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.1)},
      {'interval': maxValue / 10 * 2, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.2)},
      {'interval': maxValue / 10 * 3, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.3)},
      {'interval': maxValue / 10 * 4, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.4)},
      {'interval': maxValue / 10 * 5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.5)},
      {'interval': maxValue / 10 * 6, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.6)},
      {'interval': maxValue / 10 * 7, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.7)},
      {'interval': maxValue / 10 * 8, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.8)},
      {'interval': maxValue / 10 * 9, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 0.9)},
      {'interval': maxValue, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 10)}
    ];

    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return ColorMixer.mix(HEATMAP_LOW_COLOR, HEATMAP_HEIGHT_COLOR, 1);
    };


    const w = document.getElementsByClassName("CodeMirror")[0].clientWidth - 80;
    const h = 100;
    const barChart = d3
      .select('.barChart')
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "chartVersion");

    //Background
    let groupBack = barChart
      .append("g")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "background");
    groupBack
      .selectAll("rect")
      .data(combinedData)
      .enter()
      .append("rect")
      .attr("fill", "#EEEEEE88")
      .attr("class", "sBar")
      .attr("x", (d, i) => i * w / commits)
      .attr("y", 0)
      .attr("width", w / commits)
      .attr("height", h);


    //Bars
    let groupData = barChart
      .append("g")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "data");
    groupData
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
      .attr("height", (d, i) => {
        return h / maxValue * d.value;
      });


    //tooltip
    let div = d3
      .select('.barChart')
      .append("div")
      .attr("class", "tooltipVersion")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background-color", "#FFFFFFDD")
      .style("box-shadow", "0px 0px 10px #555555")
      .style("width","300px")
      .style("border-radius","4px")
      .style("padding","1rem")
      .style("z-index","9");

    //Info show
    let groupInfo = barChart
      .append("g")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "info");
    groupInfo
      .selectAll("rect")
      .data(combinedData)
      .enter()
      .append("rect")
      .attr("fill", "#00000000")
      .attr("class", "sBar")
      .attr("x", (d, i) => i * w / commits)
      .attr("y", 0)
      .attr("width", w / commits)
      .attr("height", h)
      .on("mouseover", function(d,i) {
        div.transition()
          .duration(200)
          .style("opacity", 1);
        div	.html("<div style='font-weight: bold'>Version: "+d.version+"</div>" +
          "<div>"+d.message+"</div>"+
          "<hr>"+
          "<div>"+d.signature+"</div>"+
          "<hr>"+
          "<div>Changes: "+d.value+"</div>")
          .style("right", (w-(i * w / commits)-300)>0?(w-(i * w / commits)-300):0 + "px")
          .style("top", (h) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click",function(d){
        currThis.setState({sha:d.sha})
      });
  }

}
