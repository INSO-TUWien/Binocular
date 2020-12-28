'use strict';

import { connect } from 'react-redux';

import { setColor, setOtherProject, updateConflictAwarenessData } from './sagas';
import styles from './styles.scss';

import cx from 'classnames';
import ColorPicker from '../../components/ColorPicker';
import React from 'react';
import SearchBox from '../../components/SearchBox';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    repoFullName: `${state.config.data.repoOwner}/${state.config.data.repoName}`, // the name of the base repo (owner/repository name)
    colorBaseProject: caState.config.color.baseProject, // the color for the commits/edges of the base project
    colorOtherProject: caState.config.color.otherProject, // the color for the commits/edges of the parent/fork
    colorCombined: caState.config.color.combined, // the color of the commits/edges found in both projects
    parent: caState.data.data.parent, // the parent of the base project
    forks: caState.data.data.forks, // the forks of the base project
    otherProject: caState.config.otherProject, // the selected parent/fork
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSetColor: (color, key) => dispatch(setColor(color, key)),
    // when a (new) parent/forks of the base project is changed
    onSetOtherProject: (otherProject, repoFullName) => {
      // set it in the state
      dispatch(setOtherProject(otherProject));
      // and update the conflict awareness data (without getting parents/forks again, incl. triggering selected project indexing)
      dispatch(
        updateConflictAwarenessData([repoFullName, otherProject.fullName], false, [
          otherProject.ownerName,
          otherProject.name,
        ])
      );
    },
  };
};

const ConflictAwarenessConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>
      <form>
        {/* Checkbox for Compact View */}
        <div className="field">
          <label>
            <input type="checkbox" className="checkbox" />
            Compact View
          </label>
        </div>

        {/* Properties for the BaseProject (Label, ProjectName, ColorPicker, BranchSelection*/}
        {projectProperties(
          props,
          'Main Project:',
          'baseProject',
          props.colorBaseProject,
          getInputElement()
        )}

        {/* Properties for the selected Parent/Fork (Label, ProjectName, ColorPicker, BranchSelection*/}
        {projectProperties(
          props,
          'Parent/Fork:',
          'otherProject',
          props.colorOtherProject,
          getSearchBoxElement(props)
        )}

        {/* Properties for the combined Commits */}
        <div className="field">
          <div className={styles.colorPickContainer}>
            <label className={styles.colorPickLabel}>Equal Commits in both Projects:</label>
            <ColorPicker
              displayColorPicker={false}
              color={props.colorCombined}
              setColor={(color) => props.onSetColor(color, 'combined')}
            />
          </div>
        </div>

        {/* Properties for the Issue selection TODO: replace textbox with selection */}
        <div className="field">
          <label className="label">Issue:</label>
          <input type="text" />
        </div>
      </form>
    </div>
  );
};

const projectProperties = (props, label, projectKey, propsColor, elementInFrontOfColorPicker) => {
  return (
    <div className="field">
      {/* Label */}
      <label className="label">{label}</label>
      <div className={styles.colorPickContainer}>
        {/* ProjectName TODO: add ProjectName */}
        {elementInFrontOfColorPicker}
        {/* ColorPicker */}
        <ColorPicker
          displayColorPicker={false}
          color={propsColor}
          setColor={(color) => props.onSetColor(color, projectKey)}
        />
      </div>
      {/* BranchSelection, select all checkbox */}
      <label>
        <input type="checkbox" className="checkbox" />
        all
      </label>
      <div className={styles.branchSelectionContainer}>
        {/* TODO: add branches as checkboxes */}
      </div>
    </div>
  );
};

const getSearchBoxElement = (props) => {
  return (
    <div className={styles.width100}>
      {/* show disabled selection box if no fork and parent is available */}
      {/* TODO: add check for parent and fork length */}
      {!props.forks && (
        <SearchBox
          placeholder="Select Parent/Fork..."
          disabled={true}
          renderOption={() => ''}
          search={() => ''}
        />
      )}
      {/* show selection box if at least a fork or parent is available */}
      {/* TODO: add check for parent and fork length */}
      {props.forks && (
        <SearchBox
          placeholder="Select Parent/Fork..."
          renderOption={(i) => `${i.fullName}`}
          search={(text) => {
            return props.forks.filter((fork) =>
              fork.fullName.toLowerCase().includes(text.toLowerCase())
            );
          }}
          value={props.otherProject}
          onChange={(otherProject) => props.onSetOtherProject(otherProject, props.repoFullName)}
        />
      )}
    </div>
  );
};

const getInputElement = () => {
  return <input type="text" disabled={true} className={cx('input')} value="Test" />;
};

const ConflictAwarenessConfig = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConflictAwarenessConfigComponent);

export default ConflictAwarenessConfig;
