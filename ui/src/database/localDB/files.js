'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

export function findCommitCommitConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-commits/.*') } },
  });
}

export function findCommitStakeholderConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-stakeholders/.*') } },
  });
}

export const addHistoryToAllCommits = (allCommits) => {
  //stores the histories of all commits
  const historycache = {};

  //sort so oldest commit is first
  const commits = allCommits.sort((a, b) => new Date(a.date) - new Date(b.date));
  const commitsShas = commits.map((c) => c.sha);
  const positions = {};
  for (let i = 0; i < commitsShas.length; i++) {
    positions[commitsShas[i]] = i;
  }

  //for all commits that do not have parents, add them to the cache
  //necessary for gitlab projects that can have multiple initial commits
  const initialCommits = allCommits.filter((c) => c.parents.length === 0);

  let children = [];
  let frontier = [];

  for (const genesis of initialCommits) {
    historycache[genesis.sha] = [genesis.sha];
    //find all children of genesis
    children = children.concat(allCommits.filter((child) => child.parents.includes(genesis.sha)));
  }

  for (const child of children) {
    frontier.push(child);
  }
  frontier = _.uniqBy(frontier, (c) => c.sha);

  const helper = (commit) => {
    let history = [commit.sha];
    for (const p of commit.parents) {
      if (!historycache[p]) {
        frontier.push(commit);
        return;
      }
      history = history.concat(historycache[p]);
    }
    history = _.uniq(history).sort((a, b) => positions[b] - positions[a]);
    historycache[commit.sha] = history;
    commit.history = history.join();

    //find all children of commit
    const children = allCommits.filter((child) => child.parents.includes(commit.sha));
    for (const child of children) {
      if (!historycache[child.sha]) {
        frontier.unshift(child);
      }
    }
  };

  while (frontier.length !== 0) {
    helper(frontier.shift());
  }
};

export async function findAllCommits(database, relations) {
  const commits = await database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') } },
  });
  const commitStakeholderConnections = (await findCommitStakeholderConnections(relations)).docs;
  const commitCommitConnections = (await findCommitCommitConnections(relations)).docs;

  commits.docs = await Promise.all(
    commits.docs.map((c) => preprocessCommit(c, database, commitStakeholderConnections, commitCommitConnections)),
  );
  addHistoryToAllCommits(commits.docs);

  return commits;
}

function findFileCommitConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') } },
  });
}

export default class Files {
  static requestFileStructure(db) {
    return findAll(db, 'files').then((res) => {
      return { files: { data: res.docs } };
    });
  }

  static getFileDataFileEvolutionDendrogram(db, relations) {
    //const first = new Date(significantSpan[0]).getTime();
    //const last = new Date(significantSpan[1]).getTime();

    return findAllCommits(db, relations).then(async (res) => {
      const commits = res.docs;/*
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });*/
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const allFiles = (await findAll(db, 'files')).docs;
      const result = [];

      for (const commit of commits) {
        commit.files = {};

        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.to === commit._id);

        //concurrently
        commit.files.data = relevantConnections.map((connection) => {
          const resultFile = allFiles.filter((file) => file._id === connection.from);
          if (resultFile.length > 0) {
            const file = resultFile[0];
            const res = { file: {} };
            res.file.path = file.path;
            res.file.webUrl = file.webUrl;
            res.stats = connection.stats;
            res.signature = commit.signature;
            return res;
          }
        });
        result.push(commit);
      }

      return _.each(result, (resp) => resp.files.data.map((file) => {
        const statsByAuthor = {};
        const totalStats = {
          count: 0,
          additions: 0,
          deletions: 0,
        };
  
        _.each(file.commits.data, function (commit) {
          let stats = statsByAuthor[commit.signature];
          if (!stats) {
            stats = statsByAuthor[commit.signature] = {
              count: 0,
              additions: 0,
              deletions: 0,
              author: commit.signature,
            };
          }
  
          stats.count = stats.count + 1;
          stats.additions = stats.additions + commit.stats.additions;
          stats.deletions = stats.deletions + commit.stats.deletions;
  
          totalStats.count = totalStats.count + 1;
          totalStats.additions = totalStats.additions + commit.stats.additions;
          totalStats.deletions = totalStats.deletions + commit.stats.deletions;
        });
  
        const authorMostLinesChanged = _.maxBy(_.values(statsByAuthor), (author) => author.additions + author.deletions);
        const authorMostCommits = _.maxBy(_.values(statsByAuthor), "count");
  
  
        const returnFile = {
          path: file.path,
          webUrl: file.webUrl,
          totalStats: totalStats,
          authorMostLinesChanged: authorMostLinesChanged.author,
          authorMostCommits: authorMostCommits.author,
        };
  
        return returnFile;
      }));
    });
  }
}
