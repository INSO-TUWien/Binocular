'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setOverlay, setHighlightedIssue, setCommitAttribute, setActiveFolder } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';


import { graphQl } from '../../utils';
import { Button } from 'react-scroll';
import e from 'cors';

const elementNames = ["Axis.js", "chart.js", "CommitMarker.js", "CommitMarker.scss", "GridLines.js", "index.js", "StackedArea.js"]; //change to get Filenames from State
const files = [];
const optionsB = [];
const folderList = [];

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
    currPath = currPath.substring(0,currPath.lastIndexOf("/")+1)
    if (currPath.length > 0 && !folderList.includes(currPath)) {
      folderList.push(currPath);
    }
  }
}

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
  const corState = state.visualizations.locEvolution.state;

  var temp;
  if (typeof corState.elements === 'undefined') {
    temp = elementNames;
  } else {
    temp = corState.elements
  }
  return {
    issues: corState.data.issues,
    overlay: corState.config.overlay,
    highlightedIssue: corState.config.highlightedIssue,
    highlightedFolder: corState.config.highlightedFolder,
    commitAttribute: corState.config.commitAttribute,
    elements: temp,
    //files: state.visualizations.codeHotspots.state.data.data.files
    files: files
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetFile: url => dispatch(setActiveFile(url)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr)),
    onChangeFolderName: folder => dispatch(setActiveFolder(folder))
  };
};

//LEGEND STUFF HERE

const locEvolutionConfigComponent = props => {
  populateFiles();
  //console.warn(files)
  const options = [];
  for (const i in files) {
    options.push(
      <option key={i}>
        {files[i].key}
      </option>
    );
  }

  /*for (const i in elementNames) {
    options.push(
      <option key={i}>
        {elementNames[i]}
      </option>
    );
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
            <label className="label">Choose Elements to display:</label>

            {props.elements.map(value => (
              <span> {value} {" "}
                <input
                  type="radio"
                  name="elementName"
                  value={value}
                  checked="false"
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
