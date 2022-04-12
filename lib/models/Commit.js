'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const log = require('debug')('git:commit');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError');
const { exec } = require('child_process');
const jsdiff = require('diff');

const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date', 'stats', 'branch', 'parents', 'webUrl'],
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
    return getBranchForCommit(sha).then((branch) => {
      /*const parentShas = [];
      for (let i = 0; 'parentcount' in nCommit && i < nCommit.parentcount(); i++) {
        parentShas.push(nCommit.parentId(i).toString());
      }
      const parents = [];
      for (let i = 0; i < nCommit.parents().length; i++) {
        parents.push(nCommit.parentId(i).toString());
      }*/
      if (branch.endsWith('\n')) {
        branch = branch.substring(0, branch.length - 1);
      }
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
          branch: branch,
          parents: parents,
          stats: {
            additions: 0,
            deletions: 0
          }
        },
        { isNew: true }
      ) /*.tap(function (commit) {
        return Promise.all(
          Promise.map(nCommit.commit.parent[0], (parentSha) => {
            return Commit.findById(parentSha).then((parentCommit) => commit.connect(parentCommit));
          })
        );
      })*/;
    });
  });
};

/**
 * returns the branch name of a given sha repository name and owner name
 * check with git shell command because this function is not jet implemented in nodegit
 *
 * @param sha sha of commit to check
 *
 * @retruns branch
 */
async function getBranchForCommit(sha) {
  return (
    await new Promise((resolve) => {
      exec('git name-rev --name-only ' + sha, (error, stdout, stderr) => {
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
  ).split('~')[0];
}

/**
 * process and store a commit and its associated data objects
 *
 * @param repo contains the repository object
 * @param nCommit contains the current commit that is created by the given repo object and holds the required data
 * @param urlProvider contains the given remote vcs webapp provider to link them
 * @param gateway contains the given gateway object to process commits based on various registered services
 * @returns {*}
 */
Commit.prototype.processTree = function (repo, nCommit, urlProvider, gateway) {
  return Promise.cast(
    repo.getCommitChanges(nCommit.oid, nCommit.commit.parent[0], async (filepath, parentCommitEntry, currentCommitEntry) => {
      // ignore directories
      //return Promise.cast(()=>{
      if (filepath === '.') {
        return;
      }
      if (
        currentCommitEntry === null ||
        parentCommitEntry === null ||
        (await currentCommitEntry.type()) === 'tree' ||
        (await parentCommitEntry.type()) === 'tree'
      ) {
        return;
      }

      // generate ids
      const currentOid = await currentCommitEntry.oid();
      const parentContent = Buffer.from(await parentCommitEntry.content()).toString('utf8');
      const currentContent = Buffer.from(await currentCommitEntry.content()).toString('utf8');
      const diff = jsdiff.structuredPatch(filepath, filepath, parentContent, currentContent);

      if (diff.hunks.length === 0) {
        return;
      }
      //const diff = gitdiff(parentContent, currentContent);
      //console.log(parsedDiff);
      const lineCount = currentContent.split('\n').length;
      const file = await File.ensureByPath(filepath, {
        webUrl: urlProvider.getFileUrl(await repo.getCurrentBranch(), filepath),
      }).spread((f) => f);

      const hunks = [];

      /*if (diff !== undefined) {
        if (!diff.includes('-') && !diff.includes('+')) {
          return;
        }
        const difflines = diff.split('\n');
        const firstLine = difflines.shift();
        const firstOldLine = firstLine.substring(firstLine.indexOf('-')).split(',')[0];
        const firstNewLine = firstLine.substring(firstLine.indexOf('+')).split(',')[0];
        let oldStart = -1;
        let newStart = -1;
        let oldLines = 0;
        let newLines = 0;
        for (let i = 0; i < difflines.length; i++) {
          const line = difflines[i];
          if (line.charAt(0) === '-') {
            if (oldStart === -1) {
              oldStart = i;
            }
            oldLines++;
          }
          if (line.charAt(0) === '+') {
            if (newStart === -1) {
              newStart = i - oldLines;
            }
            newLines++;
          }
        }
        if (oldLines < newLines) {
          this.stats.additions += newLines;
        } else if (oldLines > newLines) {
          this.stats.deletions += newLines;
        }
        hunks.push({
          webUrl: urlProvider ? urlProvider.getHunkUrl(currentOid, file, newStart, newLines) : null,
          newLines: newLines,
          newStart: newStart,
          oldLines: oldLines,
          oldStart: oldStart,
        });
      }
      */

      for (const hunk of diff.hunks) {
        if (hunk.oldLines < hunk.newLines) {
          this.stats.additions += hunk.newLines;
        } else if (hunk.oldLines > hunk.newLines) {
          this.stats.deletions += hunk.newLines;
        }
        hunks.push({
          webUrl: urlProvider ? urlProvider.getHunkUrl(currentOid, filepath, hunk.newStart, hunk.newLines) : null,
          newLines: hunk.newLines,
          newStart: hunk.newStart,
          oldLines: hunk.oldLines,
          oldStart: hunk.oldStart,
        });
      }
      this.save();
      return {
        file: file,
        languageContainer: await file.detectLanguage(nCommit, gateway).catch(() => null),
        lineCount: lineCount,
        stats: { additions: this.stats.additions, deletions: this.stats.deletions },
        hunks: hunks,
        hunkConnection: !this.justCreated
          ? null
          : await this.connect(file, {
              lineCount: lineCount,
              hunks: hunks,
              stats: { additions: this.stats.additions, deletions: this.stats.deletions }
            })
      };
      //});
    })
  );

  /*return Promise.cast(nCommit.getDiffWithOptions({ contextLines: 0 })).map((diff) => {
    return Promise.cast(diff.patches())
      .map(async (patch) => {
        const newFile = patch.newFile().path();
        const stats = patch.lineStats();

        if (!this.stats || this.justCreated) {
          this.stats.additions += stats.total_additions;
          this.stats.deletions += stats.total_deletions;
        }

        const blob = Promise.resolve(nCommit.getEntry(newFile))
          .then((e) => e.getBlob())
          .catch(/the path '.*' does not exist in the given tree/, () => null);

        const branch = await repo.getCurrentBranch();
        const file = File.ensureByPath(newFile, {
          webUrl: urlProvider.getFileUrl(branch.shorthand(), newFile)
        }).spread((f) => f);

        return Promise.join(
          file,
          file.then((fileDAO) => fileDAO.detectLanguage(nCommit, gateway)),
          blob.then((b) => (b ? _.sumBy(b.toString(), (ch) => +(ch && ch.toString() === '\n')) : 0)),
          { additions: stats.total_additions, deletions: stats.total_deletions },
          Promise.resolve(patch.hunks()).map((hunk) => ({
            webUrl: urlProvider ? urlProvider.getHunkUrl(nCommit.sha(), newFile, hunk.newStart(), hunk.newLines()) : null,
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
      .map(async (patch) =>
        // create connection obj
        Object.assign(patch, {
          hunkConnection: !this.justCreated
            ? null
            : await this.connect(patch.file, { lineCount: patch.lineCount, hunks: patch.hunks, stats: patch.stats })
        })
      );
  });*/
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
    .each((signature) => {
      // try to get an already existing stakeholder with that signature
      return Stakeholder.ensureByGitSignature(signature.signature).spread((stakeholder) => {
        // walk over all commits with that signature
        return Promise.map(signature.commits, (rawCommit) => {
          // assign the commit to the stakeholder
          return Commit.parse(rawCommit).connect(stakeholder);
        });
      });
    });
};

module.exports = Commit;
