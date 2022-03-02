'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setOverlay, setHighlightedIssue, setCommitAttribute, setActiveFolder, setFilteredFiles } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import FilterBox from '../../components/FilterBox';
import styles from './styles.scss';


import { graphQl } from '../../utils';
import { Button } from 'react-scroll';
import e from 'cors';

const elementNames = ["Axis.js", "chart.js", "CommitMarker.js", "CommitMarker.scss", "GridLines.js", "index.js", "StackedArea.js"]; //change to get Filenames from State
const files = [];
const optionsB = [];
const folderList = [];
var fileNameList = [];

async function populateFiles() {
  files.length = 0;
  requestFileStructure().then(function (resp) {
    filterFolders(resp);
    for (const i in folderList) {
      files.push(folderList[i]);
      optionsB.push(
        <option key={i}>
          {folderList[i]}
        </option>
      );
    }
  });
}

function filterFolders(queryResponse) {
  for (const i in queryResponse) {
    var currPath = "";
    currPath = queryResponse[i].path;
    currPath = currPath.substring(0, currPath.lastIndexOf("/") + 1)
    if (currPath.length > 0 && !folderList.includes(currPath)) {
      folderList.push(currPath);
    }
  }
}

//Filter Files for currently selected Folder
async function filterFiles(highlightedFolder) {
  fileNameList = [];
  console.warn(highlightedFolder);
  requestFileStructure().then(function (resp) {
    console.warn(highlightedFolder);
    var prefix = highlightedFolder;
    for (const i in resp) {
      var currPath = "";
      currPath = resp[i].path;
      if (currPath.includes(prefix)) { //check whether the path contains the desired directory
        currPath = currPath.substring(currPath.lastIndexOf("/") + 1); //Remove the directory from the filename
        if (currPath.length > 0 && !fileNameList.includes(currPath)) {
          fileNameList.push(currPath);
        }
      }
    }
    console.warn(fileNameList);
  });
}

//Query for Files
async function requestFileStructure() {
  files.length = 0;
  const resp = await Promise.resolve(
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
  );
  return resp.files.data;
}


const mapStateToProps = (state /*, ownProps*/) => {
  const locState = state.visualizations.locEvolution.state;
  var temp;
  if (typeof locState.elements === 'undefined') {
    temp = elementNames;
  } else {
    temp = locState.elements
  }
  return {
    highlightedFolder: locState.config.highlightedFolder,
    commitAttribute: locState.config.commitAttribute,
    elements: temp,
    files: files,
    filteredFiles: locState.config.filteredFiles
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr)),
    onSetFilteredFiles: files => dispatch(setFilteredFiles(files)),
    onChangeFolderName: folder => dispatch(setActiveFolder(folder))
  };
};

//LEGEND STUFF HERE

const locEvolutionConfigComponent = props => {
  populateFiles();
  /*if(props.filteredFiles.length == 0){
    filterFiles(props.highlightedFolder);
  } else {
    fileNameList = props.filteredFiles;
  }*/

  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <label className="label">Show LoC-Evolution for:</label>
            <div id={'branchSelector'} className={'select'}>
              <select
                value={props.highlightedFolder}
                onChange={e => props.onChangeFolderName(e.target.value)}
              >
                {optionsB}
              </select>
            </div>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Choose Files to display:</label>
            {props.elements.map(value => (
              <span> {value} {" "}
                <input
                  type="radio"
                  name="elementName"
                  value={value}
                  checked="true"
                  onChange={() => props.onChangeCommitAttribute('changes')}
                />
              </span>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

const LocEvolutionConfig = connect(mapStateToProps, mapDispatchToProps)(locEvolutionConfigComponent);

export default LocEvolutionConfig;
