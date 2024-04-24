'use strict';

import { expect } from 'chai';
import fake from './helper/git/repositoryFake.js';
import ReporterMock from './helper/reporter/reporterMock';
import conf from '../../lib/config.js';

import Db from '../../lib/core/db/db';

import ctx from '../../lib/context';

import GitLabBaseIndexerMock from './helper/gitlab/gitLabBaseIndexerMock';

import OctokitMock from './helper/github/octokitMock';

import GitLabITSIndexer from './helper/gitlab/gitLabITSIndexerRewire.js';

import BaseGitLabIndexer from '../../lib/indexers/BaseGitLabIndexer.js';

import GitHubMock from './helper/github/gitHubMock';
import GitHubITSIndexer from '../../lib/indexers/its/GitHubITSIndexer';

import Issue from '../../lib/models/Issue';
import MergeRequest from '../../lib/models/MergeRequest';
import Stakeholder from '../../lib/models/Stakeholder';
import IssueStakeholderConnection from '../../lib/models/IssueStakeholderConnection';
import sinon from 'sinon';
import JiraITSIndexer from '../../lib/indexers/its/JiraITSIndexer';
import Milestone from '../../lib/models/Milestone.js';
import JiraMock from './helper/jira/jiraMock';

const config = conf.get();

describe('its', function () {
  const db = new Db(config.arango);
  const reporter = new ReporterMock(['issues', 'mergeRequests', 'milestones']);

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

  describe('#indexJira', function () {
    it('should index all Jira milestones and create all necessary db collections', async function () {
      const repo = await fake.repository();

      //setup DB
      await db.ensureDatabase('test');

      await Milestone.ensureCollection();

      const jiraITSIndexer = new JiraITSIndexer(repo, reporter);
      jiraITSIndexer.setJira(new JiraMock());
      const buildMentionsStub = sinon.stub(jiraITSIndexer, 'buildMentions');
      const processWorklogStub = sinon.stub(jiraITSIndexer, 'processWorklog');
      const processCommentsStub = sinon.stub(jiraITSIndexer, 'processComments');
      const processChangelogStub = sinon.stub(jiraITSIndexer, 'processChangelog');
      const getUpdatedUserObjectStub = sinon.stub(jiraITSIndexer, 'getUpdatedUserObject');
      const createNotesObjectStub = sinon.stub(jiraITSIndexer, 'createNotesObject');
      buildMentionsStub.returns([]);
      processWorklogStub.returns([]);
      processCommentsStub.returns([]);
      processChangelogStub.returns([]);
      getUpdatedUserObjectStub.returns({});
      createNotesObjectStub.returns([]);
      await db.truncate();
      await jiraITSIndexer.index();
      const dbMilestonesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'milestones' })).all();

      expect(dbMilestonesCollectionData.length).to.equal(2);
      expect(dbMilestonesCollectionData[0].id).to.not.equal(dbMilestonesCollectionData[1].id);
    });

    it('should index all Jira issues and merge requests create all necessary db collections', async function () {
      const repo = await fake.repository();

      //setup DB
      await db.ensureDatabase('test');

      await Issue.ensureCollection();
      await MergeRequest.ensureCollection();
      await Stakeholder.ensureCollection();
      await IssueStakeholderConnection.ensureCollection();
      await db.truncate();

      const jiraITSIndexer = new JiraITSIndexer(repo, reporter);
      // jiraITSIndexer['jira'] = sinon.createStubInstance(JiraMock);
      jiraITSIndexer.setJira(new JiraMock());

      const buildMentionsStub = sinon.stub(jiraITSIndexer, 'buildMentions');
      const processWorklogStub = sinon.stub(jiraITSIndexer, 'processWorklog');

      const processCommentsStub = sinon.stub(jiraITSIndexer, 'processComments');
      const processChangelogStub = sinon.stub(jiraITSIndexer, 'processChangelog');
      const createNotesObjectStub = sinon.stub(jiraITSIndexer, 'createNotesObject');

      buildMentionsStub.returns([
        {
          commit: '123',
          createdAt: 2024,
          closes: true,
        },
      ]);
      processWorklogStub.returns([]);
      processChangelogStub.returns([]);

      processCommentsStub.returns([]);
      createNotesObjectStub.returns([]);

      await jiraITSIndexer.index();

      const dbIssuesCollectionData = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues' })).all();

      expect(dbIssuesCollectionData.length).to.equal(2);
      expect(dbIssuesCollectionData[0].mentions[0].commit).to.equal('123');
      expect(dbIssuesCollectionData[0].assignee.login).to.equal('am');

      expect(dbIssuesCollectionData[1].mentions.length).to.equal(1);
      expect(dbIssuesCollectionData[1].assignee.login).to.equal('am');

      expect(dbIssuesCollectionData[0].id).to.not.equal(dbIssuesCollectionData[1].id);
      expect(processWorklogStub.calledTwice).to.equal(true);
      expect(processWorklogStub.getCall(0).args[0].id).to.not.equal(processWorklogStub.getCall(1).args[0].id);

      const dbMergeRequestsCollectionData = await (
        await db.query('FOR i IN @@collection RETURN i', { '@collection': 'mergeRequests' })
      ).all();

      expect(dbMergeRequestsCollectionData.length).to.equal(1);
      expect(dbMergeRequestsCollectionData[0].id).to.equal('42');
      expect(dbMergeRequestsCollectionData[0].createdAt).to.equal('2022-01-01T00:00:00.000Z');
    });
  });
});
