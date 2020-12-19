'use strict';

const log = require('debug')('idx:vcs:git');
const Promise = require('bluebird');
// eslint-disable-next-line no-unused-vars
const nodegit = require('nodegit'); // used for JSDocs

const Commit = require('../../models/Commit.js');
const File = require('../../models/File.js');
const Branch = require('../../models/Branch');
const CommitBranchConnection = require('../../models/CommitBranchConnection');
const getUrlProvider = require('../../url-providers');
const aql = require('arangojs').aql;

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
        .then(() => log('Start Indexing Branches'))
        .then(() => this.indexBranches())
        .then(() => log('Finished Indexing Branches'))
        .then(() => log('Done'));
    });
};

/**
 * Indexes the branches of a repository.
 * New and updated branches are inserted into the DB, incl. the connections to their commits.
 * Removed branches are deleted from the DB incl. the connections to their commits.
 * @returns {Promise<void>}
 */
GitIndexer.prototype.indexBranches = function () {
  // get all branches persisted in the DB
  const persistedBranches = Branch.findAll();

  // get all branches from the repository
  const branches = this.repo.getAllReferences();

  // get heads of branches from the repository
  const actions = branches.map((branch) => this.repo.repo.getBranchCommit(branch));
  const heads = Promise.all(actions);

  // persist, update or delete branches to replicate the current state of the repository within the DB
  return (
    Promise.join(persistedBranches, branches, heads)
      .bind(this)
      .spread((persistedBranches, branches, heads) => {
        if (this.stopped) {
          return;
        }

        // get filtered branches with their corresponding head commits
        const branchesWithHeads = _getBranchesWithHeads(branches, heads);
        _filterBranches(branchesWithHeads);

        // get all branches which should be persisted/updated with their commints and
        // all branches which should be deleted
        const { branchesToPersist, branchesToDelete } = _getBranchesToPersistAndToDelete(
          this,
          branchesWithHeads,
          persistedBranches
        );

        // return branches which should be persisted/updated and which should be deleted
        return Promise.join(Promise.all(branchesToPersist), branchesToDelete);
      })
      .then(([branchesToPersist, branchesToDelete]) => {
        if (this.stopped) {
          return;
        }

        // get Branch.js and CommitBranchConnection.js models for the bulk insertion
        const { branchModels, commitBranchConnectionModels } = _getBranchAndCommitConnectionModels(
          branchesToPersist
        );

        if (this.stopped) {
          return;
        }

        // Rationale:
        // a bulk creation/update and deletion was chosen, because its more performant than
        // saving/updating/deleting all entries after another via the API and
        // because it makes the stopping/restarting of this algorithm easier to understand

        // perform a bulk creation/update
        const resultInsertion = _bulkInsertion(branchModels, commitBranchConnectionModels);

        // all remaining branches in the persistedBranches list were deleted in the repository
        // therefore, also delete them and their connection to commits from the DB
        const resultDeletion = _bulkDeletion(branchesToDelete);

        return Promise.join(branchModels, resultInsertion, branchesToDelete, resultDeletion);
      })
      // eslint-disable-next-line no-unused-vars
      .then(([insertedBranches, resultInsertion, deletedBranches, resultDeletion]) => {
        if (persistedBranches.length > 0) {
          log(
            'Persisted/Updated the following branches with their connections to commits:',
            insertedBranches.map((insertedBranch) => insertedBranch.branchName)
          );
        }

        if (deletedBranches.length > 0) {
          log(
            'Deleted the following branches and their connections to commits:',
            deletedBranches.map(() => deletedBranches.branchName)
          );
        }
      })
  );
};

GitIndexer.prototype.stop = function() {
  log('Stopping');
  this.stopping = true;
};

/**
 * Filters out all non branches and combines the branches with their heads.
 * @param references list of {@link nodegit.Reference} from the repository
 * @param heads list of heads {@link nodegit.Commit} from the repository
 * @returns {Map<nodegit.Branch, nodegit.Commit>}
 * @private
 */
function _getBranchesWithHeads(references, heads) {
  // combine all references and heads in a map
  let branchesWithHeads = new Map();

  // filter out all references which are not branches or remotes
  for (let i = 0; i < references.length; i++) {
    if (references[i].isBranch() || references[i].isRemote()) {
      branchesWithHeads.set(references[i], heads[i]);
    }
  }

  return branchesWithHeads;
}

/**
 * Filter branches such that only
 * <ul>
 *  <li>unique branches (no duplicates),</li>
 *  <li>local branches,</li>
 *  <li>remotes without corresponding local branch and</li>
 *  <li>remotes with different heads than their local counterpart</li>
 *  </ul>
 * is in the combined map
 * @private
 */
function _filterBranches(branchesWithHeads) {
  branchesWithHeads.forEach((head, branch) => {
    const branches = Array.from(branchesWithHeads.keys());

    // remove the current branch from the map, if a duplicate was found
    // this is necessary because nodegit returns some branches twice (and I don't know the reason)
    if (branches.filter((_branch) => _branch.shorthand() === branch.shorthand()).length > 1) {
      branchesWithHeads.delete(branch);
      return;
    }

    // get the remote of the local branch, if existing
    const remotes = Array.from(branchesWithHeads.keys()).filter(
      (_branch) => _branch.shorthand().endsWith(branch.shorthand()) && _branch.isRemote()
    );

    // remote branch was found
    if (remotes.length === 1 && branch !== remotes[0]) {
      const remoteBranch = remotes[0];
      const remoteHead = branchesWithHeads.get(remoteBranch);

      // check if the heads of the local and remote branch are equal
      // if yes, remove the remote branch from the map,
      // because it will not be handled differently than the local branch
      if (remoteHead.sha() === head.sha()) {
        branchesWithHeads.delete(remoteBranch);
      }
    }
  });
}

