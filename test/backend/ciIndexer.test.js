'use strict';

const chai = require('chai');
const proxyquire = require('proxyquire');

const fake = require('./helper/git/repositoryFake.js');
const ReporterMock = require('./helper/reporter/reporterMock');

const Db = require('../../lib/core/db/db');

const config = require('../../lib/config.js').get();
const ctx = require('../../lib/context');

const GitLabBaseIndexerMock = require('./helper/gitlab/gitLabBaseIndexerMock');
const GitLabCIIndexer = proxyquire('../../lib/indexers/ci/GitLabCIIndexer', {
  '../../indexers/BaseGitLabIndexer.js': GitLabBaseIndexerMock,
});

const Build = require('../../lib/models/Build');

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

      const gitLabITSIndexer = new GitLabCIIndexer(repo, reporter);
      await gitLabITSIndexer.configure(config);

      await gitLabITSIndexer.index();
      const dbBuildsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'builds' })).all();

      expect(dbBuildsCollectionData.length).to.equal(1);
      expect(dbBuildsCollectionData[0].jobs.length).to.equal(3);
      for (const i in dbBuildsCollectionData[0].jobs) {
        expect(dbBuildsCollectionData[0].jobs[i].webUrl).to.equal('https://gitlab.com/Test/Test-Project/jobs/' + i);
      }
      expect(dbBuildsCollectionData[0].webUrl).to.equal('https://gitlab.com/Test/Test-Project/pipelines/1');
    });
  });
});
