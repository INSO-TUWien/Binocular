'use strict';

import { expect } from 'chai';

import fake from './helper/git/repositoryFake.js';
import helpers from './helper/git/helpers.js';
import GatewayMock from './helper/gateway/gatewayMock';
import ReporterMock from './helper/reporter/reporterMock';

import Db from '../core/db/db';
import Commit from '../models/models/Commit';
import File from '../models/models/File';
import Branch from '../models/models/Branch';
import Module from '../models/models/Module';
import CommitFileConnection from '../models/connections/CommitFileConnection';
import ModuleFileConnection from '../models/connections/ModuleFileConnection';
import CommitModuleConnection from '../models/connections/CommitModuleConnection';
import BranchFileConnection from '../models/connections/BranchFileConnection';
import BranchFileFileConnection from '../models/connections/BranchFileFileConnection';
import ModuleModuleConnection from '../models/connections/ModuleModuleConnection';
import CommitUserConnection from '../models/connections/CommitUserConnection';
import CommitFileUserConnection from '../models/connections/CommitFileUserConnection';
import conf from '../utils/config.js';
import ctx from '../utils/context';
import GitHubUrlProvider from '../url-providers/GitHubUrlProvider';

import VcsIndexer from '../indexers/vcs';
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

  const testFile = `
    function helloWorld(){
      console.log("Hello World");
    }`;
  const testFileChanged = `
    function helloWorld(){
      console.log("Hello World");
      console.log("Hello World");
      console.log("Hello World");
    }`;
  const testFileChangedAgain = `
    function helloWorld(){
      console.log("Hello World");
      console.log("Hello World again");
      console.log("Hello World again again");
    }`;

  const test2File = `
    function helloWorld(){
      console.log("Hello World");
    }`;

  const setupRepo = async () => {
    const repo = await fake.repository();
    ctx.targetPath = repo.path;
    //Remap Remote functions to local ones because remote repository doesn't exist anymore.
    repo.listAllCommitsRemote = repo.listAllCommits;
    repo.getAllBranchesRemote = repo.getAllBranches;
    repo.getLatestCommitForBranchRemote = repo.getLatestCommitForBranch;
    repo.getFilePathsForBranchRemote = repo.getFilePathsForBranch;
    repo.getPreviousFilenamesRemote = repo.getPreviousFilenames;

    return repo;
  };

  const setupUrlProvider = (repo) => {
    const urlProvider = new GitHubUrlProvider(repo);
    urlProvider.configure({ url: 'https://test.com', project: 'testProject' });
    return urlProvider;
  };
  const initDb = async () => {
    //setup DB
    await db.ensureDatabase('test', ctx);
    await db.truncate();
    await Commit.ensureCollection();
    await CommitFileConnection.ensureCollection();
    await File.ensureCollection();
    await Branch.ensureCollection();
    await Module.ensureCollection();
    await CommitUserConnection.ensureCollection();
    await ModuleFileConnection.ensureCollection();
    await CommitModuleConnection.ensureCollection();
    await BranchFileConnection.ensureCollection();
    await BranchFileFileConnection.ensureCollection();
    await ModuleModuleConnection.ensureCollection();
    await CommitFileUserConnection.ensureCollection();
  };

  const setupIndexer = (repo, urlProvider) => {
    const gitIndexer = VcsIndexer(repo, urlProvider, reporter, true, conf, ctx);
    gitIndexer.setGateway(gateway);
    gitIndexer.resetCounter();
    return gitIndexer;
  };

  describe('#index', function () {
    it('should index all commits and create all necessary db collections and connections', async function () {
      const repo = await setupRepo();
      const urlProvider = setupUrlProvider(repo);
      await initDb();

      // create `test.js` and `testDir/test2.js`
      await fake.file(repo, 'test.js', testFile);
      fake.dir(repo, 'testDir');
      await fake.file(repo, 'testDir/test2.js', test2File);
      await helpers.commit(repo, ['test.js', 'testDir/test2.js'], bob, 'Commit1');

      // change `test.js`
      await fake.file(repo, 'test.js', testFileChanged);
      await helpers.commit(repo, ['test.js'], bob, 'Commit2');

      // change `test.js` again and commit to new branch `develop`
      await fake.file(repo, 'test.js', testFileChangedAgain);
      await helpers.branch(repo, 'develop');
      await helpers.checkout(repo, 'develop');
      await helpers.commit(repo, ['test.js'], bob, 'Commit3');

      // start indexing
      const gitIndexer = setupIndexer(repo, urlProvider);
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

    it('should index file renames', async function () {
      const repo = await setupRepo();
      const urlProvider = setupUrlProvider(repo);
      await initDb();

      // instruct the indexer to track file renames on the master branch
      conf.set('fileRenameBranches', ['master']);

      // create test.js
      await fake.file(repo, 'test.js', testFile);
      await helpers.commit(repo, ['.'], bob, 'Commit1');

      // rename test.js
      await fake.renameFile(repo, 'test.js', 'testOne.js');
      await helpers.renameCommit(repo, ['test.js'], ['testOne.js'], bob, 'Commit2');

      // start indexer
      const gitIndexer = setupIndexer(repo, urlProvider);
      await gitIndexer.index();

      // get all file renames from the db
      const dbBranchesFilesFilesCollectionData = await (
        await db.query('FOR i IN @@collection RETURN i', { '@collection': 'branches-files-files' })
      ).all();

      // we expect the branches-files-files collection to have length 2:
      // - one connection describing that testOne.js was named test.js in the past
      // - one connection describing that testOne.js is currently named testOne.js
      expect(dbBranchesFilesFilesCollectionData.length).to.equal(2);
    });
  });
});
