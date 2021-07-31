'use strict';

import React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import styles from '../styles.scss';
import 'codemirror/lib/codemirror.css';
require('codemirror/mode/javascript/javascript');
import '../css/codeMirror.css';
import vcsData from './helper/vcsData';
import chartUpdater from './charts/chartUpdater';
import BluebirdPromise from 'bluebird';
import { graphQl } from '../../../utils';
import Loading from './helper/loading';
import ModeSwitcher from './helper/modeSwitcher';
import Settings from './settings/settings';

const prevPath = '';
const prevMode = 0;
const prevSha = '';
const lightRefresh = false;

export default class CodeHotspots extends React.PureComponent {
  constructor(props) {
    super(props);
    this.requestFileStructure().then(function(resp) {
      const files = [];
      for (const i in resp) {
        files.push({ key: resp[i].path, webUrl: resp[i].webUrl });
      }
      props.onSetFiles(files);
    });

    this.getAllBranches().then(function(resp) {
      for (const i in resp) {
        if (resp[i].active === 'true') {
          props.onSetBranch(resp[i].branch);
        }
      }
      props.onSetBranches(resp);
    });
    this.elems = {};
    this.state = {
      code: 'No File Selected',
      branch: 'master',
      fileURL: '',
      path: '',
      sha: '',
      mode: 0, //modes: 0...Changes/Version  1...Changes/Developer  2...Changes/Issue
      data: {},

      //Settings
      dataScaleMode: true,
      dataScaleHeatmap: 0,
      dataScaleColumns: 0,
      dataScaleRow: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, path } = nextProps;
    this.setState({ path: path, branch: branch, fileURL: fileURL });
  }

  componentDidMount() {}

  render() {
    if (!this.lightRefresh) {
      this.requestData();
    } else {
      this.generateCharts();
    }
    this.lightRefresh = false;
    return (
      <div className={styles.w100}>
        <div className={'loadingContainer'} />

        <div className={styles.w100}>
          <div className={styles.menubar}>
            <Settings state={this.state} currThis={this} />
            <div className={styles.inline}>
              <button
                id={'CpVButton'}
                className={'button ' + styles.mg1 + ' ' + styles.selected}
                onClick={e => {
                  this.setState({ mode: 0 });
                  document.getElementById('CpVButton').classList.add(styles.selected);
                  document.getElementById('CpDButton').classList.remove(styles.selected);
                  document.getElementById('CpIButton').classList.remove(styles.selected);
                }}>
                Changes/Version
              </button>
            </div>
            <div className={styles.inline}>
              <button
                id={'CpDButton'}
                className={'button ' + styles.mg1}
                onClick={e => {
                  this.setState({ mode: 1 });
                  document.getElementById('CpVButton').classList.remove(styles.selected);
                  document.getElementById('CpDButton').classList.add(styles.selected);
                  document.getElementById('CpIButton').classList.remove(styles.selected);
                }}>
                Changes/Developer
              </button>
            </div>
            <div className={styles.inline}>
              <button
                id={'CpIButton'}
                className={'button ' + styles.mg1}
                onClick={e => {
                  this.setState({ mode: 2 });
                  document.getElementById('CpVButton').classList.remove(styles.selected);
                  document.getElementById('CpDButton').classList.remove(styles.selected);
                  document.getElementById('CpIButton').classList.add(styles.selected);
                }}>
                Changes/Issue
              </button>
            </div>
          </div>
          {this.state.sha !== '' &&
            <div>
              <button
                className={'button ' + styles.mg1}
                onClick={e => {
                  this.setState({ sha: '' });
                }}>
                Back to current Version
              </button>
            </div>}
          <div className={styles.w100 + ' ' + styles.pr}>
            <div className={styles.codeView}>
              <CodeMirror
                id={'codeView'}
                value={this.state.code}
                options={{
                  mode: ModeSwitcher.modeFromExtension(this.state.path.split('.').pop()),
                  theme: 'default',
                  lineNumbers: true,
                  readOnly: true
                }}
              />
              <div className={styles.heatmapContainer}>
                <svg id={'heatmap'} className="chartHeatmap" />
              </div>
              <div id={'rowSummaryContainer'} className={styles.rowSummaryContainer}>
                <div className="chartRowSummary" />
              </div>
            </div>
            <div id={'barChartContainer'} className={styles.barChartContainer}>
              <div className={'barChart'} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  requestData() {
    if (this.state.path !== '') {
      Loading.insert();
      if (this.state.path !== this.prevPath || this.state.mode !== this.prevMode || this.state.sha !== this.prevSha) {
        Loading.setState(0, 'Requesting Source Code');
        const xhr = new XMLHttpRequest();
        xhr.open(
          'GET',
          this.state.fileURL
            .replace('/blob', '')
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('master', this.state.sha === '' ? this.state.branch : this.state.sha),
          true
        );
        xhr.onload = function(e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const lines = xhr.responseText.split(/\r\n|\r|\n/).length;
              const path = this.state.path;
              const mode = this.state.mode;

              switch (mode) {
                case 2:
                  Loading.setState(33, 'Requesting Issue Data');
                  vcsData.getIssueData(path).then(
                    function(resp) {
                      this.lightRefresh = true;
                      this.setState({ code: xhr.responseText, data: resp });
                    }.bind(this)
                  );
                  break;
                default:
                  Loading.setState(33, 'Requesting VCS Data');
                  vcsData.getChangeData(path).then(
                    function(resp) {
                      this.lightRefresh = true;
                      this.setState({ code: xhr.responseText, data: resp });
                    }.bind(this)
                  );
                  break;
              }
            } else {
              Loading.setErrorText(xhr.statusText);
              console.error(xhr.statusText);
            }
          }
        }.bind(this);
        xhr.onerror = function(e) {
          Loading.setErrorText(xhr.statusText);
          console.error(xhr.statusText);
        };
        xhr.send(null);
      } else {
        Loading.setState(100, 'Updating Charts');
        chartUpdater.updateCharts(this, this.state.mode);
        Loading.remove();
      }
      this.prevPath = this.state.path;
      this.prevMode = this.state.mode;
      this.prevSha = this.state.sha;
    }
  }

