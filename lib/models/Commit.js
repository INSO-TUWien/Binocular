'use strict';

const _ = require('lodash');
const log = require('debug')('git:commit');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError');
const fast_myers_diff = require('fast-myers-diff');
const { exec } = require('child_process');
const ctx = require('../context.js');

const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date', 'stats', 'branch', 'history', 'parents', 'webUrl'],
  keyAttribute: 'sha',
});

/**
 * get or create an new commit and connect it to its parents
 *
 * @param repo contains the repository object
 * @param nCommit contains the current commit that is created by the given repo object and holds the required data
 * @param urlProvider contains the given remote vcs webapp provider to link them
 * @returns Commit returns an already existing or newly created commit
 */
Commit.persist = async function (repo, nCommit, urlProvider) {
  if (!repo || !nCommit) {
    throw IllegalArgumentError('repository and git-commit has to be set!');
  }

  const sha = nCommit.oid;

  return Commit.findById(sha).then(function (instance) {
    if (instance) {
      log('Skipped', sha);

      return instance;
    }

    log('Processing', sha);
    return getHistoryForCommit(sha).then((history) => {
      let parents = '';
      for (const i in nCommit.commit.parent) {
        parents += nCommit.commit.parent[i].toString();
        if (i < nCommit.commit.parent.length - 1) {
          parents += ',';
        }
      }

      // create new commit and link it to its parent commits
      return Commit.create(
        {
          sha,
          signature: nCommit.commit.author.name + ' <' + nCommit.commit.author.email + '>',
          date: new Date(nCommit.commit.author.timestamp * 1000),
          message: nCommit.commit.message,
          webUrl: urlProvider ? urlProvider.getCommitUrl(sha) : '',
          branch: nCommit.commit.branch,
          history: history,
          parents: parents,
          stats: {
            additions: 0,
            deletions: 0,
          },
        },
        { isNew: true }
      ).then(function (commit) {
        Promise.resolve(
          parents.split(',').map((parentSha) => {
            if (parentSha === '') {
              return;
            }
            return Commit.findById(parentSha).then((parentCommit) => commit.connect(parentCommit));
          })
        );
        return commit;
      });
    });
  });
};

/**
 * returns the history of a given sha
 * check with git shell command because this function is not yet implemented in isomorphicGit
 *
 * @param sha sha of commit to check
 *
 * @retruns history
 */
async function getHistoryForCommit(sha) {
  return (
    await new Promise((resolve) => {
      exec('cd ' + ctx.targetPath + ' && git log ' + sha + ' --format=format:%H', (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          resolve('');
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          resolve('');
        }
        resolve(stdout);
      });
    })
  )
    .split('\n')
    .join(',');
}

/**
 * process and store a commit and its associated data objects
 *
 * @param repo contains the repository object
 * @param nCommit contains the current commit that is created by the given repo object and holds the required data
 * @param currentBranch current checked out branch of the repository
 * @param urlProvider contains the given remote vcs webapp provider to link them
 * @param gateway contains the given gateway object to process commits based on various registered services
 * @returns {*}
 */
