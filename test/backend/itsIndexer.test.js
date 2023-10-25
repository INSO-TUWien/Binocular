'use strict';

import { expect } from 'chai';
import fake from './helper/git/repositoryFake.js';
import ReporterMock from './helper/reporter/reporterMock';
import conf from '../../lib/config.js';

import Db from '../../lib/core/db/db';

import ctx from '../../lib/context';

import GitLabBaseIndexerMock from './helper/gitlab/gitLabBaseIndexerMock';

import OctokitMock from './helper/github/octokitMock';

import GitLabITSIndexer from '../../lib/indexers/its/GitLabITSIndexer';

import BaseGitLabIndexer from '../../lib/indexers/BaseGitLabIndexer.js';

import GitHubMock from './helper/github/gitHubMock';
import GitHubITSIndexer from '../../lib/indexers/its/GitHubITSIndexer';

import Issue from '../../lib/models/Issue';
import MergeRequest from '../../lib/models/MergeRequest';
import Stakeholder from '../../lib/models/Stakeholder';
import IssueStakeholderConnection from '../../lib/models/IssueStakeholderConnection';
import sinon from 'sinon';
const config = conf.get();

describe('its', function () {
  const db = new Db(config.arango);
  const reporter = new ReporterMock(['issues', 'mergeRequests']);

  config.token = '1234567890';
  beforeEach(() => {
    sinon.mock(BaseGitLabIndexer, GitLabBaseIndexerMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#indexGitLab', function () {
    it('should index all GitLab issues and create all necessary db collections and connections', async function () {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      //Remap Remote functions to local ones because remote repository doesn't exist anymore.
      repo.listAllCommitsRemote = repo.listAllCommits;
      repo.getAllBranchesRemote = repo.getAllBranches;
      repo.getLatestCommitForBranchRemote = repo.getLatestCommitForBranch;
      repo.getFilePathsForBranchRemote = repo.getFilePathsForBranch;
      repo.getOriginUrl = async function () {
        return 'git@gitlab.com:Test/Test-Project.git';
      };

      //setup DB
      await db.ensureDatabase('test');
      await db.truncate();
      await Issue.ensureCollection();
      await MergeRequest.ensureCollection();
      await Stakeholder.ensureCollection();
      await IssueStakeholderConnection.ensureCollection();

      const gitLabITSIndexer = new GitLabITSIndexer(repo, reporter);
      gitLabITSIndexer.configure(config);
      await gitLabITSIndexer.index();
      const dbIssuesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues' })).all();
      const dbMergeRequestsCollectionData = await (
        await db.query('FOR i IN @@collection RETURN i', { '@collection': 'mergeRequests' })
      ).all();

      expect(dbIssuesCollectionData.length).to.equal(3);
      for (const issue of dbIssuesCollectionData) {
        expect(issue.mentions.length).to.equal(2);
        expect(issue.mentions[0].closes).to.equal(true);
        expect(issue.mentions[1].commit).to.equal('1234567890');
        expect(issue.notes.length).to.equal(3);
      }

      expect(dbMergeRequestsCollectionData.length).to.equal(3);

      for (const mergeRequest of dbMergeRequestsCollectionData) {
        expect(mergeRequest.notes.length).to.equal(3);
      }
    });
  });

  describe('#indexGitHub', function () {
    it('should index all GitHub issues and create all necessary db collections and connections', async function () {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      //Remap Remote functions to local ones because remote repository doesn't exist anymore.
      repo.listAllCommitsRemote = repo.listAllCommits;
      repo.getAllBranchesRemote = repo.getAllBranches;
      repo.getLatestCommitForBranchRemote = repo.getLatestCommitForBranch;
      repo.getFilePathsForBranchRemote = repo.getFilePathsForBranch;
      repo.getOriginUrl = async function () {
        return 'git@github.com/Test/Test-Project.git';
      };

      //setup DB
      await db.ensureDatabase('test');
      await db.truncate();
      await Issue.ensureCollection();
      await Stakeholder.ensureCollection();
      await IssueStakeholderConnection.ensureCollection();

      const gitHubITSIndexer = new GitHubITSIndexer(repo, reporter);
      gitHubITSIndexer.github = new OctokitMock();
      gitHubITSIndexer.controller = new GitHubMock();
      await gitHubITSIndexer.index();

      const dbIssuesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues' })).all();

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
