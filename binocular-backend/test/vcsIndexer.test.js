'use strict';

import { expect } from 'chai';
import _ from 'lodash';

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
import CommitCommitConnection from '../models/connections/CommitCommitConnection';
import User from '../models/models/User';

import conf from '../utils/config.js';
import ctx from '../utils/context';
import GitHubUrlProvider from '../url-providers/GitHubUrlProvider';
import VcsIndexer from '../indexers/vcs';
import path from 'path';
import { checkOwnedLines, expectExamples, getAllEntriesInCollection, getAllRelevantCollections } from './helper/utils';
import { alice, bob, file1, file1Change1, file1Change2, file2 } from './helper/git/gitTestData';
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

  const relevantCollections = [
    Commit,
    File,
    Branch,
    Module,
    User,
    CommitCommitConnection,
    CommitFileConnection,
    CommitUserConnection,
    CommitModuleConnection,
    BranchFileConnection,
    BranchFileFileConnection,
    ModuleModuleConnection,
    ModuleFileConnection,
    CommitFileUserConnection,
  ];

  // helper functions

  const getAllInCollection = async (collection) => getAllEntriesInCollection(db, collection);

  const getAllCollections = async () =>
    getAllRelevantCollections(
      db,
      relevantCollections.map((c) => c.collection.name),
    );

  // setup functions

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
    await Promise.all(
      relevantCollections.map(async (c) => {
        await c.ensureCollection();
      }),
    );
  };

  const setupIndexer = (repo) => {
    const gitIndexer = VcsIndexer(repo, setupUrlProvider(repo), reporter, true, conf, ctx);
    gitIndexer.setGateway(gateway);
    gitIndexer.resetCounter();
    return gitIndexer;
  };

  const ownershipCommits = async (repo) => {
    // bob creates `test.js` and `testDir/test2.js`
    await fake.file(repo, 'test.js', file1);
    fake.dir(repo, 'testDir');
    await fake.file(repo, 'testDir/test2.js', file2);
    await helpers.commit(repo, ['test.js', 'testDir/test2.js'], bob, 'Commit1');

    // alice changes `test.js` on develop branch
    await fake.file(repo, 'test.js', file1Change1);
    await helpers.branch(repo, 'develop');
    await helpers.checkout(repo, 'develop');
    await helpers.commit(repo, ['test.js'], alice, 'Commit2');

    // bob changes `test.js` again back on the main branch
    await helpers.checkout(repo, 'master');
    await fake.file(repo, 'test.js', file1Change2);
    await helpers.commit(repo, ['test.js'], bob, 'Commit3');
  };

  describe('#index', function () {
    it('should index all commits (one committer) and create all necessary db collections and connections', async function () {
      // step 1: setup repo and database
      const repo = await setupRepo();
      await initDb();

      // step 2: commmit changes
      // create `test.js` and `testDir/test2.js`
      await fake.file(repo, 'test.js', file1);
      fake.dir(repo, 'testDir');
      await fake.file(repo, 'testDir/test2.js', file2);
      await helpers.commit(repo, ['test.js', 'testDir/test2.js'], bob, 'Commit1');

      // change `test.js`
      await fake.file(repo, 'test.js', file1Change1);
      await helpers.commit(repo, ['test.js'], bob, 'Commit2');

      // change `test.js` again and commit to new branch `develop`
      await fake.file(repo, 'test.js', file1Change2);
      await helpers.branch(repo, 'develop');
      await helpers.checkout(repo, 'develop');
      await helpers.commit(repo, ['test.js'], bob, 'Commit3');

      // step 3: start indexing
      const gitIndexer = setupIndexer(repo);
      await gitIndexer.index();

      // step 4: check database
      const collections = await getAllCollections();

      expectExamples({}, collections['commits'], 3);

      expectExamples({}, collections['branches'], 2);
      expectExamples({ branch: 'master' }, collections['branches'], 1);
      expectExamples({ branch: 'develop' }, collections['branches'], 1);

      expectExamples({}, collections['files'], 2);
      expectExamples({ path: 'test.js' }, collections['files'], 1);
      expectExamples({ path: 'testDir/test2.js' }, collections['files'], 1);

      expectExamples({}, collections['modules'], 2);
      expectExamples({ path: '.' }, collections['modules'], 1);
      expectExamples({ path: './testDir' }, collections['modules'], 1);

      expectExamples({}, collections['users'], 1);
      expectExamples({ gitSignature: `${bob.name} <${bob.email}>` }, collections['users'], 1);

      expectExamples({}, collections['modules-files'], 2);
      expectExamples({}, collections['commits-modules'], 2);
      // Commit1 is parent of Commit2, Commit2 is parent of Commit3. -> 2 connections
      expectExamples({}, collections['commits-commits'], 2);
      // first commit created both files (results in 2 connections)
      // second and third modify one file reach (one connection each)
      expectExamples({}, collections['commits-files'], 4);
      // all commits by one user, so one connection per commit
      expectExamples({}, collections['commits-users'], 3);
      // both files exist on both branches -> 4 connections
      expectExamples({}, collections['branches-files'], 4);
      // there are no file renames
      expectExamples({}, collections['branches-files-files'], 0);
      // './testDir' is submodule of '.'
      expectExamples({}, collections['modules-modules'], 1);
      // bob is the only one committing, so there can only be 4 ownership connections
      expectExamples({}, collections['commits-files-users'], 4);
    });

    it('should index ownership correctly (two committers)', async function () {
      // step 1: setup repo and database
      const repo = await setupRepo();
      await initDb();

      // step 2: commit changes
      await ownershipCommits(repo);

      // step 3: start indexing
      const gitIndexer = setupIndexer(repo);
      await gitIndexer.index();

      // step 4: check database
      const collections = await getAllCollections();

      expectExamples({}, collections['users'], 2);
      // store the retrieved user entries for later
      const aliceUserEntry = expectExamples({ gitSignature: `${alice.name} <${alice.email}>` }, collections['users'], 1)[0];
      const bobUserEntry = expectExamples({ gitSignature: `${bob.name} <${bob.email}>` }, collections['users'], 1)[0];

      // 2 commits by bob, one by alice
      expectExamples({}, collections['commits-users'], 3);
      expectExamples({ _to: aliceUserEntry._id }, collections['commits-users'], 1);
      expectExamples({ _to: bobUserEntry._id }, collections['commits-users'], 2);

      // ownership checks

      // get db entries necessary to get the commits-files-users entries
      const commit1 = expectExamples({ message: 'Commit1\n' }, collections['commits'], 1)[0];
      const commit2 = expectExamples({ message: 'Commit2\n' }, collections['commits'], 1)[0];
      const commit3 = expectExamples({ message: 'Commit3\n' }, collections['commits'], 1)[0];

      const testJs = expectExamples({ path: 'test.js' }, collections['files'], 1)[0];
      const test2Js = expectExamples({ path: 'testDir/test2.js' }, collections['files'], 1)[0];

      const commit1ToTestJs = expectExamples({ _from: commit1._id, _to: testJs._id }, collections['commits-files'], 1)[0];
      const commit1ToTest2Js = expectExamples({ _from: commit1._id, _to: test2Js._id }, collections['commits-files'], 1)[0];
      const commit2ToTestJs = expectExamples({ _from: commit2._id, _to: testJs._id }, collections['commits-files'], 1)[0];
      const commit3ToTestJs = expectExamples({ _from: commit3._id, _to: testJs._id }, collections['commits-files'], 1)[0];

      // commit 1: bob committed 2 new files, each with 3 lines ON MAIN BRANCH
      const bobOwnershipCommit1TestJs = expectExamples(
        { _from: commit1ToTestJs._id, _to: bobUserEntry._id },
        collections['commits-files-users'],
        1,
      )[0];
      const bobOwnershipCommit1Test2Js = expectExamples(
        { _from: commit1ToTest2Js._id, _to: bobUserEntry._id },
        collections['commits-files-users'],
        1,
      )[0];
      // check if hunks are correct
      checkOwnedLines(bobOwnershipCommit1TestJs, commit1.sha, 1, 3);
      checkOwnedLines(bobOwnershipCommit1Test2Js, commit1.sha, 1, 3);

      // commit 2: alice committed changes to test.js ON BRANCH DEVELOP
      const aliceOwnershipCommit2Test2Js = expectExamples(
        { _from: commit2ToTestJs._id, _to: aliceUserEntry._id },
        collections['commits-files-users'],
        1,
      )[0];
      checkOwnedLines(aliceOwnershipCommit2Test2Js, commit2.sha, 3, 4);
      // bob still owns lines of this file, so there is also a connection for bob.
      //  Note: this ownership stems from commit1!
      const bobOwnershipCommit2Test2Js = expectExamples(
        { _from: commit2ToTestJs._id, _to: bobUserEntry._id },
        collections['commits-files-users'],
        1,
      )[0];
      checkOwnedLines(bobOwnershipCommit2Test2Js, commit1.sha, 1, 2);
      checkOwnedLines(bobOwnershipCommit2Test2Js, commit1.sha, 5, 5);

      // commit 3: bob committed changes to test.js ON MAIN BRANCH
      const bobOwnershipCommit3Test2Js = expectExamples(
        { _from: commit3ToTestJs._id, _to: bobUserEntry._id },
        collections['commits-files-users'],
        1,
      )[0];
      // lines 1-2 and 5 are still from commit1. Lines 3-4 from commit3.
      checkOwnedLines(bobOwnershipCommit3Test2Js, commit1.sha, 1, 2);
      checkOwnedLines(bobOwnershipCommit3Test2Js, commit3.sha, 3, 4);
      checkOwnedLines(bobOwnershipCommit3Test2Js, commit1.sha, 5, 5);
      // since alice's changes are on the develop branch and this commit is on the main branch, alice owns no lines here,
      //  so there is no connection for alice
      expectExamples({ _from: commit3ToTestJs._id, _to: aliceUserEntry._id }, collections['commits-files-users'], 0);

      // all in all: 5 ownership connections
      expectExamples({}, collections['commits-files-users'], 5);
    });

    it('should index file renames', async function () {
      const repo = await setupRepo();
      await initDb();

      // instruct the indexer to track file renames on the master branch
      conf.set('fileRenameBranches', ['master']);

      // create test.js
      await fake.file(repo, 'test.js', file1);
      await helpers.commit(repo, ['.'], bob, 'Commit1');

      // rename test.js
      await fake.renameFile(repo, 'test.js', 'testOne.js');
      await helpers.renameCommit(repo, ['test.js'], ['testOne.js'], bob, 'Commit2');

      // start indexer
      const gitIndexer = setupIndexer(repo);
      await gitIndexer.index();

      // get all file renames from the db
      const dbBranchesFilesFilesCollectionData = await getAllInCollection('branches-files-files');

      // we expect the branches-files-files collection to have length 2:
      // - one connection describing that testOne.js was named test.js in the past
      // - one connection describing that testOne.js is currently named testOne.js
      expect(dbBranchesFilesFilesCollectionData.length).to.equal(2);
    });

    it('should not persist data twice when indexing twice', async function () {
      // setup repo and database
      const repo = await setupRepo();
      await initDb();

      // commit changes
      await ownershipCommits(repo);

      // start indexing
      const gitIndexer = setupIndexer(repo);
      await gitIndexer.index();

      // get relevant entries from database
      const collections = await getAllCollections();

      // index again
      await gitIndexer.index();

      const collectionsNew = await getAllCollections();

      Object.entries(collections).forEach(([key, value]) => {
        const newVal = collectionsNew[key];
        // check if all pairs of collections contain the same number of entries
        expect(value.length).to.equal(
          newVal.length,
          `different number of entries in ${key} collection:\n\tfirst index run: ${value.length}\n\tSecond index run: ${newVal.length}\n`,
        );

        // check if the IDs have changed
        expect(
          _.isEqual(
            value.map((e) => e._id),
            newVal.map((e) => e._id),
          ),
        ).to.equal(true, `entries of ${key} collection have changed after second index`);
      });
    });
  });
});
