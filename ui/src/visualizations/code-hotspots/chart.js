'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import * as zoomUtils from '../../utils/zoom.js';
import styles from './styles.scss';
//import code from './democode.js';
import 'codemirror/lib/codemirror.css';
require('codemirror/mode/javascript/javascript');
import "./codeMirror.css";
import ColorMixer from "./colorMixer";

const BASE_URL = "https://raw.githubusercontent.com/INSO-TUWien/Binocular/";
let code ="No File Selected";

let HEATMAP_LOW_COLOR = '#ABEBC6';
let HEATMAP_HEIGHT_COLOR = '#E6B0AA';


export default class CodeHotspots extends React.PureComponent {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {
      code:"",
      branch:"master",
      fileURL:"/pupil.js"
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL,branch } = nextProps;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BASE_URL+branch+"/"+fileURL, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.setState({code: xhr.responseText});
        } else {
          console.log(xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.log(xhr.statusText);
    };
    xhr.send(null);
  }

  componentDidMount() {
    let lines = 189;
    let data=[];
    for (let i = 0; i < lines; i++) {
      for (let j = 0; j < 10; j++) {
        data.push({"version":j,"row":i,"value":Math.floor(Math.random() * 10)})
      }
    }
    this.generateHeatmap(data);
    this.generateRowSummary(data);
    this.generateBarChart(data);
  }

  render() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BASE_URL+this.state.branch+"/"+this.state.fileURL, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.setState({code: xhr.responseText});

        } else {
          console.error(xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
    return (<div>
        <div className={styles.codeView}>
          <CodeMirror
            value={this.state.code}
            options={{
              mode: 'javascript',
              theme: 'default',
              lineNumbers: true,
              readOnly: true
            }}
          />
          <div className={styles.heatmapContainer}>
            <svg className='chartHeatmat'></svg>
          </div>
          <div className={styles.rowSummaryContainer}>
            <svg className='chartRowSummary'></svg>
          </div>
        </div >
        <div className={styles.barChartContainer}>
          <div className={'barChart'}></div>
        </div>

      </div>
    );
  }

  generateHeatmap(data){
    const range = d3.extent(data, d => {return d.version; });

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
      height = 24*189,
      margins = {top:28, right: 0, bottom: 0, left: 30};


    //Setting chart width and adjusting for margins
    const chart = d3.select('.chartHeatmat')
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .append('g')
      .attr('transform','translate(' + margins.left + ',' + margins.top + ')');


    const barWidth = width / (range[1] - range[0]+1),
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
      .attr('x', d => {return (d.version - range[0]) * barWidth})
      .attr('y', d => {return (d.row - 1) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight)
  }

  generateRowSummary(data){
    let combinedData=[]
    for (let i = 0; i < data.length; i++) {
      if(combinedData[data[i].row]==undefined){
        combinedData[data[i].row]={"version":data[i].version,"row":data[i].row,"value":data[i].value};
      }else{
        combinedData[data[i].row].value += data[i].value;
      }
    }
    const range = d3.extent(combinedData, d => {return d.version; });

    const legendData = [
      {'interval': 5, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0)},
      {'interval': 10, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.1)},
      {'interval': 15, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.2)},
      {'interval': 20, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.3)},
      {'interval': 25, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.4)},
      {'interval': 30, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.5)},
      {'interval': 35, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.6)},
      {'interval': 40, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.7)},
      {'interval': 45, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.8)},
      {'interval': 50, 'color': ColorMixer.mix(HEATMAP_LOW_COLOR,HEATMAP_HEIGHT_COLOR,0.9)}
    ];

    const width = 28,
      height = 24*189,
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
      .attr('x', d => {return (d.version - range[0]) * barWidth})
      .attr('y', d => {return (d.row - 1) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight)
  }

  generateBarChart(data){
    let combinedData=[]
    for (let i = 0; i < data.length; i++) {
      if(combinedData[data[i].version]==undefined){
        combinedData[data[i].version]={"version":data[i].version,"row":data[i].row,"value":data[i].value};
      }else{
        combinedData[data[i].version].value += data[i].value;
      }
    }
    const w = document.getElementsByClassName("CodeMirror")[0].clientWidth-60;
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
      .attr("fill", HEATMAP_HEIGHT_COLOR)
      .attr("class", "sBar")
      .attr("x", (d, i) => i * w/combinedData.length)
      .attr("y", (d, i) => {
        return h - d.value/10;
      })
      .attr("width", w/combinedData.length)
      .attr("height", (d, i) => d.value/10)
      .append("title")
      .text(d => d);

  }
}

