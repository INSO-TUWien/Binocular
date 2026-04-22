import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import _ from 'lodash';
import type { DataPluginFileOwnership } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

interface JSONObject {
  [key: string]: unknown;
}

// ###################### GENERAL SEARCH FUNCTIONS ######################

// searches for elements `e` of the array `arr` where `e[attribute] === val`.
// returns an array of all elements of `arr` where the condition holds.
// `arr` must be sorted by `attribute` in ascending order.
export const binarySearchArray = (arr: JSONObject[], val: unknown, attribute: string) => {
  let l = 0;
  let r = arr.length - 1;
  // Loop to implement Binary Search
  while (l <= r) {
    // calc mid
    const m = l + Math.floor((r - l) / 2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const res = val.localeCompare(arr[m][attribute]);

    // Check if val is present at mid
    if (res === 0) {
      //now get the first and last occurrence
      let from = m;
      let to = m;

      while (from > 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (val.localeCompare(arr[from - 1][attribute]) !== 0) {
          break;
        }
        from--;
      }

      while (to < arr.length - 1) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (val.localeCompare(arr[to + 1][attribute]) !== 0) {
          break;
        }
        to++;
      }

      return arr.slice(from, to + 1);
    }

    // If x greater, ignore left half
    if (res > 0) l = m + 1;
    // If x is smaller, ignore right half
    else {
      r = m - 1;
    }
  }

  return [];
};

// searches for element `e` of the array `arr` where `e[attribute] === val`.
// returns one element of `arr` where the condition holds.
// `arr` must be sorted by `attribute` in ascending order.
export const binarySearch = (arr: JSONObject[], val: unknown, attribute: string) => {
  let l = 0;
  let r = arr.length - 1;
  // Loop to implement Binary Search
  while (l <= r) {
    // calc mid
    const m = l + Math.floor((r - l) / 2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const res = val.localeCompare(arr[m][attribute]);

    // Check if val is present at mid
    if (res === 0) {
      return arr[m];
    }

    // If x greater, ignore left half
    if (res > 0) l = m + 1;
    // If x is smaller, ignore right half
    else {
      r = m - 1;
    }
  }

  return null;
};

// sorts an array by the string value of `attribute` in asc/desc order (default: asc).
// example `sortByAttributeString([{a: 'def'},{a: 'abc'},{a: 'ghi'}], 'a', 'asc')`
//  returns `[{a: 'abc'},{a: 'def'},{a: 'ghi'}]`
export const sortByAttributeString = (arr: JSONObject[], attribute: unknown, order = 'asc') => {
  if (order === 'asc') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return arr.sort((a: JSONObject, b: JSONObject) => a[attribute].localeCompare(b[attribute]));
  } else if (order === 'desc') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return arr.sort((a: JSONObject, b: JSONObject) => b[attribute].localeCompare(a[attribute]));
  } else {
    return arr;
  }
};

// find all documents of a given collection (example: 'issues' or 'commits-users')
export async function findAll(database: PouchDB.Database, collection: string) {
  //this fetches documents starting with _id startKey until _id endKey.
  // this works because the ids of our documents include the collection name.
  // Note that \ufff0 is a high unicode character, so all documents with an id starting with startKey are fetched
  //  (see https://pouchdb.com/api.html#batch_fetch).
  // MUCH faster database.find() (see https://pouchdb.com/guides/bulk-operations.html#please-use-alldocs)
  const startKey = collection + '/';
  const endKey = startKey + '\ufff0';
  const res = await database.allDocs({
    startkey: startKey,
    endkey: endKey,
    include_docs: true,
  });
  return {
    docs: res.rows.map((r) => r.doc as unknown as JSONObject),
  };
}

// finds a specific document with the specified id
export function findID(database: PouchDB.Database, id: string) {
  return database.find({
    selector: { _id: id },
  });
}

// ###################### SPECIFIC SEARCHES ######################

// ###################### COMMITS ######################

