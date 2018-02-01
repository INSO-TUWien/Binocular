#!/usr/bin/env node

'use strict';

const ctx = require('./lib/context.js');

const opn = require('opn');
const _ = require('lodash');
const Promise = require('bluebird');

Promise.config({
  longStackTraces: true
});

const Repository = require('./lib/git.js');
const { app, argv, httpServer, io } = require('./lib/context.js');
const config = require('./lib/config.js');
const idx = require('./lib/indexers');
const getUrlProvider = require('./lib/url-providers');
const ProgressReporter = require('./lib/progress-reporter.js');
const path = require('path');
const Commit = require('./lib/models/Commit.js');
const File = require('./lib/models/File.js');
const Hunk = require('./lib/models/Hunk.js');
const Issue = require('./lib/models/Issue.js');
const Build = require('./lib/models/Build.js');
const Stakeholder = require('./lib/models/Stakeholder.js');
const CommitStakeholderConnection = require('./lib/models/CommitStakeholderConnection.js');
const IssueStakeholderConnection = require('./lib/models/IssueStakeholderConnection.js');
const IssueCommitConnection = require('./lib/models/IssueCommitConnection.js');
const CommitCommitConnection = require('./lib/models/CommitCommitConnection.js');

app.get('/api/commits', require('./lib/endpoints/get-commits.js'));
app.get('/api/config', require('./lib/endpoints/get-config.js'));
app.get('/graphQl', require('./lib/endpoints/graphQl.js'));
app.post('/graphQl', require('./lib/endpoints/graphQl.js'));
app.post('/api/config', require('./lib/endpoints/update-config.js'));

const port = config.get().port;

httpServer.listen(port, function() {
  console.log(`Pupil listening on http://localhost:${port}`);
  if (argv.ui && argv.open) {
    opn(`http://localhost:${port}/`);
  }
});

const indexers = {
  vcs: null,
  its: null,
  ci: null
};

let reporter = new ProgressReporter(io, ['commits', 'issues', 'builds']);

Repository.fromPath(ctx.targetPath)
  .tap(function(repo) {
    ctx.repo = repo;
    config.setSource(repo.pathFromRoot('.pupilrc'));

    require('./lib/setup-db.js');

    return ensureDb(repo);
  })
  .then(function() {
    config.on('updated', () => {
      reIndex(); // do not wait for indexing to complete on config update

      // explicitly return null to silence bluebird warning
      return null;
    });

    return reIndex();

    function reIndex() {
      console.log('Indexing data...');
      indexers.vcs = idx.makeVCSIndexer(ctx.repo, reporter);

      if (ctx.argv.its) {
        indexers.its = idx.makeITSIndexer(ctx.repo, reporter);
      }

      if (ctx.argv.ci) {
        indexers.ci = idx.makeCIIndexer(ctx.repo, reporter);
      }

      return getUrlProvider(ctx.repo)
        .then(urlProvider => (ctx.urlProvider = urlProvider))
        .then(() => Promise.props(indexers))
        .thenReturn(_.values(indexers))
        .filter(indexer => indexer !== null)
        .map(indexer => indexer.index())
        .then(() => Commit.deduceStakeholders())
        .then(() => Issue.deduceStakeholders())
        .then(() => createManualIssueReferences(config.get('issueReferences')))
        .then(() => console.log('Indexing finished'))
        .catch(e => e.name === 'Gitlab401Error', function() {
          console.warn(
            'Unable to access GitLab API. Please configure a valid private access token in the UI.'
          );
        });
    }
  });

process.on('SIGINT', function() {
  if (ctx.quitRequested) {
    console.log('Shutting down immediately!');
    process.exit(1);
  }

  console.log('Let me finish up here, ... (Ctrl+C to force quit)');

  ctx.quit();
  _(indexers).values().each(idx => idx.stop());
});

function ensureDb(repo) {
  return ctx.db
    .ensureDatabase('pupil-' + repo.getName())
    .then(function() {
      if (argv.clean) {
        return ctx.db.truncate();
      }
    })
    .then(function() {
      return Promise.join(
        ctx.db.ensureService(path.join(__dirname, 'foxx'), '/pupil-ql'),
        Commit.ensureCollection(),
        File.ensureCollection(),
        Hunk.ensureCollection(),
        Stakeholder.ensureCollection(),
        Issue.ensureCollection(),
        Build.ensureCollection(),
        CommitStakeholderConnection.ensureCollection(),
        IssueStakeholderConnection.ensureCollection(),
        IssueCommitConnection.ensureCollection(),
        CommitCommitConnection.ensureCollection()
      );
    });
}

function createManualIssueReferences(issueReferences) {
  return Promise.map(_.keys(issueReferences), sha => {
    const iid = issueReferences[sha];

    return Promise.join(
      Commit.findOneBySha(sha),
      Issue.findOneByIid(iid)
    ).spread((commit, issue) => {
      if (!commit) {
        console.warn(`Ignored issue #${iid} referencing non-existing commit ${sha}`);
        return;
      }
      if (!issue) {
        console.warn(
          `Ignored issue #${iid} referencing commit ${sha} because the issue does not exist`
        );
        return;
      }

      const existingMention = _.find(issue.mentions, mention => mention.commit === sha);
      if (!existingMention) {
        issue.mentions.push({
          createdAt: commit.date,
          commit: sha,
          manual: true
        });
        return issue.save();
      }
    });
  });
}
