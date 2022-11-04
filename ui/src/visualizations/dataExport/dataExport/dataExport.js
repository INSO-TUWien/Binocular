'use strict';

import React from 'react';
import styles from '../styles.scss';
import dataExportStyles from '../styles/dataExport.scss';
import GetData from './helper/getData';
import Promise from 'bluebird';
import viewIcon from '../assets/viewIcon.svg';

export default class DataExport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
      issues: [],
      builds: [],
      files: [],
      branches: [],
      languages: [],
      modules: [],
      stakeholders: [],
      previewTable: [],
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  render() {
    const previewTableHeader = this.state.previewTable.length > 0 ? Object.keys(this.state.previewTable[1]) : [];
    return (
      <div className={styles.chartContainer}>
        <div className={styles.mg1}>
          <button className={'button ' + dataExportStyles.button} onClick={this.loadData.bind(this)}>
            Load Data
          </button>
          <h1>Loaded Data</h1>
          <div>
            Commits: {this.state.commits.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.commits });
              }}></img>
          </div>
          <div>
            Issues: {this.state.issues.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.issues });
              }}></img>
          </div>
          <div>
            Builds: {this.state.builds.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.builds });
              }}></img>
          </div>
          <div>
            Files: {this.state.files.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.files });
              }}></img>
          </div>
          <div>
            Branches: {this.state.branches.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.branches });
              }}></img>
          </div>
          <div>
            Languages: {this.state.languages.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.languages });
              }}></img>
          </div>
          <div>
            Modules: {this.state.modules.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.modules });
              }}></img>
          </div>
          <div>
            Stakeholders: {this.state.stakeholders.length}
            <img
              className={dataExportStyles.viewIcon}
              src={viewIcon}
              onClick={() => {
                this.setState({ previewTable: this.state.stakeholders });
              }}></img>
          </div>
          <hr />
          <div>
            {this.state.previewTable.length !== 0 ? (
              <table className={dataExportStyles.previewTable}>
                <thead className={dataExportStyles.previewTableHeader}>
                  <tr>
                    {previewTableHeader.map((key, i) => {
                      return (
                        <th className={i % 2 === 0 ? dataExportStyles.previewTableHeaderEven : dataExportStyles.previewTableHeaderOdd}>
                          {key}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {this.state.previewTable.map((row, i) => {
                    return (
                      <tr>
                        {previewTableHeader.map((key, j) => {
                          return <th className={dataExportStyles.previewTableCell}>{JSON.stringify(row[key])}</th>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    );
  }

  loadData() {
    GetData.getBounds().then((bounds) => {
      const significantSpan = [
        Math.min(new Date(bounds.firstCommit.date), new Date(bounds.firstIssue.createdAt)),
        Math.max(new Date(bounds.lastCommit.date), new Date(bounds.lastIssue.createdAt)),
      ];
      Promise.join(
        GetData.getCommitData(significantSpan),
        GetData.getIssueData(significantSpan),
        GetData.getBuildData(significantSpan),
        GetData.getFileData(),
        GetData.getBranchData(),
        GetData.getLanguageData(),
        GetData.getModuleData(),
        GetData.getStakeholderData()
      ).then((resp) => {
        const commits = resp[0];
        const issues = resp[1];
        const builds = resp[2];
        const files = resp[3];
        const branches = resp[4];
        const languages = resp[5];
        const modules = resp[6];
        const stakeholders = resp[7];

        this.setState({
          commits: commits,
          issues: issues,
          builds: builds,
          files: files,
          branches: branches,
          languages: languages,
          modules: modules,
          stakeholders: stakeholders,
        });
      });
    });
  }
}
