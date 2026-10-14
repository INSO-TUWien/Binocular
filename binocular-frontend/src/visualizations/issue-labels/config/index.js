'use strict';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles.module.scss';
import { setCurrentBranch, setSelectedLabels } from '../sagas/index';
import { getBranches, getIssues } from '../sagas/helper';

export default () => {
  const issueLabelsState = useSelector((state) => state.visualizations.issueLabels.state);
  const currentBranch = issueLabelsState.config.currentBranch;
  const selectedLabels = issueLabelsState.config.selectedLabels || [];
  const labelStats = issueLabelsState.data.data?.labelStats || {};

  const [allBranches, setAllBranches] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);

  const dispatch = useDispatch();

  const onSetBranch = (branchName) => {
    const branchObject = allBranches.find((b) => b.branch === branchName);
    if (branchObject) {
      dispatch(setCurrentBranch(branchObject));
    }
  };

  useEffect(() => {
    if (currentBranch) {
      setIsLoadingLabels(true);
      getIssues()
        .then((issues) => {
          const labels = new Set();
          issues.forEach((issue) => {
            if (issue.labels && Array.isArray(issue.labels)) {
              issue.labels.forEach((label) => labels.add(label));
            }
          });
          return Array.from(labels).sort();
        })
        .then((labels) => {
          setAvailableLabels(labels);
          setIsLoadingLabels(false);
        })
        .catch((error) => {
          setIsLoadingLabels(false);
        });
    }
  }, [currentBranch]);

  useEffect(() => {
    getBranches()
      .then((branches) => {
        return branches.sort((a, b) => a.branch.localeCompare(b.branch));
      })
      .then((branches) => {
        setAllBranches(branches);
        // Select the currently active branch
        if (!currentBranch) {
          const activeBranch = branches.find((b) => b.active === 'true') || branches[0];
          if (activeBranch) {
            dispatch(setCurrentBranch(activeBranch));
          }
        }
        return branches.map((b) => b.branch);
      })
      .then((branches) => [...new Set(branches)])
      .then((branches) => {
        const options = [
          <option key={-1} value={''}>
            Select a Branch
          </option>,
        ];
        branches.forEach((branch, index) => {
          options.push(
            <option key={index} value={branch}>
              {branch}
            </option>,
          );
        });
        setBranchOptions(options);
      })
      .catch((error) => {
        console.error('Error in initialization effect:', error);
      });
  }, []);

  return (
    <div className={styles.configContainer}>
      <form>
        {/* Branch selection */}
        <div className="field">
          <div className="control">
            <label className="label">Branch:</label>
            <div className="select">
              <select value={currentBranch?.branch || ''} onChange={(e) => onSetBranch(e.target.value)}>
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

        {/* Label selection */}
        {currentBranch && (
          <div className="field">
            <div className="control">
              <label className="label">Select Labels to Visualize:</label>
              {isLoadingLabels ? (
                <div className="has-text-centered">
                  <span className="icon">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                  <span>Loading labels...</span>
                </div>
              ) : availableLabels.length > 0 ? (
                <div className={styles.labelGrid}>
                  {availableLabels.map((label) => (
                    <div
                      key={label}
                      className={`${styles.labelItem} ${selectedLabels.includes(label) ? styles.selected : ''}`}
                      onClick={() => {
                        const newSelection = selectedLabels.includes(label)
                          ? selectedLabels.filter((l) => l !== label)
                          : [...selectedLabels, label];
                        dispatch(setSelectedLabels(newSelection));
                      }}>
                      <span className={styles.labelName}>{label}</span>
                      {labelStats[label] && <span className={styles.labelStats}>({labelStats[label].timelineChanges.length} changes)</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="has-text-centered">No labels found in issues</p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