export async function findAllCommits(database: PouchDB.Database, relations: PouchDB.Database) {
  const commits = await findAll(database, 'commits');
  const allCommits = sortByAttributeString(commits.docs, '_id');
  const commitUserConnections = sortByAttributeString((await findCommitUserConnections(relations)).docs, 'from');
  const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'from');
  const userObjects = (await findAll(database, 'users')).docs;
  const users: JSONObject = {};
  const commitFiles = sortByAttributeString((await findFileCommitConnections(relations)).docs, 'from');
  const files = (await findAll(database, 'files')).docs;
  userObjects.map((s) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    users[s._id] = s.gitSignature;
  });

  commits.docs = await Promise.all(
    commits.docs.map((c) => preprocessCommit(c, allCommits, commitUserConnections, commitCommitConnections, users, commitFiles, files)),
  );

  return commits;
}

export async function findAllCommitsWithBuilds(database: PouchDB.Database, relations: PouchDB.Database) {
  const commits = await findAll(database, 'commits');
  const allCommits = sortByAttributeString(commits.docs, '_id');
  const commitUserConnections = sortByAttributeString((await findCommitUserConnections(relations)).docs, 'from');
  const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'from');
  const userObjects = (await findAll(database, 'users')).docs;
  const users: JSONObject = {};
  const commitFiles = sortByAttributeString((await findFileCommitConnections(relations)).docs, 'from');
  const files = (await findAll(database, 'files')).docs;
  const commitBuilds = sortByAttributeString((await findCommitBuildConnections(relations)).docs, 'from');
  const builds = (await findAll(database, 'builds')).docs;
  userObjects.map((s) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    users[s._id] = s.gitSignature;
  });

  commits.docs = await Promise.all(
    commits.docs.map((c) =>
      preprocessCommitWithBuilds(
        c,
        allCommits,
        commitUserConnections,
        commitCommitConnections,
        users,
        commitFiles,
        files,
        commitBuilds,
        builds,
      ),
    ),
  );

  return commits;
}

export async function findCommit(database: PouchDB.Database, relations: PouchDB.Database, sha: string) {
  const allCommits = sortByAttributeString((await findAll(database, 'commits')).docs, '_id');
  const commit = (await database.find({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    selector: { _id: { $regex: new RegExp('^commits/.*') }, sha: { $eq: sha } },
  })) as unknown as { docs: JSONObject[] };

  if (commit.docs && commit.docs[0]) {
    const commitUserConnections = sortByAttributeString((await findCommitUserConnections(relations)).docs, 'from');
    const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'from');

    const userObjects = (await findAll(database, 'users')).docs;
    const users: JSONObject = {};
    userObjects.map((s) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      users[s._id] = s.gitSignature;
    });
    commit.docs[0] = preprocessCommit(commit.docs[0], allCommits, commitUserConnections, commitCommitConnections, users, [], []);
  }
  return commit;
}

