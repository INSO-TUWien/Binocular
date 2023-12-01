'use strict';

import { expect } from 'chai';

import fake from './helper/git/repositoryFake.js';
import helpers from './helper/git/helpers.js';
import GatewayMock from './helper/gateway/gatewayMock';
import ReporterMock from './helper/reporter/reporterMock';

import Db from '../../lib/core/db/db';
import Commit from '../../lib/models/Commit';
import Hunk from '../../lib/models/Hunk';
import File from '../../lib/models/File';
import Branch from '../../lib/models/Branch';
import Module from '../../lib/models/Module';
import ModuleFileConnection from '../../lib/models/ModuleFileConnection';
import CommitModuleConnection from '../../lib/models/CommitModuleConnection';
import BranchFileConnection from '../../lib/models/BranchFileConnection';
import ModuleModuleConnection from '../../lib/models/ModuleModuleConnection';
import CommitFileStakeholderConnection from '../../lib/models/CommitFileStakeholderConnection';
import conf from '../../lib/config.js';
import ctx from '../../lib/context';
import GitHubUrlProvider from '../../lib/url-providers/GitHubUrlProvider';

import VcsIndexer from '../../lib/indexers/vcs';
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
const config = conf.get();

describe('vcs', function () {
  const db = new Db(config.arango);
  const gateway = new GatewayMock();
  const reporter = new ReporterMock(['commits', 'files', 'modules']);
  const bob = { name: 'Bob Barker', email: 'bob@gmail.com' };

  const testFile = 'function helloWorld(){\nconsole.log("Hello World");\n}';
  const testFileChanged = 'function helloWorld(){\nconsole.log("Hello World!");\n}';
  const testFileChangedAgain =
    'function helloWorld(){\nconsole.log("Hello");\nconsole.log("Hello World!");\nconsole.log("World");\nconsole.log("!");\n}';

  const test2File = 'function helloWorld(){\nconsole.log("Hello World");\n}';

  describe('#index', function () {
    it('should index all commits and create all necessary db collections and connections', async function () {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      //Remap Remote functions to local ones because remote repository doesn't exist anymore.
      repo.listAllCommitsRemote = repo.listAllCommits;
      repo.getAllBranchesRemote = repo.getAllBranches;
      repo.getLatestCommitForBranchRemote = repo.getLatestCommitForBranch;
      repo.getFilePathsForBranchRemote = repo.getFilePathsForBranch;

      const urlProvider = new GitHubUrlProvider(repo);
      urlProvider.configure({ url: 'https://test.com', project: 'testProject' });

      //setup DB
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await Commit.ensureCollection();
      await Hunk.ensureCollection();
      await File.ensureCollection();
      await Branch.ensureCollection();
      await Module.ensureCollection();
      await ModuleFileConnection.ensureCollection();
      await CommitModuleConnection.ensureCollection();
      await BranchFileConnection.ensureCollection();
      await ModuleModuleConnection.ensureCollection();
      await CommitFileStakeholderConnection.ensureCollection();

      await fake.file(repo, 'test.js', testFile);
      await fake.dir(repo, 'testDir');
      await fake.file(repo, 'testDir/test2.js', test2File);
      await helpers.commit(repo, ['test.js', 'testDir/test2.js'], bob, 'Commit1');
      await fake.file(repo, 'test.js', testFileChanged);
      await helpers.commit(repo, ['test.js'], bob, 'Commit2');
      await fake.file(repo, 'test.js', testFileChangedAgain);
      await helpers.branch(repo, 'develop');
      await helpers.checkout(repo, 'develop');
      await helpers.commit(repo, ['test.js'], bob, 'Commit3');
      await repo.listAllCommits();

      const gitIndexer = VcsIndexer(repo, urlProvider, reporter, true, conf, ctx);
      gitIndexer.setGateway(gateway);
      gitIndexer.resetCounter();
      await gitIndexer.index();

      const dbCommitsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits' })).all();
      const dbBranchesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'branches' })).all();
      const dbFilesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'files' })).all();
      const dbModulesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules' })).all();
      const dbModulesFilesCollectionData = await (
        await db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules-files' })
      ).all();
      const dbCommitsModulesCollectionData = await (
        await db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-modules' })
      ).all();

      expect(dbCommitsCollectionData.length).to.equal(3);
      expect(dbBranchesCollectionData.length).to.equal(2);
      expect(dbFilesCollectionData.length).to.equal(2);
      expect(dbModulesCollectionData.length).to.equal(2);
      expect(dbModulesFilesCollectionData.length).to.equal(2);
      expect(dbCommitsModulesCollectionData.length).to.equal(2);
    });
  });
});
