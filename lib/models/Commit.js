'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const log = require('debug')('git:commit');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError');

const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date', 'stats', 'webUrl'],
  keyAttribute: 'sha'
});

/**
 * get or create an new commit and connect it to its parents
 *
 * @param repo contains the repository object
 * @param nCommit contains the current commit that is created by the given repo object and holds the required data
 * @param urlProvider contains the given remote vcs webapp provider to link them
 * @returns Commit returns an already existing or newly created commit
 */
Commit.persist = function(repo, nCommit, urlProvider) {
  if (!repo || !nCommit) {
    throw IllegalArgumentError('repository and git-commit has to be set!');
  }

  const sha = nCommit.id().toString();

  return Commit.findById(sha).then(function(instance) {
    if (instance) {
      log('Skipped', sha);

      return instance;
    }

    log('Processing', sha);

    const parentShas = [];
    for (let i = 0; 'parentcount' in nCommit && i < nCommit.parentcount(); i++) {
      parentShas.push(nCommit.parentId(i).toString());
    }

    // create new commit and link it to its parent commits
    return Commit.create(
      {
        sha,
        signature: nCommit.committer().toString(),
        date: nCommit.date(),
        message: nCommit.message(),
        webUrl: urlProvider ? urlProvider.getCommitUrl(sha) : '',
        stats: {
          additions: 0,
          deletions: 0
        }
      },
      { isNew: true }
    ).tap(function(commit) {
      return Promise.all(
        Promise.map(parentShas, parentSha => {
          return Commit.findById(parentSha).then(parentCommit => commit.connect(parentCommit));
        })
      );
    });
  });
};

/**
 * process and store a commit and its associated data objects
 *
 * @param repo contains the repository object
 * @param nCommit contains the current commit that is created by the given repo object and holds the required data
 * @param urlProvider contains the given remote vcs webapp provider to link them
 * @param gateway contains the given gateway object to process commits based on various registered services
 * @returns {*}
 */
Commit.prototype.processTree = function(repo, nCommit, urlProvider, gateway) {
  return Promise.cast(nCommit.getDiffWithOptions({ contextLines: 0 })).map(diff => {
    return Promise.cast(diff.patches())
      .map(async patch => {
        const newFile = patch.newFile().path();
        const stats = patch.lineStats();

        if (!this.stats || this.justCreated) {
          this.stats.additions += stats.total_additions;
          this.stats.deletions += stats.total_deletions;
        }

        const blob = Promise.resolve(nCommit.getEntry(newFile))
          .then(e => e.getBlob())
          .catch(/the path '.*' does not exist in the given tree/, () => null);

        const file = File.ensureByPath(newFile, { webUrl: urlProvider.getFileUrl(await repo.getCurrentBranch(), newFile) }).spread(f => f);

        return Promise.join(
          file,
          file.then(fileDAO => fileDAO.detectLanguage(nCommit, gateway)),
          blob.then(b => (b ? _.sumBy(b.toString(), ch => +(ch && ch.toString() === '\n')) : 0)),
          { additions: stats.total_additions, deletions: stats.total_deletions },
          Promise.resolve(patch.hunks()).map(hunk => ({
            webUrl: urlProvider ? urlProvider.getHunkUrl(nCommit.id(), newFile, hunk.newStart(), hunk.newLines()) : null,
            newLines: hunk.newLines(),
            newStart: hunk.newStart(),
            oldLines: hunk.oldLines(),
            oldStart: hunk.oldStart()
          })),
          this.save()
        ).spread((file, languageContainer, lineCount, stats, hunks) => ({
          file,
          languageContainer,
          lineCount,
          stats,
          hunks
        }));
      })
      .map(async patch =>
        // create connection obj
        Object.assign(patch, {
          hunkConnection: !this.justCreated
            ? null
            : await this.connect(patch.file, { lineCount: patch.lineCount, hunks: patch.hunks, stats: patch.stats })
        })
      );
  });
};

/**
 * create a connection for each stakeholder and all of their commits
 *
 * @returns {*}
 */
Commit.deduceStakeholders = async function() {
  const CommitStakeholderConnection = require('./CommitStakeholderConnection.js');
  const Stakeholder = require('./Stakeholder.js');

  // walk through all commits
  return Promise.resolve(
    Commit.rawDb.query(
      aql`
    FOR commit IN ${Commit.collection}
        LET stakeholders = (FOR stakeholder
                    IN
                    INBOUND commit ${CommitStakeholderConnection.collection}
                        RETURN stakeholder)
        FILTER LENGTH(stakeholders) == 0
        COLLECT sig = commit.signature INTO commitsPerSignature = commit
        RETURN {
          "signature": sig,
          "commits": commitsPerSignature
        }`
    )
  )
    .then(cursor => cursor.all())
    .each(signature => {
      // try to get an already existing stakeholder with that signature
      return Stakeholder.ensureByGitSignature(signature.signature).spread(stakeholder => {
        // walk over all commits with that signature
        return Promise.map(signature.commits, rawCommit => {
          // assign the commit to the stakeholder
          return Commit.parse(rawCommit).connect(stakeholder);
        });
      });
    });
};

module.exports = Commit;
