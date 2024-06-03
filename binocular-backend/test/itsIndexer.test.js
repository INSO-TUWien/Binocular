'use strict';

import { expect } from 'chai';
import fake from './helper/git/repositoryFake.js';
import ReporterMock from './helper/reporter/reporterMock';
import conf from '../utils/config.js';

import Db from '../core/db/db';

import ctx from '../utils/context';

import GitLabBaseIndexerMock from './helper/gitlab/gitLabBaseIndexerMock';

import GitLabITSIndexer from './helper/gitlab/gitLabITSIndexerRewire.js';

import BaseGitLabIndexer from '../indexers/BaseGitLabIndexer.js';

import GitHubMock from './helper/github/gitHubMock';
import GitHubITSIndexer from '../indexers/its/GitHubITSIndexer';

import Issue from '../models/models/Issue';
import MergeRequest from '../models/models/MergeRequest';
import User from '../models/models/User';
import IssueUserConnection from '../models/connections/IssueUserConnection';
import sinon from 'sinon';
import path from 'path';
import Milestone from '../models/models/Milestone';
import IssueMilestoneConnection from '../models/connections/IssueMilestoneConnection';
import MergeRequestMilestoneConnection from '../models/connections/MergeRequestMilestoneConnection';
import Account from '../models/models/Account';
import IssueAccountConnection from '../models/connections/IssueAccountConnection';
import MergeRequestAccountConnection from '../models/connections/MergeRequestAccountConnection';
import IssueNoteConnection from '../models/connections/IssueNoteConnection';
import MergeRequestNoteConnection from '../models/connections/MergeRequestNoteConnection';
import Note from '../models/models/Note';
import NoteAccountConnection from '../models/connections/NoteAccountConnection';

const indexerOptions = {
  backend: true,
  frontend: false,
  open: false,
  clean: true,
  its: true,
  ci: true,
  export: true,
  server: false,
};
const targetPath = path.resolve('.');
ctx.setOptions(indexerOptions);
ctx.setTargetPath(targetPath);
conf.loadConfig(ctx);
const config = conf.get();

