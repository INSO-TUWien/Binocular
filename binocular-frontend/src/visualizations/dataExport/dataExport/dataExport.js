'use strict';

import React from 'react';
import styles from '../styles.module.scss';
import dataExportStyles from '../styles/dataExport.module.scss';
import GetData from './helper/getData';
import viewIcon from '../assets/viewIcon.svg';
import downloadIcon from '../assets/downloadIcon.svg';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

export default class DataExport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collections: {
        branches: [],
        builds: [],
        commits: [],
        files: [],
        issues: [],
        modules: [],
        users: [],
        mergeRequests: [],
      },
      relations: {
        commits_commits: [],
        commits_files: [],
        commits_files_users: [],
        commits_modules: [],
        commits_users: [],
        issues_commits: [],
        issues_users: [],
        modules_files: [],
        modules_modules: [],
      },
      previewTable: [],
      exportType: 'json',
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
    const previewTableHeader = this.state.previewTable.length > 0 ? Object.keys(this.state.previewTable[0]) : [];
    return (
      <div className={styles.chartContainer}>
        <div className={styles.mg1}>
          <h1>1. Load Data</h1>
          <div className={dataExportStyles.sectionArrowContainer}>
            <div className={dataExportStyles.sectionArrowStem}></div>
            <div className={dataExportStyles.sectionArrowHead}></div>
          </div>
          <div className={dataExportStyles.section}>
            <button className={'button ' + dataExportStyles.button} onClick={this.loadData.bind(this)}>
              Load Data
            </button>
          </div>
          <h1>2. Choose Export Type</h1>
          <div className={dataExportStyles.sectionArrowContainer}>
            <div className={dataExportStyles.sectionArrowStem}></div>
            <div className={dataExportStyles.sectionArrowHead}></div>
          </div>
          <div className={dataExportStyles.section}>
            <button
              className={'button ' + dataExportStyles.button + (this.state.exportType === 'json' ? ' ' + dataExportStyles.selected : '')}
              onClick={() => {
                this.setState({ exportType: 'json' });
              }}>
              JSON
            </button>
            <button
              className={'button ' + dataExportStyles.button + (this.state.exportType === 'csv' ? ' ' + dataExportStyles.selected : '')}
              onClick={() => {
                this.setState({ exportType: 'csv' });
              }}>
              CSV
            </button>
          </div>
          <h1>3. View and Download Data</h1>
          <div className={dataExportStyles.sectionArrowContainer}>
            <div className={dataExportStyles.sectionArrowStem}></div>
            <div className={dataExportStyles.sectionArrowHead}></div>
          </div>
          <div className={dataExportStyles.section}>
            <h2>Collections</h2>
            {Object.keys(this.state.collections).map((c) => {
              return (
                <div key={c}>
                  {c}: {this.state.collections[c].length}{' '}
                  {this.state.collections[c].length > 10000 ? '(Too many Entries! Preview may crash Binocular.)' : ''}
                  <img
                    className={dataExportStyles.icon}
                    src={viewIcon}
                    onClick={() => {
                      this.setState({ previewTable: this.state.collections[c] });
                    }}></img>
                  <img
                    className={dataExportStyles.icon}
                    src={downloadIcon}
                    onClick={() => {
                      this.download(c, this.state.collections[c]);
                    }}></img>
                </div>
              );
            })}

            <h2>Relations</h2>
            {Object.keys(this.state.relations).map((r) => {
              return (
                <div key={r}>
                  {r.replaceAll('_', '-')}: {this.state.relations[r].length}{' '}
                  {this.state.relations[r].length > 10000 ? '(Too many Entries! Preview may crash Binocular.)' : ''}
                  <img
                    className={dataExportStyles.icon}
                    src={viewIcon}
                    onClick={() => {
                      this.setState({ previewTable: this.state.relations[r] });
                    }}></img>
                  <img
                    className={dataExportStyles.icon}
                    src={downloadIcon}
                    onClick={() => {
                      this.download(r.replaceAll('_', '-'), this.state.relations[r]);
                    }}></img>
                </div>
              );
            })}
          </div>
          <hr />
          <button className={'button ' + dataExportStyles.button} onClick={this.createExportZipAndDownload.bind(this)}>
            Export Complete Database
          </button>
          <hr />
          <div className={dataExportStyles.previewTableContainer}>
            {this.state.previewTable.length !== 0 ? (
              <table className={dataExportStyles.previewTable}>
                <thead className={dataExportStyles.previewTableHeader}>
                  <tr>
                    {previewTableHeader.map((key, i) => {
                      return (
                        <th
                          key={'previewTableHeaderCol' + i}
                          className={i % 2 === 0 ? dataExportStyles.previewTableHeaderEven : dataExportStyles.previewTableHeaderOdd}>
                          {key}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {this.state.previewTable.map((row, i) => {
                    return (
                      <tr key={'previewTableRow' + i}>
                        {previewTableHeader.map((key, j) => {
                          return (
                            <th key={'previewTableRow' + i + 'Col' + j} className={dataExportStyles.previewTableCell}>
                              {JSON.stringify(row[key])}
                            </th>
                          );
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

  download(filename, jsonObject) {
    let blob = '';
    switch (this.state.exportType) {
      case 'csv':
        blob = new Blob([this.convertToCSV(jsonObject)], { type: 'data:text/csv;charset=utf-8' });
        FileSaver.saveAs(blob, filename + '.csv');
        break;
      default:
        blob = new Blob([JSON.stringify(jsonObject)], { type: 'data:text/json;charset=utf-8' });
        FileSaver.saveAs(blob, filename + '.json');
        break;
    }
  }

  convertToCSV(jsonObject) {
    const items = jsonObject;
    const replacer = (key, value) => (value === null ? '' : value);
    const header = Object.keys(items[0]);
    const csv = [
      header.join(','),
      ...items.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')),
    ].join('\r\n');
    return csv;
  }

  loadData() {
    Promise.resolve(GetData.getDatabase()).then((resp) => {
      const database = resp;

      const collections = this.state.collections;
      const relations = this.state.relations;

      collections.branches = database.branches;
      collections.builds = database.builds;
      collections.commits = database.commits;
      collections.files = database.files;
      collections.issues = database.issues;
      collections.modules = database.modules;
      collections.users = database.users;
      collections.mergeRequests = database.mergeRequests;

      relations.commits_commits = database.commits_commits;
      relations.commits_files = database.commits_files;
      relations.commits_files_users = database.commits_files_users;
      relations.commits_users = database.commits_users;
      relations.issues_commits = database.issues_commits;
      relations.issues_users = database.issues_users;
      relations.modules_files = database.modules_files;
      relations.modules_modules = database.modules_modules;

      this.setState({
        collections: collections,
        relations: relations,
      });
    });
  }

  createExportZipAndDownload() {
    const zip = new JSZip();
    switch (this.state.exportType) {
      case 'csv':
        for (const c of Object.keys(this.state.collections)) {
          if (this.state.collections[c].length > 0) {
            zip.file(c.replaceAll('_', '-') + '.csv', this.convertToCSV(this.state.collections[c]));
          }
        }
        for (const r of Object.keys(this.state.relations)) {
          if (this.state.relations[r].length > 0) {
            zip.file(r.replaceAll('_', '-') + '.csv', this.convertToCSV(this.state.relations[r]));
          }
        }
        break;
      default:
        for (const c of Object.keys(this.state.collections)) {
          zip.file(c.replaceAll('_', '-') + '.json', JSON.stringify(this.state.collections[c]));
        }
        for (const r of Object.keys(this.state.relations)) {
          zip.file(r.replaceAll('_', '-') + '.json', JSON.stringify(this.state.relations[r]));
        }
        break;
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      FileSaver.saveAs(content, 'db_export.zip');
    });
  }
}
