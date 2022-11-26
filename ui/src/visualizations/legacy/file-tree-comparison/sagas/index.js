'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import { createAction } from 'redux-actions';
import Database from '../../../../database/database';
import { graphQl } from '../../../../utils';

export const requestCommitsAndFileTree = createAction('REQUEST_COMMITS_AND_FILE_TREE');
export const receiveCommitsAndFileTree = timestampedActionFactory('RECEIVE_COMMITS_AND_FILE_TREE');
export const receiveCommitsAndFileTreeError = createAction('RECEIVE_COMMITS_AND_FILE_TREE_ERROR');

export default function* () {
  // fetch data once on entry
  yield* fetchFileTreeEvolutionData();
}

export const fetchFileTreeEvolutionData = fetchFactory(
  function* () {

    const { firstCommit, lastCommit } = yield Database.getBounds(); //getting first and last commit date
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const commits = yield Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp]); //COMMITS

    const fileTree = yield Database.requestFileStructure();
    const hierarchicalFileTree = makeHierarchyFileTree(fileTree); //FILETREE



    //console.log(yield Database.searchCommits('Bug')); //search commits

    return { commits, hierarchicalFileTree };

    return yield graphQl //TODO replace with my query, get changes by certain commit
      .query(
        `{  
        commits(sort: "ASC") {
          data {
            date
            message
            files {
              data {
                stats {
                  additions
                  deletions
                }
                file {
                  path,
                }
                lineCount
              }
            }
          }
        }
      }`
      )
      .then((resp) => {
        const commitsWithFileTree = [];

        for (const commit of resp.commits.data) {
          //const fileTree = makeHierarchyFileTreee(commit);
          //const commitWithFileTree = [commit, fileTree];
          //commitsWithFileTree.push(commitWithFileTree);
          //fileTree = applyCommit(fileTree, commit);
          //fileTreeHistory.push(fileTree);
        }
        return {
          commitsWithFileTree,

          //fileTreeHistory,
          //commits: resp.commits.data
        };
      });
  },
  requestCommitsAndFileTree, //LOGGER
  receiveCommitsAndFileTree,
  receiveCommitsAndFileTreeError
);

function makeHierarchyFileTree(fileTree) {
  const result = [];
  const level = { result };

  fileTree.files.data.forEach((entry) => {
    entry.path.split('/').reduce((r, name) => {
      if (!r[name]) {
        r[name] = { result: [] };
        r.result.push({ name, children: r[name].result });
      }

      return r[name];
    }, level);
  });

  return result;
}
