'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const log = require('debug')('git:commit');
const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = require('./File.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError');
const { exec } = require('child_process');
const diff_match_patch = require('diff-match-patch');

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
      ).tap(function (commit) {
        return Promise.all(
          parents.split(',').map((parentSha) => {
            if (parentSha === '') {
              return;
            }
            return Commit.findById(parentSha).then((parentCommit) => commit.connect(parentCommit));
          })
        );
      });
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
    repo.getCommitChanges.bind(this)(nCommit.oid, nCommit.commit.parent[0], async (filepath, parentCommitEntry, currentCommitEntry) => {
      // ignore directories
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
      const dmp = new diff_match_patch();
      const diff = dmp.diff_lineMode_(parentContent, currentContent);
      const patch_list = dmp.patch_make(parentContent, currentContent, diff);
      if (patch_list.length === 0) {
        return;
      }
      const lineCount = currentContent.split('\n').length;
      const webUrl = urlProvider.getFileUrl(await repo.getCurrentBranch(), filepath);
      const file = File.ensureByPath(filepath, {
        webUrl: webUrl
      }).spread((f) => f);

      let hunks = [];

      for (const hunk of patch_list) {
        if (hunk.length1 < hunk.length2) {
          this.stats.additions += hunk.length2 - hunk.length1;
        } else if (hunk.length1 > hunk.length2) {
          this.stats.deletions += hunk.length1 - hunk.length2;
        }
        hunks.push({
          webUrl: urlProvider ? urlProvider.getHunkUrl(currentOid, filepath, hunk.newStart, hunk.newLines) : null,
          newLines: hunk.length2,
          newStart: hunk.start2,
          oldLines: hunk.length1,
          oldStart: hunk.start1,
        });
      }
      await this.save();

      return Promise.join(
        file,
        file.then((fileDAO) => fileDAO.detectLanguage(nCommit, gateway)),
        lineCount,
        { additions: this.stats.additions, deletions: this.stats.deletions },
        hunks
      ).spread((file, languageContainer, lineCount, stats, hunks) => ({
        file,
        languageContainer,
        lineCount,
        stats,
        hunks
      }));
    })
  ).map(async (patch) =>
    Object.assign(patch, {
      hunkConnection: !this.justCreated
        ? null
        : await this.connect(patch.file, { lineCount: patch.lineCount, hunks: patch.hunks, stats: patch.stats })
    })
  );
};

Commit.prototype.getCommitChanges = function (repo, nCommit, urlProvider, gateway) {
  return repo.getCommitChangesBeweenTwoCommits.bind(this)(nCommit.oid, nCommit.commit.parent[0]);
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
