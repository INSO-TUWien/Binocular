'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import {
  expandCollapsedNode,
  getCherryPickCheck,
  getCommitDependencies,
  getDiff,
  getMergeCheck,
  getRebaseCheck,
  resetStateProperty,
  setBranchesHeadShas,
  setCollapsedSections,
  setCompactAll,
  setExpandAll,
  setIsLoading,
  setNodeToCompactSection,
  updateConflictAwarenessData,
} from '../sagas';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    isLoading: caState.data.data.isLoading,
    commits: caState.data.data.commits, // the commits of the base project and the parent/fork (if one was selected)
    branches: caState.data.data.branches, // the branches of the base project and the parent/fork (if one was selected)
    branchesBaseProject: caState.data.data.branchesBaseProject, // the branch names of the base project, and a flag if they are checked in the config
    branchesOtherProject: caState.data.data.branchesOtherProject, // the branch names of the parent/fork (if one was selected), and a flag if they are checked in the config
    excludedBranchesBaseProject: caState.config.excludedBranchesBaseProject, // the branches of the base project which should be excluded from the graph
    excludedBranchesOtherProject: caState.config.excludedBranchesOtherProject, // the branches of the other project which should be excluded from the graph
    diff: caState.data.data.diff, // the diffs of a commit
    issues: caState.data.data.issues, // the issues of the base project for the filter list
    rebaseCheck: caState.data.data.rebaseCheck, // the result of the rebase check
    mergeCheck: caState.data.data.mergeCheck, // the result of the merge check
    cherryPickCheck: caState.data.data.cherryPickCheck, // the result of the cherry pick check
    commitDependencies: caState.data.data.commitDependencies, // the shas of the commits the previously clicked commit node depends on (not recursive)
    colorBaseProject: caState.config.color.baseProject, // the color for the commits/edges of the base project
    colorOtherProject: caState.config.color.otherProject, // the color for the commits/edges of the parent/fork
    colorCombined: caState.config.color.combined, // the color of the commits/edges found in both projects
    otherProject: caState.config.otherProject, // the selected parent/fork
    issueForFilter: caState.config.issueForFilter, // the issueID whose commits should be highlighted
    repoFullName: `${state.config.data.repoOwner}/${state.config.data.repoName}`, // the name of the base repo (owner/repository name)
    filterAfterDate: caState.config.filterAfterDate, // the filter for all the commits after a specific date
    filterBeforeDate: caState.config.filterBeforeDate, // the filter for all commits before a specific date
    filterAuthor: caState.config.filterAuthor, // the filter for commits of a specific author
    filterCommitter: caState.config.filterCommitter, // the filter for commits of a specific committer
    filterSubtree: caState.config.filterSubtree, // the filter for commits of a specific subtree
    compactAll: caState.data.data.compactAll, // a flag indicating if the graph should be completely compacted
    expandAll: caState.data.data.expandAll, // a flag indicating if the graph should be completely expanded
    collapsedSections: caState.data.data.collapsedSections, // the current showing collapsed sections
    nodeToExpand: caState.data.data.nodeToExpand, // the parentSha and the childSha of the compacted view which should be expanded
    nodeToCompactSection: caState.data.data.nodeToCompactSection, // the sha of the commit which section should be compacted
    branchesHeadShas: caState.data.data.branchesHeadShas, // information about the branches heads
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onResetStateProperty: (stateProperty) => dispatch(resetStateProperty(stateProperty)),
    onGetDiff: (commitSha) => dispatch(getDiff(commitSha)),
    onUpdateConflictAwarenessData: (repoFullName) =>
      dispatch(updateConflictAwarenessData([repoFullName], true)),
    onCheckRebase: (headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch) =>
      dispatch(getRebaseCheck(headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch)),
    onCheckMerge: (fromRepo, fromBranch, toRepo, toBranch) =>
      dispatch(getMergeCheck(fromRepo, fromBranch, toRepo, toBranch)),
    onCheckCherryPick: (cherryPickCommitInfos, otherRepo, toRepo, toBranch) =>
      dispatch(getCherryPickCheck(cherryPickCommitInfos, otherRepo, toRepo, toBranch)),
    onGetCommitDependencies: (sha) => dispatch(getCommitDependencies(sha)),
    onSetIsLoading: (isLoading) => dispatch(setIsLoading(isLoading)),
    onSetNodeToCompactSection: (nodeToCompactSection) =>
      dispatch(setNodeToCompactSection(nodeToCompactSection)),
    onExpandCollapsedNode: (nodeToExpand) => dispatch(expandCollapsedNode(nodeToExpand)),
    onSetExpandAll: (shouldExpandAll) => dispatch(setExpandAll(shouldExpandAll)),
    onSetCompactAll: (shouldCompactAll) => dispatch(setCompactAll(shouldCompactAll)),
    onSetCollapsedSections: (collapsedSections) =>
      dispatch(setCollapsedSections(collapsedSections)),
    onSetBranchesHeadSha: (branchesHeadShas) => dispatch(setBranchesHeadShas(branchesHeadShas)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
