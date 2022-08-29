'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { setActivityDimensions, setActivityScale, setBranch, setConflictBranch, setFileFilterMode, setFilteredFiles } from './sagas';
import * as d3 from 'd3';
import { getState } from './util/util';
import _ from 'lodash';
import ActivityTimeline from './components/Timeline/ActivityTimeline';
import styles from './styles.scss';
import FileSelection from './components/FileSelection/FileSelection';

const mapStateToProps = (appState /*, ownProps*/) => {
  const { config, data } = getState(appState);

  return {
    config: {
      selectedActivityScale: config.selectedActivityScale,
      selectedBranch: config.selectedBranch
    },
    data: {
      files: data.data.files,
      fileTree: data.data.fileTree,
      branches: data.data.branches,
      activityTimeline: data.data.activityTimeline,
      yDims: data.data.dataBoundaries
    }
  };
};
const mapDispatchToProps = dispatch => {
  // noinspection JSUnusedGlobalSymbols
  return {
    onSelectActivityScale: activity => dispatch(setActivityScale(activity)),
    onActivityDimensionsRestricted: activity => dispatch(setActivityDimensions(activity)),
    onSelectBranch: activity => dispatch(setBranch(activity)),
    onSelectConflictBranch: activity => dispatch(setConflictBranch(activity)),
    onSetFilteredFile: activity => dispatch(setFilteredFiles(activity)),
    onSetFileFilterMode: activity => dispatch(setFileFilterMode(activity))
  };
};

class ConfigComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      onActivityDimensionsRestricted,
      onSelectActivityScale,
      config,
      data,
      onSelectBranch,
      onSelectConflictBranch,
      onSetFilteredFile,
      onSetFileFilterMode
    } = this.props;
    const { activityTimeline, yDims, branches, fileTree } = data;
    const { stackOffsetDiverging } = d3;

    return (
      <div className={styles.configContainer}>
        <form>
          <div className="field">
            <label className="label">Activity</label>
            <div className="control">
              <div className={'select ' + styles.activitySelect}>
                <select
                  className={styles.activitySelect}
                  value={config.selectedActivityScale}
                  onChange={event => onSelectActivityScale(event.target.value)}>
                  <option value="commits">Commits</option>
                  <option value="activity">Additions & Deletions</option>
                  <option value="additions">Additions</option>
                  <option value="deletions">Deletions</option>
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Branches</label>
            <div className={'select ' + styles.branchesSelect}>
              <select
                className={styles.branchesSelect}
                value={config.selectedBranch}
                onChange={event => onSelectBranch(event.target.value)}>
                <option value="all">All Branches</option>
                {_.sortBy(branches, 'branch').map(branch =>
                  <option key={'branch_' + branch.id} value={branch.branch}>
                    {branch.branch}
                  </option>
                )}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Conflict Branch</label>
            <div className={'select ' + styles.branchesSelect}>
              <select
                className={styles.branchesSelect}
                defaultValue="not_set"
                onChange={event => onSelectConflictBranch(event.target.value)}>
                <option value="not_set">Select a branch</option>
                {_.sortBy(branches, 'branch').map(branch =>
                  <option key={'conflict_branch_' + branch.id} value={branch.branch}>
                    {branch.branch}
                  </option>
                )}
              </select>
            </div>
          </div>
        </form>
        <div>
          <label className="label">Timeline</label>
          <ActivityTimeline
            palette={{ activity: '#00bcd4' }}
            paddings={{ top: 5, left: 30, bottom: 30, right: 30 }}
            resolution={'weeks'}
            xAxisCenter={true}
            content={activityTimeline && activityTimeline.length > 0 ? activityTimeline : [{ date: 0, activity: 0 }]}
            d3offset={stackOffsetDiverging}
            yDims={_.values(yDims)}
            onDimensionsRestricted={dims => onActivityDimensionsRestricted(dims)}
          />
        </div>
        <FileSelection onSetFileFilterMode={m => onSetFileFilterMode(m)} files={fileTree} onSetFilteredFile={f => onSetFilteredFile(f)} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
