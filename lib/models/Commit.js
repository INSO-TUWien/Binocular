'use strict';

import debug from 'debug';
import Model from './Model.js';
import File from './File.js';
import IllegalArgumentError from '../errors/IllegalArgumentError.js';
import { exec } from 'child_process';
import ctx from '../context.js';
import * as utils from '../utils.js';
import Stakeholder from './Stakeholder.js';

const log = debug('git:commit');

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
    let parents = '';
    for (const i in nCommit.commit.parent) {
      parents += nCommit.commit.parent[i].toString();
      if (i < nCommit.commit.parent.length - 1) {
        parents += ',';
      }
    }

    // create new commit and link it to its parent commits
    const authorSignature = utils.fixUTF8(nCommit.commit.author.name + ' <' + nCommit.commit.author.email + '>');
    return Commit.create(
      {
        sha,
        date: new Date(nCommit.commit.author.timestamp * 1000),
        message: nCommit.commit.message,
        webUrl: urlProvider ? urlProvider.getCommitUrl(sha) : '',
        branch: nCommit.commit.branch,
        stats: {
          additions: 0,
          deletions: 0,
        },
      },
      { isNew: true }
    ).then(function (commit) {
      //connect commit to parents
      Promise.resolve(
        parents.split(',').map((parentSha) => {
          if (parentSha === '') {
            return;
          }
          return Commit.findById(parentSha).then((parentCommit) => commit.connect(parentCommit));
        })
      );
      //connect commit to author
      return Stakeholder.ensureByGitSignature(authorSignature).then(async (results) => {
        const stakeholder = results[0];
        await commit.connect(stakeholder);
        return commit;
      });
    });
  });
};

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
          let action = 'modified';

          try {
            if (!(commitFiles.includes(filepath) || parentCommitFiles.includes(filepath))) {
              //File not in commit or parent commit
              return;
            } else if (commitFiles.includes(filepath) && !parentCommitFiles.includes(filepath)) {
              //file added
              action = 'added';
              currentContent = Buffer.from(await currentCommitEntry.content()).toString('utf8');
              lineCount = currentContent.split(/\r\n|\r|\n/).length;
              changes.push({ lhs: { at: 0, del: 0 }, rhs: { at: 1, add: lineCount } });
            } else if (!commitFiles.includes(filepath) && parentCommitFiles.includes(filepath)) {
              //file deleted
              action = 'deleted';
              //return;
              //index file deletions as changes
              parentContent = Buffer.from(await parentCommitEntry.content()).toString('utf8');
              const parentLineCount = parentContent.split('\n').length;
              changes.push({ lhs: { at: 0, del: parentLineCount }, rhs: { at: 0, add: 0 } });
            } else {
              //file modified
              parentContent = Buffer.from(await parentCommitEntry.content()).toString('utf8');
              currentContent = Buffer.from(await currentCommitEntry.content()).toString('utf8');
              if (parentContent === currentContent) {
                return;
              }

              const diffOutput = await new Promise((resolve) => {
                //go to the target directory, execute git diff for a specific file to get the changes between the parent/current commit
                exec(
                  `cd ${ctx.targetPath} && git diff --unified=0 ${nCommit.commit.parent[0]} ${nCommit.oid} -- ${filepath}`,
                  { maxBuffer: 1024 * 10000 },
                  (error, stdout, stderr) => {
                    if (error) {
                      console.log(`error: ${error.message}`);
                      resolve('');
                    }
                    if (stderr) {
                      console.log(`stderr: ${stderr}`);
                      resolve('');
                    }
                    resolve(stdout);
                  }
                );
              });

              //diff output also includes the changed lines which we dont care about.
              //we only need the chunk headers: "@@ -oldFileStartLine,oldFileLineNumbers +newFileStartLine,newFileLineNumbers @@"
              const hunkheaders = diffOutput.split('\n').filter((s) => s.startsWith('@@'));
              hunkheaders.forEach((header) => {
                //remove the '+' and '-'
                const headerArray = header.replace('+', '').replace('-', '').split(' ');
                //part of the header containing the numbers for the old/new file
                const oldHeader = headerArray[1].split(',');
                const newHeader = headerArray[2].split(',');

                const oldStart = parseInt(oldHeader[0]);
                //if oldFileLineNumbers is 1, it is omitted from the header
                const oldLines = oldHeader.length === 2 ? parseInt(oldHeader[1]) : 1;

                const newStart = parseInt(newHeader[0]);
                //if newFileLineNumbers is 1, it is omitted from the header
                const newLines = newHeader.length === 2 ? parseInt(newHeader[1]) : 1;

                changes.push({
                  lhs: { at: oldStart, del: oldLines },
                  rhs: { at: newStart, add: newLines },
                });
              });
            }
          } catch (e) {
            console.log(e.message);
          }

          const webUrl = urlProvider.getFileUrl(currentBranch, filepath);
          const file = File.ensureByPath(filepath, {
            webUrl: webUrl,
          }).then((f) => f[0]);

          let additionsForFile = 0;
          let deletionsForFile = 0;

          const hunks = changes.map((change) => {
            const oldStart = change.lhs.at;
            const oldLines = change.lhs.del;
            const newStart = change.rhs.at;
            const newLines = change.rhs.add;
            //add additions and deletions of this change to this commit obj
            this.stats.additions += newLines;
            this.stats.deletions += oldLines;
            //add additions and deletions of this change to counter for the commits-files connection
            additionsForFile += newLines;
            deletionsForFile += oldLines;
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
            { additions: additionsForFile, deletions: deletionsForFile },
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
              action,
            };
          });
        } catch (e) {
          console.log(e);
        }
      }
    )
  ).then((patches) =>
    patches.map(async (patch) => {
      const connection = await this.ensureConnection(patch.file, {
        lineCount: patch.lineCount,
        hunks: patch.hunks,
        stats: patch.stats,
        action: patch.action,
      });

      return Object.assign(patch, {
        hunkConnection: !this.justCreated ? null : connection,
      });
    })
  );
};

export default Commit;
