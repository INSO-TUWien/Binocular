'use strict';
export default class SearchAlgorithm {
  static performFileSearch(dataSet, searchTerm) {
    let filteredDataSet = dataSet;
    const searchTermChunks = searchTerm.toLowerCase().split(' ');

    for (let i = 0; i < searchTermChunks.length; i++) {
      switch (searchTermChunks[i]) {
        case '-':
          break;
        case '-f':
        case '-file':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) =>
              d.key.split('/')[d.key.split('/').length - 1].split('.')[0].toLowerCase().includes(searchTermChunks[i]),
            );
          }
          break;
        case '-t':
        case '-type':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) =>
              d.key.split('.')[d.key.split('.').length - 1].toLowerCase().includes(searchTermChunks[i]),
            );
          }
          break;
        default:
          filteredDataSet = filteredDataSet.filter((d) => d.key.toLowerCase().includes(searchTermChunks[i]));
          break;
      }
    }

    return filteredDataSet;
  }

  static performCommitSearch(dataSet, searchTerm) {
    let filteredDataSet = dataSet.data;
    let firstLineNumber = 1;
    let code = dataSet.code;
    let secondaryCode = dataSet.secondaryCode;
    const searchTermChunks = searchTerm.toLowerCase().split(' ');
    for (let i = 0; i < searchTermChunks.length; i++) {
      switch (searchTermChunks[i]) {
        case '-m':
        case '-message':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.message.toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-s':
        case '-sha':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.sha.toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-d':
        case '-developer':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.signature.toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-b':
        case '-branch':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.branch.toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-l':
        case '-line':
        case '-lines':
          if (i < searchTermChunks.length - 1) {
            i++;
            const searchTermChunk = searchTermChunks[i];
            if (searchTermChunk.includes('-')) {
              if (searchTermChunk.startsWith('-')) {
                const endNr = parseInt(searchTermChunk.substring(1));
                if (!isNaN(endNr)) {
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i < endNr)
                    .join('\n');
                  secondaryCode = secondaryCode
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i < endNr)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row < endNr);
                }
              } else if (searchTermChunk.endsWith('-')) {
                const startNr = parseInt(searchTermChunk.substring(0, searchTermChunk.length - 1));
                if (!isNaN(startNr)) {
                  firstLineNumber = startNr;
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1)
                    .join('\n');
                  secondaryCode = secondaryCode
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row >= startNr - 1);
                }
              } else {
                const rowSearchTermChunks = searchTermChunk.split('-');
                const startNr = parseInt(rowSearchTermChunks[0]);
                const endNr = parseInt(rowSearchTermChunks[1]);
                if (!isNaN(startNr) && !isNaN(endNr)) {
                  firstLineNumber = startNr;
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1 && i < endNr)
                    .join('\n');
                  secondaryCode = secondaryCode
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1 && i < endNr)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row >= startNr - 1 && d.row < endNr);
                }
              }
            } else {
              const lineNr = parseInt(searchTermChunk);
              if (!isNaN(lineNr)) {
                firstLineNumber = lineNr;
                code = code.split(/\r\n|\r|\n/).find((e, i) => i === lineNr - 1);
                secondaryCode = secondaryCode.split(/\r\n|\r|\n/).find((e, i) => i === lineNr - 1);
                filteredDataSet = filteredDataSet.filter((d) => d.row === lineNr - 1);
              }
            }
          }

          break;
        default:
          filteredDataSet = filteredDataSet.filter(
            (d) =>
              d.message.toLowerCase().includes(searchTermChunks[i]) ||
              d.branch.toLowerCase().includes(searchTermChunks[i]) ||
              d.sha.toLowerCase().includes(searchTermChunks[i]) ||
              d.signature.toLowerCase().includes(searchTermChunks[i]),
          );
          break;
      }
    }
    return {
      data: filteredDataSet,
      lines: dataSet.lines,
      commits: dataSet.commits,
      devs: dataSet.devs,
      issues: dataSet.issues,
      maxValue: dataSet.maxValue,
      code: code,
      secondaryCode: secondaryCode,
      firstLineNumber: firstLineNumber,
      legendSteps: dataSet.legendSteps,
      searchTerm: searchTerm,
      rawData: dataSet.rawData,
    };
  }

  static performDeveloperSearch(dataSet, searchTerm) {
    let filteredDataSet = dataSet.data;
    let firstLineNumber = 1;
    let code = dataSet.code;
    let secondaryCode = dataSet.secondaryCode;
    const searchTermChunks = searchTerm.toLowerCase().split(' ');
    for (let i = 0; i < searchTermChunks.length; i++) {
      switch (searchTermChunks[i]) {
        case '-n':
        case '-name':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.dev.split(' <')[0].toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-e':
        case '-email':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.dev.split(' <')[1].toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        default:
          filteredDataSet = filteredDataSet.filter((d) => d.dev.toLowerCase().includes(searchTermChunks[i]));
          break;
        case '-l':
        case '-line':
        case '-lines':
          if (i < searchTermChunks.length - 1) {
            i++;
            const searchTermChunk = searchTermChunks[i];
            if (searchTermChunk.includes('-')) {
              if (searchTermChunk.startsWith('-')) {
                const endNr = parseInt(searchTermChunk.substring(1));
                if (!isNaN(endNr)) {
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i < endNr)
                    .join('\n');
                  secondaryCode = secondaryCode
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i < endNr)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row < endNr);
                }
              } else if (searchTermChunk.endsWith('-')) {
                const startNr = parseInt(searchTermChunk.substring(0, searchTermChunk.length - 1));
                if (!isNaN(startNr)) {
                  firstLineNumber = startNr;
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1)
                    .join('\n');
                  secondaryCode = secondaryCode
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row >= startNr - 1);
                }
              } else {
                const rowSearchTermChunks = searchTermChunk.split('-');
                const startNr = parseInt(rowSearchTermChunks[0]);
                const endNr = parseInt(rowSearchTermChunks[1]);
                if (!isNaN(startNr) && !isNaN(endNr)) {
                  firstLineNumber = startNr;
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1 && i < endNr)
                    .join('\n');
                  secondaryCode = secondaryCode
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1 && i < endNr)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row >= startNr - 1 && d.row < endNr);
                }
              }
            } else {
              const lineNr = parseInt(searchTermChunk);
              if (!isNaN(lineNr)) {
                firstLineNumber = lineNr;
                code = code.split(/\r\n|\r|\n/).find((e, i) => i === lineNr - 1);
                secondaryCode = secondaryCode.split(/\r\n|\r|\n/).find((e, i) => i === lineNr - 1);
                filteredDataSet = filteredDataSet.filter((d) => d.row === lineNr - 1);
              }
            }
          }

          break;
      }
    }
    return {
      data: filteredDataSet,
      lines: dataSet.lines,
      commits: dataSet.commits,
      devs: dataSet.devs,
      issues: dataSet.issues,
      maxValue: dataSet.maxValue,
      code: code,
      secondaryCode: secondaryCode,
      firstLineNumber: firstLineNumber,
      legendSteps: dataSet.legendSteps,
      searchTerm: searchTerm,
      rawData: dataSet.rawData,
    };
  }

  static performIssueSearch(dataSet, searchTerm) {
    let filteredDataSet = dataSet.data;
    let firstLineNumber = 1;
    let code = dataSet.code;
    const searchTermChunks = searchTerm.toLowerCase().split(' ');
    for (let i = 0; i < searchTermChunks.length; i++) {
      switch (searchTermChunks[i]) {
        case '-t':
        case '-title':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.title.toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-d':
        case '-description':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => ('' + d.description).toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        case '-i':
        case '-iid':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) => d.iid.toLowerCase().includes(searchTermChunks[i]));
          }
          break;
        default:
          filteredDataSet = filteredDataSet.filter(
            (d) =>
              d.title.toLowerCase().includes(searchTermChunks[i]) ||
              ('' + d.description).toLowerCase().includes(searchTermChunks[i]) ||
              d.iid.toLowerCase().includes(searchTermChunks[i]),
          );
          break;
        case '-l':
        case '-line':
        case '-lines':
          if (i < searchTermChunks.length - 1) {
            i++;
            const searchTermChunk = searchTermChunks[i];
            if (searchTermChunk.includes('-')) {
              if (searchTermChunk.startsWith('-')) {
                const endNr = parseInt(searchTermChunk.substring(1));
                if (!isNaN(endNr)) {
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i < endNr)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row < endNr);
                }
              } else if (searchTermChunk.endsWith('-')) {
                const startNr = parseInt(searchTermChunk.substring(0, searchTermChunk.length - 1));
                if (!isNaN(startNr)) {
                  firstLineNumber = startNr;
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row >= startNr - 1);
                }
              } else {
                const rowSearchTermChunks = searchTermChunk.split('-');
                const startNr = parseInt(rowSearchTermChunks[0]);
                const endNr = parseInt(rowSearchTermChunks[1]);
                if (!isNaN(startNr) && !isNaN(endNr)) {
                  firstLineNumber = startNr;
                  code = code
                    .split(/\r\n|\r|\n/)
                    .filter((e, i) => i >= startNr - 1 && i < endNr)
                    .join('\n');
                  filteredDataSet = filteredDataSet.filter((d) => d.row >= startNr - 1 && d.row < endNr);
                }
              }
            } else {
              const lineNr = parseInt(searchTermChunk);
              if (!isNaN(lineNr)) {
                firstLineNumber = lineNr;
                code = code.split(/\r\n|\r|\n/).find((e, i) => i === lineNr - 1);
                filteredDataSet = filteredDataSet.filter((d) => d.row === lineNr - 1);
              }
            }
          }

          break;
      }
    }
    return {
      data: filteredDataSet,
      lines: dataSet.lines,
      commits: dataSet.commits,
      devs: dataSet.devs,
      issues: dataSet.issues,
      maxValue: dataSet.maxValue,
      code: code,
      firstLineNumber: firstLineNumber,
      legendSteps: dataSet.legendSteps,
      searchTerm: searchTerm,
      rawData: dataSet.rawData,
    };
  }
}
