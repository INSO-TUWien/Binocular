'use strict';

import { connect } from 'react-redux';

import { setColor } from './sagas';
import styles from './styles.scss';

import cx from 'classnames';
import ColorPicker from '../../components/ColorPicker';
import React from 'react';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    colorBaseProject: caState.config.color.baseProject,
    colorOtherProject: caState.config.color.otherProject,
    colorCombined: caState.config.color.combined,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSetColor: (color, key) => dispatch(setColor(color, key)),
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
        {projectProperties(props, 'Main Project:', 'baseProject', props.colorBaseProject)}

        {/* Properties for the selected Parent/Fork (Label, ProjectName, ColorPicker, BranchSelection*/}
        {projectProperties(props, 'Parent/Fork Project:', 'otherProject', props.colorOtherProject)}

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

const projectProperties = (props, label, projectKey, propsColor) => {
  return (
    <div className="field">
      {/* Label */}
      <label className="label">{label}</label>
      <div className={styles.colorPickContainer}>
        {/* ProjectName TODO: add ProjectName */}
        <input type="text" disabled={true} className={cx('input')} value="Test" />
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

const ConflictAwarenessConfig = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConflictAwarenessConfigComponent);

export default ConflictAwarenessConfig;
