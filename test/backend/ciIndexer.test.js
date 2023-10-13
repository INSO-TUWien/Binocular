'use strict';

const chai = require('chai');
const proxyquire = require('proxyquire');

const fake = require('./helper/git/repositoryFake.js');
const ReporterMock = require('./helper/reporter/reporterMock');

const Db = require('../../lib/core/db/db').default;

const config = require('../../lib/config.js').get();
const ctx = require('../../lib/context').default;

const GitLabBaseIndexerMock = require('./helper/gitlab/gitLabBaseIndexerMock');
const GitLabCIIndexer = proxyquire('../../lib/indexers/ci/GitLabCIIndexer', {
  '../../indexers/BaseGitLabIndexer.js': GitLabBaseIndexerMock,
});

const GitHubMock = require('./helper/github/gitHubMock');
const GitHubCIIndexer = proxyquire('../../lib/indexers/ci/GitHubCIIndexer', {
  '../../core/provider/github': GitHubMock,
});

const Build = require('../../lib/models/Build').default;
const OctokitMock = require('./helper/github/octokitMock');

const expect = chai.expect;

describe('ci', function () {
  const db = new Db(config.arango);
  const reporter = new ReporterMock(['build']);

  config.token = '1234567890';

  describe('#indexGitLab', function () {
    it('should index all GitLab pipelines and create all necessary db collections and connections', async function () {
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
      await Build.ensureCollection();

      const gitLabCIIndexer = new GitLabCIIndexer(repo, reporter);
      await gitLabCIIndexer.configure(config);

      await gitLabCIIndexer.index();
      const dbBuildsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'builds' })).all();

      expect(dbBuildsCollectionData.length).to.equal(3);
      expect(dbBuildsCollectionData[0].jobs.length).to.equal(3);
      for (const i in dbBuildsCollectionData[0].jobs) {
        expect(dbBuildsCollectionData[0].jobs[i].webUrl).to.equal('https://gitlab.com/Test/Test-Project/jobs/' + i);
      }
      expect(dbBuildsCollectionData[0].webUrl).to.equal('https://gitlab.com/Test/Test-Project/pipelines/' + dbBuildsCollectionData[0]._key);
    });
  });

  describe('#indexGitHub', function () {
    it('should index all GitHub workflows and create all necessary db collections and connections', async function () {
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
      await Build.ensureCollection();

      const gitHubCIIndexer = new GitHubCIIndexer(repo, reporter);
      await gitHubCIIndexer.configure(config);
      gitHubCIIndexer.github = new OctokitMock();
      gitHubCIIndexer.controller = new GitHubMock();
      await gitHubCIIndexer.index();
      const dbBuildsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'builds' })).all();

      expect(dbBuildsCollectionData.length).to.equal(3);
      expect(dbBuildsCollectionData[0].jobs.length).to.equal(3);
      expect(dbBuildsCollectionData[0].jobs[0].id).to.equal('0');
      expect(dbBuildsCollectionData[0].jobs[0].status).to.equal('success');
      expect(dbBuildsCollectionData[0].jobs[1].id).to.equal('1');
      expect(dbBuildsCollectionData[0].jobs[1].status).to.equal('success');
      expect(dbBuildsCollectionData[0].jobs[2].id).to.equal('2');
      expect(dbBuildsCollectionData[0].jobs[2].status).to.equal('failure');

      expect(dbBuildsCollectionData[0].status).to.equal('failed');
    });
  });

  describe('#configureGitHubIncorrectly', function () {
    it('should configure GitHubCIIndexer incorrectly and throw error', async function () {
      const gitHubCIIndexer = new GitHubCIIndexer();
      try {
        await gitHubCIIndexer.configure();
      } catch (e) {
        expect(e.name).to.equal('ConfigurationError');
        expect(e.message).to.equal('GitHub/Octokit cannot be configured!');
      }
    });
  });
});