//add user, parents to commit
function preprocessCommit(
  commit: JSONObject,
  allCommits: JSONObject[],
  commitUser: JSONObject[],
  commitCommit: JSONObject[],
  users: JSONObject,
  commitFiles: JSONObject[],
  files: JSONObject[],
) {
  //add messageHeader from message (first line of the commit message) similar to Bino BE
  if (commit.message && !commit.messageHeader) {
    commit.messageHeader = (commit.message as string).split('\n')[0];
  }

  //add parents: first get the ids of the parents using the commits-commits connection, then find the actual commits to get the hashes
  commit.parents = binarySearchArray(commitCommit, commit._id, 'from').map((r) => {
    const parent = binarySearch(allCommits, r.to, '_id');
    if (parent !== null) {
      return parent.sha;
    }
  });

  //add user
  const commitUserRelation = binarySearch(commitUser, commit._id, 'from');

  if (!commitUserRelation) {
    console.log('Error in localDB: commit: no user found for commit ' + commit.sha);
    return commit;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const author = users[commitUserRelation.to];

  if (!author) {
    console.log('Error in localDB: commit: no user found with ID ' + commitUserRelation.to);
    return commit;
  }

  _.assign(commit, { user: { gitSignature: author, id: commitUserRelation.to } });

  //add file data
  const commitFileRelation = binarySearchArray(commitFiles, commit._id, 'from');
  const filesData: JSONObject[] = [];
  if (!commitFileRelation) {
    return commit;
  }
  commitFileRelation.forEach((cfr) => {
    const file = binarySearch(files, cfr.to, '_id');
    filesData.push({ file: { path: file!.path }, stats: cfr.stats });
  });
  return _.assign(commit, { files: { data: filesData } });
}

function preprocessCommitWithBuilds(
  commit: JSONObject,
  allCommits: JSONObject[],
  commitUser: JSONObject[],
  commitCommit: JSONObject[],
  users: JSONObject,
  commitFiles: JSONObject[],
  files: JSONObject[],
  builds: JSONObject[],
  commitBuilds: JSONObject[],
) {
  commit = preprocessCommit(commit, allCommits, commitUser, commitCommit, users, commitFiles, files);

  //add file data
  const commitBuildRelation = binarySearchArray(commitBuilds, commit._id, 'from');
  const buildData: JSONObject[] = [];
  if (!commitBuildRelation) {
    return commit;
  }
  commitBuildRelation.forEach((cbr) => {
    const build = binarySearch(builds, cbr.to, '_id');
    if (build) buildData.push(build);
  });

  return _.assign(commit, { builds: buildData });
}

function preprocessCommitWithOwnership(
  commit: JSONObject,
  allCommits: JSONObject[],
  commitCommit: JSONObject[],
  users: JSONObject,
  allFiles: JSONObject[],
  commitFiles: JSONObject[],
  commitFileUsers: JSONObject[],
) {
  //add parents: first get the ids of the parents using the commits-commits connection, then find the actual commits to get the hashes
  const parents: string[] = [];
  binarySearchArray(commitCommit, commit._id, 'from').forEach((r) => {
    const parent = binarySearch(allCommits, r.to, '_id');
    if (parent !== null) {
      parents.push(<string>parent.sha);
    }
  });
  //add ownership data for each file using the commits-file connection and for every individual author using the commits-file-user connection
  const files: {
    path: string;
    action: string;
    ownership: DataPluginFileOwnership[];
  }[] = [];
  binarySearchArray(commitFiles, commit._id, 'from').forEach((cf) => {
    const file = binarySearch(allFiles, cf.to, '_id');
    //action field might not be needed
    const fileEntry: { path: string; action: string; ownership: DataPluginFileOwnership[] } = {
      path: <string>file?.path,
      action: <string>cf.action,
      ownership: [],
    };
    binarySearchArray(commitFileUsers, cf._id, 'from').forEach((cfu) => {
      fileEntry.ownership.push(<DataPluginFileOwnership>{ user: users[<string>cfu.to], hunks: cfu.hunks });
    });
    files.push(fileEntry);
  });

  return { sha: commit.sha, date: commit.date, parents: parents, files: files };
}

export async function findOwnershipData(database: PouchDB.Database, relations: PouchDB.Database) {
  const commits = await findAll(database, 'commits');
  const allCommits = sortByAttributeString(commits.docs, '_id');
  const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'from');
  const userObjects = (await findAll(database, 'users')).docs;
  const commitFileConnections = sortByAttributeString((await findFileCommitConnections(relations)).docs, 'from');
  const commitFileUserConnections = sortByAttributeString((await findFileCommitUserConnections(relations)).docs, 'from');
  const users: JSONObject = {};
  const files = (await findAll(database, 'files')).docs;
  userObjects.map((s) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    users[s._id] = s.gitSignature;
  });

  commits.docs = await Promise.all(
    commits.docs.map((c) =>
      preprocessCommitWithOwnership(c, allCommits, commitCommitConnections, users, files, commitFileConnections, commitFileUserConnections),
    ),
  );

  return commits;
}

// ###################### BUILDS ######################

export async function findAllBuilds(database: PouchDB.Database, relations: PouchDB.Database) {
  const builds = await findAll(database, 'builds');
  const commitBuildConnections = sortByAttributeString((await findCommitBuildConnections(relations)).docs, 'to');
  const commitUserConnections = sortByAttributeString((await findCommitUserConnections(relations)).docs, 'from');
  const userObjects = (await findAll(database, 'users')).docs;
  const users: JSONObject = {};
  userObjects.map((s) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    users[s._id] = s.gitSignature;
  });
  builds.docs = await Promise.all(builds.docs.map((b) => preprocessBuild(b, commitBuildConnections, commitUserConnections, users)));
  return builds;
}

