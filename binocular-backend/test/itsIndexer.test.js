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
import Stakeholder from '../models/models/Stakeholder';
import IssueStakeholderConnection from '../models/connections/IssueStakeholderConnection';
import sinon from 'sinon';
import path from 'path';
import Milestone from '../models/models/Milestone';
import IssueMilestoneConnection from '../models/connections/IssueMilestoneConnection';
import MergeRequestMilestoneConnection from '../models/connections/MergeRequestMilestoneConnection';
import Account from '../models/models/Account';
import IssueAccountConnection from '../models/connections/IssueAccountConnection';
import MergeRequestAccountConnection from '../models/connections/MergeRequestAccountConnection';

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

  const remapRemoteFunctions = (repo) => {
    repo.listAllCommitsRemote = repo.listAllCommits;
    repo.getAllBranchesRemote = repo.getAllBranches;
    repo.getLatestCommitForBranchRemote = repo.getLatestCommitForBranch;
    repo.getFilePathsForBranchRemote = repo.getFilePathsForBranch;
  };

  const relevantCollections = [
    Issue,
    MergeRequest,
    Stakeholder,
    IssueStakeholderConnection,
    Milestone,
    IssueMilestoneConnection,
    MergeRequestMilestoneConnection,
    Account,
    IssueAccountConnection,
    MergeRequestAccountConnection,
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

  const expectExamples = (example, collectionArray, number) => {
    expect(findInCollection(example, collectionArray).length).to.equal(number);
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
    it('should index all GitLab issues and create all necessary db collections and connections', async function () {
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

      // start indexer. gets data from GitLab Mock implementation (see ./gitlab)
      await gitLabITSIndexer.index();

      // get all entries from all relevant collections
      const collections = await getAllCollections();

      // check if the data was indexed as expected:

      // accounts
      expect(collections['accounts'].length).to.equal(1);

      // milestones
      expect(collections['milestones'].length).to.equal(1);

      // issues
      expect(collections['issues'].length).to.equal(3);
      for (const issue of collections['issues']) {
        expect(issue.mentions.length).to.equal(2);
        expect(issue.mentions[0].closes).to.equal(true);
        expect(issue.mentions[1].commit).to.equal('1234567890');
        expect(issue.notes.length).to.equal(3);
      }

      // mergeRequests
      expect(collections['mergeRequests'].length).to.equal(3);
      for (const mergeRequest of collections['mergeRequests']) {
        expect(mergeRequest.notes.length).to.equal(3);
      }

      // issues-accounts
      const accId = collections['accounts'][0]._id;
      for (const issue of collections['issues']) {
        // we expect the only account there is to have roles author, assignee and assignees
        expectExamples({ _from: issue._id, _to: accId, role: 'author' }, collections['issues-accounts'], 1);
        expectExamples({ _from: issue._id, _to: accId, role: 'assignee' }, collections['issues-accounts'], 1);
        expectExamples({ _from: issue._id, _to: accId, role: 'assignees' }, collections['issues-accounts'], 1);
      }

      // mergeRequests-accounts
      for (const mr of collections['mergeRequests']) {
        // we expect the only account there is to have roles author, assignee and assignees
        expectExamples({ _from: mr._id, _to: accId, role: 'author' }, collections['mergeRequests-accounts'], 1);
        expectExamples({ _from: mr._id, _to: accId, role: 'assignee' }, collections['mergeRequests-accounts'], 1);
        expectExamples({ _from: mr._id, _to: accId, role: 'assignees' }, collections['mergeRequests-accounts'], 1);
      }

      // issues-milestones
      const milestoneId = collections['milestones'][0]._id;
      for (const issue of collections['issues']) {
        // every issue is connected to the only milestone there is
        expectExamples({ _from: issue._id, _to: milestoneId }, collections['issues-milestones'], 1);
      }

      // mergeRequests-milestones
      for (const mr of collections['mergeRequests']) {
        // every issue is connected to the only milestone there is
        expectExamples({ _from: mr._id, _to: milestoneId }, collections['mergeRequests-milestones'], 1);
      }
    });
  });

  describe('#indexGitHub', function () {
    it('should index all GitHub issues and create all necessary db collections and connections', async function () {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      //Remap Remote functions to local ones because remote repository doesn't exist anymore.
      remapRemoteFunctions(repo);
      repo.getOriginUrl = async function () {
        return 'git@github.com/Test/Test-Project.git';
      };

      //setup DB
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await Issue.ensureCollection();
      await Stakeholder.ensureCollection();
      await IssueStakeholderConnection.ensureCollection();

      const gitHubITSIndexer = new GitHubITSIndexer(repo, reporter);
      gitHubITSIndexer.controller = new GitHubMock();
      await gitHubITSIndexer.index();

      const dbIssuesCollectionData = await (
        await db.query('FOR i IN @@collection SORT i.id ASC RETURN i', { '@collection': 'issues' })
      ).all();

      expect(dbIssuesCollectionData.length).to.equal(2);

      expect(dbIssuesCollectionData[0].mentions.length).to.equal(2);
      expect(dbIssuesCollectionData[0].author.login).to.equal('tester1');
      expect(dbIssuesCollectionData[0].assignee.login).to.equal('tester2');
      expect(dbIssuesCollectionData[0].assignees.length).to.equal(1);
      expect(dbIssuesCollectionData[1].assignees[0].login).to.equal('tester1');
      expect(dbIssuesCollectionData[0].mentions[0].closes).to.equal(false);
      expect(dbIssuesCollectionData[0].mentions[0].commit).to.equal('1234567890');
      expect(dbIssuesCollectionData[0].mentions[1].closes).to.equal(true);

      expect(dbIssuesCollectionData[1].mentions.length).to.equal(2);
      expect(dbIssuesCollectionData[1].author.login).to.equal('tester2');
      expect(dbIssuesCollectionData[1].assignee.login).to.equal('tester1');
      expect(dbIssuesCollectionData[1].assignees.length).to.equal(2);
      expect(dbIssuesCollectionData[1].assignees[0].login).to.equal('tester1');
      expect(dbIssuesCollectionData[1].assignees[1].login).to.equal('tester2');
      expect(dbIssuesCollectionData[1].mentions[0].closes).to.equal(false);
      expect(dbIssuesCollectionData[1].mentions[0].commit).to.equal('1234567890');
      expect(dbIssuesCollectionData[1].mentions[1].closes).to.equal(true);
    });
  });
});
