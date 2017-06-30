'use strict';

const Promise = require('bluebird');
const Git = require('nodegit');
const log = require('debug')('git');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');
const BlameHunk = require('./BlameHunk.js');

const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date'],
  keyAttribute: 'sha'
});

Commit.persist = function(nCommit) {
  const sha = nCommit.id().toString();

  return Commit.findById(sha).then(function(instance) {
    if (!instance) {
      log('Processing', sha);
      return Commit.create({
        sha,
        signature: nCommit.committer().toString(),
        date: nCommit.date(),
        message: nCommit.message()
      })
        .tap(function(commit) {
          return commit.processTree(nCommit);
        })
        .then(commit => [commit, true]);
    }

    log('Skipped', sha);

    return [instance, false];
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

Commit.prototype.processTree = function(nCommit) {
  const self = this;
  return Promise.resolve(nCommit.getTree()).then(function(tree) {
    return walkTree(tree.entries(), function(entry) {
      const opt = new Git.BlameOptions();
      opt.newestCommit = nCommit.id();
      opt.oldestCommit = nCommit.id();

      return Promise.join(
        File.ensureByPath(entry.path()).spread(f => f),
        Git.Blame.file(nCommit.repo, entry.path(), opt)
      ).spread(function(file, blame) {
        const promises = [];
        const n = blame.getHunkCount();

        for (let i = 0; i < n; i++) {
          const hunk = blame.getHunkByIndex(i);

          const p = BlameHunk.create({
            startLine: hunk.finalStartLineNumber(),
            lineCount: hunk.linesInHunk(),
            signature: nCommit.committer().toString()
          }).then(function(hunk) {
            return Promise.join(self.connect(hunk), hunk.connect(file));
          });

          promises.push(p);
        }

        return Promise.all(promises);
      });
    });
  });
};

// const Commit = ctx.sequelize.define(
//   'Commit',
//   {
//     id: {
//       type: Sequelize.STRING,
//       primaryKey: true,
//       allowNull: false
//     },
//     message: Sequelize.STRING,
//     signature: Sequelize.STRING,
//     date: Sequelize.DATE
//   },
//   {
//     timestamps: true,
//     createdAt: false,
//     updatedAt: 'cachedAt',

//     instanceMethods: {
//       processTree: function(nCommit) {
//         const File = ctx.models.File;
//         const BlameHunk = ctx.models.BlameHunk;
//         const self = this;

//         return Promise.resolve(nCommit.getTree()).then(function(tree) {
//           return walkTree(tree.entries(), function(entry) {
//             const opt = new Git.BlameOptions();
//             opt.newestCommit = nCommit.id();
//             opt.oldestCommit = nCommit.id();

//             // log( ' * ', entry.path() );

//             return Promise.join(
//               File.ensure(entry.path()),
//               Git.Blame.file(nCommit.repo, entry.path(), opt)
//             ).spread(function(file, blame) {
//               const hunkData = [];
//               const n = blame.getHunkCount();

//               for (let i = 0; i < n; i++) {
//                 const hunk = blame.getHunkByIndex(i);

//                 hunkData.push({
//                   CommitId: self.id,
//                   FileId: file.id,
//                   startLine: hunk.finalStartLineNumber(),
//                   lineCount: hunk.linesInHunk(),
//                   signature: nCommit.committer().toString()
//                 });
//               }

//               return BlameHunk.bulkCreate(hunkData);
//             });
//           });
//         });
//       }
//     },

//     classMethods: {
//       persist: function(nCommit) {
//         const sha = nCommit.id().toString();

//         return Commit.findById(sha).then(function(instance) {
//           if (!instance) {
//             log('Processing', sha);
//             return Commit.create({
//               id: sha,
//               signature: nCommit.committer().toString(),
//               date: nCommit.date(),
//               message: nCommit.message()
//             })
//               .tap(function(commit) {
//                 return commit.processTree(nCommit);
//               })
//               .then(commit => [commit, true]);
//           }

//           log('Skipped', sha);

//           return [instance, false];
//         });
//       },

//       /**
//      * Assign users to all commits that do not already have users assigned. If a commit with an unknown signature is
//      * found, a new user is created for it.
//      **/
//       deduceUsers: function() {
//         // walk through all commits
//         return Commit.findAll({
//           where: { CommitterId: null }
//         }).map(
//           function(commit) {
//             // try to get an already existing user with that signature
//             return User.findOne({ where: { gitSignature: commit.signature } })
//               .then(function(user) {
//                 if (!user) {
//                   // user does not exist => create
//                   return User.create({ gitSignature: commit.signature });
//                 }

//                 return user;
//               })
//               .then(function(user) {
//                 // assign the commit to the user
//                 return commit.update({ CommitterId: user.id });
//               });
//           },
//           { concurrency: 1 }
//         );
//       }
//     }
//   }
// );

// Commit.belongsTo(User, { as: 'Committer' });
// User.hasMany(Commit, { foreignKey: 'CommitterId' });

module.exports = Commit;

function walkTree(entries, fn) {
  return Promise.map(entries, function(entry) {
    if (entry.isTree()) {
      return entry.getTree().then(sub => walkTree(sub.entries(), fn));
    }

    return fn(entry);
  });
}
