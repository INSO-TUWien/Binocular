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
import Settings from '../components/settings/settings';
import BackgroundRefreshIndicator from '../components/backgroundRefreshIndicator/backgroundRefreshIndicator';
import VisualizationSelector from '../components/VisulaizationSelector/visualizationSelector';
import SearchBar from '../components/searchBar/searchBar';

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
    let activeBranch = 'master';
    this.getAllBranches().then(function(resp) {
      for (const i in resp) {
        if (resp[i].active === 'true') {
          activeBranch = resp[i].branch;
          props.onSetBranch(resp[i].branch);
        }
      }
      props.onSetBranches(resp);
    });

    this.elems = {};
    this.state = {
      code: 'No File Selected',
      branch: 'master',
      checkedOutBranch: activeBranch,
      fileURL: '',
      path: '',
      sha: '',
      mode: 0, //modes: 0...Changes/Version  1...Changes/Developer  2...Changes/Issue
      data: {},
      filteredData: { code: 'No File Selected', firstLineNumber: 1 }
    };

    this.updateParametrization = false;
    this.dataScaleHeatmap = -1;
    this.dataScaleColumns = -1;
    this.dataScaleRow = -1;

    this.combinedColumnData = {};
    this.combinedRowData = {};
    this.combinedHeatmapData = {};
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, path } = nextProps;
    this.setState({ path: path, branch: branch, fileURL: fileURL });
  }

  componentDidMount() {}

  render() {
    if (this.prevMode !== this.state.mode || this.state.path !== this.prevPath) {
      this.dataScaleHeatmap = -1;
      this.dataScaleColumns = -1;
      this.dataScaleRow = -1;
      this.requestData();
    } else {
      if (this.dataChanged) {
        this.dataChanged = false;
        this.generateCharts();
      } else {
        if (!this.codeChanged || this.updateParametrization) {
          this.requestData();
        } else {
          this.codeChanged = false;
        }
      }
    }
    return (
      <div className={styles.w100}>
        <div className={'loadingContainer'} />
        <BackgroundRefreshIndicator />
        <div className={styles.w100}>
          <div className={styles.menubar}>
            <span style={{ float: 'left' }}>
              {' '}<Settings currThis={this} />
            </span>
            <span className={styles.verticalSeparator} />
            <span style={{ float: 'left' }}>
              {' '}<VisualizationSelector
                changeMode={mode => {
                  this.setState({ mode: mode });
                }}
              />
            </span>
            <span className={styles.verticalSeparator} />
            <span className={styles.mg1} style={{ width: '20rem', float: 'left' }}>
              <SearchBar
                searchType={this.state.mode === 1 ? 'developerSearch' : this.state.mode === 2 ? 'issueSearch' : 'commitSearch'}
                data={this.state.data}
                placeholder={'Search for ' + (this.state.mode === 1 ? 'Developer' : this.state.mode === 2 ? 'Issues' : 'Commits') + '!'}
                hint={
                  '-m [term] search commit message; ' +
                  '-s [term] search commit sha; ' +
                  '-d [term] search developer; ' +
                  '-b [term] search branch; ' +
                  '-l [term] search line or multible lines'
                }
                onSearchChanged={function(data) {
                  this.dataChanged = true;
                  this.setState({ filteredData: data });
                  this.forceUpdate();
                }.bind(this)}
              />
            </span>
          </div>
          {this.state.sha !== '' &&
            <div>
              <button
                className={'button ' + styles.mg1 + ' ' + styles.button}
                onClick={() => {
                  this.setState({ sha: '' });
                }}>
                Back to current Version
              </button>
            </div>}
          <div className={styles.w100 + ' ' + styles.pr}>
            <div className={styles.codeView}>
              <CodeMirror
                id={'codeView'}
                ref={'codeView'}
                value={this.state.filteredData.code}
                options={{
                  mode: ModeSwitcher.modeFromExtension(this.state.path.split('.').pop()),
                  theme: 'default',
                  lineNumbers: true,
                  readOnly: true,
                  firstLineNumber: this.state.filteredData.firstLineNumber
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
      if (this.updateParametrization) {
        Loading.setState(100, 'Updating Charts');
        setTimeout(
          function() {
            chartUpdater.updateCharts(this, this.state.mode, this.state.filteredData);
            this.state.updateScale = false;
            Loading.remove();
          }.bind(this),
          0
        );
      } else {
        Loading.setState(0, 'Requesting Source Code');
        const xhr = new XMLHttpRequest();
        xhr.open(
          'GET',
          this.state.fileURL
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob', '')
            .replace(this.state.checkedOutBranch, this.state.sha === '' ? this.state.branch : this.state.sha),
          true
        );
        xhr.onload = function() {
          if (xhr.readyState === 4) {
            //if (xhr.status === 200) {
            if (this.state.path === this.prevPath && this.state.sha !== this.prevSha) {
              this.prevSha = this.state.sha;
              this.codeChanged = true;
              Loading.remove();
              this.setState({ code: xhr.responseText });
            } else {
              const path = this.state.path;
              const mode = this.state.mode;
              this.prevPath = this.state.path;
              this.prevMode = this.state.mode;
              this.prevSha = this.state.sha;

              switch (mode) {
                case 1:
                  Loading.setState(33, 'Requesting Developer Data');
                  vcsData.getChangeData(path).then(
                    function(resp) {
                      Loading.setState(66, 'Transforming Developer Data');
                      setTimeout(
                        function() {
                          const lines = (xhr.status === 200 ? xhr.responseText : '').split(/\r\n|\r|\n/).length;
                          const data = chartUpdater.transformChangesPerDeveloperData(resp, lines);
                          this.codeChanged = true;
                          this.dataChanged = true;
                          data.code = xhr.status === 200 ? xhr.responseText : 'No commit code in current selected Branch!';
                          data.firstLineNumber = 1;
                          this.setState({
                            code: xhr.status === 200 ? xhr.responseText : 'No commit code in current selected Branch!',
                            data: data,
                            filteredData: data
                          });
                        }.bind(this),
                        0
                      );
                    }.bind(this)
                  );
                  break;
                case 2:
                  Loading.setState(33, 'Requesting Issue Data');
                  vcsData.getIssueData(path).then(
                    function(resp) {
                      Loading.setState(66, 'Transforming Issue Data');
                      setTimeout(
                        function() {
                          const lines = (xhr.status === 200 ? xhr.responseText : '').split(/\r\n|\r|\n/).length;
                          const data = chartUpdater.transformChangesPerIssueData(resp, lines);
                          this.codeChanged = true;
                          this.dataChanged = true;
                          data.code = xhr.status === 200 ? xhr.responseText : 'No commit code in current selected Branch!';
                          data.firstLineNumber = 1;
                          this.setState({
                            code: xhr.status === 200 ? xhr.responseText : 'No commit code in current selected Branch!',
                            data: data,
                            filteredData: data
                          });
                        }.bind(this),
                        0
                      );
                    }.bind(this)
                  );
                  break;
                default:
                  Loading.setState(33, 'Requesting Version Data');
                  vcsData.getChangeData(path).then(
                    function(resp) {
                      Loading.setState(66, 'Transforming Version Data');
                      setTimeout(
                        function() {
                          const lines = (xhr.status === 200 ? xhr.responseText : '').split(/\r\n|\r|\n/).length;
                          const data = chartUpdater.transformChangesPerVersionData(resp, lines);

                          this.codeChanged = true;
                          this.dataChanged = true;
                          data.code = xhr.status === 200 ? xhr.responseText : 'No commit code in current selected Branch!';
                          data.firstLineNumber = 1;
                          this.setState({
                            code: xhr.status === 200 ? xhr.responseText : 'No commit code in current selected Branch!',
                            data: data,
                            filteredData: data
                          });
                        }.bind(this),
                        0
                      );
                    }.bind(this)
                  );
                  break;
              }
            }
          }
        }.bind(this);
        xhr.onerror = function() {
          Loading.setErrorText(xhr.statusText);
          console.error(xhr.statusText);
        };
        xhr.send(null);
      }
    }
  }

  generateCharts() {
    Loading.setState(100, 'Generating Charts');
    setTimeout(
      function() {
        chartUpdater.generateCharts(this, this.state.mode, this.state.filteredData);
        Loading.remove();
      }.bind(this),
      0
    );
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