describe('its', function () {
  const db = new Db(config.arango);
  const reporter = new ReporterMock(['issues', 'mergeRequests', 'milestones']);

  config.token = '1234567890';
  beforeEach(() => {
    sinon.mock(BaseGitLabIndexer, GitLabBaseIndexerMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  // remaps the git functions that would fetch infos from remote repos to the ones that only check the local git information.
  const remapRemoteFunctions = (repo) => {
    repo.listAllCommitsRemote = repo.listAllCommits;
    repo.getAllBranchesRemote = repo.getAllBranches;
    repo.getLatestCommitForBranchRemote = repo.getLatestCommitForBranch;
    repo.getFilePathsForBranchRemote = repo.getFilePathsForBranch;
  };

  const relevantCollections = [
    Issue,
    MergeRequest,
    User,
    IssueUserConnection,
    Milestone,
    IssueMilestoneConnection,
    MergeRequestMilestoneConnection,
    Account,
    IssueAccountConnection,
    MergeRequestAccountConnection,
    IssueNoteConnection,
    MergeRequestNoteConnection,
    Note,
    NoteAccountConnection,
  ];

  // helper functions
  const getAllInCollection = async (collection) => {
    return (await db.query('FOR i IN @@collection RETURN i', { '@collection': collection })).all();
  };

  const getAllCollections = async () => {
    const res = {};
    await Promise.all(
      relevantCollections.map(async (c) => {
        res[c.collection.name] = await getAllInCollection(c.collection.name);
      }),
    );
    return res;
  };

  const findInCollection = (example, collectionArray) => {
    let res = collectionArray;
    Object.entries(example).forEach(([key, value]) => {
      res = res.filter((conn) => conn[key] && conn[key] === value);
    });
    return res;
  };

  // checks if there are a certain number of entries in the collectionArray that fit the specified example.
  // returns the found examples
  const expectExamples = (example, collectionArray, number) => {
    const res = findInCollection(example, collectionArray);
    expect(res.length).to.equal(number);
    return res;
  };

  // checks if the specified collection and all connections from/to this collection are empty
  const expectEmptyCollectionAndConnections = (collections, collectionName) => {
    const relevantCollectionNames = relevantCollections.map((c) => c.collection.name).filter((cn) => cn.includes(collectionName));
    for (const name of relevantCollectionNames) {
      expect(collections[name].length).to.equal(0);
    }
  };

  const setupDb = async (db, collections) => {
    await db.ensureDatabase('test', ctx);
    await db.truncate();
    await Promise.all(
      collections.map(async (c) => {
        await c.ensureCollection();
      }),
    );
  };

  describe('#indexGitLab', function () {
    // GITLAB HELPER FUNCTIONS

    // basic setup for gitlab. Returns the gitlab indexer.
    // Sets up the default gitlab mock implementation.
    const gitlabSetup = async () => {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      //Remap Remote functions to local ones because remote repository doesn't exist anymore.
      remapRemoteFunctions(repo);
      repo.getOriginUrl = async function () {
        return 'git@gitlab.com:Test/Test-Project.git';
      };

      // init all relevant collections for ITS indexing
      await setupDb(db, relevantCollections);

      const gitLabITSIndexer = new GitLabITSIndexer(repo, reporter);
      gitLabITSIndexer.configure(config);

      return gitLabITSIndexer;
    };

    // the gitlab mock implementation returns some standard test data.
    // But for some tests, we need the mock api to return something else.
    const remapGitlabApiCall = (indexer, functionName, newData) => {
      if (indexer.gitlab === null || indexer.gitlab === undefined) {
        throw Error('Test Error: indexer.gitlab does not exist, function "' + functionName + '" cannot be remapped');
      }
      const fun = indexer.gitlab[functionName];
      if (fun === null || fun === undefined) {
        throw Error('Test Error: function "' + functionName + '" does not exist, cannot be remapped');
      }
      indexer.gitlab[functionName] = () => {
        return indexer.gitlab.testPaginator(newData);
      };
    };

    // some helper functions that check if the expected data has been indexed when the default gitlab mock implementation is used.
    const expectDefaultIssues = (collections, checkAccounts = true, checkMilestones = true, checkNotes = true) => {
      // issues
      expect(collections['issues'].length).to.equal(3);

      // issues-accounts
      if (checkAccounts) {
        const accId = collections['accounts'][0]._id;
        for (const issue of collections['issues']) {
          // we expect the only account there is to have roles author, assignee and assignees
          expectExamples({ _from: issue._id, _to: accId, role: 'author' }, collections['issues-accounts'], 1);
          expectExamples({ _from: issue._id, _to: accId, role: 'assignee' }, collections['issues-accounts'], 1);
          expectExamples({ _from: issue._id, _to: accId, role: 'assignees' }, collections['issues-accounts'], 1);
        }
      }

      // issues-milestones
      if (checkMilestones) {
        const milestoneId = collections['milestones'][0]._id;
        for (const issue of collections['issues']) {
          // every issue is connected to the only milestone there is
          expectExamples({ _from: issue._id, _to: milestoneId }, collections['issues-milestones'], 1);
        }
      }

      // issues-notes
      if (checkNotes) {
        for (const issue of collections['issues']) {
          expect(issue.mentions.length).to.equal(2);
          expect(issue.mentions[0].closes).to.equal(true);
          expect(issue.mentions[1].commit).to.equal('1234567890');
          expectExamples({ _from: issue._id }, collections['issues-notes'], 3);
          const issueNoteConnections = expectExamples({ _from: issue._id }, collections['issues-notes'], 3);
          for (const conn of issueNoteConnections) {
            // for each note connected to this issue, we expect to have one connection to an account
            expectExamples({ _from: conn._to }, collections['notes-accounts'], 1);
          }
        }
      }
    };
    const expectDefaultMergeRequests = (collections, checkAccounts = true, checkMilestones = true, checkNotes = true) => {
      // mergeRequests
      expect(collections['mergeRequests'].length).to.equal(3);

      // mergeRequests-accounts
      if (checkAccounts) {
        const accId = collections['accounts'][0]._id;
        for (const mr of collections['mergeRequests']) {
          // we expect the only account there is to have roles author, assignee and assignees
          expectExamples({ _from: mr._id, _to: accId, role: 'author' }, collections['mergeRequests-accounts'], 1);
          expectExamples({ _from: mr._id, _to: accId, role: 'assignee' }, collections['mergeRequests-accounts'], 1);
          expectExamples({ _from: mr._id, _to: accId, role: 'assignees' }, collections['mergeRequests-accounts'], 1);
        }
      }

      // mergeRequests-milestones
      if (checkMilestones) {
        const milestoneId = collections['milestones'][0]._id;
        for (const mr of collections['mergeRequests']) {
          // every issue is connected to the only milestone there is
          expectExamples({ _from: mr._id, _to: milestoneId }, collections['mergeRequests-milestones'], 1);
        }
      }

      // mergeRequests-notes
      if (checkNotes) {
        for (const mr of collections['mergeRequests']) {
          expectExamples({ _from: mr._id }, collections['mergeRequests-notes'], 3);
          const mrNoteConnections = expectExamples({ _from: mr._id }, collections['mergeRequests-notes'], 3);
          for (const conn of mrNoteConnections) {
            // for each note connected to this mr, we expect to have one connection to an account
            expectExamples({ _from: conn._to }, collections['notes-accounts'], 1);
          }
        }
      }
    };
    const expectDefaultNotes = (collections) => {
      let noteCounter = 0;
      for (const issue of collections['issues']) {
        const issueNoteConnections = expectExamples({ _from: issue._id }, collections['issues-notes'], 3);
        noteCounter += issueNoteConnections.length;
      }
      // mergeRequests-notes
      for (const mr of collections['mergeRequests']) {
        const mrNoteConnections = expectExamples({ _from: mr._id }, collections['mergeRequests-notes'], 3);
        noteCounter += mrNoteConnections.length;
      }
      // we don't want notes that are not connected to any issue/mr
      expect(collections['notes'].length).to.equal(noteCounter);
    };
    const expectDefaultAccounts = (collections) => {
      expect(collections['accounts'].length).to.equal(1);
    };
    const expectDefaultMilestones = (collections) => {
      expect(collections['milestones'].length).to.equal(1);
    };

    // TESTS

    it('should index all GitLab issues and create all necessary db collections and connections', async function () {
      const gitLabITSIndexer = await gitlabSetup();

      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // check if the data was indexed as expected
      expectDefaultIssues(collections);
      expectDefaultMergeRequests(collections);
      expectDefaultMilestones(collections);
      expectDefaultAccounts(collections);
      expectDefaultNotes(collections);
    });

    it('should not persist objects twice if indexer is called twice (GitLab)', async function () {
      const gitLabITSIndexer = await gitlabSetup();

      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();
      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // run indexer a second time. Second run should not add additional data to the database
      await gitLabITSIndexer.index();
      // get all entries from all relevant collections
      const updatedCollections = await getAllCollections();

      Object.entries(collections).map(([collectionName, collectionArray]) => {
        // check if updated collection has the same size
        expect(collectionArray.length).to.equal(updatedCollections[collectionName].length);
      });
    });

    it('can handle empty milestones collection', async function () {
      const gitLabITSIndexer = await gitlabSetup();
      remapGitlabApiCall(gitLabITSIndexer, 'getMileStones', []);
      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // milestones (and all its connections) should be empty, the other collections should be unaffected
      expectEmptyCollectionAndConnections(collections, 'milestones');
      expectDefaultIssues(collections, true, false, true);
      expectDefaultMergeRequests(collections, true, false, true);
      expectDefaultAccounts(collections);
      expectDefaultNotes(collections);
    });

    it('can handle empty issues collection', async function () {
      const gitLabITSIndexer = await gitlabSetup();
      remapGitlabApiCall(gitLabITSIndexer, 'getIssues', []);
      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // issues (and all its connections) should be empty, the other collections should be unaffected
      expectEmptyCollectionAndConnections(collections, 'issues');
      expectDefaultMergeRequests(collections);
      expectDefaultMilestones(collections);
      expectDefaultAccounts(collections);
      expectDefaultNotes(collections);
    });

    it('can handle empty mergeRequests collection', async function () {
      const gitLabITSIndexer = await gitlabSetup();
      remapGitlabApiCall(gitLabITSIndexer, 'getMergeRequests', []);
      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // mergeRequests (and all its connections) should be empty, the other collections should be unaffected
      expectEmptyCollectionAndConnections(collections, 'mergeRequests');
      expectDefaultIssues(collections);
      expectDefaultMilestones(collections);
      expectDefaultAccounts(collections);
      expectDefaultNotes(collections);
    });

    it('can handle empty notes collection', async function () {
      const gitLabITSIndexer = await gitlabSetup();
      remapGitlabApiCall(gitLabITSIndexer, 'getNotes', []);
      remapGitlabApiCall(gitLabITSIndexer, 'getMergeRequestNotes', []);
      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // notes (and all its connections) should be empty, the other collections should be unaffected
      expectEmptyCollectionAndConnections(collections, 'notes');
      expectDefaultIssues(collections, true, true, false);
      expectDefaultMergeRequests(collections, true, true, false);
      expectDefaultMilestones(collections);
      expectDefaultAccounts(collections);
    });
  });

  describe('#indexGitHub', function () {
    // GITHUB HELPER FUNCTIONS

    // basic setup for github. Returns the github indexer.
    // Sets up the default github mock implementation.
    const githubSetup = async () => {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      //Remap Remote functions to local ones because remote repository doesn't exist anymore.
      remapRemoteFunctions(repo);
      repo.getOriginUrl = async function () {
        return 'git@github.com/Test/Test-Project.git';
      };

      // init all relevant collections for ITS indexing
      await setupDb(db, relevantCollections);

      const gitHubITSIndexer = new GitHubITSIndexer(repo, reporter);
      gitHubITSIndexer.controller = new GitHubMock();
      return gitHubITSIndexer;
    };

    // the github mock implementation returns some standard test data.
    // But for some tests, we need the mock api to return something else.
    const remapGitHubApiCall = (indexer, functionName, newData) => {
      if (indexer.controller === null || indexer.controller === undefined) {
        throw Error('Test Error: indexer.controller does not exist, function "' + functionName + '" cannot be remapped');
      }
      const fun = indexer.controller[functionName];
      if (fun === null || fun === undefined) {
        throw Error('Test Error: function "' + functionName + '" does not exist, cannot be remapped');
      }
      indexer.controller[functionName] = () => {
        return new Promise((resolve) => {
          resolve(newData);
        });
      };
    };

    // some helper functions that check if the expected data has been indexed when the default github mock implementation is used.
    const expectDefaultIssues = (collections, coll = 'issues') => {
      const dbIssuesCollectionData = collections[coll].sort((a, b) => a.id.localeCompare(b.id));
      expect(dbIssuesCollectionData.length).to.equal(2);

      const issue0 = collections[coll][0];
      const issue1 = collections[coll][1];

      const t1Id = collections['accounts'].filter((a) => a.login === 'tester1')[0]._id;
      const t2Id = collections['accounts'].filter((a) => a.login === 'tester2')[0]._id;

      expectExamples({ _from: issue0._id, _to: t1Id, role: 'author' }, collections[`${coll}-accounts`], 1);
      expectExamples({ _from: issue0._id, _to: t2Id, role: 'assignee' }, collections[`${coll}-accounts`], 1);
      expectExamples({ _from: issue0._id, _to: t2Id, role: 'assignees' }, collections[`${coll}-accounts`], 1);
      expectExamples({ _from: issue1._id, _to: t2Id, role: 'author' }, collections[`${coll}-accounts`], 1);

      expectExamples({ _from: issue1._id, _to: t1Id, role: 'assignee' }, collections[`${coll}-accounts`], 1);
      expectExamples({ _from: issue1._id, _to: t1Id, role: 'assignees' }, collections[`${coll}-accounts`], 1);
      expectExamples({ _from: issue1._id, _to: t2Id, role: 'assignees' }, collections[`${coll}-accounts`], 1);

      // mentions attribute only relevant for issues, not merge requests
      if (coll === 'issues') {
        expect(issue0.mentions.length).to.equal(2);
        expect(issue0.mentions[0].closes).to.equal(false);
        expect(issue0.mentions[0].commit).to.equal('1234567890');
        expect(issue0.mentions[1].closes).to.equal(true);
        expect(dbIssuesCollectionData[1].mentions.length).to.equal(2);
        expect(dbIssuesCollectionData[1].mentions[0].closes).to.equal(false);
        expect(dbIssuesCollectionData[1].mentions[0].commit).to.equal('1234567890');
        expect(dbIssuesCollectionData[1].mentions[1].closes).to.equal(true);
      }
    };
    // atm, PRs and Issue mock data is the same
    const expectDefaultMergeRequests = (collections) => {
      expectDefaultIssues(collections, 'mergeRequests');
    };
    const expectDefaultAccounts = (collections) => {
      expect(collections['accounts'].length).to.equal(2);
    };

    // TESTS

    it('should index all GitHub issues and create all necessary db collections and connections', async function () {
      const gitHubITSIndexer = await githubSetup();

      await gitHubITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      expectDefaultIssues(collections);
      expectDefaultMergeRequests(collections);
      expectDefaultAccounts(collections);
    });

    it('should not persist objects twice if indexer is called twice (GitHub)', async function () {
      const gitHubITSIndexer = await githubSetup();

      // first index run should add all necessary entries
      await gitHubITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // run indexer a second time. Second run should not add additional data to the database
      await gitHubITSIndexer.index();

      // again get all entries
      const updatedCollections = await getAllCollections();

      Object.entries(collections).map(([collectionName, collectionArray]) => {
        // check if updated collection has the same size
        expect(collectionArray.length).to.equal(updatedCollections[collectionName].length);
      });
    });

    it('can handle empty issues collection', async function () {
      const gitHubITSIndexer = await githubSetup();

      remapGitHubApiCall(gitHubITSIndexer, 'getIssuesWithEvents', []);

      await gitHubITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // issues (and all its connections) should be empty, the other collections should be unaffected
      expectEmptyCollectionAndConnections(collections, 'issues');
      expectDefaultMergeRequests(collections);
      expectDefaultAccounts(collections);
    });

    it('can handle empty mergeRequests collection', async function () {
      const gitHubITSIndexer = await githubSetup();

      remapGitHubApiCall(gitHubITSIndexer, 'getPullRequestsWithEvents', []);

      await gitHubITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // mergeRequests (and all its connections) should be empty, the other collections should be unaffected
      expectEmptyCollectionAndConnections(collections, 'mergeRequests');
      expectDefaultIssues(collections);
      expectDefaultAccounts(collections);
    });
  });
});