function preprocessBuild(build: JSONObject, commitBuildConnections: JSONObject[], commitUserConnections: JSONObject[], users: JSONObject) {
  const commitBuildRelation = binarySearch(commitBuildConnections, build._id, 'to');
  if (commitBuildRelation === null) {
    return _.assign(build, { manualRun: true });
  }
  const commitUserRelation = binarySearch(commitUserConnections, commitBuildRelation.from, 'from');
  if (commitUserRelation === null) {
    return _.assign(build, { manualRun: true });
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const author = users[commitUserRelation.to];
  return _.assign(build, { user: { gitSignature: author, id: commitUserRelation.to } });
}

// ###################### NOTES ######################

export async function findAllNotes(database: PouchDB.Database, relations: PouchDB.Database) {
  const notes = await findAll(database, 'notes');
  const noteAccountConnections = sortByAttributeString((await findNoteAccountConnections(relations)).docs, 'to');
  const accountUserConnections = sortByAttributeString((await findAccountUserConnections(relations)).docs, 'to');
  const noteIssueConnections = sortByAttributeString((await findIssueNoteConnection(relations)).docs, 'to');
  const noteMRConnections = sortByAttributeString((await findMRNoteConnection(relations)).docs, 'to');
  const users = (await findAll(database, 'users')).docs;
  const mergeRequests = (await findAll(database, 'mergeRequests')).docs;
  const issues = (await findAll(database, 'issues')).docs;
  const noteUserConnections: { from: string; to: string }[] = [];

  noteAccountConnections.forEach((noteAccount) => {
    const matchedAccount = accountUserConnections.find((accountUser) => accountUser.from === noteAccount.to);

    if (matchedAccount) {
      noteUserConnections.push({
        from: noteAccount.from as string,
        to: matchedAccount.to as string,
      });
    }
  });
  // sort it to match the order of notes
  noteUserConnections.sort((a, b) => {
    if (a.from < b.from) return -1;
    if (a.from > b.from) return 1;
    return 0;
  });

  if (noteUserConnections.length > 0) {
    notes.docs = await Promise.all(
      notes.docs.map((n, index) =>
        preprocessNotes(n, noteUserConnections[index], noteIssueConnections, noteMRConnections, users, mergeRequests, issues),
      ),
    );
  } else {
    notes.docs = [];
  }
  return notes;
}

function preprocessNotes(
  note: JSONObject,
  noteUserConnection: { from: string; to: string },
  noteIssueConnections: JSONObject[],
  noteMRConnections: JSONObject[],
  users: JSONObject[],
  mergeRequests: JSONObject[],
  issues: JSONObject[],
) {
  const rawUser = binarySearch(users, noteUserConnection.to, '_id');
  if (rawUser == null) {
    return _.assign(note, { manualRun: true });
  }
  const dataPluginGitUser = {
    id: rawUser._id as string,
    gitSignature: rawUser.gitSignature as string,
  };
  // id and name of author currently not needed, not implemented to reduce amount of searches to find unnecessary information
  note.author = {
    id: '',
    name: '',
    user: dataPluginGitUser,
  };
  const noteMRRelation = binarySearch(noteMRConnections, note._id, 'to');
  if (noteMRRelation !== null) {
    const mergeRequest = binarySearch(mergeRequests, noteMRRelation.from, '_id');
    return _.assign(note, { mergeRequest: mergeRequest });
  } else {
    const noteIssueRelation = binarySearch(noteIssueConnections, note._id, 'to');
    if (noteIssueRelation !== null) {
      const issue = binarySearch(issues, noteIssueRelation.from, '_id');
      return _.assign(note, { issue: issue });
    }
  }
  return _.assign(note, { manualRun: true });
}

// ###################### USERS ######################

export async function findAllUsers(database: PouchDB.Database, relations: PouchDB.Database) {
  const users = await findAll(database, 'users');
  const accounts = sortByAttributeString((await findAll(database, 'accounts')).docs, '_id');
  const accountsUsersConnection = sortByAttributeString((await findAccountUserConnections(relations)).docs, 'to');

  users.docs = await Promise.all(users.docs.map((u) => preprocessUser(u, accountsUsersConnection, accounts)));
  return users;
}

function preprocessUser(user: JSONObject, accountsUsersConnection: JSONObject[], accounts: JSONObject[]) {
  const accountUserRelation = binarySearch(accountsUsersConnection, user._id, 'to');
  if (accountUserRelation === null) {
    return _.assign(user, { id: user._id });
  }
  const account = binarySearch(accounts, accountUserRelation.from, '_id');
  if (account === null) {
    return _.assign(user, { id: user._id });
  }
  return _.assign(user, { id: user._id, account: { id: account._id, name: account.name, user: null, platform: account.platform } });
}

// ###################### ACCOUNTS ######################

export async function findAllAccounts(database: PouchDB.Database, relations: PouchDB.Database) {
  const users = (await findAll(database, 'users')).docs;
  const accounts = await findAll(database, 'accounts');
  const accountsUsersConnection = sortByAttributeString((await findAccountUserConnections(relations)).docs, 'from');

  accounts.docs = await Promise.all(accounts.docs.map((u) => preprocessAccount(u, accountsUsersConnection, users)));
  return accounts;
}

function preprocessAccount(account: JSONObject, accountsUsersConnection: JSONObject[], users: JSONObject[]) {
  const accountUserRelation = binarySearch(accountsUsersConnection, account._id, 'from');
  // If user.name is null but user.login exists, set name = login
  if (account.name == null && account.login != null) {
    account.name = account.login;
  }
  if (accountUserRelation === null) {
    return _.assign(account, { id: account._id });
  }
  const user = binarySearch(users, accountUserRelation.to, '_id');
  if (user === null) {
    return _.assign(account, { id: account._id });
  }
  return _.assign(account, { id: account._id, user: _.assign(user, { id: user._id }) });
}

export async function findAllAccountsIssues(database: PouchDB.Database, relations: PouchDB.Database) {
  const users = (await findAll(database, 'users')).docs;
  const accounts = await findAll(database, 'accounts');
  const accountsUsersConnection = sortByAttributeString((await findAccountUserConnections(relations)).docs, 'from');
  const issues = (await findAll(database, 'issues')).docs;
  const accountsIssuesConnection = sortByAttributeString((await findAll(relations, 'issues-accounts')).docs, 'to');

  accounts.docs = await Promise.all(accounts.docs.map((u) => preprocessAccount(u, accountsUsersConnection, users)));
  accounts.docs.forEach((account) => {
    account.issues = [];
    const relevantIssues = binarySearchArray(accountsIssuesConnection, account._id, 'to');
    relevantIssues.forEach((issueConnection) => {
      const issue = binarySearch(issues, issueConnection.from, '_id');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (issue) account.issues.push(issue);
    });
  });
  return accounts;
}

// ###################### OTHER ######################

export function findIssue(database: PouchDB.Database, iid: number) {
  return database.find({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    selector: { _id: { $regex: new RegExp('^issues/.*') }, iid: { $eq: iid } },
  });
}

export function findFile(database: PouchDB.Database, file: number) {
  return database.find({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    selector: { _id: { $regex: new RegExp('^files/.*') }, path: { $eq: file } },
  });
}

export async function findAllIssues(database: PouchDB.Database, relations: PouchDB.Database) {
  return findAllIssuesOrMergeRequests(database, relations, 'issues');
}

export async function findAllMergeRequests(database: PouchDB.Database, relations: PouchDB.Database) {
  return findAllIssuesOrMergeRequests(database, relations, 'mergeRequests');
}

// finds all Issues/MRs and infers notes, author, assignee and assignees using the respective relations
async function findAllIssuesOrMergeRequests(database: PouchDB.Database, relations: PouchDB.Database, type: string) {
  if (type !== 'issues' && type !== 'mergeRequests') {
    return { docs: [] };
  }
  const issues = await findAll(database, type);

  // get issues-accounts connections and sort by the issues ids
  const issuesAccounts = sortByAttributeString((await findAll(relations, `${type}-accounts`)).docs, 'from');
  const users = (await findAll(database, 'users')).docs;
  const accountsUsersConnection = sortByAttributeString((await findAccountUserConnections(relations)).docs, 'from');
  const rawAccounts = await findAll(database, 'accounts');
  rawAccounts.docs = await Promise.all(rawAccounts.docs.map((a) => preprocessAccount(a, accountsUsersConnection, users)));
  const accounts = sortByAttributeString(rawAccounts.docs, '_id');

  // get relevant connections for notes
  // notes array should already be sorted by _id
  const notes = (await findAll(database, 'notes')).docs;
  const issuesNotesConnections = sortByAttributeString((await findIssueNoteConnections(relations)).docs, 'from');
  const notesAccountsConnections = sortByAttributeString((await findNoteAccountConnections(relations)).docs, 'from');

  issues.docs = issues.docs.map((i) => {
    // related notes
    i.notes = [];
    const relevantNotesConnections = binarySearchArray(issuesNotesConnections, i._id, 'from');
    i.notes = relevantNotesConnections.map((issueNote) => {
      // find note this connection points to
      const note = binarySearch(notes, issueNote.to, '_id');
      // find author of this note
      // find the outgoing connection from this note to the acc of the author
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const noteAccConnection = binarySearch(notesAccountsConnections, note._id, 'from');
      // find the actual acc the connection points to
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      note.author = binarySearch(accounts, noteAccConnection.to, '_id');
      return note;
    });

    // related accounts
    i.author = null;
    i.assignee = null;
    i.assignees = [];
    // find all related accounts
    const relevantAccConnections = binarySearchArray(issuesAccounts, i._id, 'from');
    relevantAccConnections.forEach((c) => {
      // find account
      const a = binarySearch(accounts, c.to, '_id');
      // add account to the issue i the role defined by the connection
      if (c.role === 'author') {
        i.author = a;
      } else if (c.role === 'assignee') {
        i.assignee = a;
      } else if (c.role === 'assignees') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        i.assignees.push(a);
      }
    });
    return i;
  });
  return issues;
}

