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
const CommitBlameHunkConnection = require('./lib/models/CommitBlameHunkConnection.js');
const BlameHunkFileConnection = require('./lib/models/BlameHunkFileConnection.js');

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
    config.setSource(ctx.repo.pathFromRoot('.pupilrc'));
    config.ensure('gitlab.url', url);

    config.on('updated', reIndex);

    return reIndex();

    function reIndex() {
      gitlabIndexer.configure(config.get().gitlab);

      return (Promise.join(localIndexer.index() /*, gitlabIndexer.index()*/)
          // .then(() => ctx.models.Commit.deduceUsers())
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

// #!/usr/bin/env node

// 'use strict';

// require( './lib/context.js' );

// const _ = require( 'lodash' );
// const Promise = require( 'bluebird' );
// const git = require( './lib/git.js' );
// const path = require( 'path' );

// const { db } = require( './lib/context.js' );
// const config = require( './lib/config.js' );

// return Promise.resolve( git.getRepoPath() )
// .bind( {} )
// .then( function( repoPath ) {
//   const name = path.basename( path.dirname(repoPath) );
//   this.dbName = config.arango.database || name;
//   this.repoPath = repoPath;

//   return db.ensureDatabase( this.dbName );
// } )
// .then( function() {

//   return Promise.join(
//     db.ensureCollection( 'commits' ),
//     db.ensureEdgeCollection( 'commit-parents' )
//   );
// } )
// .spread( function( commitCollection, parentsCollection ) {
//   this.commitCollection = commitCollection;
//   this.parentsCollection = parentsCollection;

//   return db.ensureGraph( 'commit-network', {
//     edgeDefinitions: [ {
//       collection: 'commit-parents',
//       from: ['commits'],
//       to: ['commits']
//     } ]
//   } );
// } )
// .then( function( network ) {
//   this.network = network;

//   return git.getAllCommits( this.repoPath );
// } )
// .map( function( commit ) {

//   const sha = commit.id().toString();
//   return Promise.bind( this )
//   .then( () => this.commitCollection.lookupByKeys([sha]) )
//   .then( function( c ) {
//     if( c.length === 0 ) {
//       console.log( 'Persisting', sha );
//       return this.commitCollection.save( {
//         sha: commit.id().toString(),
//         _key: commit.id().toString(),
//         message: commit.message()
//       } );
//     } else {
//       console.log( 'Omitting', sha, '(already present)' );
//     }
//   } )
//   .thenReturn( commit );
// } )
// .map( function( commit ) {

//   return Promise.bind( this )
//   .then( () => commit.parents() )
//   .map( function( parentOid ) {
//     const parent = parentOid.toString();

//     this.parentsCollection.save( {}, `commits/${commit.id().toString()}`, `commits/${parent}` );
//   } );
// } );

function ensureDb(repo) {
  return ctx.db.ensureDatabase(repo.getName()).then(function() {
    return Promise.join(
      ctx.db.ensureService(path.join(__dirname, 'foxx'), '/pupil-ql'),
      Commit.ensureCollection(),
      File.ensureCollection(),
      BlameHunk.ensureCollection(),
      CommitBlameHunkConnection.ensureCollection(),
      BlameHunkFileConnection.ensureCollection()
    );
  });
}
