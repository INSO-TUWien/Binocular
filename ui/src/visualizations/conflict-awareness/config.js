'use strict';

import { connect } from 'react-redux';

import {
  setColor,
  setIssueForFilter,
  setIssueSelector,
  setOtherProject,
  setSelectedIssue,
  switchAllBranchCheckedBaseProject,
  switchAllBranchCheckedOtherProject,
  switchBranchCheckedBaseProject,
  switchBranchCheckedOtherProject,
  switchExcludedBranchesBaseProject,
  switchExcludedBranchesOtherProject,
  switchShowAllBranchesBaseProject,
  switchShowAllBranchesOtherProject,
  updateConflictAwarenessData,
} from './sagas';
import styles from './styles.scss';

import cx from 'classnames';
import ColorPicker from '../../components/ColorPicker';
import React from 'react';
import SearchBox from '../../components/SearchBox';

let issueNumber = ''; // issueNumber (ID) for highlighting the commits of the issue

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    repoFullName: `${state.config.data.repoOwner}/${state.config.data.repoName}`, // the name of the base repo (owner/repository name)
    colorBaseProject: caState.config.color.baseProject, // the color for the commits/edges of the base project
    colorOtherProject: caState.config.color.otherProject, // the color for the commits/edges of the parent/fork
    colorCombined: caState.config.color.combined, // the color of the commits/edges found in both projects
    parent: caState.data.data.parent, // the parent of the base project
    forks: caState.data.data.forks, // the forks of the base project
    issues: caState.data.data.issues, // the issues of the base project for the filter list
    otherProject: caState.config.otherProject, // the selected parent/fork
    issueForFilter: caState.config.issueForFilter, // the issueID whose commits should be highlighted
    issueSelector: caState.config.issueSelector, // indicator if the issue selection should be via a list of GitHub issues or by text entry
    selectedIssue: caState.config.selectedIssue, // issue which was selected in the list
    branchesBaseProject: caState.data.data.branchesBaseProject, // the branch names of the base project and a flag if they are checked in the config
    branchesOtherProject: caState.data.data.branchesOtherProject, // the branch names of the parent/fork (if one was selected) and a flag if they are checked in the config
    excludedBranchesBaseProject: caState.config.excludedBranchesBaseProject, // the branches of the base project which should be excluded in the graph
    excludedBranchesOtherProject: caState.config.excludedBranchesOtherProject, // the branches of the other project which should be excluded in the graph
    showAllBranchesBaseProjectChecked: caState.config.showAllBranchesBaseProjectChecked, // a flag indicating if all branches of the base project should be excluded or not
    showAllBranchesOtherProjectChecked: caState.config.showAllBranchesOtherProjectChecked, // a flag indicating if all branches of the other project should be excluded or not
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // sets the issueNumber of the selected issue and highlights its commits
    onSetSelectedIssue: (selectedIssue) => {
      if (selectedIssue) {
        issueNumber = `#${selectedIssue.iid}`;
      } else {
        issueNumber = '';
      }
      dispatch(setIssueForFilter(issueNumber));
      dispatch(setSelectedIssue(selectedIssue));
    },
    // when the issue filter selector is changed to text or list based
    // if text based: resets the issueNumber, filter and the selectedIssue
    onSetIssueSelector: (selector) => {
      if (selector === 'text') {
        issueNumber = '';
        dispatch(setIssueForFilter(issueNumber));
        dispatch(setSelectedIssue(undefined));
      }
      dispatch(setIssueSelector(selector));
    },
    // when a new issue is selected (text and list based) for highlighting its commits
    onSetIssueForFilter: () => dispatch(setIssueForFilter(issueNumber)),
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
    // when a branch of the base project is unchecked, switch its checked property
    // and add/remove it to/form the excluded branches list
    onSwitchBranchSelectionBaseProject: (excludedBranch) => {
      dispatch(switchBranchCheckedBaseProject(excludedBranch));
      dispatch(switchExcludedBranchesBaseProject(excludedBranch));
    },
    // when a branch from the other project is unchecked, switch its checked property
    // and add/remove it to/from the excluded branches list
    onSwitchBranchSelectionOtherProject: (excludedBranch) => {
      dispatch(switchBranchCheckedOtherProject(excludedBranch));
      dispatch(switchExcludedBranchesOtherProject(excludedBranch));
    },
    // when the all checkbox for the branches of the base project is switched,
    // switch the checked property of all base project branches accordingly
    // and update the excluded branches
    onSwitchShowAllBranchesBaseProject: (isShowAllBranchesBaseProjectChecked, branches) => {
      dispatch(switchShowAllBranchesBaseProject(isShowAllBranchesBaseProjectChecked, branches));
      dispatch(switchAllBranchCheckedBaseProject(isShowAllBranchesBaseProjectChecked));
    },
    // when the all checkbox for the branches of the other project is switched,
    // switch the checked property of all other project branches accordingly
    // and update the excluded branches
    onSwitchShowAllBranchesOtherProject: (isShowAllBranchesOtherProjectChecked, branches) => {
      dispatch(switchShowAllBranchesOtherProject(isShowAllBranchesOtherProjectChecked, branches));
      dispatch(switchAllBranchCheckedOtherProject(isShowAllBranchesOtherProjectChecked));
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
          getInputElement(),
          props.branchesBaseProject,
          props.onSwitchBranchSelectionBaseProject,
          props.onSwitchShowAllBranchesBaseProject,
          props.showAllBranchesBaseProjectChecked
        )}

        {/* Properties for the selected Parent/Fork (Label, ProjectName, ColorPicker, BranchSelection*/}
        {projectProperties(
          props,
          'Parent/Fork:',
          'otherProject',
          props.colorOtherProject,
          getSearchBoxElement(props),
          props.branchesOtherProject,
          props.onSwitchBranchSelectionOtherProject,
          props.onSwitchShowAllBranchesOtherProject,
          props.showAllBranchesOtherProjectChecked
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

        {/* Properties for the Issue selection */}
        <div className="field">
          <label className="label">Issue:</label>
          {/* radio button for text based commit issue highlighting */}
          <label className="radio">
            <input
              name="issueFilterSelection"
              type="radio"
              checked={props.issueSelector === 'text'}
              onChange={() => props.onSetIssueSelector('text')}
            />
            Textual Issue ID
          </label>

          {/* radio button for list based commit issue highlighting */}
          <label className="radio">
            <input
              name="issueFilterSelection"
              type="radio"
              checked={props.issueSelector === 'list'}
              onChange={() => props.onSetIssueSelector('list')}
            />
            GitHub Issues
          </label>

          {/* text based commit filter highlighting */}
          {props.issueSelector === 'text' && (
            <div className={styles.colorPickContainer}>
              {/* text field */}
              <input
                type="search"
                className={cx('input')}
                onChange={(event) => (issueNumber = event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    props.onSetIssueForFilter();
                  }
                }}
              />
              {/* search button */}
              <a className="button ml-3" href="#" onClick={() => props.onSetIssueForFilter()}>
                <i className="fas fa-search" />
              </a>
            </div>
          )}

          {/* list based commit filter highlighting */}
          {props.issueSelector === 'list' && (
            // search box with issues
            <SearchBox
              placeholder="Select issue..."
              renderOption={(issue) => `#${issue.iid} ${issue.title}`}
              search={(text) => {
                return props.issues.filter((issue) =>
                  `#${issue.iid} ${issue.title}`.toLowerCase().includes(text.toLowerCase())
                );
              }}
              value={props.selectedIssue}
              onChange={(issue) => props.onSetSelectedIssue(issue)}
            />
          )}
        </div>
      </form>
    </div>
  );
};

