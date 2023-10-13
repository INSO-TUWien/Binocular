'use strict';

const chai = require('chai');
const proxyquire = require('proxyquire');

const fake = require('./helper/git/repositoryFake.js');
const ReporterMock = require('./helper/reporter/reporterMock');

const Db = require('../../lib/core/db/db').default;

const config = require('../../lib/config.js').get();
const ctx = require('../../lib/context').default;

const GitLabBaseIndexerMock = require('./helper/gitlab/gitLabBaseIndexerMock');

const OctokitMock = require('./helper/github/octokitMock');
const GitLabITSIndexer = proxyquire('../../lib/indexers/its/GitLabITSIndexer', {
  '../../indexers/BaseGitLabIndexer.js': GitLabBaseIndexerMock,
});

const GitHubMock = require('./helper/github/gitHubMock');
const GitHubITSIndexer = require('../../lib/indexers/its/GitHubITSIndexer').default;

const Issue = require('../../lib/models/Issue').default;
const MergeRequest = require('../../lib/models/MergeRequest').default;
const Stakeholder = require('../../lib/models/Stakeholder').default;
const IssueStakeholderConnection = require('../../lib/models/IssueStakeholderConnection').default;

const expect = chai.expect;

describe('its', function () {
  const db = new Db(config.arango);
  const reporter = new ReporterMock(['issues', 'mergeRequests']);

  config.token = '1234567890';

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
