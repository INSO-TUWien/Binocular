'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import _ from 'lodash';
import moment from 'moment/moment';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

function bulkGet(database, ids) {
  const idsObjects = ids.map((id) => { return {id: id} })
  return database.bulkGet({
    docs: idsObjects
  });
}

function findIssue(database, iid) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^issues/.*') }, iid: { $eq: iid } },
  });
}

function findCommit(database, sha) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') }, sha: { $eq: sha } },
  });
}

function findID(database, id) {
  return database.find({
    selector: { _id: id },
  });
}

function findFile(database, file) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^files/.*') }, path: { $eq: file } },
  });
}

function findFileCommitConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') } },
  });
}

export default class Commits {
  static getCommitData(db, commitSpan, significantSpan) {
    // return all commits, filtering according to parameters can be added in the future
    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();

    return findAll(db, 'commits').then((res) => {
      res.docs = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

      return res.docs;
    });
  }

  static getCommitDataWithFiles(db, relations, commitSpan, significantSpan) {

    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();

    return findAll(db, 'commits').then(async (res) => {

      const commits = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const allFiles = (await findAll(db, 'files')).docs;
      const result = [];

      for(let commit of commits) {
        commit.files = {};

        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.to === commit._id);

        //concurrently
        commit.files.data = relevantConnections.map((connection) => {
          const resultFile = allFiles.filter((file) => file._id === connection.from)
          if(resultFile.length > 0) {
            const file = resultFile[0];
            const res = { file: {} };
            res.file.path = file.path;
            res.stats = connection.stats;
            res.hunks = connection.hunks;
            return res
          }
        });
        result.push(commit);
      }

      return result;
    });
  }

  static getCommitsForFiles(db, relations, filenames) {

    return findAll(db, 'files').then(async (res) => {

      let files = res.docs;
      files = files.filter((f) => filenames.includes(f.path));

      const resultCommitHashes = []

      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;

      for(let file of files) {
        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.from === file._id);
        for(const connection of relevantConnections) {
          if(resultCommitHashes.includes(connection.to)) {
            continue; 
          }
          resultCommitHashes.push(connection.to);
        }
      }

      //get whole commit objects from hashes
      let resultCommits = await bulkGet(db, resultCommitHashes);
      resultCommits = resultCommits.results.map(res => res.docs[0].ok)
      return resultCommits;
    });

  }

  static getCommitDataOwnershipRiver(db, commitSpan, significantSpan, granularity, interval) {
    const statsByAuthor = {};

    const totals = {
      count: 0,
      additions: 0,
      deletions: 0,
      changes: 0,
    };

    const data = [
      {
        date: new Date(significantSpan[0]),
        totals: _.cloneDeep(totals),
        statsByAuthor: {},
      },
    ];

    let next = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();
    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();
    function group(data) {
      const lastDatum = _.last(data);

      if (_.keys(lastDatum.statsByAuthor).length < 50) {
        return data;
      }

      const meanCommitCount = _.meanBy(_.values(lastDatum.statsByAuthor), 'count');
      const threshhold = meanCommitCount;

      const applyGroupBy = (stats, predicate) => {
        const groupStats = {
          count: 0,
          additions: 0,
          deletions: 0,
          changes: 0,
        };
        const groupedCommitters = [];

        const groupedStats = _.omitBy(stats, (stats, author) => {
          if (predicate(stats, author)) {
            groupStats.count += stats.count;
            groupStats.additions += stats.additions;
            groupStats.deletions += stats.deletions;
            groupStats.changes += stats.changes;
            groupedCommitters.push(author);
            return true;
          }
        });

        groupedStats.other = groupStats;

        return {
          groupedStats,
          groupedCommitters,
        };
      };

      const { groupedCommitters } = applyGroupBy(lastDatum.statsByAuthor, (stats) => {
        return stats.count <= threshhold;
      });

      _.each(data, (datum) => {
        const { groupedStats } = applyGroupBy(datum.statsByAuthor, (stats, author) => _.includes(groupedCommitters, author));

        datum.statsByAuthor = groupedStats;
      });

      return data;
    }

    return findAll(db, 'commits').then((res) => {
      const commits = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      commits.map((commit) => {
        const dt = Date.parse(commit.date);
        let stats = statsByAuthor[commit.signature];
        if (!stats) {
          stats = statsByAuthor[commit.signature] = {
            count: 0,
            additions: 0,
            deletions: 0,
            changes: 0,
          };
        }

        totals.count++;
        totals.additions += commit.stats.additions;
        totals.deletions += commit.stats.deletions;
        totals.changes += commit.stats.additions + commit.stats.deletions;

        stats.count++;
        stats.additions += commit.stats.additions;
        stats.deletions += commit.stats.deletions;
        stats.changes += commit.stats.additions + commit.stats.deletions;

        while (dt >= next) {
          const dataPoint = {
            date: new Date(next),
            totals: _.cloneDeep(totals),
            statsByAuthor: _.cloneDeep(statsByAuthor),
          };

          data.push(dataPoint);
          next += interval;
        }
      });
      data.push({
        date: new Date(significantSpan[1]),
        totals: _.cloneDeep(totals),
        statsByAuthor: _.cloneDeep(statsByAuthor),
      });
      //console.log(significantSpan[1].toString());

      return group(data);
    });
  }

  static getRelatedCommitDataOwnershipRiver(db, issue) {
    if (issue !== null) {
      return findIssue(db, issue.iid).then(async (resIssue) => {
        const foundIssue = resIssue.docs[0];
        foundIssue.commits = { count: 0, data: [] };
        for (const mention of foundIssue.mentions) {
          if (mention.commit !== null) {
            const commit = (await findCommit(db, mention.commit)).docs[0];
            foundIssue.commits.count++;
            foundIssue.commits.data.push(commit);
          }
        }
        return foundIssue;
      });
    } else {
      return {};
    }
  }

  static getCommitDateHistogram(db, granularity, dateField, since, until) {
    function mapCommitToHistogram(histogram, commit, granularity) {
      const commitDate = new Date(commit.date);
      return histogram.map((commit) => {
        switch (granularity) {
          case 'month':
            if (commit.category === commitDate.getMonth() + 1) {
              commit.count++;
            }
            break;
          case 'dayOfMonth':
            if (commit.category === commitDate.getDate()) {
              commit.count++;
            }
            break;
          case 'dayOfWeek':
            if (commit.category === commitDate.getDay()) {
              commit.count++;
            }
            break;
          case 'hour':
            if (commit.category === (12 + commitDate.getHours() - 2) % 12) {
              commit.count++;
            }
            break;
        }
        return commit;
      });
    }

    function addCommitsToCollection(histogram, goodCommitsHistogram, badCommitsHistogram, commits, builds, granularity) {
      for (const commit of commits) {
        const commitBuild = builds.find((b) => b.sha === commit.sha);
        histogram = mapCommitToHistogram(histogram, commit, granularity);
        if (commitBuild !== undefined && commitBuild.status === 'success') {
          goodCommitsHistogram = mapCommitToHistogram(goodCommitsHistogram, commit, granularity);
        } else {
          badCommitsHistogram = mapCommitToHistogram(badCommitsHistogram, commit, granularity);
        }
      }
    }

    function addIssuesToCollection(collection, issues, granularity) {
      for (const issue of issues) {
        const issueDate = new Date(issue.createdAt);
        collection = collection.map((issue) => {
          switch (granularity) {
            case 'month':
              if (issue.category === issueDate.getMonth() + 1) {
                issue.count++;
              }
              break;
            case 'dayOfMonth':
              if (issue.category === issueDate.getDate()) {
                issue.count++;
              }
              break;
            case 'dayOfWeek':
              if (issue.category === issueDate.getDay()) {
                issue.count++;
              }
              break;
            case 'hour':
              if (issue.category === (12 + issueDate.getHours() - 2) % 12) {
                issue.count++;
              }
              break;
          }
          return issue;
        });
      }
    }

    return findAll(db, 'commits').then((resCommits) => {
      return findAll(db, 'issues').then((resIssues) => {
        return findAll(db, 'builds').then((resBuilds) => {
          const commitDateHistogram = [];
          const goodCommits = [];
          const badCommits = [];
          const issueDateHistogram = [];
          const commits = resCommits.docs
            .filter((c) => new Date(c.date) >= since && new Date(c.date) <= until)
            .sort((a, b) => {
              return new Date(a.date) - new Date(b.date);
            });
          const issues = resIssues.docs
            .filter((i) => new Date(i.createdAt) >= since && new Date(i.createdAt) <= until)
            .sort((a, b) => {
              return new Date(a.createdAt) - new Date(b.createdAt);
            });
          const builds = resBuilds.docs.sort((a, b) => {
            return new Date(a.createdAt) - new Date(b.createdAt);
          });

          //console.log(commits);
          //console.log(dateField); //createdAt || closedAt
          switch (granularity) {
            case 'month':
              for (let i = 1; i <= 12; i++) {
                commitDateHistogram.push({ count: 0, category: i });
                goodCommits.push({ count: 0, category: i });
                badCommits.push({ count: 0, category: i });
                issueDateHistogram.push({ count: 0, category: i });
              }
              addCommitsToCollection(commitDateHistogram, goodCommits, badCommits, commits, builds, 'month');
              addIssuesToCollection(issueDateHistogram, issues, 'month');
              break;
            case 'dayOfMonth':
              for (let i = 1; i <= 31; i++) {
                commitDateHistogram.push({ count: 0, category: i });
                goodCommits.push({ count: 0, category: i });
                badCommits.push({ count: 0, category: i });
                issueDateHistogram.push({ count: 0, category: i });
              }
              addCommitsToCollection(commitDateHistogram, goodCommits, badCommits, commits, builds, 'dayOfMonth');
              addIssuesToCollection(issueDateHistogram, issues, 'dayOfMonth');
              break;
            case 'dayOfWeek':
              for (let i = 0; i < 7; i++) {
                commitDateHistogram.push({ count: 0, category: i });
                goodCommits.push({ count: 0, category: i });
                badCommits.push({ count: 0, category: i });
                issueDateHistogram.push({ count: 0, category: i });
              }
              addCommitsToCollection(commitDateHistogram, goodCommits, badCommits, commits, builds, 'dayOfWeek');
              addIssuesToCollection(issueDateHistogram, issues, 'dayOfWeek');
              break;
            case 'hour':
              for (let i = 0; i < 12; i++) {
                commitDateHistogram.push({ count: 0, category: i });
                goodCommits.push({ count: 0, category: i });
                badCommits.push({ count: 0, category: i });
                issueDateHistogram.push({ count: 0, category: i });
              }
              addCommitsToCollection(commitDateHistogram, goodCommits, badCommits, commits, builds, 'hour');
              addIssuesToCollection(issueDateHistogram, issues, 'hour');
              break;
            default:
              break;
          }
          //console.log('Histogram');
          //console.log(commitDateHistogram);
          return {
            commitDateHistogram: commitDateHistogram,
            goodCommits: goodCommits,
            badCommits: badCommits,
            issueDateHistogram: issueDateHistogram,
          };
        });
      });
    });
  }

  static getCodeHotspotsChangeData(db, relations, file) {
    return findFile(db, file).then(async (resFile) => {
      const file = resFile.docs[0];

      const fileCommitConnections = (await findFileCommitConnections(relations)).docs.filter((fCC) => fCC.from === file._id);
      const commits = [];
      for (const fileCommitConnection of fileCommitConnections) {
        const resCommit = await findID(db, fileCommitConnection.to);
        if (resCommit.docs.length > 0) {
          const commit = resCommit.docs[0];
          commit.file = { file: {} };
          commit.file.file.path = file.path;
          commit.file.lineCount = fileCommitConnection.lineCount;
          commit.file.hunks = fileCommitConnection.hunks;
          commits.push(commit);
        }
      }
      return { file: { commits: { data: commits } } };
    });
  }
}
