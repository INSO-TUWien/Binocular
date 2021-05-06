'use strict';

import React from 'react';
import styles from './styles.scss';
import StackedBarChart from './chart/StackedBarChart';
import moment from 'moment';
import { CodeLine } from './classes/codeLine';
import _ from 'lodash';
import { OVERLAY_PLOT_OPTIONS } from './chart/OverlayPlotter';
import PieChart from './chart/PieChart';
import { largestRemainderRound, shortenString } from './helper/util';

let startUp = true;
let unmounted = false;
let authorColors = ['green', 'orange', 'indigo', 'pink', 'lavender', 'violet'];
let authors = [];
let selectedPlotOptions = [];
let unknownAuthor = 'unknown';
export default class CodeEditorConfigComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pieChart: [],
      pieChartID: 'pieChart',
      result: []
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if (startUp || unmounted) {
      this.props.requestCodeFileData(nextProps.receiveAllFiles.files[249]);
      startUp = false;
      unmounted = false;
    }
  }

  componentWillUnmount() {
    unmounted = true;
    selectedPlotOptions = [];
    authors = [];
    this.props.onSetSelectedBlames([]);
    this.props.updateOverlay([]);
    this.props.updateCode([]);
  }

  render() {
    return (
      <div className={styles.configContainer}>
        <h1>
          <b>Life Cycle View</b>
        </h1>
        <div key={'lifeCycleSelectBar'} id={'lifeCycleSelectBar'}>
          {this.renderFiles('lifeCycleSelectBar')}
        </div>
        {this.renderSelection()}
        {this.state.result}
        {this.state.pieChart}
        {this.renderCompareElements()}
      </div>
    );
  }

  renderFiles(id) {
    if (Object.keys(this.props.receiveCodeFileData).length === 0) {
      return <div />;
    } else {
      return (
        <StackedBarChart
          data={{
            blames: this.props.receiveAllBlames,
            id
          }}
          handleChange={blames => this.handleSelectedBlamesChange(blames)}
        />
      );
    }
  }

  handleSelectedBlamesChange(blames) {
    this.props.onSetSelectedBlames([...blames]);
    this.renderPie();
    this.renderAuthors();
  }

  renderPie(stats) {
    if (
      (this.props.receiveSelectedBlames && this.props.receiveSelectedBlames.length < 2) ||
      Object.keys(this.props.receiveCodeFileData).length === 0 ||
      !stats
    ) {
      this.setState({
        pieChart: []
      });
    } else {
      this.setState({
        pieChart: (
          <div>
            <div className={styles.resultHeader}>
              <b>Result Frequency Heatmap</b>
            </div>
            <div className={styles.pieChart} key={this.state.pieChartID} id={this.state.pieChartID}>
              <PieChart data={{ id: this.state.pieChartID, stats }} />
            </div>
          </div>
        )
      });
    }
  }

  renderSelection() {
    const selectedBlames = this.props.receiveSelectedBlames;
    const selection = [];
    const tableHeader = [<th key="Table_Selection_0" />];
    const author = [];
    const additions = [];
    const deletions = [];
    const dates = [];
    const commitMessage = [];
    // generate table from blame data
    selectedBlames.forEach((blame, index) => {
      let authorName = blame.commit.signature;
      authorName = shortenString(blame.commit.signature, 15);
      tableHeader.push(<th key={`Table_Selection_${index + 1}`}>{`Selection ${index + 1}`}</th>);
      author.push(
        <td key={`Table_Autor_${blame.commit.signature + index + 1}`}>
          <abbr title={`${blame.commit.signature}`}>{`${authorName}`}</abbr>
        </td>
      );
      additions.push(
        <td key={`Table_Addition_${blame.commit.signature + index + 1}`}>{`${blame.commit.stats
          .additions}`}</td>
      );
      deletions.push(
        <td key={`Table_Deletion_${blame.commit.signature + index + 1}`}>{`${blame.commit.stats
          .deletions}`}</td>
      );
      dates.push(
        <td key={`Table_Date_${blame.commit.date}`}>
          {moment(blame.commit.date).format('DD.MM.YY')}
        </td>
      );
      commitMessage.push(
        <td key={`Table_Commit_${blame.commit.signature + index + 1}`}>{`${blame.commit
          .message}`}</td>
      );
    });
    if (tableHeader.length > 1) {
      selection.push(
        <div key={tableHeader}>
          <table className="table">
            <thead>
              <tr>
                {tableHeader}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Author</th>
                {author}
              </tr>
              <tr>
                <th>Additions</th>
                {additions}
              </tr>
              <tr>
                <th>Deletions</th>
                {deletions}
              </tr>
              <tr>
                <th>Date</th>
                {dates}
              </tr>
              <tr>
                <th>Commit Message</th>
                {commitMessage}
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    return selection;
  }

  handleCheckbox({ target }, selectedOption) {
    const checked = target.type === 'checkbox' ? target.checked : target.value;
    if (checked) {
      if (selectedPlotOptions.indexOf(selectedOption) === -1) {
        selectedPlotOptions.push(selectedOption);
      }
    } else {
      selectedPlotOptions.splice(selectedPlotOptions.indexOf(selectedOption), 1);
    }
  }

  renderCompareElements() {
    let compareButton;
    let labels;
    if (this.props.receiveSelectedBlames) {
      switch (this.props.receiveSelectedBlames.length) {
        case 1:
          compareButton = (
            <button key="CompareButton" className="button is-link" disabled>
              Compare Selection
            </button>
          );
          break;
        case 2:
          authors = [];
          compareButton = (
            <button
              onClick={() => {
                this.compareSelection();
              }}
              key="CompareButton"
              className="button is-link">
              Compare Selection
            </button>
          );
          break;
      }
      if (this.props.receiveSelectedBlames.length !== 0) {
        labels = (
          <div key="CompareLabels" className={styles.checkBox}>
            <div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  onClick={target =>
                    this.handleCheckbox(target, OVERLAY_PLOT_OPTIONS.FREQUENCY_HEATMAP)}
                />
                Frequency Heatmap
              </label>
            </div>
            <div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  onClick={target =>
                    this.handleCheckbox(target, OVERLAY_PLOT_OPTIONS.CODE_OWNERSHIP)}
                />
                Code Ownership
              </label>
            </div>
          </div>
        );
      } else {
        selectedPlotOptions = [];
      }
      return (
        <div>
          {labels}
          {compareButton}
        </div>
      );
    }
  }

  compareSelection() {
    let indexFirst = this.props.receiveAllBlames.findIndex(
      blame => blame.commit.sha === this.props.receiveSelectedBlames[0].commit.sha
    );
    let indexSecond = this.props.receiveAllBlames.findIndex(
      blame => blame.commit.sha === this.props.receiveSelectedBlames[1].commit.sha
    );
    let baseBlame;
    let blames = [];

    if (indexFirst > indexSecond) {
      const indexFirstTemp = indexFirst;
      indexFirst = indexSecond;
      indexSecond = indexFirstTemp;
    }

    if (indexFirst > 0) {
      baseBlame = this.props.receiveAllBlames[indexFirst - 1];
    }
    blames = this.props.receiveAllBlames.slice(indexFirst, indexSecond + 1);

    const analyzedData = this.analyzeCode(baseBlame, blames);
    const codeLines = {
      codeLines: analyzedData.codeLines,
      selectedPlotOptions
    };
    const selectedBlames = [
      this.props.receiveAllBlames[indexFirst],
      this.props.receiveAllBlames[indexSecond]
    ];

    this.props.onSetSelectedBlames([...selectedBlames]);
    this.props.updateOverlay(...[codeLines]);
    if (selectedPlotOptions.includes(OVERLAY_PLOT_OPTIONS.FREQUENCY_HEATMAP)) {
      this.renderPie(analyzedData.heatmapStats);
    } else {
      this.renderPie();
    }
    if (selectedPlotOptions.includes(OVERLAY_PLOT_OPTIONS.CODE_OWNERSHIP)) {
      this.renderAuthors(analyzedData.ownerShipStats);
    } else {
      this.renderAuthors();
    }
  }

  renderAuthors(stats) {
    let render = [];
    const rows = [];
    if (
      this.props.receiveSelectedBlames &&
      this.props.receiveSelectedBlames.length > 1 &&
      Object.keys(this.props.receiveCodeFileData).length !== 0 &&
      stats
    ) {
      stats.forEach(stat => {
        rows.push(
          <tr>
            <td>
              <div className={styles.authorLayout}>
                <div className={styles.authorDot}>
                  <svg height="10" width="10">
                    <circle cx="5" cy="5" r="4" fill={`${stat.color}`} />
                  </svg>
                </div>
                <div>
                  <abbr title={`${stat.author}`}>{`${shortenString(stat.author, 15)}`}</abbr>
                </div>
              </div>
            </td>
            <td>
              {stat.newLines}
            </td>
            <td>
              {stat.newCharacters}
            </td>
            <td>
              {stat.loopl}
            </td>
          </tr>
        );
      });
      render.push(
        <div>
          <div className={styles.resultHeader}>
            <b>Result Codeownership</b>
          </div>
          <div key={'authorTable'}>
            <table className="table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>New Lines</th>
                  <th>New Characters</th>
                  <th>
                    <abbr title="Lost of Ownership per Line">LOOPL</abbr>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    this.setState({
      result: render
    });
  }

  getAuthorColor(commitSignature) {
    let color;
    const authorIndex = authors.indexOf(commitSignature);
    if (commitSignature === 'unknown') {
      color = 'none';
    } else if (authorIndex != -1) {
      color = authorColors[authorIndex];
    } else {
      authors.push(commitSignature);
      color = authorColors[authors.length - 1];
    }
    return color;
  }

  createNewCodeLine(commit, author, index, content) {
    const color = this.getAuthorColor(author);
    return new CodeLine(index, content, author, color);
  }

  analyzeCode(baseBlame, blames) {
    const data = [];
    if (baseBlame) {
      const commit = baseBlame.commit;
      const commitsFiles = baseBlame.commitsFiles;
      const content = commit.fileContent.split('\n');
      // initialize data with first commit
      for (let i = 1; i <= commitsFiles.lineCount; i++) {
        data.push(this.createNewCodeLine(commit, unknownAuthor, i, content[i - 1]));
      }
    }
    blames.forEach(blame => {
      const commit = blame.commit;
      const commitsFiles = blame.commitsFiles;
      const content = commit.fileContent.split('\n');
      let deletedCount = 0;
      commitsFiles.hunks.forEach(hunk => {
        if (hunk.oldLines === hunk.newLines) {
          for (let i = 0; i < hunk.newLines; i++) {
            const index = hunk.newStart + i - 1;
            const clonedData = _.cloneDeep(data[index]);
            data[index].changeHistory.push(clonedData);
            data[index].author = commit.signature;
            data[index].authorColor = this.getAuthorColor(commit.signature);
            // if (clonedData.author !== data[index].author) {
            //   data[index].oldAuthorColor.push(this.getAuthorColor(clonedData.author));
            // }
            data[index].changeCount++;
            data[index].lineContent = content[index];
          }
          // codeLines only got removed, add old changeCount and mergeCount to the next line +1 and remove old lines
        } else if (hunk.newLines === 0) {
          let mergeCount = 1;
          let history = [];
          for (let i = 0; i < hunk.oldLines; i++) {
            const index = hunk.oldStart - 1 - deletedCount;
            mergeCount += data[index].mergeCount + data[index].changeCount;
            history.push(_.cloneDeep(data[index]));
            data.splice(index, 1);
          }
          deletedCount += hunk.oldLines;
          // check if next line exist , if not add to previous
          if (data[hunk.newStart]) {
            data[hunk.newStart].mergeCount += mergeCount;
            data[hunk.newStart].changeHistory = data[hunk.newStart].changeHistory.concat(history);
          } else {
            data[hunk.newStart - 1].mergeCount += mergeCount;
            data[hunk.newStart - 1].changeHistory = data[hunk.newStart - 1].changeHistory.concat(
              history
            );
          }
          // if more lines get added than deleted
        } else if (hunk.newLines > hunk.oldLines) {
          for (let i = 0; i < hunk.newLines; i++) {
            const index = hunk.newStart + i - 1;
            if (hunk.oldLines > i) {
              const clonedData = _.cloneDeep(data[index]);
              data[index].changeHistory.push(clonedData);
              data[index].author = commit.signature;
              data[index].authorColor = this.getAuthorColor(commit.signature);
              // if (clonedData.author !== data[index].author) {
              //   data[index].oldAuthorColor.push(this.getAuthorColor(clonedData.author));
              // }
              data[index].changeCount++;
              data[index].lineContent = content[index];
            } else {
              data.splice(
                index,
                0,
                this.createNewCodeLine(commit, commit.signature, index, content[index])
              );
              deletedCount--;
            }
          }
          // if more lines get delete than added, add mergeCount equally between new lines
        } else if (hunk.oldLines > hunk.newLines) {
          let mergeCount = 1;
          let history = [];
          for (let i = 0; i < hunk.oldLines; i++) {
            const index = hunk.oldStart - 1 - deletedCount;
            data.splice(index, 1);
            mergeCount += data[index].mergeCount + data[index].changeCount;
            history.push(_.cloneDeep(data[index]));
          }
          deletedCount += hunk.oldLines;
          for (let i = 0; i < hunk.newLines; i++) {
            const index = hunk.newStart + i - 1;
            data.splice(
              index,
              0,
              this.createNewCodeLine(commit, commit.signature, index, content[index])
            );
            data[index].mergeCount = mergeCount / hunk.newLines;
            data[index].changeHistory = data[index].changeHistory.concat(history);
          }
          deletedCount -= hunk.newLines;
        }
      });
    });
    let maxChangeCount = 0;
    let minChangeCount = undefined;

    data.forEach((codeLine, i) => {
      const currentChangeCount = codeLine.changeCount + codeLine.mergeCount;
      // update line numbers
      codeLine.lineNumber = i + 1;
      // find min and max values
      if (maxChangeCount < currentChangeCount) {
        maxChangeCount = currentChangeCount;
      }
      if (minChangeCount === undefined) {
        minChangeCount = maxChangeCount;
      }
      if (minChangeCount > currentChangeCount) {
        minChangeCount = currentChangeCount;
      }
    });
    const heatmapStats = [];
    const ownerShipStats = [];
    authors.forEach(author => {
      ownerShipStats.push({
        color: this.getAuthorColor(author),
        author: author,
        newLines: 0,
        newCharacters: 0,
        loopl: 0
      });
    });
    data.forEach(codeLine => {
      if (codeLine.author !== unknownAuthor) {
        const author = ownerShipStats.find(stats => stats.author === codeLine.author);
        author.newLines += 1;
        author.newCharacters += codeLine.lineContent.length;
      }
      if (codeLine.changeHistory.length > 0) {
        codeLine.changeHistory.forEach(history => {
          if (history.author !== codeLine.author) {
            codeLine.oldAuthorColor = history.authorColor;
            const author = ownerShipStats.find(stats => stats.author === history.author);
            if (author) {
              author.loopl += 1;
            }
          }
        });
      }
      // normalizeValues with min and max for heatmap
      codeLine.normalizedValue =
        (codeLine.changeCount + codeLine.mergeCount - minChangeCount) /
        (maxChangeCount - minChangeCount);
      if (Number.isNaN(codeLine.normalizedValue)) {
        codeLine.normalizedValue = 1;
      }
      // set color for heatmap
      codeLine.hslColor = {
        hue: (1.0 - codeLine.normalizedValue) * 240,
        saturation: 1,
        lightness: 0.5,
        opacity: 1
      };
      const foundStat = heatmapStats.find(stat => {
        if (stat.hslColor.hue === codeLine.hslColor.hue) {
          return true;
        }
      });
      if (foundStat) {
        foundStat.count++;
        foundStat.percent = foundStat.count / data.length * 100;
      } else {
        heatmapStats.push({
          hslColor: codeLine.hslColor,
          count: 1,
          percent: 1 / data.length * 100
        });
      }
    });
    //Round heatmap percent
    const percentNumbers = [];
    heatmapStats.forEach(stat => {
      percentNumbers.push(stat.percent);
    });
    largestRemainderRound(percentNumbers, 100, 1).forEach((percent, i) => {
      heatmapStats[i].percent = percent;
    });

    // add one extra empty line because codeMirror always adds one
    const line = new CodeLine(data.length + 1, '', '', 'white');
    line.hslColor = {
      hue: 0,
      saturation: 0,
      lightness: 1,
      opacity: 1
    };
    data.push(line);
    return {
      codeLines: data,
      heatmapStats: _.sortBy(heatmapStats, [
        function(o) {
          return o.hslColor.hue;
        }
      ]),
      ownerShipStats
    };
  }
}