Commit.prototype.processTree = function (repo, nCommit, currentBranch, urlProvider, gateway) {
  return Promise.resolve(
    repo.getCommitChanges.bind(this)(
      repo,
      nCommit.oid,
      nCommit.commit.parent[0],
      async (filepath, parentCommitEntry, currentCommitEntry, commitFiles, parentCommitFiles) => {
        try {
          // ignore directories
          const currentOid = nCommit.oid;
          if (!(commitFiles.includes(filepath) || parentCommitFiles.includes(filepath))) {
            return;
          }
          const changes = [];

          let parentContent = '';
          let currentContent = '';
          let lineCount = 0;

          if (!(commitFiles.includes(filepath) || parentCommitFiles.includes(filepath))) {
            //File not in commit or parent commit
            return;
          } else if (commitFiles.includes(filepath) && !parentCommitFiles.includes(filepath)) {
            //file added
            currentContent = Buffer.from(await currentCommitEntry.content()).toString('utf8');
            lineCount = currentContent.split('\n').length - 1;
            changes.push({ lhs: { at: 0, del: 0 }, rhs: { at: 1, add: lineCount } });
          } else if (!commitFiles.includes(filepath) && parentCommitFiles.includes(filepath)) {
            //file deleted
            return;
            //index file deletions as changes
            //parentContent = Buffer.from(await parentCommitEntry.content()).toString('utf8');
            //const parentLineCount = parentContent.split('\n').length;
            //changes.push({ lhs: { at: 0, del: parentLineCount }, rhs: { at: 0, add: 0 } });
          } else {
            //file modified
            parentContent = Buffer.from(await parentCommitEntry.content()).toString('utf8');
            currentContent = Buffer.from(await currentCommitEntry.content()).toString('utf8');
            if (parentContent === currentContent) {
              return;
            }
            const currentContentLineArray = currentContent.split('\n');
            const parentContentLineArray = parentContent.split('\n');
            lineCount = currentContentLineArray.length - 1;

            if (parentContentLineArray.length < 2000) {
              const diff = fast_myers_diff.calcPatch(parentContentLineArray, currentContentLineArray);
              let nextChange = diff.next();

              /*const myersChanges = myers.diff(parentContent, currentContent, { compare: 'lines' });
            for (const myersChange of myersChanges) {
              if (myersChange.lhs.at !== myersChange.rhs.at) {
                console.log(myersChange);
              }
            }*/

              while (!nextChange.done) {
                changes.push({
                  lhs: { at: nextChange.value[0], del: nextChange.value[1] - nextChange.value[0] },
                  rhs: { at: nextChange.value[3] - nextChange.value[2].length, add: nextChange.value[2].length },
                });
                nextChange = diff.next();
              }
            } else {
              const currentContentChunks = _.chunk(currentContentLineArray, 1000);
              const parentContentChunks = _.chunk(parentContentLineArray, 1000);

              const biggerChunkCount =
                currentContentChunks.length > parentContentChunks.length ? currentContentChunks.length : parentContentChunks.length;

              for (let i = 0; i < biggerChunkCount; i++) {
                let currentContentChunk = [];
                let parentContentChunk = [];
                if (currentContentChunks[i] !== undefined) {
                  currentContentChunk = currentContentChunks[i];
                }
                if (parentContentChunks[i] !== undefined) {
                  parentContentChunk = parentContentChunks[i];
                }
                const diff = fast_myers_diff.calcPatch(parentContentChunk, currentContentChunk);
                let nextChange = diff.next();
                while (!nextChange.done) {
                  changes.push({
                    lhs: { at: nextChange.value[0], del: nextChange.value[1] - nextChange.value[0] },
                    rhs: { at: nextChange.value[3] - nextChange.value[2].length, add: nextChange.value[2].length },
                  });
                  nextChange = diff.next();
                }
              }
            }
          }

          const webUrl = urlProvider.getFileUrl(currentBranch, filepath);
          const file = File.ensureByPath(filepath, {
            webUrl: webUrl,
          }).then((f) => f[0]);

          const hunks = changes.map((change) => {
            const oldStart = change.lhs.at;
            const oldLines = change.lhs.del;
            const newStart = change.rhs.at;
            const newLines = change.rhs.add;
            this.stats.additions += newLines;
            this.stats.deletions += oldLines;
            return {
              webUrl: urlProvider ? urlProvider.getHunkUrl(currentOid, filepath, newLines, oldLines) : null,
              newLines: newLines,
              newStart: newStart,
              oldLines: oldLines,
              oldStart: oldStart,
            };
          });

          await this.save();

          return Promise.all([
            file,
            file.then((fileDAO) => fileDAO.detectLanguage(nCommit, gateway)),
            lineCount,
            { additions: this.stats.additions, deletions: this.stats.deletions },
            hunks,
          ]).then((results) => {
            const file = results[0];
            const languageContainer = results[1];
            const lineCount = results[2];
            const stats = results[3];
            const hunks = results[4];
            return {
              file,
              languageContainer,
              lineCount,
              stats,
              hunks,
            };
          });
        } catch (e) {
          console.log(e);
        }
      }
    )
  ).then((patches) =>
    patches.map(async (patch) =>
      Object.assign(patch, {
        hunkConnection: !this.justCreated
          ? null
          : await this.connect(patch.file, { lineCount: patch.lineCount, hunks: patch.hunks, stats: patch.stats }),
      })
    )
  );
};

/**
 * create a connection for each stakeholder and all of their commits
 *
 * @returns {*}
 */
Commit.deduceStakeholders = async function () {
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
    .then((cursor) => cursor.all())
    .then((signatures) =>
      signatures.forEach((signature) => {
        // try to get an already existing stakeholder with that signature
        return Stakeholder.ensureByGitSignature(signature.signature).then((results) => {
          const stakeholder = results[0];
          // walk over all commits with that signature
          return signature.commits.map((rawCommit) =>
            Promise.resolve(rawCommit, (commit) => {
              // assign the commit to the stakeholder
              return Commit.parse(commit).connect(stakeholder);
            })
          );
        });
      })
    );
};

module.exports = Commit;
