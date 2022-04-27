'use strict';
import _ from 'lodash';
import { processTeamAwarenessFileBrowser } from './index';
import { put, select } from 'redux-saga/effects';
import { getState } from '../util/util';

const filterNullValues = node => {
  const childMapToArray = n => {
    if (!n.children) {
      return n;
    }
    n.children = filterNullValues(n.children);
    if (n.children.length === 0) {
      return null;
    }
    return n;
  };

  return _.reduce(
    [...node.values()],
    (collector, current) => {
      const child = childMapToArray(current);
      if (child) {
        collector.push(child);
      }
      return collector;
    },
    []
  );
};

const checkAllChildrenSelected = node => {
  if (node.type === 'file') {
    return node.file.selected;
  }
  for (const child of node.children) {
    if (checkAllChildrenSelected(child) === false) {
      return false;
    }
  }
  return true;
};

const flattenNode = node => {
  if (node.type === 'file') {
    return Array.of(node.file);
  }

  return _.reduce(
    node.children,
    (collector, current) => {
      collector.push(...flattenNode(current));
      return collector;
    },
    []
  );
};

const buildNodeStep = (file, pathParts, pathIndex, node, filterFn, fileSelectedFn) => {
  if (pathParts.length === pathIndex + 1) {
    if (!filterFn(file)) {
      file.selected = fileSelectedFn(file);
      node.set(pathParts[pathIndex], {
        name: pathParts[pathIndex],
        type: 'file',
        path: _.join(pathParts.slice(0, pathIndex + 1), '/'),
        file
      });
    }
    return;
  }

  if (!node.has(pathParts[pathIndex])) {
    node.set(pathParts[pathIndex], {
      name: pathParts[pathIndex],
      type: 'folder',
      path: _.join(pathParts.slice(0, pathIndex + 1), '/'),
      children: new Map()
    });
  }

  buildNodeStep(file, pathParts, pathIndex + 1, node.get(pathParts[pathIndex]).children, filterFn, fileSelectedFn);
};

const fileCommitDateInRange = (from, to, commit) => {
  const date = Date.parse(commit.date);
  return from <= date && date <= to;
};

const filterFileTreeOnDate = (from, to, next) => {
  return (file, data) => {
    if (data && data.branchCommit) {
      return _.filter(data.branchCommit, c => fileCommitDateInRange(from, to, c)).length === 0;
    }
    return _.filter(file.commits.data, c => fileCommitDateInRange(from, to, c)).length === 0 ? true : next(file, data);
  };
};

const filterFileTreeOnBranch = (branch, next) => {
  return file => {
    const branchCommit = _.filter(file.commits.data, { branch });
    return branchCommit.length === 0 ? true : next(file, { branchCommit });
  };
};

function* generateFileBrowser() {
  const appState = yield select();
  yield put(processTeamAwarenessFileBrowser(constructFromAppState(appState)));
}

const constructFromAppState = appState => {
  const { config, data } = getState(appState);

  let nodeFilterFn = () => false;
  if (config.activityRestricted === true) {
    const from = Date.parse(config.activityDims[0]);
    const to = Date.parse(config.activityDims[1]);
    nodeFilterFn = filterFileTreeOnDate(from, to, nodeFilterFn);
  }

  if (config.selectedBranch && config.selectedBranch !== 'all') {
    // noinspection JSValidateTypes
    nodeFilterFn = filterFileTreeOnBranch(config.selectedBranch, nodeFilterFn);
  }
  // noinspection JSCheckFunctionSignatures
  let fileSelectedFn = file => undefined === _.find(config.fileFilter.files, { path: file.path });
  if (config.fileFilter.mode === 'INCLUDE') {
    // noinspection JSCheckFunctionSignatures
    fileSelectedFn = file => _.find(config.fileFilter.files, { path: file.path }) !== undefined;
  }

  const treeNode = new Map();
  data.data.files.forEach(file => buildNodeStep(file, file.path.split('/'), 0, treeNode, nodeFilterFn, fileSelectedFn));

  return {
    fileTree: filterNullValues(treeNode)
  };
};

export { filterFileTreeOnBranch, filterFileTreeOnDate, checkAllChildrenSelected, flattenNode, generateFileBrowser };
