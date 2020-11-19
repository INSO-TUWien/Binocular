'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const log = require('debug')('git');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');

const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date', 'stats', 'webUrl'],
  keyAttribute: 'sha'
});

Commit.persist = function(nCommit, urlProvider = null) {
  const sha = nCommit.id().toString();

  return Commit.findById(sha).then(function(instance) {
    if (!instance) {
      log('Processing', sha);

      const parentShas = [];
      for (let i = 0; i < nCommit.parentcount(); i++) {
        parentShas.push(nCommit.parentId(i).toString());
      }

      return Commit.create({
        sha,
        signature: nCommit.committer().toString(),
        date: nCommit.date(),
        message: nCommit.message(),
        webUrl: urlProvider ? urlProvider.getCommitUrl(sha) : null,
        stats: {
          additions: 0,
          deletions: 0
        }
      })
        .tap(function(commit) {
          return Promise.join(
            commit.processTree(nCommit, urlProvider),
            Promise.map(parentShas, parentSha => {
              return Commit.findById(parentSha).then(parentCommit => commit.connect(parentCommit));
            })
          );
        })
        .then(commit => [commit, true]);
    }

    log('Skipped', sha);

    return [instance, false];
  });
};

Commit.prototype.processTree = function(nCommit, urlProvider) {
  const self = this;

  return Promise.resolve(nCommit.getDiffWithOptions({ contextLines: 0 })).map(diff => {
    return Promise.resolve(diff.patches())
      .map(patch => {
        const newFile = patch.newFile().path();
        const stats = patch.lineStats();

        self.stats = {
          additions: stats.total_additions,
          deletions: stats.total_deletions
        };

        return Promise.join(
          File.ensureByPath(newFile, { webUrl: urlProvider.getFileUrl('master', newFile) }).spread(
            f => f
          ),
          Promise.resolve(nCommit.getEntry(newFile))
            .then(e => e.getBlob())
            .then(b => _.sumBy(b.toString(), ch => ch === '\n'))
            .catch(/the path '.*' does not exist in the given tree/, () => {
              return 0;
            }),
          Promise.resolve(patch.hunks()).map(hunk => ({
            webUrl: urlProvider
              ? urlProvider.getHunkUrl(nCommit.sha(), newFile, hunk.newStart(), hunk.newLines())
              : null,
            newLines: hunk.newLines(),
            newStart: hunk.newStart(),
            oldLines: hunk.oldLines(),
            oldStart: hunk.oldStart()
          })),
          self.save()
        ).spread((file, lineCount, hunks) => ({ file, lineCount, hunks }));
      })
      .map(patch => {
        return self.connect(patch.file, {
          lineCount: patch.lineCount,
          hunks: patch.hunks
        });
      });
  });
};

Commit.deduceStakeholders = function() {
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
    .each(function(signature) {
      // try to get an already existing stakeholder with that signature
      return Stakeholder.ensureByGitSignature(signature.signature).spread(function(stakeholder) {
        // walk over all commits with that signature
        return Promise.map(signature.commits, function(rawCommit) {
          // assign the commit to the stakeholder
          return Commit.parse(rawCommit).connect(stakeholder);
        });
      });
    });
};

module.exports = Commit;
