'use strict';

import React from 'react';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import styles from '../styles.scss';
import 'codemirror/lib/codemirror.css';
require('codemirror/mode/javascript/javascript');
import "../css/codeMirror.css";
import vcsData from "./vcsData";
import charts from "./charts";
import Promise from 'bluebird';
import {graphQl} from '../../../utils';

let code ="No File Selected";



export default class CodeHotspots extends React.PureComponent {
  constructor(props) {
    super(props);

    this.requestFileStructure().then(function (resp){
      let files =[];
      for (let i in resp) {
        files.push({key:resp[i].path,webUrl:resp[i].webUrl});
      }
      props.onSetFiles(files);
    });
    this.elems = {};
    this.state = {
      code:"No File Selected",
      branch:"master",
      fileURL:"",
      path:""
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL,branch,path } = nextProps;
    this.setState({path: path});
    this.setState({branch: branch});
    this.setState({fileURL: fileURL});

  }


  componentDidMount() {

  }

  render() {
    this.requestData();

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
            <svg className='chartHeatmap'></svg>
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

  requestData(){
    if(this.state.path !==""){
      var xhr = new XMLHttpRequest();
      xhr.open("GET",  this.state.fileURL.replace("/blob", "").replace("github.com","raw.githubusercontent.com").replace("master",this.state.branch), true);
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this.setState({code: xhr.responseText});
            let lines = xhr.responseText.split(/\r\n|\r|\n/).length
            let path = this.state.path
            vcsData.getChangeData(path).then(function (resp){
              charts.updateAllChartsWithChanges(resp,lines,path);
            });
          } else {
            console.error(xhr.statusText);
          }
        }
      }.bind(this);
      xhr.onerror = function (e) {
        console.error(xhr.statusText);
      };
      xhr.send(null);
    }
  }

  requestFileStructure(){
    return Promise.resolve(
      graphQl.query(
        `
      query{
       files(sort: "ASC"){
          data{path,webUrl}
        }
      }
      `,
        {}
      ))
      .then(resp => resp.files.data);
  }
}