// ###################### CONNECTIONS ######################

export function findFileCommitConnections(relations: PouchDB.Database) {
  return findAll(relations, 'commits-files');
}

export function findCommitUserConnections(relations: PouchDB.Database) {
  return findAll(relations, 'commits-users');
}

export function findCommitCommitConnections(relations: PouchDB.Database) {
  return findAll(relations, 'commits-commits');
}

export function findFileCommitUserConnections(relations: PouchDB.Database) {
  return findAll(relations, 'commits-files-users');
}

export function findBranch(database: PouchDB.Database, branch: string) {
  return new Promise<PouchDB.Find.FindResponse<object>>((resolve) =>
    database
      .find({
        selector: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          _id: { $regex: new RegExp('^branches/.*') },
          branch: { $eq: branch },
        },
      })
      .then((result) => resolve(result)),
  );
}

export function findBranchFileConnections(relations: PouchDB.Database) {
  return findAll(relations, 'branches-files');
}

// a connection between a branch-file edge and a file
export function findBranchFileFileConnections(relations: PouchDB.Database) {
  return findAll(relations, 'branches-files-files');
}

export function findBuild(database: PouchDB.Database, sha: string) {
  return database.find({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    selector: { _id: { $regex: new RegExp('^builds/.*') }, sha: { $eq: sha } },
  });
}

// TODO should probably not be used, very slow
export function findFileConnections(relations: PouchDB.Database, commitId: number) {
  return relations.find({
    selector: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      _id: { $regex: new RegExp('^commits-files/.*') },
      from: { $eq: commitId },
    },
  });
}

export function findIssueCommitConnections(relations: PouchDB.Database) {
  return findAll(relations, 'issues-commits');
}

export function findCommitBuildConnections(relations: PouchDB.Database) {
  return findAll(relations, 'commits-builds');
}

export function findIssueNoteConnections(relations: PouchDB.Database) {
  return findAll(relations, 'issues-notes');
}

export function findNoteAccountConnections(relations: PouchDB.Database) {
  return findAll(relations, 'notes-accounts');
}

export function findAccountUserConnections(relations: PouchDB.Database) {
  return findAll(relations, 'accounts-users');
}

export function findIssueNoteConnection(relations: PouchDB.Database) {
  return findAll(relations, 'issues-notes');
}

export function findMRNoteConnection(relations: PouchDB.Database) {
  return findAll(relations, 'mergeRequests-notes');
}
