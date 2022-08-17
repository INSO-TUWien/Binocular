"use strict";

import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import styles from "../styles.scss";
import "codemirror/lib/codemirror.css";
require("codemirror/mode/javascript/javascript");
import "../css/codeMirror.css";
import vcsData from "./helper/vcsData";
import chartUpdater from "./charts/chartUpdater";
import BluebirdPromise from "bluebird";
import { graphQl } from "../../../utils";
import Loading from "./helper/loading";
import BackgroundRefreshIndicator from "../components/backgroundRefreshIndicator/backgroundRefreshIndicator";
import DateRangeFilter from "../components/dateRangeFilter/dateRangeFilter";
import searchAlgorithm from "../components/searchBar/searchAlgorithm";
import chartStyles from "./chart.scss";
import ModeSwitcher from "./helper/modeSwitcher";

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
      code: "No File Selected",
      type: "",
      branch: "main",
      checkedOutBranch: "main",
      fileURL: "",
      path: "",
      sha: "",
      mode: 0, //modes: 0...Changes/Version  1...Changes/Developer  2...Changes/Issue
      data: {},
      filteredData: {
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
    if (
      this.prevMode !== this.state.mode ||
      this.state.path !== this.prevPath
    ) {
      this.requestData();
    } else {
      if (this.dataChanged) {
        this.dataChanged = false;
        Loading.remove();
      } else {
        if (!this.codeChanged) {
          this.requestData();
        } else {
          this.codeChanged = false;
        }
      }
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
              <span className={styles.dependencyTitle}>Dependencies: </span>
              <ul className={styles.dependencyList}>
                {this.state.filteredDependencies.map((dep, index) => (
                  <li key={index}>{dep}</li>
                ))}
              </ul>
            </div>
            <div className={chartStyles.codeView}>
              <CodeMirror
                id={"codeView"}
                ref={"codeView"}
                value={this.state.filteredData.code}
                options={{
                  mode: ModeSwitcher.modeFromExtension(
                    this.state.path.split(".").pop()
                  ),
                  theme: "default",
                  lineNumbers: true,
                  readOnly: true,
                  firstLineNumber: this.state.filteredData.firstLineNumber,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  requestData() {
    if (this.state.path !== "") {
      Loading.insert();
      Loading.setState(0, "Requesting Source Code");
      const xhr = new XMLHttpRequest();
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
          if (
            this.state.path === this.prevPath &&
            this.state.sha !== this.prevSha
          ) {
            this.prevSha = this.state.sha;
            this.codeChanged = true;
            this.dataChanged = false;
            Loading.remove();
            const data = this.state.data;
            data.code = xhr.responseText;
            this.setState({
              data: data,
              filteredData:
                this.state.mode === 2
                  ? searchAlgorithm.performIssueSearch(
                      data,
                      this.state.filteredData.searchTerm
                    )
                  : this.state.mode === 1
                  ? searchAlgorithm.performDeveloperSearch(
                      data,
                      this.state.filteredData.searchTerm
                    )
                  : this.state.mode === 0
                  ? searchAlgorithm.performCommitSearch(
                      data,
                      this.state.filteredData.searchTerm
                    )
                  : data,
            });
          } else {
            const path = this.state.path;
            this.prevPath = this.state.path;
            this.prevMode = this.state.mode;
            this.prevSha = this.state.sha;
            Loading.setState(33, "Requesting Version Data");
            vcsData.getChangeData(path).then(
              function (resp) {
                Loading.setState(66, "Transforming Version Data");
                setTimeout(
                  function () {
                    const lines = (
                      xhr.status === 200 ? xhr.responseText : ""
                    ).split(/\r\n|\r|\n/).length;
                    const data = chartUpdater.transformChangesPerVersionData(
                      resp,
                      lines
                    );

                    //this.codeChanged = true;
                    this.dataChanged = true;
                    data.code =
                      xhr.status === 200
                        ? xhr.responseText
                        : "No commit code in current selected Branch!";
                    data.firstLineNumber = 1;
                    data.searchTerm = "";

                    const currDisplayProps = this.state.displayProps;
                    currDisplayProps.dateRange.from =
                      data.data[0].date.split(".")[0];
                    currDisplayProps.dateRange.from =
                      currDisplayProps.dateRange.from.substring(
                        0,
                        currDisplayProps.dateRange.from.length - 3
                      );
                    currDisplayProps.dateRange.to =
                      data.data[data.data.length - 1].date.split(".")[0];
                    currDisplayProps.dateRange.to =
                      currDisplayProps.dateRange.to.substring(
                        0,
                        currDisplayProps.dateRange.to.length - 3
                      );
                    this.setState({
                      code:
                        xhr.status === 200
                          ? xhr.responseText
                          : "No commit code in current selected Branch!",
                      data: data,
                      filteredData: data,
                      displayProps: currDisplayProps,
                    });
                  }.bind(this),
                  0
                );
              }.bind(this)
            );
            const type = this.state.fileURL.substring(
              this.state.fileURL.lastIndexOf(".") + 1,
              this.state.fileURL.length
            );
            this.getDependencies(this.state.code, type);
          }
        }
      }.bind(this);
      xhr.onerror = function () {
        Loading.setErrorText(xhr.statusText);
        console.error(xhr.statusText);
      };
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

  getDependencies(content, type) {
    var body = {};
    body.content = content;
    body.type = type;
    var http = new XMLHttpRequest();
    http.open("POST", "/api/ast", true);

    http.setRequestHeader("Content-type", "application/json");

    http.onload = () => {
      if (http.readyState === XMLHttpRequest.DONE && http.status === 200) {
        this.setState({
          filteredDependencies: JSON.parse(http.responseText),
        });
      }
      Loading.remove();
    };

    http.send(JSON.stringify(body));
  }
}