const projectProperties = (
  props,
  label,
  projectKey,
  propsColor,
  elementInFrontOfColorPicker,
  branches,
  onSwitchBranchSelectionFunction,
  onSwitchShowAllBranches,
  currentShowAllSelection
) => {
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
        <input
          type="checkbox"
          className="checkbox"
          checked={currentShowAllSelection}
          onChange={() => onSwitchShowAllBranches(!currentShowAllSelection, branches)}
        />
        all
      </label>
      <div className={styles.branchSelectionContainer}>
        {branches &&
          branches.map((branch) => {
            return (
              <div>
                <label>
                  <input
                    type="checkbox"
                    key={branch.branchName}
                    checked={branch.checked}
                    onChange={() => switchBranchSelection(branch, onSwitchBranchSelectionFunction)}
                  />
                  {branch.branchName}
                </label>
                <br />
              </div>
            );
          })}
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

/**
 * Switches the checked property of branch and calls the reducer.
 * @param branch the branch whose checked property should be switched
 * @param onSwitchBranchSelectionFunction the reducer which should be called
 */
const switchBranchSelection = (branch, onSwitchBranchSelectionFunction) => {
  branch.checked = !branch.checked;
  onSwitchBranchSelectionFunction(branch);
};

const ConflictAwarenessConfig = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConflictAwarenessConfigComponent);

export default ConflictAwarenessConfig;
