'use strict';

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { lineNumbers } from '@codemirror/view';
import { Compartment } from '@codemirror/state';
import styles from '../styles.module.scss';

import '../css/codeMirror.module.css';
import vcsData from './helper/vcsData';
import chartUpdater from './charts/chartUpdater';
import Loading from './helper/loading';
import ModeSwitcher from './helper/modeSwitcher';
import Settings from '../components/settings/settings';
import BackgroundRefreshIndicator from '../components/backgroundRefreshIndicator/backgroundRefreshIndicator';
import VisualizationSelector from '../components/visualizationSelector/visualizationSelector';
import SearchBar from '../components/searchBar/searchBar';
import searchAlgorithm from '../components/searchBar/searchAlgorithm';
import chartStyles from './chart.module.scss';
import Database from '../../../../database/database';
import SourceCodeRequest from './helper/sourceCodeRequest';
import GitLabConfig from '../../../../../config/gitlab.json';
import _ from 'lodash';
import ApiKeyEntry from '../components/apiKeyEntry/apiKeyEntry';

export default class CodeHotspots extends React.PureComponent {
  constructor(props) {
    super(props);

    this.requestFileStructure().then(function (resp) {
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
        sha: '',
      },
      selectedCompareCommit: {
        commitID: 0,
        sha: '',
      },
      mode: 0, //modes: 0...Changes/Version  1...Changes/Developer  2...Changes/Issue
      data: { code: 'No File Selected', secondaryCode: 'No File Selected' },
      filteredData: { code: 'No File Selected', secondaryCode: 'No File Selected', firstLineNumber: 1, searchTerm: '' },
      displayProps: {
        dataScaleHeatmap: 0,
        dataScaleColumns: 0,
        dataScaleRows: 0,
        customDataScale: false,
        dateRange: {
          from: '',
          to: '',
        },
        heatMapStyle: 0,
        mainVisualizationMode: 0,
        heatmapTooltips: false,
      },
      gitlabSettings: {
        server: 'Gitlab Server',
        projectId: 'Project ID',
        apiKey: '',
        configAvailable: false,
        apiKeyEntryNecessary: false,
      },
    };
    if (!_.isEmpty(GitLabConfig)) {
      this.state.gitlabSettings.server = GitLabConfig.server;
      this.state.gitlabSettings.projectId = GitLabConfig.projectId;
      this.state.gitlabSettings.configAvailable = true;
    }
    const lastGitlabSettings = JSON.parse(localStorage.getItem('gitlabSettings'));
    if (!this.state.gitlabSettings.configAvailable) {
      if (lastGitlabSettings !== null) {
        this.state.gitlabSettings = lastGitlabSettings;
      } else {
        localStorage.setItem('gitlabSettings', JSON.stringify(this.state.gitlabSettings));
      }
    } else {
      if (lastGitlabSettings !== null) {
        if (lastGitlabSettings.apiKey === '') {
          this.state.gitlabSettings.apiKeyEntryNecessary = true;
        } else {
          this.state.gitlabSettings.apiKey = lastGitlabSettings.apiKey;
        }
      } else {
        this.state.gitlabSettings.apiKeyEntryNecessary = true;
        localStorage.setItem('gitlabSettings', JSON.stringify(this.state.gitlabSettings));
      }
    }

    const lastDisplayProps = JSON.parse(localStorage.getItem('displayProps'));

    if (lastDisplayProps !== null) {
      this.state.displayProps = lastDisplayProps;
      this.state.displayProps.dateRange = {
        from: '',
        to: '',
      };
    } else {
      localStorage.setItem('displayProps', JSON.stringify(this.state.displayProps));
    }

    this.combinedColumnData = {};
    this.combinedRowData = {};
    this.combinedHeatmapData = {};
    this.dataChanged = false;
    this.codeChanged = false;
    this.getAllBranches().then(
      function (resp) {
        let activeBranch = 'main';
        for (const i in resp) {
          if (resp[i].active === true || resp[i].active === 'true') {
            activeBranch = resp[i].branch;
            props.onSetBranch(resp[i].branch);
          }
        }
        props.onSetBranches(resp);
        this.setState({ checkedOutBranch: activeBranch });
        this.forceUpdate();
      }.bind(this),
    );
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, path } = nextProps;
    this.setState({ path: path, branch: branch, fileURL: fileURL });
  }

  render() {
    //console.log(this.state.checkedOutBranch);
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
          chartUpdater.updateMainChart(this, this.state.mode, this.state.filteredData, this.state.displayProps);
        }
      }
    }
    const lang = ModeSwitcher.modeFromExtension(this.state.path.split('.').pop());
    const compartment = new Compartment();

    return (
      <div className={styles.w100}>
        <div className={'loadingContainer'} />
        {this.state.gitlabSettings.apiKeyEntryNecessary ? (
          <ApiKeyEntry
            setApiKey={(apiKey) => {
              console.log(apiKey);
              const newGitlabSettings = this.state.gitlabSettings;
              newGitlabSettings.apiKey = apiKey;
              newGitlabSettings.apiKeyEntryNecessary = false;
              localStorage.setItem('gitlabSettings', JSON.stringify(newGitlabSettings));
              this.setState({ gitlabSettings: newGitlabSettings });
              this.forceUpdate();
            }}
          />
        ) : (
          ''
        )}
        <BackgroundRefreshIndicator />
        <div className={styles.w100}>
          <div className={chartStyles.menubar}>
            <span style={{ float: 'left' }}>
              <Settings
                displayProps={this.state.displayProps}
                gitlabSettings={this.state.gitlabSettings}
                saveSettings={(newDisplayProps, newGitlabSettings) => {
                  this.dataChanged = true;
                  localStorage.setItem('displayProps', JSON.stringify(newDisplayProps));
                  localStorage.setItem('gitlabSettings', JSON.stringify(newGitlabSettings));
                  this.setState({ displayProps: newDisplayProps, gitlabSettings: newGitlabSettings });
                  this.forceUpdate();
                }}
              />
            </span>
            <span className={styles.verticalSeparator} />
            <span style={{ float: 'left' }}>
              {' '}
              <VisualizationSelector
                changeMode={(mode) => {
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
                onSearchChanged={function (data) {
                  this.dataChanged = true;
                  this.setState({ filteredData: data });
                }.bind(this)}
              />
            </span>
            {this.state.selectedCommit.sha !== '' && (
              <span>
                <span className={styles.verticalSeparator} />
                <button
                  className={'button ' + styles.mg1 + ' ' + styles.button}
                  onClick={() => {
                    this.setState({
                      selectedCommit: {
                        commitID: 0,
                        sha: '',
                      },
                    });
                    this.setState({
                      selectedCompareCommit: {
                        commitID: 0,
                        sha: '',
                      },
                    });
                  }}>
                  Back to current Version
                </button>
              </span>
            )}
          </div>

          <div className={styles.w100 + ' ' + styles.pa}>
            <div id={'barChartContainer'} className={chartStyles.barChartContainer}>
              <div className={'barChart'} />
            </div>
            {this.state.mode === 0 ? (
              <div className={chartStyles.branchView}>
                <div className={'branchView'} />
              </div>
            ) : (
              ''
            )}
            {this.state.selectedCompareCommit.sha === '' ? (
              ''
            ) : (
              <div className={chartStyles.codeViewIndicators}>
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
              </div>
            )}
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
                  basicSetup={{
                    highlightActiveLineGutter: false,
                    foldGutter: false,
                  }}
                  readOnly={true}
                  extensions={[
                    loadLanguage(lang),
                    compartment.of(lineNumbers({ formatNumber: this.getFormatNumber(this.state.filteredData.firstLineNumber) })),
                  ]}
                />
              </div>
              {this.state.selectedCompareCommit.sha === '' ? (
                ''
              ) : (
                <div className={chartStyles.codeViewWidthHalf + ' ' + chartStyles.codeViewSecondary}>
                  <CodeMirror
                    id={'codeViewSecondary'}
                    ref={'codeViewSecondary'}
                    value={
                      this.state.selectedCommit.commitID > this.state.selectedCompareCommit.commitID
                        ? this.state.filteredData.code
                        : this.state.filteredData.secondaryCode
                    }
                    basicSetup={{
                      highlightActiveLineGutter: false,
                      foldGutter: false,
                    }}
                    readOnly={true}
                    extensions={[
                      loadLanguage(lang),
                      compartment.of(lineNumbers({ formatNumber: this.getFormatNumber(this.state.filteredData.firstLineNumber) })),
                    ]}
                  />
                </div>
              )}
              <div className={chartStyles.heatmapContainer}>
                <svg id={'chartMain'} className="chartMain" />
                <div id={'chartMainToolTip'} className="chartMainToolTip" />
                <div id={'chartMainSubToolTip'} className="chartMainSubToolTip" />
              </div>
              <div className={chartStyles.rowInteractionContainer}>
                <svg id={'rowInteraction'} className="rowInteraction" />
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
      SourceCodeRequest.getSourceCode(
        this.state.fileURL,
        this.state.path,
        this.state.checkedOutBranch,
        this.state.branch,
        this.state.selectedCommit.sha,
        this.state.gitlabSettings.projectId,
        this.state.gitlabSettings.apiKey,
        this.state.gitlabSettings.server,
      ).then((sourceCode) => {
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
          data.code = sourceCode;
          data.secondaryCode = sourceCode;
          const currFilteredData =
            this.state.mode === 2
              ? searchAlgorithm.performIssueSearch(data, this.state.filteredData.searchTerm)
              : this.state.mode === 1
                ? searchAlgorithm.performDeveloperSearch(data, this.state.filteredData.searchTerm)
                : this.state.mode === 0
                  ? searchAlgorithm.performCommitSearch(data, this.state.filteredData.searchTerm)
                  : data;
          if (this.state.selectedCompareCommit.sha !== '') {
            Loading.setState(50, 'Requesting Comparison Source Code');

            SourceCodeRequest.getSourceCode(
              this.state.fileURL,
              this.state.checkedOutBranch,
              this.state.branch,
              this.state.selectedCompareCommit.sha,
              '',
              '',
            ).then((secondarySourceCode) => {
              data.secondaryCode = secondarySourceCode;

              this.setState({
                data: data,
                filteredData: currFilteredData,
              });
            });
          } else {
            this.setState({
              data: data,
              filteredData: currFilteredData,
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
                function (resp) {
                  Loading.setState(66, 'Transforming Developer Data');
                  setTimeout(
                    function () {
                      const lines = sourceCode.split(/\r\n|\r|\n/).length;
                      const data = chartUpdater.transformChangesPerDeveloperData(resp, lines);
                      //this.codeChanged = true;
                      this.dataChanged = true;
                      // eslint-disable-next-line max-len
                      data.code = sourceCode;
                      data.secondaryCode = data.code;
                      data.firstLineNumber = 1;
                      data.searchTerm = '';
                      data.rawData = resp;
                      this.setState({
                        code: sourceCode,
                        data: data,
                        filteredData: data,
                      });
                    }.bind(this),
                    0,
                  );
                }.bind(this),
              );
              break;
            case 2:
              Loading.setState(33, 'Requesting Issue Data');
              vcsData.getIssueData(path).then(
                function (resp) {
                  Loading.setState(66, 'Transforming Issue Data');
                  setTimeout(
                    function () {
                      const lines = sourceCode.split(/\r\n|\r|\n/).length;
                      const data = chartUpdater.transformChangesPerIssueData(resp, lines);
                      //this.codeChanged = true;
                      this.dataChanged = true;
                      data.code = sourceCode;
                      data.secondaryCode = data.code;
                      data.firstLineNumber = 1;
                      data.searchTerm = '';
                      data.rawData = resp;
                      this.setState({
                        code: sourceCode,
                        data: data,
                        filteredData: data,
                      });
                    }.bind(this),
                    0,
                  );
                }.bind(this),
              );
              break;
            default:
              Loading.setState(33, 'Requesting Version Data');
              vcsData.getChangeData(path).then(
                function (resp) {
                  Loading.setState(66, 'Transforming Version Data');
                  setTimeout(
                    function () {
                      const lines = sourceCode.split(/\r\n|\r|\n/).length;
                      const data = chartUpdater.transformChangesPerVersionData(resp, lines);
                      //this.codeChanged = true;
                      this.dataChanged = true;
                      data.code = sourceCode;
                      data.secondaryCode = data.code;
                      data.firstLineNumber = 1;
                      data.searchTerm = '';
                      data.rawData = resp;
                      const currDisplayProps = this.state.displayProps;
                      if (data.data.length !== 0) {
                        currDisplayProps.dateRange.from = data.data[0].date.split('.')[0];
                        currDisplayProps.dateRange.to = data.data[data.data.length - 1].date.split('.')[0];
                      }
                      this.setState({
                        code: sourceCode,
                        data: data,
                        filteredData: data,
                        displayProps: currDisplayProps,
                      });
                    }.bind(this),
                    0,
                  );
                }.bind(this),
              );
              break;
          }
        }
      });
    }
  }

  generateCharts() {
    Loading.setState(100, 'Generating Charts');
    setTimeout(
      function () {
        chartUpdater.generateCharts(this, this.state.mode, this.state.filteredData, this.state.displayProps);
        Loading.remove();
      }.bind(this),
      0,
    );
  }

  requestFileStructure() {
    return Promise.resolve(Database.requestFileStructure()).then((resp) => resp.files.data);
  }

  getAllBranches() {
    return Promise.resolve(Database.getAllBranches()).then((resp) => resp.branches.data);
  }

  getFormatNumber(lineNumberOffset) {
    return (n, s) => (lineNumberOffset + n - 1).toString();
  }
}
