'use strict';

import React from 'react';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import styles from '../styles.scss';
import 'codemirror/lib/codemirror.css';
require('codemirror/mode/javascript/javascript');
import "../css/codeMirror.css";
import vcsData from "./helper/vcsData";
import charts from "./charts";
import Promise from 'bluebird';
import {graphQl} from '../../../utils';
import Loading from "./helper/loading";
import ModeSwitcher from './helper/modeSwitcher';

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

    this.getAllBranches().then(function(resp){
      for (let i in resp) {
        if(resp[i].active==="true"){
          props.onSetBranch(resp[i].branch);
        }
      }
      props.onSetBranches(resp);
    });
    this.elems = {};
    this.state = {
      code:"No File Selected",
      branch:"master",
      fileURL:"",
      path:"",
      sha:""
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

    return (<div className={styles.w100}>
        <div className={"loadingContainer"}></div>
        <div className={styles.w100}>
          {
            this.state.sha!==""&&
            <div><button className={"button "+styles.mg1} onClick={(e)=>{
              this.setState({sha:""});
            }
            }>Back to current Version</button></div>
          }
          <div className={styles.w100 +" " + styles.pr}>
            <div className={styles.codeView}>
              <CodeMirror
                value={this.state.code}
                options={{
                  mode: ModeSwitcher.modeFromExtension(this.state.path.split(".").pop()),
                  theme: 'default',
                  lineNumbers: true,
                  readOnly: true
                }}
              />
              <div className={styles.heatmapContainer}>
                <svg className='chartHeatmap'></svg>
              </div>
              <div className={styles.rowSummaryContainer}>
                <div className='chartRowSummary'></div>
              </div>
            </div >
            <div className={styles.barChartContainer}>
              <div className={'barChart'}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  requestData(){
    if(this.state.path !==""){
      var xhr = new XMLHttpRequest();
      Loading.insert();
      xhr.open("GET",  this.state.fileURL.replace("/blob", "").replace("github.com","raw.githubusercontent.com").replace("master",this.state.sha===""?this.state.branch:this.state.sha), true);
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let lines = xhr.responseText.split(/\r\n|\r|\n/).length
            let path = this.state.path
            let currThis = this;
            vcsData.getChangeData(path).then(function (resp){
              charts.updateAllChartsWithChanges(resp,lines,path,currThis);
              currThis.setState({code: xhr.responseText});
              Loading.remove();
            });
          } else {
            Loading.setErrorText(xhr.statusText);
            console.error(xhr.statusText);
          }
        }
      }.bind(this);
      xhr.onerror = function (e) {
        Loading.setErrorText(xhr.statusText);
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

  getAllBranches(){
    return Promise.resolve(
      graphQl.query(
        `
      query{
       branches(sort: "ASC"){
          data{branch,active}
        }
      }
      `,
        {}
      ))
      .then(resp => resp.branches.data);
  }
}

