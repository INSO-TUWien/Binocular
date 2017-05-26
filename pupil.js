#!/usr/bin/env node

'use strict';

const ctx = require('./lib/context.js');

const opn = require('opn');
const Promise = require('bluebird');

Promise.config({
  longStackTraces: true
});

const Repository = require('./lib/git.js');
const { app, argv, httpServer, io } = require('./lib/context.js');
const config = require('./lib/config.js');
const LocalIndexer = require('./lib/indexers/LocalIndexer.js');
const GitLabIndexer = require('./lib/indexers/GitLabIndexer.js');
const ProgressReporter = require('./lib/progress-reporter.js');
const path = require('path');
const Commit = require('./lib/models/Commit.js');
const File = require('./lib/models/File.js');
const BlameHunk = require('./lib/models/BlameHunk.js');
const Stakeholder = require('./lib/models/Stakeholder.js');
const CommitBlameHunkConnection = require('./lib/models/CommitBlameHunkConnection.js');
const BlameHunkFileConnection = require('./lib/models/BlameHunkFileConnection.js');
const CommitStakeholderConnection = require('./lib/models/CommitStakeholderConnection.js');
const BlameHunkStakeholderConnection = require('./lib/models/BlameHunkStakeholderConnection.js');

app.get('/api/commits', require('./lib/endpoints/get-commits.js'));
app.get('/api/config', require('./lib/endpoints/get-config.js'));
app.post('/api/config', require('./lib/endpoints/update-config.js'));

const port = config.get().port;

const server = httpServer.listen(port, function() {
  console.log(`Pupil listening on http://localhost:${port}`);
  if (argv.ui && argv.open) {
    opn(`http://localhost:${port}/`);
  }
});

let localIndexer, gitlabIndexer;

let reporter = new ProgressReporter(io);

Repository.fromPath(ctx.targetPath)
  .tap(function(repo) {
    ctx.repo = repo;
    config.setSource(repo.pathFromRoot('.pupilrc'));

    require('./lib/setup-db.js');

    return ensureDb(repo);
  })
  .then(function(repo) {
    localIndexer = new LocalIndexer(repo, reporter);
    gitlabIndexer = new GitLabIndexer(repo, reporter);

    return guessGitLabApiUrl(repo);
  })
  .delay(2500)
  .then(function(url) {
    config.ensure('gitlab.url', url);
    config.on('updated', reIndex);

    return reIndex();

    function reIndex() {
      gitlabIndexer.configure(config.get().gitlab);

      return (Promise.join(localIndexer.index() /*, gitlabIndexer.index()*/)
          .then(() => Commit.deduceStakeholders())
          // .then(() => ctx.models.Issue.deduceUsers())
          // .then(() => ctx.models.BlameHunk.deduceUsers())
          .catch(e => e.name === 'Gitlab401Error', function() {
            console.warn(
              'Unable to access GitLab API. Please configure a valid private access token in the UI.'
            );
          }) );
    }
  })
  .then(function() {
    return guessGitLabApiUrl(ctx.repo);
  });

process.on('SIGINT', function() {
  if (ctx.quitRequested) {
    console.log('Shutting down immediately!');
    process.exit(1);
  }

  ctx.quitRequested = true;
  console.log('Let me finish up here, ... (Ctrl+C to force quit)');

  server.close();

  localIndexer.stop();
  gitlabIndexer.stop();
});

function guessGitLabApiUrl(repo) {
  return repo.getOriginUrl().then(function(url) {
    const match = url.match(/git@(.*):(.*)\/(.*)\.git/);
    if (match) {
      return `https://${match[1]}`;
    } else {
      return 'https://gitlab.com';
    }
  });
}

function ensureDb(repo) {
  return ctx.db
    .ensureDatabase(repo.getName())
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
        BlameHunk.ensureCollection(),
        Stakeholder.ensureCollection(),
        CommitBlameHunkConnection.ensureCollection(),
        BlameHunkFileConnection.ensureCollection(),
        CommitStakeholderConnection.ensureCollection(),
        BlameHunkStakeholderConnection.ensureCollection()
      );
    });
}