  generateCharts() {
    const lines = this.state.code.split(/\r\n|\r|\n/).length;
    switch (this.state.mode) {
      case 1:
        Loading.setState(66, 'Transforming Developer Data');
        chartUpdater.transformChangesPerDeveloperData(this.state.data, lines, this.state.path);
        Loading.setState(100, 'Generating Charts');
        chartUpdater.updateCharts(this, 1);
        Loading.remove();
        break;
      case 2:
        Loading.setState(66, 'Transforming Issue Data');
        chartUpdater.transformChangesPerIssueData(this.state.data, lines, this.state.path);
        Loading.setState(100, 'Generating Charts');
        chartUpdater.updateCharts(this, 2);
        Loading.remove();
        break;
      default:
        Loading.setState(66, 'Transforming Version Data');
        setTimeout(
          function() {
            chartUpdater.transformChangesPerVersionData(this.state.data, lines, this.state.path);
            Loading.setState(100, 'Generating Charts');
            setTimeout(
              function() {
                chartUpdater.updateCharts(this, 0);
                Loading.remove();
              }.bind(this),
              0
            );
          }.bind(this),
          0
        );
        break;
    }
  }

  requestFileStructure() {
    return BluebirdPromise.resolve(
      graphQl.query(
        `
      query{
       files(sort: "ASC"){
          data{path,webUrl}
        }
      }
      `,
        {}
      )
    ).then(resp => resp.files.data);
  }

  getAllBranches() {
    return BluebirdPromise.resolve(
      graphQl.query(
        `
      query{
       branches(sort: "ASC"){
          data{branch,active}
        }
      }
      `,
        {}
      )
    ).then(resp => resp.branches.data);
  }
}
