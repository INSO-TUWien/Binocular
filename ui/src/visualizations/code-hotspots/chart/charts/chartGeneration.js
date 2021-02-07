import * as d3 from 'd3';
import ColorMixer from '../helper/colorMixer';
import ListGeneration from '../helper/listGeneration';

let HEATMAP_LOW_COLOR = '#ABEBC6';
let HEATMAP_HEIGH_COLOR = '#E6B0AA';
let HEATMAP_MAX_COLOR = '#d5796f';
let EVEN_COLOR = '#FFFFFFFF';
let ODD_COLOR = '#EEEEEE55';

export default class chartGeneration {
  static generateHeatmap(data,lines,columns,currThis,mode,maxValue,legendSteps){

    d3.select('.chartHeatmap > *').remove();

    const legendData = [];

    if(!currThis.state.dataScaleMode){
      maxValue = currThis.state.dataScaleHeatmap;
    }else{
      currThis.state.dataScaleHeatmap = maxValue;
    }

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({'interval': maxValue/legendSteps*i, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGH_COLOR,1.0/legendSteps*i)})
    }

    const width = document.getElementById('barChartContainer').clientWidth,
      height = 24*lines,
      margins = {top:28, right: 0, bottom: 0, left: 0};


    //Setting chart width and adjusting for margins
    const chart = d3.select('.chartHeatmap')
      .attr('width', "calc(100% - 105px)")
      .attr('height', height + margins.top + margins.bottom)
      .attr("viewBox","0 0 "+width+" "+(height + margins.top + margins.bottom))
      .attr('preserveAspectRatio','none')
      .append('g')
      .attr('transform','translate(' + margins.left + ',' + margins.top + ')');


    const barWidth = width / columns,
      barHeight = 24;

    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if(d.value===0){
          if(d.row%2===0){
            return EVEN_COLOR;
          }else{
            return ODD_COLOR;
          }
        }
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return HEATMAP_MAX_COLOR;
    };

    chart.selectAll('g')
      .data(data).enter()
      .append('rect')
      .attr('x', d => {return (d.column - 0) * barWidth})
      .attr('y', d => {return (d.row - 1) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight)
  }

  static generateRowSummary(data,lines,currThis,mode,legendSteps){
    d3.select('.chartRow').remove();
    d3.select('.tooltipRow').remove();

    let combinedData=[]
    let maxValue =0;


    switch (mode){
      case 1:
        for (let i = 0; i < data.length; i++) {
          if(combinedData[data[i].row]===undefined){
            combinedData[data[i].row]={"column":data[i].column,"row":data[i].row,"value":data[i].value,"developer":[]};
            combinedData[data[i].row].developer.push({"dev":data[i].dev,"value":data[i].value})
          }else{
            combinedData[data[i].row].value += data[i].value;
            combinedData[data[i].row].developer.push({"dev":data[i].dev,"value":data[i].value})
            if(combinedData[data[i].row].value>maxValue){
              maxValue=combinedData[data[i].row].value;
            }
          }
        }
        break;
      case 2:
        for (let i = 0; i < data.length; i++) {
          if(combinedData[data[i].row]===undefined){
            combinedData[data[i].row]={"column":data[i].column,"row":data[i].row,"value":data[i].value,"issues":[]};
            combinedData[data[i].row].issues.push({"title":data[i].title,"value":data[i].value})
          }else{
            combinedData[data[i].row].value += data[i].value;
            combinedData[data[i].row].issues.push({"title":data[i].title,"value":data[i].value})
            if(combinedData[data[i].row].value>maxValue){
              maxValue=combinedData[data[i].row].value;
            }
          }
        }
        break;
      default:
        for (let i = 0; i < data.length; i++) {
          if(combinedData[data[i].row]===undefined){
            combinedData[data[i].row]={"column":data[i].column,"row":data[i].row,"value":data[i].value};
          }else{
            combinedData[data[i].row].value += data[i].value;
            if(combinedData[data[i].row].value>maxValue){
              maxValue=combinedData[data[i].row].value;
            }
          }
        }
        break;
    }

    const legendData = [];

    if(!currThis.state.dataScaleMode){
      maxValue = currThis.state.dataScaleRow;
    }else{
      currThis.state.dataScaleRow = maxValue;
    }

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({'interval': maxValue/legendSteps*i, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGH_COLOR,1.0/legendSteps*i)})
    }


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
      return HEATMAP_MAX_COLOR;
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
      .style("width","40rem")
      .style("border-radius","4px")
      .style("padding","1rem");

    //chart

    switch (mode){
      case 1:
        chart.selectAll('g')
          .data(combinedData).enter().append('g')
          .append('rect')
          .attr('x', d => {return (d.column - 0) * barWidth})
          .attr('y', d => {return (d.row - 1) * barHeight})
          .style('fill', colorScale)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('z-index', "10")
          .on("mouseover", function(d,i) {
            div.transition()
              .duration(200)
              .style("opacity", 1);
            div	.html("<div style='font-weight: bold'>Row: "+(d.row+1)+"</div>" +
              "<div>Changes: "+d.value+"</div>"+
              "<hr>"+
              ListGeneration.generateDeveloperList(d.developer)
            )
              .style("right", (30) + "px")
              .style("top", ((d.row) * barHeight) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

        break;
      case 2:
        chart.selectAll('g')
          .data(combinedData).enter().append('g')
          .append('rect')
          .attr('x', d => {return (d.column - 0) * barWidth})
          .attr('y', d => {return (d.row - 1) * barHeight})
          .style('fill', colorScale)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('z-index', "10")
          .on("mouseover", function(d,i) {
            div.transition()
              .duration(200)
              .style("opacity", 1);
            div	.html("<div style='font-weight: bold'>Row: "+(d.row+1)+"</div>" +
              "<div>Changes: "+d.value+"</div>"+
              "<hr>"+
              ListGeneration.generateIssueList(d.issues)
            )
              .style("right", (30) + "px")
              .style("top", ((d.row) * barHeight) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

        break;
      default:
        chart.selectAll('g')
          .data(combinedData).enter().append('g')
          .append('rect')
          .attr('x', d => {return (d.column - 0) * barWidth})
          .attr('y', d => {return (d.row - 1) * barHeight})
          .style('fill', colorScale)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('z-index', "10")
          .on("mouseover", function(d,i) {
            div.transition()
              .duration(200)
              .style("opacity", 1);
            div	.html("<div style='font-weight: bold'>Row: "+(d.row+1)+"</div>" +
              "<div>Changes: "+d.value+"</div>")
              .style("right", (30) + "px")
              .style("top", ((d.row) * barHeight) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

        break;
    }


  }

  static generateBarChart(data,columns,currThis,mode,legendSteps) {
    d3.select('.chartColumns').remove();
    d3.select('.tooltipColumns').remove();


    let combinedData = []
    let maxValue = 0;
    switch (mode) {
      case 1:
        for (let i = 0; i < data.length; i++) {
          if (combinedData[data[i].column] === undefined) {
            combinedData[data[i].column] = {"column": data[i].column,
              "row": data[i].row,
              "value": data[i].value,
              "message":data[i].message,
              "sha":data[i].sha,
              "dev":data[i].dev}
          } else {
            combinedData[data[i].column].value += data[i].value;
            if (combinedData[data[i].column].value > maxValue) {
              maxValue = combinedData[data[i].column].value;
            }
          }
        }

        break;
      case 2:
        for (let i = 0; i < data.length; i++) {
          if (combinedData[data[i].column] === undefined) {
            combinedData[data[i].column] = {"column": data[i].column,
              "row": data[i].row,
              "value": data[i].value,
              "message":data[i].message,
              "sha":data[i].sha,
              "title":data[i].title,
              "description":data[i].description,
              "iid":data[i].iid};
          } else {
            combinedData[data[i].column].value += data[i].value;
            if (combinedData[data[i].column].value > maxValue) {
              maxValue = combinedData[data[i].column].value;
            }
          }
        }

        break;
      default:
        for (let i = 0; i < data.length; i++) {
          if (combinedData[data[i].column] === undefined) {
            combinedData[data[i].column] = {"column": data[i].column, "row": data[i].row, "value": data[i].value,"message":data[i].message,"sha":data[i].sha,"signature":data[i].signature};
          } else {
            combinedData[data[i].column].value += data[i].value;
            if (combinedData[data[i].column].value > maxValue) {
              maxValue = combinedData[data[i].column].value;
            }
          }
        }

        break;

    }

    const legendData = [];

    if(!currThis.state.dataScaleMode){
      maxValue = currThis.state.dataScaleColumns;
    }else{
      currThis.state.dataScaleColumns = maxValue;
    }

    for (let i = 1; i <= legendSteps; i++) {
      legendData.push({'interval': maxValue/legendSteps*i, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGH_COLOR,1.0/legendSteps*i)})
    }

    const colorScale = d => {
      for (let i = 0; i < legendData.length; i++) {
        if (d.value < legendData[i].interval) {
          return legendData[i].color;
        }
      }
      return HEATMAP_MAX_COLOR;
    };


    const w = document.getElementsByClassName("CodeMirror")[0].clientWidth - 80;
    const h = 100;
    const barChart = d3
      .select('.barChart')
      .append("svg")
      .attr("width", '100%')
      .attr("height", h)
      .attr("viewBox","0 0 "+w+" "+h)
      .attr('preserveAspectRatio','none')
      .attr("class", "chartColumns");

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
      .attr("x", (d, i) => i * w / columns)
      .attr("y", 0)
      .attr("width", w / columns)
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
      .attr("x", (d, i) => i * w / columns)
      .attr("y", (d, i) => {
        return h - h / maxValue * d.value;
      })
      .attr("width", w / columns)
      .attr("height", (d, i) => {
        return h / maxValue * d.value;
      });


    //tooltip
    let div = d3
      .select('.barChart')
      .append("div")
      .attr("class", "tooltipColumns")
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

    switch (mode){
      case 1:
        groupInfo
          .selectAll("rect")
          .data(combinedData)
          .enter()
          .append("rect")
          .attr("fill", "#00000000")
          .attr("class", "sBar")
          .attr("x", (d, i) => i * w / columns)
          .attr("y", 0)
          .attr("width", w / columns)
          .attr("height", h)
          .on("mouseover", function(d,i) {
            div.transition()
              .duration(200)
              .style("opacity", 1);
            div	.html("<div style='font-weight: bold'>Developer: "+(parseInt(d.column)+1)+"</div>" +
              "<div>"+d.dev+"</div>"+
              "<hr>"+
              "<div>Changes: "+d.value+"</div>")
              .style("right", (w-(i * w / columns)-300)>0?(w-(i * w / columns)-300):0 + "px")
              .style("top", (h) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });
        break;
      case 2:
        groupInfo
          .selectAll("rect")
          .data(combinedData)
          .enter()
          .append("rect")
          .attr("fill", "#00000000")
          .attr("class", "sBar")
          .attr("x", (d, i) => i * w / columns)
          .attr("y", 0)
          .attr("width", w / columns)
          .attr("height", h)
          .on("mouseover", function(d,i) {
            div.transition()
              .duration(200)
              .style("opacity", 1);
            div	.html("<div style='font-weight: bold'>Issue: "+d.iid+"</div>" +
              "<div>"+d.title+"</div>"+
              "<hr>"+
              "<div>"+d.description+"</div>"+
              "<hr>"+
              "<div>Changes: "+d.value+"</div>")
              .style("right", (w-(i * w / columns)-300)>0?(w-(i * w / columns)-300):0 + "px")
              .style("top", (h) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });
        break;
      default:
        groupInfo
          .selectAll("rect")
          .data(combinedData)
          .enter()
          .append("rect")
          .attr("fill", "#00000000")
          .attr("class", "sBar")
          .attr("x", (d, i) => i * w / columns)
          .attr("y", 0)
          .attr("width", w / columns)
          .attr("height", h)
          .style("cursor", "pointer")
          .on("mouseover", function(d,i) {
            div.transition()
              .duration(200)
              .style("opacity", 1);
            div	.html("<div style='font-weight: bold'>Version: "+d.column+"</div>" +
              "<div>"+d.message+"</div>"+
              "<hr>"+
              "<div>"+d.signature+"</div>"+
              "<hr>"+
              "<div>Changes: "+d.value+"</div>")
              .style("right", (w-(i * w / columns)-300)>0?(w-(i * w / columns)-300):0 + "px")
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
        break;
    }
  }
}