/**
 * Gets all branches which should be persisted or updated and which should be deleted.
 * @param that this instance
 * @param branchesWithHeads the filtered branches with their heads
 * @param persistedBranches list of {@link Branch}es which are currently stored in the DB
 * @returns {{branchesToPersist: Promise<nodegit.Branch, nodegit.Commit, nodegit.Commit[]>[], branchesToDelete}}
 * branchesToPersist: [] whose elements should be inserted and contain of
 * <ol>
 *  <li>the branch ({@link nodegit.Branch}),</li>
 *  <li>its head ({@link nodegit.Commit}) and</li>
 *  <li>its commits ({@link nodegit.Commit}[]),</li>
 * </ol>
 * branchesToDelete: an {@link Branch}[] whose branches should be deleted
 * @private
 */
function _getBranchesToPersistAndToDelete(that, branchesWithHeads, persistedBranches) {
  const branchesToPersist = [];

  branchesWithHeads.forEach((head, branch) => {
    // gets the persisted branch (in DB) of the repository branch, if exists
    const counterpartBranches = persistedBranches.filter(
      (persistedBranch) => persistedBranch.branchName === branch.shorthand()
    );

    // no counterpart branch was found or the head of the stored branch and the one from the repository differs
    // -> the branch was newly created and is not stored in the DB or
    // -> the head of the branch was updated between the last indexing and now
    if (counterpartBranches.length === 0 || counterpartBranches[0].headSha !== head.sha()) {
      // store the branch and its commits for a bulk creation/update
      branchesToPersist.push(Promise.join(branch, head, that.repo.getCommitsOfBranch(branch)));
    }

    // delete the filtered counterpartBranch from the persistedBranches list,
    // because the branch will be stored/updated later and
    // the persistedBranches array should only contain branches which were deleted afterwards
    // Hint: either 0 or 1 branch can be found, because the name of the branch is unique
    counterpartBranches.forEach((counterpartBranch) => {
      const index = persistedBranches.indexOf(counterpartBranch);
      persistedBranches.splice(index, 1);
    });
  });

  return { branchesToPersist, branchesToDelete: persistedBranches };
}

/**
 * Transforms all branches and their commits to insert it into the DB.
 * @param branchesToPersist an [] whose elements contain:
 * <ol>
 *  <li>the branch to insert ({@link nodegit.Branch}),</li>
 *  <li>the head of the branch ({@link nodegit.Commit}) and</li>
 *  <li>the commits of the branch ({@link nodegit.Commit}[])</li>
 * </ol>
 * @returns {{commitBranchConnectionModels: [], branchModels: []}}
 * @private
 */
function _getBranchAndCommitConnectionModels(branchesToPersist) {
  const branchModels = [];
  const commitBranchConnectionModels = [];

  branchesToPersist.forEach((branchToPersist) => {
    const branch = branchToPersist[0]; // Branch from the repository (NodeGit.Reference)
    const head = branchToPersist[1]; // Head of the Branch (NodeGit.Commit)
    const commits = branchToPersist[2]; // boolean which indicates if the branch was persisted or updated

    const branchKey = Branch.getBranchKey(branch);

    // create the Branch model for the bulk creation/update
    branchModels.push({
      _key: branchKey,
      branchKey: branchKey,
      branchName: branch.shorthand(),
      headSha: head.sha(),
    });

    // create the CommitBranchConnection models for the bulk creation/update
    for (let commit of commits) {
      commitBranchConnectionModels.push({
        _from: 'commits/' + commit.sha(),
        _to: 'branches/' + branchKey,
      });
    }
  });

  return { branchModels, commitBranchConnectionModels };
}

/**
 * Create or updates all branches and connections in the DB.
 * @param branchModels which should be stored in the Branch collection
 * @param commitBranchConnectionModels which should be stored in the CommitBranchConnection collection
 * @returns {null|Promise<ArrayCursor>} null, if nothing must be inserted
 * @private
 */
function _bulkInsertion(branchModels, commitBranchConnectionModels) {
  if (branchModels.length > 0) {
    return Branch.rawDb.query(
      aql`
            LET branches = ${branchModels}
            LET commitBranchConnections = ${commitBranchConnectionModels}
            LET persistedBranches = (FOR branch IN branches
              UPSERT { branchKey: branch.branchKey }
                INSERT branch
                UPDATE { headSha: branch.headSha } 
              IN ${Branch.collection}
              )
            FOR connection IN commitBranchConnections
              UPSERT { _from: connection._from, _to: connection._to }
                INSERT connection
                UPDATE {}
              IN ${CommitBranchConnection.collection}`
    );
  }

  return null;
}

/**
 * Deletes all branches and their commit connections in the DB.
 * @param branchesToDelete an {@link Branch}[] which stores all branches to delete
 * @returns {null|Promise<ArrayCursor>} null, if nothing must be deleted
 * @private
 */
function _bulkDeletion(branchesToDelete) {
  if (branchesToDelete.length > 0) {
    return Branch.rawDb.query(
      aql`
            FOR branchToDelete IN ${branchesToDelete}
              LET r = (FOR cb IN ${CommitBranchConnection.collection}
                FILTER cb._to == branchToDelete._id
                REMOVE cb IN ${CommitBranchConnection.collection})
              FOR b IN ${Branch.collection}
                FILTER b.branchKey == branchToDelete.data.branchKey
                REMOVE b IN ${Branch.collection}`
    );
  }

  return null;
}

module.exports = GitIndexer;
