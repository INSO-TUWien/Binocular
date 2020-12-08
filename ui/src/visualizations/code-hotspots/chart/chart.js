'use strict';

import React from 'react';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import styles from '../styles.scss';
import 'codemirror/lib/codemirror.css';
require('codemirror/mode/javascript/javascript');
import "../css/codeMirror.css";
import vcsData from "./helper/vcsData";
import chartUpdater from "./charts/chartUpdater";
import Promise from 'bluebird';
import {graphQl} from '../../../utils';
import Loading from "./helper/loading";
import ModeSwitcher from './helper/modeSwitcher';
import Settings from './settings/settings'

let code ="No File Selected";
let prevPath="";
let prevMode=0;
let prevSha="";


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
      sha:"",
      mode:0,  //modes: 0...Changes/Version  1...Changes/Developer

      //Settings
      dataScaleMode:true,
      dataScaleHeatmap:0,
      dataScaleColumns:0,
      dataScaleRow:0
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
          <div className={styles.menubar}>
            <Settings
              state={this.state}
              currThis={this}
            />
            <div className={styles.inline}><button id={"CpVButton"}  className={"button "+styles.mg1+" "+styles.selected} onClick={(e)=>{
              this.setState({mode:0});
              document.getElementById("CpVButton").classList.add(styles.selected);
              document.getElementById("CpDButton").classList.remove(styles.selected);
            }}>Changes/Version</button></div>
            <div className={styles.inline}><button id={"CpDButton"} className={"button "+styles.mg1} onClick={(e)=>{
              this.setState({mode:1});
              document.getElementById("CpVButton").classList.remove(styles.selected);
              document.getElementById("CpDButton").classList.add(styles.selected);
            }}>Changes/Developer</button></div>
          </div>
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
            <div id={"barChartContainer"} className={styles.barChartContainer}>
              <div className={'barChart'}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  requestData(){
    if(this.state.path !==""){
      Loading.insert();
      if(this.state.path!==this.prevPath||this.state.mode!==this.prevMode||this.state.sha!==this.prevSha){
        var xhr = new XMLHttpRequest();
        xhr.open("GET",  this.state.fileURL.replace("/blob", "").replace("github.com","raw.githubusercontent.com").replace("master",this.state.sha===""?this.state.branch:this.state.sha), true);
        xhr.onload = function (e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              let lines = xhr.responseText.split(/\r\n|\r|\n/).length;
              let path = this.state.path;
              let mode = this.state.mode;
              let currThis = this;
              vcsData.getChangeData(path).then(function (resp){
                switch (mode){
                  case 1:
                    chartUpdater.updateAllChartsWithChangesPerDeveloper(resp,lines,path,currThis,true);
                    break;
                  default:
                    chartUpdater.updateAllChartsWithChangesPerVersion(resp,lines,path,currThis,true);
                    break;
                }
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
      }else{
        switch (this.state.mode){
          case 1:
            chartUpdater.updateAllChartsWithChangesPerDeveloper(null,null,null,this,false);
            break;
          default:
            chartUpdater.updateAllChartsWithChangesPerVersion(null,null,null,this,false);
            break;
        }
        Loading.remove();
      }
      this.prevPath = this.state.path;
      this.prevMode = this.state.mode;
      this.prevSha = this.state.sha;
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

