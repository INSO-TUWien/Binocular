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
import searchAlgorithm from '../components/searchBar/searchAlgorithm';
import chartStyles from './chart.scss';

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

    this.elems = {};
    this.state = {
      code: 'No File Selected',
      secondaryCode: 'No File Selected',
      branch: 'main',
      checkedOutBranch: 'main',
      fileURL: '',
      path: '',
      selectedCommit: {
        commitID: 0,
        sha: ''
      },
      selectedCompareCommit: {
        commitID: 0,
        sha: ''
      },
      mode: 0, //modes: 0...Changes/Version  1...Changes/Developer  2...Changes/Issue
      data: {},
      filteredData: { code: 'No File Selected', secondaryCode: 'No File Selected', firstLineNumber: 1, searchTerm: '' },
      displayProps: {
        dataScaleHeatmap: 0,
        dataScaleColumns: 0,
        dataScaleRows: 0,
        customDataScale: false,
        dateRange: {
          from: '',
          to: ''
        },
        heatMapStyle: 0
      }
    };

    this.combinedColumnData = {};
    this.combinedRowData = {};
    this.combinedHeatmapData = {};
    this.dataChanged = false;
    this.codeChanged = false;
    this.getAllBranches().then(
      function(resp) {
        let activeBranch = 'main';
        for (const i in resp) {
          if (resp[i].active === 'true') {
            activeBranch = resp[i].branch;
            props.onSetBranch(resp[i].branch);
          }
        }
        props.onSetBranches(resp);
        this.setState({ checkedOutBranch: activeBranch });
      }.bind(this)
    );
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, path } = nextProps;
    this.setState({ path: path, branch: branch, fileURL: fileURL });
  }

  componentDidMount() {}

  render() {
    if (this.prevMode !== this.state.mode || this.state.path !== this.prevPath) {
      this.requestData();
    } else {
      if (this.dataChanged) {
        this.dataChanged = false;
        this.generateCharts();
      } else {
        if (!this.codeChanged) {
          this.requestData();
        } else {
          this.codeChanged = false;
          chartUpdater.updateColumnChart(this, this.state.mode, this.state.filteredData, this.state.displayProps);
        }
      }
    }

    return (
      <div className={styles.w100}>
        <div className={'loadingContainer'} />
        <BackgroundRefreshIndicator />
        <div className={styles.w100}>
          <div className={chartStyles.menubar}>
            <span style={{ float: 'left' }}>
              <Settings
                displayProps={this.state.displayProps}
                displayPropsChanged={newDisplayProps => {
                  this.dataChanged = true;
                  this.setState({ displayProps: newDisplayProps });
                  this.forceUpdate();
                }}
              />
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
            <span id={'mainSearch'} className={styles.mg1} style={{ width: '20rem', float: 'left' }}>
              <SearchBar
                searchType={this.state.mode === 1 ? 'developerSearch' : this.state.mode === 2 ? 'issueSearch' : 'commitSearch'}
                data={this.state.data}
                placeholder={'Search for ' + (this.state.mode === 1 ? 'Developer' : this.state.mode === 2 ? 'Issues' : 'Commits') + '!'}
                hint={
                  this.state.mode === 1
                    ? '-n [term] search developer name; ' + '-e [term] search developer email' + '-l [term] search line or multible lines'
                    : this.state.mode === 2
                      ? '-t [term] search title; ' +
                        '-d [term] search description; ' +
                        '-i [term] search iid' +
                        '-l [term] search line or multible lines'
                      : '-m [term] search commit message; ' +
                        '-s [term] search commit sha; ' +
                        '-d [term] search developer; ' +
                        '-b [term] search branch; ' +
                        '-l [term] search line or multible lines'
                }
                onSearchChanged={function(data) {
                  this.dataChanged = true;
                  this.setState({ filteredData: data });
                }.bind(this)}
              />
            </span>
            {this.state.selectedCommit.sha !== '' &&
              <span>
                <span className={styles.verticalSeparator} />
                <button
                  className={'button ' + styles.mg1 + ' ' + styles.button}
                  onClick={() => {
                    this.setState({
                      selectedCommit: {
                        commitID: 0,
                        sha: ''
                      }
                    });
                    this.setState({
                      selectedCompareCommit: {
                        commitID: 0,
                        sha: ''
                      }
                    });
                  }}>
                  Back to current Version
                </button>
              </span>}
          </div>

          <div className={styles.w100 + ' ' + styles.pa}>
            <div id={'barChartContainer'} className={chartStyles.barChartContainer}>
              <div className={'barChart'} />
            </div>
            {this.state.mode === 0
              ? <div className={chartStyles.branchView}>
                  <div className={'branchView'} />
                </div>
              : ''}
            {this.state.selectedCompareCommit.sha === ''
              ? ''
              : <div className={chartStyles.codeViewIndicators}>
                  <div
                    className={
                      this.state.selectedCommit.commitID <= this.state.selectedCompareCommit.commitID
                        ? chartStyles.codeViewPrimaryIndicator
                        : chartStyles.codeViewSecondaryIndicator
                    }
                  />
                  <div
                    className={
                      this.state.selectedCommit.commitID > this.state.selectedCompareCommit.commitID
                        ? chartStyles.codeViewPrimaryIndicator
                        : chartStyles.codeViewSecondaryIndicator
                    }
                  />
                </div>}
            <div className={chartStyles.codeView} id={'codeViewContainer'}>
              <div
                className={
                  this.state.selectedCompareCommit.sha === ''
                    ? chartStyles.codeViewWidthFull
                    : chartStyles.codeViewWidthHalf + ' ' + chartStyles.codeViewPrimary
                }>
                <CodeMirror
                  id={'codeView'}
                  ref={'codeView'}
                  value={
                    this.state.selectedCommit.commitID <= this.state.selectedCompareCommit.commitID
                      ? this.state.filteredData.code
                      : this.state.filteredData.secondaryCode
                  }
                  options={{
                    mode: ModeSwitcher.modeFromExtension(this.state.path.split('.').pop()),
                    theme: 'default',
                    lineNumbers: true,
                    readOnly: true,
                    firstLineNumber: this.state.filteredData.firstLineNumber
                  }}
                />
              </div>
              {this.state.selectedCompareCommit.sha === ''
                ? ''
                : <div className={chartStyles.codeViewWidthHalf + ' ' + chartStyles.codeViewSecondary}>
                    <CodeMirror
                      id={'codeViewSecondary'}
                      ref={'codeViewSecondary'}
                      value={
                        this.state.selectedCommit.commitID > this.state.selectedCompareCommit.commitID
                          ? this.state.filteredData.code
                          : this.state.filteredData.secondaryCode
                      }
                      options={{
                        mode: ModeSwitcher.modeFromExtension(this.state.path.split('.').pop()),
                        theme: 'default',
                        lineNumbers: true,
                        readOnly: true,
                        firstLineNumber: this.state.filteredData.firstLineNumber
                      }}
                    />
                  </div>}
              <div className={chartStyles.heatmapContainer}>
                <svg id={'heatmap'} className="chartHeatmap" />
              </div>
              <div id={'rowSummaryContainer'} className={chartStyles.rowSummaryContainer}>
                <div className="chartRowSummary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  requestData() {
    if (this.state.path !== '') {
      Loading.insert();
      Loading.setState(0, 'Requesting Source Code');
      const sourceCodeRequest = new XMLHttpRequest();
      sourceCodeRequest.open(
        'GET',
        this.state.fileURL
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob', '')
          .replace(this.state.checkedOutBranch, this.state.selectedCommit.sha === '' ? this.state.branch : this.state.selectedCommit.sha),
        true
      );
      sourceCodeRequest.onload = function() {
        if (sourceCodeRequest.readyState === 4) {
          //if (xhr.status === 200) {
          if (
            this.state.path === this.prevPath &&
            (this.state.selectedCommit.sha !== this.prevSha || this.state.selectedCompareCommit.sha !== this.prevCompareSha)
          ) {
            this.prevSha = this.state.selectedCommit.sha;
            this.prevCompareSha = this.state.selectedCompareCommit.sha;
            this.codeChanged = true;
            this.dataChanged = false;
            Loading.remove();
            const data = this.state.data;
            data.code = sourceCodeRequest.responseText;
            data.secondaryCode = sourceCodeRequest.responseText;
            if (this.state.selectedCompareCommit.sha !== '') {
              Loading.setState(50, 'Requesting Comparison Source Code');
              const secondarySourceCodeRequest = new XMLHttpRequest();
              secondarySourceCodeRequest.open(
                'GET',
                this.state.fileURL
                  .replace('github.com', 'raw.githubusercontent.com')
                  .replace('/blob', '')
                  .replace(this.state.checkedOutBranch, this.state.selectedCompareCommit.sha),
                true
              );
              const currThis = this;
              secondarySourceCodeRequest.onload = function() {
                data.secondaryCode = secondarySourceCodeRequest.responseText;
                currThis.setState({
                  data: data,
                  filteredData:
                    currThis.state.mode === 2
                      ? searchAlgorithm.performIssueSearch(data, currThis.state.filteredData.searchTerm)
                      : currThis.state.mode === 1
                        ? searchAlgorithm.performDeveloperSearch(data, currThis.state.filteredData.searchTerm)
                        : currThis.state.mode === 0
                          ? searchAlgorithm.performCommitSearch(data, currThis.state.filteredData.searchTerm)
                          : data
                });
              };
              secondarySourceCodeRequest.send(null);
            } else {
              this.setState({
                data: data,
                filteredData:
                  this.state.mode === 2
                    ? searchAlgorithm.performIssueSearch(data, this.state.filteredData.searchTerm)
                    : this.state.mode === 1
                      ? searchAlgorithm.performDeveloperSearch(data, this.state.filteredData.searchTerm)
                      : this.state.mode === 0 ? searchAlgorithm.performCommitSearch(data, this.state.filteredData.searchTerm) : data
              });
            }
          } else {
            const path = this.state.path;
            const mode = this.state.mode;
            this.prevPath = this.state.path;
            this.prevMode = this.state.mode;
            this.prevSha = this.state.selectedCommit.sha;
            this.prevCompareSha = this.state.selectedCompareCommit.sha;

            switch (mode) {
              case 1:
                Loading.setState(33, 'Requesting Developer Data');
                vcsData.getChangeData(path).then(
                  function(resp) {
                    Loading.setState(66, 'Transforming Developer Data');
                    setTimeout(
                      function() {
                        const lines = (sourceCodeRequest.status === 200 ? sourceCodeRequest.responseText : '').split(/\r\n|\r|\n/).length;
                        const data = chartUpdater.transformChangesPerDeveloperData(resp, lines);
                        //this.codeChanged = true;
                        this.dataChanged = true;
                        // eslint-disable-next-line max-len
                        data.code =
                          sourceCodeRequest.status === 200 ? sourceCodeRequest.responseText : 'No commit code in current selected Branch!';
                        data.firstLineNumber = 1;
                        data.searchTerm = '';

                        this.setState({
                          code:
                            sourceCodeRequest.status === 200
                              ? sourceCodeRequest.responseText
                              : 'No commit code in current selected Branch!',
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
                        const lines = (sourceCodeRequest.status === 200 ? sourceCodeRequest.responseText : '').split(/\r\n|\r|\n/).length;
                        const data = chartUpdater.transformChangesPerIssueData(resp, lines);
                        //this.codeChanged = true;
                        this.dataChanged = true;
                        data.code =
                          sourceCodeRequest.status === 200 ? sourceCodeRequest.responseText : 'No commit code in current selected Branch!';
                        data.firstLineNumber = 1;
                        data.searchTerm = '';
                        this.setState({
                          code:
                            sourceCodeRequest.status === 200
                              ? sourceCodeRequest.responseText
                              : 'No commit code in current selected Branch!',
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
                        const lines = (sourceCodeRequest.status === 200 ? sourceCodeRequest.responseText : '').split(/\r\n|\r|\n/).length;
                        const data = chartUpdater.transformChangesPerVersionData(resp, lines);

                        //this.codeChanged = true;
                        this.dataChanged = true;
                        data.code =
                          sourceCodeRequest.status === 200 ? sourceCodeRequest.responseText : 'No commit code in current selected Branch!';
                        data.firstLineNumber = 1;
                        data.searchTerm = '';

                        const currDisplayProps = this.state.displayProps;
                        currDisplayProps.dateRange.from = data.data[0].date.split('.')[0];
                        currDisplayProps.dateRange.from = currDisplayProps.dateRange.from.substring(
                          0,
                          currDisplayProps.dateRange.from.length - 3
                        );
                        currDisplayProps.dateRange.to = data.data[data.data.length - 1].date.split('.')[0];
                        currDisplayProps.dateRange.to = currDisplayProps.dateRange.to.substring(
                          0,
                          currDisplayProps.dateRange.to.length - 3
                        );
                        this.setState({
                          code:
                            sourceCodeRequest.status === 200
                              ? sourceCodeRequest.responseText
                              : 'No commit code in current selected Branch!',
                          data: data,
                          filteredData: data,
                          displayProps: currDisplayProps
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
      sourceCodeRequest.onerror = function() {
        Loading.setErrorText(sourceCodeRequest.statusText);
        console.error(sourceCodeRequest.statusText);
      };
      sourceCodeRequest.send(null);
    }
  }

  generateCharts() {
    Loading.setState(100, 'Generating Charts');
    setTimeout(
      function() {
        chartUpdater.generateCharts(this, this.state.mode, this.state.filteredData, this.state.displayProps);
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
