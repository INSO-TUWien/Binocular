"use strict";

import React from "react";
import styles from "../styles.scss";
import "codemirror/lib/codemirror.css";
require("codemirror/mode/javascript/javascript");
import "../css/codeMirror.css";
import BluebirdPromise from "bluebird";
import { graphQl } from "../../../utils";
import Loading from "./helper/loading";
import BackgroundRefreshIndicator from "../components/backgroundRefreshIndicator/backgroundRefreshIndicator";
import DateRangeFilter from "../components/dateRangeFilter/dateRangeFilter";
import chartStyles from "./chart.scss";
import cx from "classnames";
import TimeLineComponent from "../components/timeLine/timeLine";


export default class DependencyChanges extends React.PureComponent {
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
      dates: ['2022-11-12', '2022-11-13', '2022-11-14', '2022-11-15'],
      date: '2022-11-13',
      code: "No File Selected",
      comparedCode: "No File Selected",
      type: "",
      branch: "main",
      compareBranch: "main",
      checkedOutBranch: "main",
      checkedOutCompareBranch: "main",
      fileURL: "",
      path: "",
      showTimeLine: false,
      sha: "",
      mode: 0, //modes: 0...Changes/Version  1...Changes/Developer  2...Changes/Issue
      data: {},
      filteredData: {
        code: "No File Selected",
        firstLineNumber: 1,
        searchTerm: "",
      },
      comparedData: {},
      filteredComparedData: {
        code: "No File Selected",
        firstLineNumber: 1,
        searchTerm: "",
      },
      displayProps: {
        dataScaleHeatmap: 0,
        dataScaleColumns: 0,
        dataScaleRows: 0,
        customDataScale: false,
        dateRange: {
          from: "",
          to: "",
        },
        heatMapStyle: 0,
      },
      filteredDependencies: [],
      filteredComparedDependencies: [],
      resultDependencies: [],
      packageJsons: {},
      commits: [],
      selectedDep: undefined
    };

    this.combinedColumnData = {};
    this.combinedRowData = {};
    this.combinedHeatmapData = {};
    this.dataChanged = false;
    this.codeChanged = false;
    this.getAllBranches().then(   
      function (resp) {
        let activeBranch = "main";
        for (const i in resp) {
          if (resp[i].active === "true") {
            activeBranch = resp[i].branch;
            props.onSetBranch(resp[i].branch);
            props.onSetCompareBranch(resp[i].branch);
          }
        }
        props.onSetBranches(resp);
        this.setState({ checkedOutBranch: activeBranch });
        this.setState({ checkedOutCompareBranch: activeBranch });
      }.bind(this)
    );

    this.getCommitsPackageJsons();
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, compareBranch, path } = nextProps;
    this.setState({
      path: path,
      branch: branch,
      compareBranch: compareBranch,
      fileURL: fileURL,
    });
  }

  componentDidMount() {}

  render() {
    if (this.state.path !== this.prevPath) {
      this.requestData();
    }

    return (
      <div className={styles.w100}>
        <div className={"loadingContainer"} />
        <BackgroundRefreshIndicator />
        <div className={styles.w100}>
          <div className={chartStyles.menubar}>
            <span
              className={chartStyles.dependencyChangesFilter}
              style={{ float: "left" }}
            >
              {" "}
              <DateRangeFilter
                from={this.state.displayProps.dateRange.from}
                to={this.state.displayProps.dateRange.to}
                onDateChanged={(data) => {
                  const currDisplayProps = this.state.displayProps;
                  currDisplayProps.dateRange = data;
                  this.setState({ displayProps: currDisplayProps });
                }}
              />
            </span>
            <span className={styles.verticalSeparator} />
            <span
              id={"mainSearch"}
              className={styles.mg1}
              style={{ width: "20rem", float: "left" }}
            ></span>
            {this.state.sha !== "" && (
              <span>
                <span className={styles.verticalSeparator} />
                <button
                  className={"button " + styles.mg1 + " " + styles.button}
                  onClick={() => {
                    this.setState({ sha: "" });
                  }}
                >
                  Back to current Version
                </button>
              </span>
            )}
          </div>

          <div className={styles.w100 + " " + styles.pr + " tree-sitter"}>
            <div className={styles.dependencyChart}>
              <span className={styles.dependencyTitle}>
                Dependency Changes:{" "}
              </span>
              <ul className={styles.dependencyList}>
                {this.state.resultDependencies.map((dep, index) => (
                  <li onClick={() => { this.getCommitsPackageJsons(dep.name)}}  key={index}>
                    { dep.status === 1 ? <i className={cx("fa", "fa-plus")}></i> : dep.status === 2 ? <i className={cx("fa", "fa-minus")}></i> : <i className={cx("fa", "fa-equals")}></i>}
                    {dep.name}
                  </li>
                ))}
              </ul>
              { this.state.showTimeLine && this.state.commits.length > 0 ? <TimeLineComponent dep={ this.state.selectedDep } data={ this.state.commits }/> : null }
            </div>
          </div>
        </div>
      </div>
    );
  }

  convertTimeToDate(timestamp){
    debugger;
    const timestampParsed = parseInt(timestamp);
    const date = new Date(timestampParsed);
    return date.toLocaleDateString('de-DE', {day:'numeric', month: 'numeric', year: 'numeric'});
  }

  showVersion(depName){
    let arr = [];
    for( const [key, value] of Object.entries(this.state.packageJsons)){
        arr.push(value.dependencies[depName]);
    }
    return arr;
  }

  evaluateDependencies() {
    this.setState({
      resultDependencies: [],
    });
    let result = [];
    for (const i in this.state.filteredDependencies) {
      var dep = this.state.filteredDependencies[i].name;
      var foundDependencies = this.state.filteredComparedDependencies.filter(
        (cd) => cd.name === dep
      );
      if (foundDependencies.length > 0) {
        result.push({ name: dep, status: 0 });
        this.setState({
          filteredComparedDependencies:
            this.state.filteredComparedDependencies.filter(
              (cd) => cd.name !== dep
            ),
        });
      } else {
        result.push({ name: dep, status: 1 });
      }
    }

    for (const j in this.state.filteredComparedDependencies) {
      result.push({
        name: this.state.filteredComparedDependencies[j].name,
        status: 2,
      });
    }

    this.setState({
      resultDependencies: result,
    });
  }

  requestComparedData() {
    if (this.state.path !== "") {
      const http = new XMLHttpRequest();
      http.open(
        "GET",
        this.state.fileURL
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob", "")
          .replace(
            this.state.checkedOutCompareBranch,
            this.state.sha === "" ? this.state.compareBranch : this.state.sha
          ),
        true
      );

      let self = this;
      http.onload = function () {
        if (http.readyState === 4) {
          const resp = http.responseText;
          self.setState({
            comparedCode: resp,
          });
          const type = self.state.fileURL.substring(
            self.state.fileURL.lastIndexOf(".") + 1,
            self.state.fileURL.length
          );
          self.getComparedDependencies(self.state.comparedCode, type);
        }
      };

      http.onerror = function () {
        Loading.setErrorText(xhr.statusText);
        console.error(xhr.statusText);
      };

      http.send(null);
    }
  }

  requestData() {
    if (this.state.path !== "") {
      Loading.insert();
      Loading.setState(0, "Requesting Source Code");
      const xhr = new XMLHttpRequest();

      //get file from branch
      xhr.open(
        "GET",
        this.state.fileURL
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob", "")
          .replace(
            this.state.checkedOutBranch,
            this.state.sha === "" ? this.state.branch : this.state.sha
          ),
        true
      );
      xhr.onload = function () {
        if (xhr.readyState === 4) {
          //if (xhr.status === 200) {
          const path = this.state.path;
          this.prevPath = this.state.path;
          this.prevMode = this.state.mode;
          this.prevSha = this.state.sha;
          Loading.setState(33, "Requesting Version Data");
          if (xhr.status === 200) {
            this.setState({
              code: xhr.responseText,
            });
          }
          const type = this.state.fileURL.substring(
            this.state.fileURL.lastIndexOf(".") + 1,
            this.state.fileURL.length
          );
          this.getDependencies(this.state.code, type);
        }
      }.bind(this);

      xhr.onerror = function () {
        Loading.setErrorText(xhr.statusText);
        console.error(xhr.statusText);
      };
      xhr.onloadend = function () {
        this.requestComparedData();
      }.bind(this);

      xhr.send(null);
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
    ).then((resp) => resp.files.data);
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
    ).then((resp) => resp.branches.data);
  }


  getCommitsPackageJsons(name){
    Loading.insert();
    Loading.setState(80, "Search for dependency version changes");
    this.setState({
      showTimeLine: false,
      selectedDep: name
    });

    var http = new XMLHttpRequest();

    http.addEventListener('load', () => {
      const data = JSON.parse(http.responseText);

      const onlyRelevant = [];
      for(const commit of data){
        if(onlyRelevant.filter(c => c.version == commit.version).length == 0){
            onlyRelevant.push(commit);
        }
      }
      this.setState({
        commits: onlyRelevant,
        showTimeLine: true
      });
      Loading.remove();
      console.log('wait until all data fetched');
      console.log(onlyRelevant);
    });
    
    http.open("GET", "/api/commitsPackage?dep=" + name);
    http.send();
  }


  getDependencies(content, type) {
    var body = {};
    body.content = content;
    body.type = type;
    var http = new XMLHttpRequest();
    http.open("POST", "/api/ast", true);

    http.setRequestHeader("Content-type", "application/json");

    http.onload = () => {
      if (http.readyState === XMLHttpRequest.DONE && http.status === 200) {
        let deps = JSON.parse(http.responseText);
        let toReturn = [];

        //status 0 .. nothing changed, staus 1 .. dependency added, status 2 .. dependency removed
        for (const i in deps) {
          toReturn.push({ name: deps[i], status: 0 });
        }
        this.setState({
          filteredDependencies: toReturn,
        });
      }
      Loading.remove();
    };

    http.send(JSON.stringify(body));
  }

  getComparedDependencies(content, type) {
    var body = {};
    body.content = content;
    body.type = type;
    var http = new XMLHttpRequest();
    http.open("POST", "/api/ast", true);

    http.setRequestHeader("Content-type", "application/json");

    http.onload = () => {
      if (http.readyState === XMLHttpRequest.DONE && http.status === 200) {
        let deps = JSON.parse(http.responseText);
        let toReturn = [];

        //status 0 .. nothing changed, staus 1 .. dependency added, status 2 .. dependency removed
        for (const i in deps) {
          toReturn.push({ name: deps[i], status: 0 });
        }

        this.setState({
          filteredComparedDependencies: toReturn,
        });

        this.evaluateDependencies();
      }
      Loading.remove();
    };

    http.send(JSON.stringify(body));
  }
}
