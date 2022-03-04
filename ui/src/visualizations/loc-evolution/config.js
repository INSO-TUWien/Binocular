'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setCommitAttribute, setActiveFolder, setFilteredFiles } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import FilterBox from '../../components/FilterBox';
import styles from './styles.scss';


import { graphQl } from '../../utils';
import { Button } from 'react-scroll';
import e from 'cors';

const elementNames = ["Axis.js", "chart.js", "CommitMarker.js", "CommitMarker.scss", "GridLines.js", "index.js", "mockdata.csv", "prototyp.js", "StackedArea.js"]; //change to get Filenames from State
const files = [];
const optionsB = [];
const folderList = [
  ".idea/",
  ".run/",
  "docs/",
  "foxx/",
  "foxx/scripts/",
  "foxx/test/",
  "foxx/types/",
  "lib/",
  "lib/core/db/",
  "lib/core/provider/",
  "lib/endpoints/",
  "lib/errors/",
  "lib/foxx/",
  "lib/importer/",
  "lib/indexers/",
  "lib/indexers/ci/",
  "lib/indexers/clones/",
  "lib/indexers/its/",
  "lib/indexers/vcs/",
  "lib/models/",
  "lib/url-providers/",
  "scripts/",
  "services/grpc/comm/",
  "services/grpc/messages/",
  "services/language/detector/",
  "services/language/detector/bin/",
  "services/language/detector/lib/api/",
  "services/language/detector/lib/config/",
  "services/language/detector/lib/",
  "services/language/detector/lib/service/",
  "services/language/detector/out/production/detector/config/",
  "services/language/detector/out/production/detector/",
  "services/language/detector/out/production/detector/service/",
  "services/language/detector/out/test/detector/",
  "services/language/detector/test/",
  "test/",
  "ui/",
  "ui/components/",
  "ui/components/charts/",
  "ui/components/config-button/",
  "ui/components/config-dialog/",
  "ui/components/icon/",
  "ui/components/message/",
  "ui/components/monospaced/",
  "ui/components/notifications/",
  "ui/components/progress-bar/",
  "ui/components/sidebar/",
  "ui/components/visualizations/code-ownership-river/",
  "ui/icons/",
  "ui/reducers/",
  "ui/src/",
  "ui/src/components/App/",
  "ui/src/components/charts/",
  "ui/src/components/CheckboxLegend/",
  "ui/src/components/ColorPicker/",
  "ui/src/components/ConfigButton/",
  "ui/src/components/ConfigDialog/",
  "ui/src/components/DataRiverChart/",
  "ui/src/components/FilterBox/",
  "ui/src/components/",
  "ui/src/components/Help/HelpButton/",
  "ui/src/components/Help/",
  "ui/src/components/icon/",
  "ui/src/components/Legend/",
  "ui/src/components/LegendCompact/",
  "ui/src/components/message/",
  "ui/src/components/monospaced/",
  "ui/src/components/morph/",
  "ui/src/components/notifications/",
  "ui/src/components/ProgressBar/",
  "ui/src/components/ScalableBaseChart/",
  "ui/src/components/SearchBox/",
  "ui/src/components/Sidebar/",
  "ui/src/components/StackedAreaChart/",
  "ui/src/components/svg/",
  "ui/src/components/ThemeRiverChart/",
  "ui/src/components/ViolinPlot/",
  "ui/src/components/visualizations/code-ownership-river/",
  "ui/src/components/visualizations/issue-impact/",
  "ui/src/database/",
  "ui/src/reducers/",
  "ui/src/sagas/",
  "ui/src/utils/",
  "ui/src/utils/exception/",
  "ui/src/visualizations/active-conflict-awareness/",
  "ui/src/visualizations/active-conflict-awareness/reducers/",
  "ui/src/visualizations/active-conflict-awareness/sagas/",
  "ui/src/visualizations/code-clone-evolution/",
  "ui/src/visualizations/code-clone-evolution/reducers/",
  "ui/src/visualizations/code-clone-evolution/sagas/",
  "ui/src/visualizations/code-editor/chart/",
  "ui/src/visualizations/code-editor/classes/",
  "ui/src/visualizations/code-editor/",
  "ui/src/visualizations/code-editor/helper/",
  "ui/src/visualizations/code-editor/reducers/",
  "ui/src/visualizations/code-editor/sagas/",
  "ui/src/visualizations/code-flow/chart/",
  "ui/src/visualizations/code-flow/",
  "ui/src/visualizations/code-flow/reducers/",
  "ui/src/visualizations/code-flow/sagas/",
  "ui/src/visualizations/code-hotspots/",
  "ui/src/visualizations/code-hotspots/chart/",
  "ui/src/visualizations/code-hotspots/chart/charts/",
  "ui/src/visualizations/code-hotspots/chart/charts/interaction/",
  "ui/src/visualizations/code-hotspots/chart/charts/subCharts/",
  "ui/src/visualizations/code-hotspots/chart/components/",
  "ui/src/visualizations/code-hotspots/chart/helper/",
  "ui/src/visualizations/code-hotspots/chart/settings/",
  "ui/src/visualizations/code-hotspots/components/backgroundRefreshIndicator/",
  "ui/src/visualizations/code-hotspots/components/dateRangeFilter/",
  "ui/src/visualizations/code-hotspots/components/fileBrowser/",
  "ui/src/visualizations/code-hotspots/components/searchBar/",
  "ui/src/visualizations/code-hotspots/components/settings/",
  "ui/src/visualizations/code-hotspots/components/VisulaizationSelector/",
  "ui/src/visualizations/code-hotspots/config/",
  "ui/src/visualizations/code-hotspots/css/",
  "ui/src/visualizations/code-hotspots/images/",
  "ui/src/visualizations/code-hotspots/reducers/",
  "ui/src/visualizations/code-hotspots/sagas/",
  "ui/src/visualizations/code-ownership-river/",
  "ui/src/visualizations/code-ownership-river/chart/",
  "ui/src/visualizations/code-ownership-river/reducers/",
  "ui/src/visualizations/code-ownership-river/sagas/",
  "ui/src/visualizations/code-ownership-transfer/",
  "ui/src/visualizations/code-ownership-transfer/chart/",
  "ui/src/visualizations/code-ownership-transfer/entity/",
  "ui/src/visualizations/code-ownership-transfer/reducers/",
  "ui/src/visualizations/code-ownership-transfer/sagas/",
  "ui/src/visualizations/conflict-awareness/",
  "ui/src/visualizations/conflict-awareness/chart/",
  "ui/src/visualizations/conflict-awareness/help-images/",
  "ui/src/visualizations/conflict-awareness/reducers/",
  "ui/src/visualizations/conflict-awareness/sagas/",
  "ui/src/visualizations/dashboard/chart/",
  "ui/src/visualizations/dashboard/",
  "ui/src/visualizations/dashboard/reducers/",
  "ui/src/visualizations/dashboard/sagas/",
  "ui/src/visualizations/dependency-graph/chart/",
  "ui/src/visualizations/dependency-graph/",
  "ui/src/visualizations/dependency-graph/reducers/",
  "ui/src/visualizations/dependency-graph/sagas/",
  "ui/src/visualizations/File-Evolution/chart/",
  "ui/src/visualizations/File-Evolution/",
  "ui/src/visualizations/File-Evolution/reducers/",
  "ui/src/visualizations/File-Evolution/sagas/",
  "ui/src/visualizations/hotspot-dials/",
  "ui/src/visualizations/hotspot-dials/reducers/",
  "ui/src/visualizations/hotspot-dials/sagas/",
  "ui/src/visualizations/issue-impact/",
  "ui/src/visualizations/issue-impact/reducers/",
  "ui/src/visualizations/issue-impact/sagas/",
  "ui/src/visualizations/language-module-river/chart/",
  "ui/src/visualizations/language-module-river/",
  "ui/src/visualizations/language-module-river/reducers/",
  "ui/src/visualizations/language-module-river/sagas/",
  "ui/src/visualizations/loc-evolution/chart/",
  "ui/src/visualizations/loc-evolution/",
  "ui/src/visualizations/loc-evolution/reducers/",
  "ui/src/visualizations/loc-evolution/sagas/",
  "ui/src/visualizations/project-issue/chart/",
  "ui/src/visualizations/project-issue/",
  "ui/src/visualizations/project-issue/reducers/",
  "ui/src/visualizations/project-issue/sagas/",
  "ui/src/visualizations/symbol-lifespan/chart/",
  "ui/src/visualizations/symbol-lifespan/",
  "ui/src/visualizations/symbol-lifespan/enum/",
  "ui/src/visualizations/symbol-lifespan/reducers/",
  "ui/src/visualizations/symbol-lifespan/sagas/",
  "ui/src/visualizations/team-awareness/chart/",
  "ui/src/visualizations/team-awareness/",
  "ui/src/visualizations/team-awareness/reducers/",
  "ui/src/visualizations/team-awareness/sagas/",
  "ui/src/visualizations/team-awareness/util/",
  "ui/test/"
];
var fileNameList = [];

async function populateFiles() {
  files.length = 0;
  requestFileStructure().then(function (resp) {
    filterFolders(resp);
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
  requestFileStructure().then(function (resp) {
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
  for (const i in folderList) {
    files.push(folderList[i]);
    optionsB.push(
      <option key={i}>
        {folderList[i]}
      </option>
    );
  }

  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <label className="label">Show LoC-Evolution for:</label>
            <div id={'folderSelector'} className={'select'}>
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
