'use strict';

const chai = require('chai');

const fake = require('./helper/git/repositoryFake.js');
const helpers = require('./helper/git/helpers.js');
const GatewayMock = require('./helper/gateway/gatewayMock');
const ReporterMock = require('./helper/reporter/reporterMock');

const Db = require('../../lib/core/db/db').default;
const Commit = require('../../lib/models/Commit').default;
const Hunk = require('../../lib/models/Hunk').default;
const File = require('../../lib/models/File').default;
const Language = require('../../lib/models/Language').default;
const LanguageFileConnection = require('../../lib/models/LanguageFileConnection').default;
const Branch = require('../../lib/models/Branch').default;
const Module = require('../../lib/models/Module').default;
const ModuleFileConnection = require('../../lib/models/ModuleFileConnection').default;
const CommitModuleConnection = require('../../lib/models/CommitModuleConnection').default;
const BranchFileConnection = require('../../lib/models/BranchFileConnection').default;
const ModuleModuleConnection = require('../../lib/models/ModuleModuleConnection').default;
const CommitFileStakeholderConnection = require('../../lib/models/CommitFileStakeholderConnection').default;

const config = require('../../lib/config.js').get();
const ctx = require('../../lib/context').default;
const GitHubUrlProvider = require('../../lib/url-providers/GitHubUrlProvider').default;

const VcsIndexer = require('../../lib/indexers/vcs').default;

const expect = chai.expect;

describe('vcs', function () {
  const db = new Db(config.arango);
  const gateway = new GatewayMock();
  const reporter = new ReporterMock(['commits', 'files', 'languages', 'filesLanguage', 'modules']);
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
      await db.ensureDatabase('test');
      await db.truncate();
      await Commit.ensureCollection();
      await Hunk.ensureCollection();
      await File.ensureCollection();
      await Language.ensureCollection();
      await LanguageFileConnection.ensureCollection();
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

      const gitIndexer = VcsIndexer(repo, urlProvider, reporter, true);
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
