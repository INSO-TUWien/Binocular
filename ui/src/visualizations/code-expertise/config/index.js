'use strict';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import TabCombo from '../../../components/TabCombo.js';
import Filepicker from '../../../components/Filepicker/index.js';
import styles from '../styles.scss';
import { setActiveIssue, setMode, setCurrentBranch, setActiveFiles, setFilterMergeCommits, setOnlyDisplayOwnership } from '../sagas';
import { getBranches, getFilenamesForBranch, getIssues } from '../sagas/helper.js';

export default () => {
  //global state from redux store
  const expertiseState = useSelector((state) => state.visualizations.codeExpertise.state);
  const currentMode = expertiseState.config.mode;
  const currentBranch = expertiseState.config.currentBranch;
  const activeFiles = expertiseState.config.activeFiles;
  const currentBranchName = currentBranch && currentBranch.branch;
  const activeIssueId = expertiseState.config.activeIssueId;
  const filterMergeCommits = expertiseState.config.filterMergeCommits;
  const onlyDisplayOwnership = expertiseState.config.onlyDisplayOwnership;
  const mode = useSelector((state) => state.visualizations.codeExpertise.state.config.mode);

  //local state
  const [allBranches, setAllBranches] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [issueOptions, setIssueOptions] = useState([]);
  const [files, setFiles] = useState([]);

  const dispatch = useDispatch();

  const onSetIssue = (issueId) => {
    dispatch(setActiveIssue(issueId));
  };

  const onSetMode = (mode) => {
    dispatch(setMode(mode));
  };

  const onSetBranch = (branchName) => {
    const branchObject = allBranches.filter((b) => b.branch === branchName)[0];
    dispatch(setCurrentBranch(branchObject));
  };

  const resetActiveFiles = () => {
    dispatch(setActiveFiles([]));
  };

  const onSetFilterMergeCommits = (isChecked) => {
    dispatch(setFilterMergeCommits(isChecked));
  };

  const onSetOnlyDisplayOwnership = (isChecked) => {
    if (mode === 'issues') return;
    dispatch(setOnlyDisplayOwnership(isChecked));
  };

  //run once on initialization
  useEffect(() => {
    //get all branches for branch-select
    getBranches()
      .then((branches) => branches.sort((a, b) => a.branch.localeCompare(b.branch)))
      .then((branches) => {
        setAllBranches(branches);
        return branches.map((b) => b.branch);
      })
      .then((branches) => [...new Set(branches)])
      .then((branches) => {
        const temp = [];
        //placeholder option
        temp.push(
          <option key={-1} value={''}>
            Select a Branch
          </option>
        );
        for (const i in branches) {
          temp.push(
            <option key={i} value={branches[i]}>
              {branches[i]}
            </option>
          );
        }
        setBranchOptions(temp);
      });

    //get all issues for issue-select
    getIssues().then((issues) => {
      const temp = [];
      //placeholder option
      temp.push(
        <option key={-1} value={''}>
          Select an Issue
        </option>
      );
      for (const i of issues) {
        temp.push(
          <option key={i.iid} value={i.iid}>
            {'#' + i.iid + ' ' + i.title}
          </option>
        );
      }
      setIssueOptions(temp);
    });
  }, []);

  //update files every time the branch changes
  //also reset selected files
  useEffect(() => {
    if (currentBranch) {
      resetActiveFiles();
      getFilenamesForBranch(currentBranch.branch).then((files) => setFiles(files));
    }
  }, [currentBranch]);

  return (
    <div className={styles.configContainer}>
      <form>
        {/* select branch */}
        <div className="field">
          <div className="control">
            <label className="label">Branch:</label>
            <div className="select">
              <select value={currentBranchName} onChange={(e) => onSetBranch(e.target.value)}>
                {branchOptions}
              </select>
            </div>
          </div>
        </div>

        {/* Display a warning if the current branch cannot track file renames */}
        {currentBranch && currentBranch.tracksFileRenames !== 'true' && currentBranch.tracksFileRenames !== true && (
          <>
            <p>
              <b>Attention:</b> This branch does <b>not</b> track file renames!
            </p>
            <p>If you want to track file renames for this branch, add it to the 'fileRenameBranches' array in '.binocularrc'</p>
          </>
        )}

        {/* select if merge commits should be filtered */}
        <div className="field">
          <div className="control">
            <label className="label">Filter Commits:</label>
            <input type="checkbox" checked={filterMergeCommits} onChange={(event) => onSetFilterMergeCommits(event.target.checked)} />
            <span>Exclude merge commits</span>
          </div>
        </div>

        {mode !== 'issues' && (
          <div className="field">
            <div className="control">
              <label className="label">Display Settings:</label>
              <input type="checkbox" checked={onlyDisplayOwnership} onChange={(event) => onSetOnlyDisplayOwnership(event.target.checked)} />
              <span>Only display Code Ownership</span>
            </div>
          </div>
        )}

        {/* select if commits related to issues or commits related to files should be visualized */}
        <div className="field">
          <div className="control">
            <label className="label">Mode:</label>
            <TabCombo
              value={currentMode}
              onChange={(value) => onSetMode(value)}
              options={[
                { label: 'Issues', icon: 'ticket-alt', value: 'issues' },
                { label: 'Modules', icon: 'server', value: 'modules' },
              ]}
            />
          </div>
        </div>

        {/* Only diplay issue searchbar when 'issues' is selected as mode */}
        {currentMode === 'issues' && (
          <div className="field">
            <div className="control">
              <label className="label">Choose an Issue to visualize:</label>
              <div className="select">
                <select value={activeIssueId} onChange={(e) => onSetIssue(e.target.value)}>
                  {issueOptions}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Only diplay file-picker when 'modules' is selected as mode and a branch is selected*/}
        {currentMode === 'modules' && currentBranch && (
          <div className="field">
            <div className="control">
              <label className="label">Choose Files and Modules to visualize:</label>

              <Filepicker fileList={files} globalActiveFiles={activeFiles} setActiveFiles={(files) => dispatch(setActiveFiles(files))} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
