'use strict';

import { expect } from 'chai';

import ReporterMock from './helper/reporter/reporterMock.js';

import Db from '../core/db/db';
import conf from '../utils/config.js';

import ctx from '../utils/context.ts';
import GitLabCIIndexer from './helper/gitlab/gitLabCIIndexerRewire.js';
import GitHubCIIndexer from './helper/github/gitHubCIIndexerRewire.js';

import Build from '../models/models/Build';
import repositoryFake from './helper/git/repositoryFake.js';
import GitLabMock from './helper/gitlab/gitLabMock.js';
import path from 'path';
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
describe('ci', function () {
  const config = conf.get();
  const db = new Db(config.arango);
  const reporter = new ReporterMock(['build']);

  config.token = '1234567890';

  describe('#indexGitLab', function () {
    it('should index all GitLab pipelines and create all necessary db collections and connections', async function () {
      const repo = await repositoryFake.repository();
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
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await Build.ensureCollection();

      const gitLabCIIndexer = new GitLabCIIndexer(repo, reporter);
      gitLabCIIndexer.gitlab = new GitLabMock();
      await gitLabCIIndexer.configure(config);

      await gitLabCIIndexer.index();
      const dbBuildsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'builds' })).all();

      expect(dbBuildsCollectionData.length).to.equal(3);
      expect(dbBuildsCollectionData[0].jobs.length).to.equal(3);
      for (const i in dbBuildsCollectionData[0].jobs) {
        expect(dbBuildsCollectionData[0].jobs[i].webUrl).to.equal('https://gitlab.com/Test/Test-Project/jobs/' + i);
      }
      expect(dbBuildsCollectionData[0].webUrl).to.equal(dbBuildsCollectionData[0].webUrl);
    });
  });

  describe('#indexGitHub', function () {
    it('should index all GitHub workflows and create all necessary db collections and connections', async function () {
      const repo = await repositoryFake.repository();
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
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await Build.ensureCollection();

      const gitHubCIIndexer = new GitHubCIIndexer(repo, reporter);
      await gitHubCIIndexer.configure(config);
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

      expect(dbBuildsCollectionData[0].status).to.equal('success');
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
