'use strict';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import TabCombo from '../../../components/TabCombo';
import Filepicker from '../../../components/Filepicker/index';
import styles from '../styles.module.scss';
import { setMode, setCurrentBranch, setActiveFiles } from '../sagas';
import { getBranches, getFilenamesForBranch } from '../sagas/helper';
import { ownershipDataForMergedAuthors } from '../../../utils/ownership.js';

export default () => {
  //global state from redux store
  const ownershipState = useSelector((state) => state.visualizations.codeOwnership.state);
  const currentMode = ownershipState.config.mode;
  const currentBranch = ownershipState.config.currentBranch;
  const currentBranchName = (currentBranch && currentBranch.branch) || undefined;
  const currentActiveFiles = ownershipState.config.activeFiles;
  const ownershipForFiles = ownershipState.data.data.ownershipForFiles;

  //global state of universal settings
  const universalSettings = useSelector((state) => state.universalSettings);
  const otherAuthors = universalSettings.otherAuthors;
  const mergedAuthors = universalSettings.mergedAuthors;
  const authorColors = universalSettings.universalSettingsData.data.palette;

  //local state
  const [allBranches, setAllBranches] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileOwnership, setFileOwnership] = useState(null);

  const dispatch = useDispatch();

  const onSetMode = (mode) => {
    dispatch(setMode(mode));
  };

  const onSetBranch = (branchName) => {
    const branchObject = allBranches.filter((b) => b.branch === branchName)[0];
    dispatch(setCurrentBranch(branchObject));
  };

  const resetActiveFiles = () => {
    if (currentActiveFiles.length !== 0) {
      dispatch(setActiveFiles([]));
    }
  };

  //run once on initialization
  useEffect(() => {
    //get all branches for branch-select
    getBranches()
      .then((branches) => branches.sort((a, b) => a.branch.localeCompare(b.branch)))
      .then((branches) => {
        setAllBranches(branches);
        //select the currently active branch
        if (!currentBranch) {
          let activeBranch = branches.filter((b) => b.active === 'true')[0];
          if (!activeBranch) {
            activeBranch = branches[0];
          }
          dispatch(setCurrentBranch(activeBranch));
        }
        //return just the names of the branches
        return branches.map((b) => b.branch);
      })
      .then((branches) => [...new Set(branches)])
      .then((branches) => {
        //build the selection box
        const temp = [];
        //placeholder option
        temp.push(
          <option key={-1} value={''}>
            Select a Branch
          </option>,
        );
        for (const i in branches) {
          temp.push(
            <option key={i} value={branches[i]}>
              {branches[i]}
            </option>,
          );
        }
        setBranchOptions(temp);
      });
  }, []);

  //update files every time the branch changes
  //also reset selected files
  useEffect(() => {
    if (currentBranch) {
      resetActiveFiles();
      getFilenamesForBranch(currentBranch.branch).then((files) => {
        setFiles(files);
        //preselect all files
        dispatch(setActiveFiles(files));
      });
    }
  }, [currentBranch]);

  //the filepicker should indicate the ownership of the files
  //it needs to consider the colors and merged authors from the universal settings
  useEffect(() => {
    setFileOwnership(ownershipDataForMergedAuthors(mergedAuthors, otherAuthors, authorColors, ownershipForFiles, files));
  }, [mergedAuthors, otherAuthors, authorColors, ownershipForFiles, files]);

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

        {/* if the chart should display the absolute ownership (stacked chart) or the relative percentage of ownership of each dev */}
        <div className="field">
          <div className="control">
            <label className="label">Mode:</label>
            <TabCombo
              value={currentMode}
              onChange={(value) => onSetMode(value)}
              options={[
                { label: 'Absolute', icon: 'bars', value: 'absolute' },
                { label: 'Relative', icon: 'percent', value: 'relative' },
              ]}
            />
          </div>
        </div>

        {currentBranch && (
          <div className="field">
            <div className="control">
              <label className="label">Choose Files and Modules to visualize:</label>
              <Filepicker
                fileList={files}
                globalActiveFiles={currentActiveFiles}
                setActiveFiles={(files) => dispatch(setActiveFiles(files))}
                fileOwnership={fileOwnership}
                authorColors={authorColors}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
