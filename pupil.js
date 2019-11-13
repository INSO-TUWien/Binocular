#!/usr/bin/env node
'use strict';

/**
 * Main entry point of the pupil application
 */

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
const Clone = require('./lib/models/Clone.js');
const LastRevision = require('./lib/models/LastRevision.js');
const CommitStakeholderConnection = require('./lib/models/CommitStakeholderConnection.js');
const IssueStakeholderConnection = require('./lib/models/IssueStakeholderConnection.js');
const IssueCommitConnection = require('./lib/models/IssueCommitConnection.js');
const CommitCommitConnection = require('./lib/models/CommitCommitConnection.js');
const CloneCloneConnection = require('./lib/models/CloneCloneConnection.js');
const CloneCommitConnection = require('./lib/models/CloneCommitConnection.js');
const CloneFileConnection = require('./lib/models/CloneFileConnection.js');

// set up the endpoints
app.get('/api/commits', require('./lib/endpoints/get-commits.js'));
app.get('/api/config', require('./lib/endpoints/get-config.js'));

// proxy to the FOXX-service
app.get('/graphQl', require('./lib/endpoints/graphQl.js'));
app.post('/graphQl', require('./lib/endpoints/graphQl.js'));

// configuration endpoint (not really used atm)
app.post('/api/config', require('./lib/endpoints/update-config.js'));

const port = config.get().port;

httpServer.listen(port, function() {
  console.log(`Listening on http://localhost:${port}`);
  if (argv.ui && argv.open) {
    opn(`http://localhost:${port}/`);
  }
});

const indexers = {
  vcs: null,
  its: null,
  ci: null,
  clones: null
};

let reporter = new ProgressReporter(io, ['commits', 'issues', 'builds', 'clones']);

// kickstart the indexing process
Repository.fromPath(ctx.targetPath)
  .tap(function(repo) {
    ctx.repo = repo;
    config.setSource(repo.pathFromRoot('.pupilrc'));

    // configure everything in the context
    require('./lib/setup-db.js');

    return ensureDb(repo);
  })
  .then(function() {
    // be sure to re-index when the configuration changes
    config.on('updated', () => {
      reIndex(); // do not wait for indexing to complete on config update

      // explicitly return null to silence bluebird warning
      return null;
    });

    // immediately run all indexers
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

      if (ctx.argv.clones) {
        indexers.clones = idx.makeClonesIndexer(ctx.repo, reporter);
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

/**
 * Ensures that the db is set up correctly and the GraphQL-Service is installed
 */
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
        Clone.ensureCollection(),
        LastRevision.ensureCollection(),
        CommitStakeholderConnection.ensureCollection(),
        IssueStakeholderConnection.ensureCollection(),
        IssueCommitConnection.ensureCollection(),
        CommitCommitConnection.ensureCollection(),
        CloneCloneConnection.ensureCollection(),
        CloneCommitConnection.ensureCollection(),
        CloneFileConnection.ensureCollection()
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
