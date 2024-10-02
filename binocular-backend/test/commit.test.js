'use strict';

import { expect } from 'chai';

import fake from './helper/git/repositoryFake.js';
import helpers from './helper/git/helpers.js';
import GatewayMock from './helper/gateway/gatewayMock';

import Db from '../core/db/db';
import Commit from '../models/models/Commit';
import File from '../models/models/File';
import CommitUserConnection from '../models/connections/CommitUserConnection';
import CommitFileConnection from '../models/connections/CommitFileConnection';
import CommitCommitConnection from '../models/connections/CommitCommitConnection';
import User from '../models/models/User';

import conf from '../utils/config.js';
import ctx from '../utils/context';
import GitHubUrlProvider from '../url-providers/GitHubUrlProvider';
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

describe('commit', function () {
  const db = new Db(config.arango);
  const gateway = new GatewayMock();
  const bob = { name: 'Bob Barker', email: 'bob@gmail.com' };

  const testFile = 'function helloWorld(){\nconsole.log("Hello World");\n}';
  const testFileChanged = 'function helloWorld(){\nconsole.log("Hello World!");\n}';
  const testFileChangedAgain =
    'function helloWorld(){\nconsole.log("Hello");\nconsole.log("Hello World!");\nconsole.log("World");\nconsole.log("!");\n}';

  describe('#persit', function () {
    it('should persist all commits', async function () {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      const urlProvider = new GitHubUrlProvider(repo);
      urlProvider.configure({ url: 'https://test.com', project: 'testProject' });

      //setup DB
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await Commit.ensureCollection();
      await File.ensureCollection();
      await CommitCommitConnection.ensureCollection();
      await CommitFileConnection.ensureCollection();
      await CommitUserConnection.ensureCollection();
      await User.ensureCollection();

      await fake.file(repo, 'test.js', testFile);
      await helpers.commit(repo, ['test.js'], bob, 'Commit1');
      await fake.file(repo, 'test.js', testFileChanged);
      await helpers.commit(repo, ['test.js'], bob, 'Commit2');
      await fake.file(repo, 'test.js', testFileChangedAgain);
      await helpers.commit(repo, ['test.js'], bob, 'Commit3');
      const commits = await repo.listAllCommits();

      for (const commit of commits) {
        await Commit.persist(repo, commit, urlProvider);
      }

      const dbCommitsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits' })).all();

      expect(dbCommitsCollectionData.length).to.equal(3);
      expect(dbCommitsCollectionData[0].message).to.equal('Commit1\n');
      expect(dbCommitsCollectionData[1].message).to.equal('Commit2\n');
      expect(dbCommitsCollectionData[2].message).to.equal('Commit3\n');
    });
  });

  describe('#processTree', function () {
    it('should persist all commits and process tree to generate hunks', async function () {
      const repo = await fake.repository();
      ctx.targetPath = repo.path;

      const urlProvider = new GitHubUrlProvider(repo);
      urlProvider.configure({ url: 'https://test.com', project: 'testProject' });

      //setup DB
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await Commit.ensureCollection();
      await File.ensureCollection();
      await CommitFileConnection.ensureCollection();

      await fake.file(repo, 'test.js', testFile);
      await helpers.commit(repo, ['test.js'], bob, 'Commit1');
      await fake.file(repo, 'test.js', testFileChanged);
      await helpers.commit(repo, ['test.js'], bob, 'Commit2');
      await fake.file(repo, 'test.js', testFileChangedAgain);
      await helpers.commit(repo, ['test.js'], bob, 'Commit3');

      const currentBranch = await repo.getCurrentBranch();

      const commits = await repo.listAllCommits();

      for (const commit of commits) {
        const commitDAO = await Commit.persist(repo, commit, urlProvider);
        await Promise.all(await Commit.processTree(commitDAO, repo, commit, currentBranch, urlProvider, gateway, ctx));
      }
      const dbCommitsCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits' })).all();
      const dbFilesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'files' })).all();
      const dbHunksCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-files' })).all();

      expect(dbCommitsCollectionData.length).to.equal(3);
      expect(dbCommitsCollectionData[0].stats.additions).to.equal(3);
      expect(dbCommitsCollectionData[0].stats.deletions).to.equal(0);
      expect(dbCommitsCollectionData[1].stats.additions).to.equal(1);
      expect(dbCommitsCollectionData[1].stats.deletions).to.equal(1);
      expect(dbCommitsCollectionData[2].stats.additions).to.equal(3);
      expect(dbCommitsCollectionData[2].stats.deletions).to.equal(0);

      expect(dbFilesCollectionData.length).to.equal(1);
      expect(dbFilesCollectionData[0].path).to.equal('test.js');

      expect(dbHunksCollectionData.length).to.equal(3);
      expect(dbHunksCollectionData[0].stats.additions).to.equal(3);
      expect(dbHunksCollectionData[0].stats.deletions).to.equal(0);
      expect(dbHunksCollectionData[0].hunks.length).to.equal(1);
      expect(dbHunksCollectionData[0].hunks[0].newLines).to.equal(3);
      expect(dbHunksCollectionData[0].hunks[0].newStart).to.equal(1);
      expect(dbHunksCollectionData[0].hunks[0].oldLines).to.equal(0);
      expect(dbHunksCollectionData[0].hunks[0].oldStart).to.equal(0);

      expect(dbHunksCollectionData[1].stats.additions).to.equal(1);
      expect(dbHunksCollectionData[1].stats.deletions).to.equal(1);
      expect(dbHunksCollectionData[1].hunks.length).to.equal(1);
      expect(dbHunksCollectionData[1].hunks[0].newLines).to.equal(1);
      expect(dbHunksCollectionData[1].hunks[0].newStart).to.equal(2);
      expect(dbHunksCollectionData[1].hunks[0].oldLines).to.equal(1);
      expect(dbHunksCollectionData[1].hunks[0].oldStart).to.equal(2);

      expect(dbHunksCollectionData[2].stats.additions).to.equal(3);
      expect(dbHunksCollectionData[2].stats.deletions).to.equal(0);
      expect(dbHunksCollectionData[2].hunks.length).to.equal(2);
      expect(dbHunksCollectionData[2].hunks[0].newLines).to.equal(1);
      expect(dbHunksCollectionData[2].hunks[0].newStart).to.equal(2);
      expect(dbHunksCollectionData[2].hunks[0].oldLines).to.equal(0);
      expect(dbHunksCollectionData[2].hunks[0].oldStart).to.equal(1);
      expect(dbHunksCollectionData[2].hunks[1].newLines).to.equal(2);
      expect(dbHunksCollectionData[2].hunks[1].newStart).to.equal(4);
      expect(dbHunksCollectionData[2].hunks[1].oldLines).to.equal(0);
      expect(dbHunksCollectionData[2].hunks[1].oldStart).to.equal(2);
    });
  });
});
