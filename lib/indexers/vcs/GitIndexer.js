'use strict';

const log = require('debug')('idx:vcs:git');

const Commit = require('../../models/Commit.js');
const File = require('../../models/File.js');
const Branch = require('../../models/Branch.js');
const getUrlProvider = require('../../url-providers');

function GitIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitIndexer.prototype.index = function() {
  let omitCount = 0;
  let persistCount = 0;

  let total = 0;
  let urlProvider;

  return getUrlProvider(this.repo)
    .then(_urlProvider => {
      urlProvider = _urlProvider;
      log('Counting commits...');
    })
    .then(() => this.repo.walk(() => total++))
    .then(()=>{
        Promise.resolve(this.repo.getCurrentBranch()).then(currentBranch=>{
          let currentBranchName = currentBranch.shorthand();
          Promise.resolve(this.repo.getAllBranches()).then(branches=>{
            for (let i in branches) {
              if(branches[i].startsWith("refs/remotes/origin/")){
                let name = branches[i].substring(20);
                if(name!=="HEAD"){
                  let branch = {branchName:name,id:i,currentActive:name===currentBranchName}
                  Branch.persist(branch);
                }
              }
            }
          })
        });
      }
    )
    .then(() => {
      this.reporter.setCommitCount(total);
      log('Processing', total, 'commits');

      return this.repo
        .walk(commit => {
          if (this.stopping) {
            return;
          }

          return Commit.persist(commit, urlProvider).bind(this).spread(function(c, wasCreated) {
            if (wasCreated) {
              persistCount++;
            } else {
              omitCount++;
            }

            this.reporter.finishCommit();

            log(`${omitCount + persistCount}/${total} commits processed`);
            log(`${omitCount + persistCount}/${total} commits processed`);
          });
        }, null)
        .tap(function() {
          log('Persisted %d new commits (%d already present)', persistCount, omitCount);

          log('Deducing file lengths...');
          return File.deduceMaxLengths();
        })
        .then(() => log('Done'));
    });
};

GitIndexer.prototype.stop = function() {
  log('Stopping');
  this.stopping = true;
};

module.exports = GitIndexer;
