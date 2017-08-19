'use strict';

const Promise = require('bluebird');
const Git = require('nodegit');
const log = require('debug')('git');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');
const Hunk = require('./Hunk.js');

const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date', 'stats'],
  keyAttribute: 'sha'
});

Commit.persist = function(nCommit) {
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
        message: nCommit.message()
      })
        .tap(function(commit) {
          return Promise.join(
            commit.processTree(nCommit),
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

Commit.prototype.processTree = function(nCommit) {
  const self = this;

  return Promise.resolve(nCommit.getDiff()).map(diff => {
    return Promise.resolve(diff.patches()).map(patch => {
      const oldFile = patch.oldFile().path();
      const newFile = patch.newFile().path();
      const stats = patch.lineStats();

      self.stats = {
        additions: stats.total_additions,
        deletions: stats.total_deletions
      };

      return Promise.join(File.ensureByPath(newFile).spread(f => f), self.save()).spread(file => {
        return Promise.resolve(patch.hunks()).map(hunk => {
          return Hunk.create({
            newLines: hunk.newLines(),
            newStart: hunk.newStart(),
            oldLines: hunk.oldLines(),
            oldStart: hunk.oldStart()
          }).then(hunk => {
            return Promise.join(self.connect(hunk), hunk.connect(file));
          });
        });
      });
    });
  });

  // return Promise.resolve(nCommit.getTree()).then(function(tree) {
  //   return walkTree(tree.entries(), function(entry) {
  //     const opt = new Git.BlameOptions();
  //     opt.newestCommit = nCommit.id();

  //     return Promise.join(
  //       File.ensureByPath(entry.path()).spread(f => f),
  //       Git.Blame.file(nCommit.repo, entry.path(), opt)
  //     ).spread(function(file, blame) {
  //       const promises = [];
  //       const n = blame.getHunkCount();

  //       for (let i = 0; i < n; i++) {
  //         const hunk = blame.getHunkByIndex(i);

  //         const sig = hunk.finalSignature().toString();
  //         if (!(sig in self.linesPerAuthor)) {
  //           self.linesPerAuthor[sig] = 0;
  //         }

  //         self.linesPerAuthor[sig] += hunk.linesInHunk();

  //         if (hunk.finalCommitId().toString() === nCommit.sha()) {
  //           const p = BlameHunk.create({
  //             startLine: hunk.finalStartLineNumber(),
  //             lineCount: hunk.linesInHunk(),
  //             signature: sig
  //           }).then(function(hunk) {
  //             return Promise.join(self.connect(hunk), hunk.connect(file));
  //           });

  //           promises.push(p);
  //         }
  //       }

  //       promises.push(self.save());

  //       return Promise.all(promises);
  //     });
  //   });
  // });
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

function walkTree(entries, fn) {
  return Promise.map(entries, function(entry) {
    if (entry.isTree()) {
      return entry.getTree().then(sub => walkTree(sub.entries(), fn));
    }

    return fn(entry);
  });
}
