# Database Scheme

This document lists all collections and connections of the ArangoDB Database used by Binocular.
Complicated connections such as `branches-files-files` and `commits-files-stakeholders` are explained in detail.

Note: Collections may have different attributes, depending on the source of the data (GitLab, GitHub).

1. [Collections](#collections)
  1. [branches](#branches)
  2. [builds](#builds)
  3. [commits](#commits)
  4. [files](#files)
  5. [issues (GitHub)](#issues-github)
  6. [issues (GitLab)](#issues-gitlab)
  7. [mergeRequests (GitHub)](#mergeRequests-github)
  8. [mergeRequests (GitLab)](#mergerequests-gitlab)
  9. [milestones](#milestones)
  10. [modules](#modules)
  11. [stakeholders](#stakeholders)
2. [Connections](#connections)
  1. [branches-files](#branches-files)
  2. [branches-files-files](#branches-files-files)
  3. [commits-builds](#commits-builds)
  4. [commits-commits](#commits-commits)
  5. [commits-files](#commits-files)
  6. [commits-files-stakeholders](#commits-files-stakeholders)
  7. [commits-modules](#commits-modules)
  8. [commits-stakeholders](#commits-stakeholders)
  9. [issues-commits](#issues-commits)
  10. [issues-stakeholders](#issues-stakeholders)
  11. [modules-files](#modules-files)
  12. [modules-modules](#modules-modules)

## Collections

### branches

All branches that exist in the project at the time of indexing.
Deleted branches are not indexed.

| attribute name      | type    | details                                                                                                                                                                                                                                                                                          |
|---------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ``id``              | string  | internal ArangoDB key                                                                                                                                                                                                                                                                            |
| `branch`            | string  | Name of the branch                                                                                                                                                                                                                                                                               |
| `active`            | boolean | If this is the checked-out branch at the time of indexing.<br/> Which branches track file renames is controlled by the `fileRenameBranches` array in the `.binocularrc` file.<br/> For more information, check the documentation of the [branches-files-files connection](#branches-files-files) |
| `tracksFileRenames` | boolean | If the indexer tracked file-renames on this branch                                                                                                                                                                                                                                               |
| `latestCommit`      | string  | The hash of the last commit of this branch                                                                                                                                                                                                                                                       |

### builds

Builds by the CI system.

| attribute name | type                       | details                                                    |
|----------------|----------------------------|------------------------------------------------------------|
| `id`           | string                     | internal ArangoDB key                                      |
| `committedAt`  | string (timestamp)         |                                                            |                |                    |                     |
| `createdAt`    | string (timestamp)         |                                                            |
| `duration`     | number                     | duration in seconds                                        |
| `finishedAt`   | string (timestamp)         |                                                            |
| `jobs`         | Array\[[Job](#job-object)] | see definition below                                       |
| `startedAt`    | string (timestamp)         |                                                            |
| `status`       | string                     |                                                            |
| `tag`          | string                     | first line of the commit message that triggered this build |
| `updatedAt`    | string (timestamp)         |                                                            |
| `user`         | string                     | user that triggered this build                             |
| `userFullName` | string                     |                                                            |
| `webUrl`       | string                     | link to GitHub                                             |

#### Job Object

| attribute name | type               | details                                |
|----------------|--------------------|----------------------------------------|
| `id`           | number             | internal GitHub id of the job          |
| `name`         | string             | name of the user who triggered the job |
| `status`       | string             |                                        |
| `stage`        | string             |                                        |
| `createdAt`    | string (timestamp) |                                        |
| `finishedAt`   | string (timestamp) |                                        |
| `webUrl`       | string             | link to GitHub                         |

### commits

| attribute name | type                          | details                                               |
|----------------|-------------------------------|-------------------------------------------------------|
| `sha`          | string                        | sha hash of the commit. Also used as the ArangoDB key |
| `date`         | string (timestamp)            |                                                       |
| `message`      | string                        | commit message                                        |
| `webUrl`       | string                        | link to GitHub/Lab                                    |
| `branch`       | string                        | branch this commit currently belongs to.              |
| `stats`        | [Stats](#stats-object) Object | see below                                             |

#### Stats Object

| attribute name | type   | details                                |
|----------------|--------|----------------------------------------|
| `additions`    | number | number of lines added in this commit   |
| `deletions`    | number | number of lines deleted in this commit |                                                       |

### files

All files that ever existed in the project.
Also includes deleted files.
Note that renaming files technically deletes the old file and creates a new file with the new path.

| attribute name | type   | details                                                                     |
|----------------|--------|-----------------------------------------------------------------------------|
| `webUrl`       | string | link to GitHub                                                              |
| `path`         | string | full path of the file starting at the project root (**without leading ./**) |
| `maxLength`    | number | maximum number of lines of the file across its lifecycle                    |

### issues (GitHub)

Issues from the GitHub ITS.

| attribute name | type                                           | details                             |
|----------------|------------------------------------------------|-------------------------------------|
| `id`           | string                                         | internal ArangoDB key               |
| `assignee`     | [GitHub-Author](#github-author-object) Object  | current assignee                    |
| `assignees`    | Array\[[GitHub-Author](#github-author-object)] | past assignees                      |
| `author`       | [GitHub-Author](#github-author-object) Object  | who created the issue               |
| `createdAt`    | string (timestamp)                             |                                     |
| `closedAt`     | string (timestamp)                             |                                     |
| `title`        | string                                         |                                     |
| `description`  | string                                         |                                     |
| `iid`          | number                                         | GitHub issue id                     |
| `labels`       | Array\[[GitHub-Label](#github-label-object)]   |                                     |
| `milestone`    | [Milestone](#milestones) Object                |                                     |
| `state`        | string                                         | if the issue is opened, closed etc. |
| `updatedAt`    | string (timestamp)                             |                                     |
| `url`          | string                                         | link to GitHub                      |
| `webUrl`       | string                                         | link to GitHub                      |

#### GitHub-Author Object

| attribute name | type   | details |
|----------------|--------|---------|
| `login`        | string |         |
| `name`         | string |         |

#### GitHub-Label Object

| attribute name | type    | details                                         |
|----------------|---------|-------------------------------------------------|
| `id`           | string  | internal Github key                             |
| `url`          | string  | link to GitHub                                  |
| `name`         | string  |                                                 |
| `color`        | string  | hex code of the label color (without leading #) |
| `isDefault`    | boolean |                                                 |
| `description`  | string  |                                                 |

### issues (GitLab)

Issues from the GitLab ITS

| attribute name         | type                                                | details                                                          |
|------------------------|-----------------------------------------------------|------------------------------------------------------------------|
| `id`                   | string                                              | internal ArangoDB key                                            |
| `assignee`             | [GitLab-Author](#gitlab-author-object) Object       | current assignee                                                 |
| `assignees`            | Array\[[GitLab-Author](#gitlab-author-object)]      | past assignees                                                   |
| `author`               | [GitLab-Author](#gitlab-author-object) Object       | who created the issue                                            |
| `createdAt`            | string (timestamp)                                  |                                                                  |
| `closedAt`             | string (timestamp)                                  |                                                                  |
| `closedBy`             | [GitLab-Author](#gitlab-author-object) Object       |                                                                  |
| `confidential`         | boolean                                             |                                                                  |
| `description`          | string                                              |                                                                  |
| `discussionLocked`     |                                                     |                                                                  |
| `downvotes`            | number                                              |                                                                  |
| `dueDate`              | string                                              |                                                                  |
| `hasTasks`             | boolean                                             |                                                                  |
| `iid`                  | number                                              | GitLab issue id                                                  |
| `issueType`            | string                                              |                                                                  |
| `labels`               | Array\[string]                                      |                                                                  |
| `links`                | Object                                              | Object with links to related resources (the project, notes etc.) |
| `mergeRequestsCount`   | number                                              |                                                                  |
| `milestone`            | [GitLab-Milestone](#gitlab-milestone-object) Object |                                                                  |
| `movedToId`            | number \| null                                      |                                                                  |
| `notes`                | Array\[[GitLab-Notes](#gitlab-notes-object)]        |                                                                  |
| `references`           | Object                                              |                                                                  |
| `serviceDeskReplyTo`   |                                                     |                                                                  |
| `severity`             | string                                              |                                                                  |
| `state`                | string                                              |                                                                  |
| `taskCompletionStatus` |                                                     |                                                                  |
| `taskStatus`           | string                                              |                                                                  |
| `title`                | string                                              |                                                                  |
| `type`                 | string                                              |                                                                  |
| `updatedAt`            | string (timestamp)                                  |                                                                  |
| `upvotes`              | number                                              |                                                                  |
| `userNotesCount`       | number                                              |                                                                  |
| `webUrl`               | string                                              |                                                                  |

#### GitLab-Author Object

| attribute name | type    | details |
|----------------|---------|---------|
| `id`           | number  |         |
| `username`     | string  |         |
| `name`         | string  |         |
| `state`        | string  |         |
| `locked`       | boolean |         |
| `avatar_url`   | string  |         |
| `web_url`      | string  |         |

#### GitLab-Milestone Object

Exactly like the [milestones Object](#milestones), with one additional field:

| attribute name | type   | details |
|----------------|--------|---------|
| `project_id`   | number |         |

#### GitLab-Notes Object

| attribute name     | type                                          | details                                                 |
|--------------------|-----------------------------------------------|---------------------------------------------------------|
| `id`               | number                                        |                                                         |
| `type`             |                                               |                                                         |
| `body`             | string                                        |                                                         |
| `attachment`       |                                               |                                                         |
| `author`           | [GitLab-Author](#gitlab-author-object) Object |                                                         |
| `created_at`       | string (timestamp)                            |                                                         |
| `updated_at`       | string (timestamp)                            |                                                         |
| `system`           | boolean                                       |                                                         |
| `noteable_id`      | number                                        | internal ArangoDB id of the issue this notes belongs to |
| `noteable_type`    | string                                        | type of the issue this note belongs to                  |
| `noteable_iid`     | number                                        | iid of the issue this note belongs to                   |
| `project_id`       | number                                        |                                                         |
| `resolvable`       | boolean                                       |                                                         |
| `confidential`     | boolean                                       |                                                         |
| `internal`         | boolean                                       |                                                         |
| `commands_changes` | Object                                        |                                                         |

### mergeRequests (GitHub)

Open and merged MRs.
Attributes are identical to [GitHub issues](#issues-github), except for one additional one:

| attribute name | type   | details |
|----------------|--------|---------|
| `state`        | string |         |

### mergeRequests (GitLab)

| attribute name                | type                                                | details               |
|-------------------------------|-----------------------------------------------------|-----------------------|
| `id`                          | string                                              | internal ArangoDB key |
| `iid`                         | number                                              |                       |
| `title`                       | string                                              |                       |
| `description`                 | string                                              |                       |
| `state`                       | string                                              |                       |
| `createdAt`                   | string (timestamp)                                  |                       |
| `updatedAt`                   | string (timestamp)                                  |                       |
| `mergedBy`                    | [GitLab-Author](#gitlab-author-object) Object       |                       |
| `mergeUser`                   | [GitLab-Author](#gitlab-author-object) Object       |                       |
| `mergedAt`                    |                                                     |                       |
| `closedBy`                    | [GitLab-Author](#gitlab-author-object) Object       |                       |
| `closedAt`                    | string (timestamp)                                  |                       |
| `targetBranch`                | string                                              |                       |
| `sourceBranch`                | string                                              |                       |
| `userNotesCount`              | number                                              |                       |
| `upvotes`                     | number                                              |                       |
| `downvotes`                   | number                                              |                       |
| `author`                      | [GitLab-Author](#gitlab-author-object) Object       |                       |
| `assignees`                   | Array\[[GitLab-Author](#gitlab-author-object)]      |                       |
| `assignee`                    | [GitLab-Author](#gitlab-author-object) Object       |                       |
| `reviewers`                   | Array\[[GitLab-Author](#gitlab-author-object)]      |                       |
| `sourceProjectId`             | number                                              |                       |
| `targetProjectId`             | number                                              |                       |
| `labels`                      | Array\[string]                                      |                       |
| `draft`                       | boolean                                             |                       |
| `workInProgress`              | boolean                                             |                       |
| `milestone`                   | [GitLab-Milestone](#gitlab-milestone-object) Object |                       |
| `mergeWhenPipelineSucceeds`   | boolean                                             |                       |
| `mergeStatus`                 | string                                              |                       |
| `detailedMergeStatus`         | string                                              |                       |
| `sha`                         | string                                              |                       |
| `mergeCommitSha`              | string                                              |                       |
| `squashCommitSha`             | string                                              |                       |
| `discussionLocked`            |                                                     |                       |
| `shouldRemoveSourceBranch`    | boolean                                             |                       |
| `forceRemoveSourceBranch`     | boolean                                             |                       |
| `preparedAt`                  | string (timestamp)                                  |                       |
| `reference`                   | string                                              |                       |
| `references`                  | Object                                              |                       |
| `webUrl`                      | string                                              |                       |
| `timeStats`                   | Object                                              |                       |
| `squash`                      | boolean                                             |                       |
| `squashOnMerge`               | boolean                                             |                       |
| `taskCompletionStatus`        |                                                     |                       |
| `hasConflicts`                | boolean                                             |                       |
| `blockingDiscussionsResolved` | boolean                                             |                       |
| `notes`                       | Array\[[GitLab-Notes](#gitlab-notes-object)]        |                       |

### milestones

| attribute name | type               | details               |
|----------------|--------------------|-----------------------|
| `id`           | string             | internal ArangoDB key |
| `iid`          | string             |                       |
| `title`        | string             |                       |
| `description`  | string             |                       |
| `startDate`    | string (timestamp) |                       |
| `dueDate`      | string (timestamp) |                       |
| `state`        | string             |                       |
| `createdAt`    | string (timestamp) |                       |
| `updatedAt`    | string (timestamp) |                       |
| `expired`      | boolean            |                       |
| `webURL`       | string             |                       |

### modules

All directories contained in the project.
Also contains directories that have been deleted/renamed.

| attribute name | type   | details                                                                    |
|----------------|--------|----------------------------------------------------------------------------|
| `path`         | string | full path of the module starting at the project root (**with leading ./**) |

### stakeholders

All users that have ever committed to the project.

| attribute name | type   | details                                             |
|----------------|--------|-----------------------------------------------------|
| `gitSignature` | string | Signature with the following format: `name <email>` |

## Connections

### branches-files

Tracks which files *currently* exists on a branch.

| attribute name | type   | details                                  |
|----------------|--------|------------------------------------------|
| `_from`        | string | internal ArangoDB key of a file object   |
| `_to`          | string | internal ArangoDB key of a branch object |

### branches-files-files

This connection is used to track file renames.

#### Attributes

| attribute name     | type               | details                                              |
|--------------------|--------------------|------------------------------------------------------|
| `_from`            | string             | internal ArangoDB key of a branches-files connection |
| `_to`              | string             | internal ArangoDB key of a file object               |
| `hasThisNameFrom`  | string (timestamp) |                                                      |
| `hasThisNameUntil` | string (timestamp) |                                                      |

#### Example

- On branch `b`, there exists a file `f1`.
  - There is a connection `bf` from `f1` to branch `b` in `branches-files`.
- At some point in the past, `f1` was named `f0`.
  - There is a connection from `bf` to `f0` in `branches-files-files` that models that on branch `b`, `f1` was
    named `f0` at some earlier point.

![branches-files-files.png](assets/branches-files-files.png)

#### Details

Documents in `branches-files-files` contain two attributes: `hasThisNameFrom` and `hasThisNameUntil`.
If `hasThisNameUntil` is `null`, this means that the file *still has that name*.
So for the connection `bf` from `f1` to `b`, there exist two connections in the `branches-files-files` connection: one
from `bf` to `f0` and one from `bf` to `f1`

Since tracking file renames requires some time during indexing, it has to be manually enabled for each branch.
To do this, add the following to your `.binocularrc` file:

```
"fileRenameBranches": [
    "branch",
    "other-branch"
],
```

Use case: For some visualizations, it may be important to know which files were renamed at which points in time.
For example, if we want to know who contributed to `f1`, we would need to go through all commits that touched `f1` *and*
through all commits that touched `f0`.
Otherwise, all changes prior to the rename would not be counted.

### commits-builds

Tracks which builds were triggered because of which commits.

| attribute name | type   | details                                  |
|----------------|--------|------------------------------------------|
| `_from`        | string | internal ArangoDB key of a build object  |
| `_to`          | string | internal ArangoDB key of a commit object |

### commits-commits

Tracks parent-child relationships between commits.

| attribute name | type   | details                                    |
|----------------|--------|--------------------------------------------|
| `_from`        | string | internal ArangoDB key of the parent commit |
| `_to`          | string | internal ArangoDB key of the child commit  |

### commits-files

Tracks which files were added/deleted/modified by commits.

| attribute name | type                         | details                                                                             |
|----------------|------------------------------|-------------------------------------------------------------------------------------|
| `_from`        | string                       | internal ArangoDB key of a file object                                              |
| `_to`          | string                       | internal ArangoDB key of a commit object                                            |
| `hunks`        | Array\[[Hunk](#hunk-object)] | tracks which parts of a file have been modified by this commit                      |
| `lineCount`    | number                       | if the file was added in this commit, this is the original line count. Otherwise 0. |
| `stats`        | Stats Object                 |                                                                                     |
| `action`       | string                       | either "added", "deleted" or "modified                                              |

#### Hunk Object

| attribute name | type   | details                                       |
|----------------|--------|-----------------------------------------------|
| `newStart`     | number | line number where the newly added lines start |
| `newLines`     | number | number of newly added lines                   |                                                       |
| `oldStart`     | number | line number where deletions start             |                                                       |
| `oldLines`     | number | number of lines deleted                       |                                                       |
| `webUrl`       | string | link to GitHub                                |                                                       |

#### Stats Object

| attribute name | type   | details                                               |
|----------------|--------|-------------------------------------------------------|
| `additions`    | number | number of lines added to this file in this commit     |
| `deletions`    | number | number of lines deleted from this file in this commit |                                                       |

### commits-files-stakeholders

This connection is used to track ownership of lines of a file.

#### Attributes

| attribute name | type                                           | details                                             |
|----------------|------------------------------------------------|-----------------------------------------------------|
| `_from`        | string                                         | internal ArangoDB key of a commits-files connection |
| `_to`          | string                                         | internal ArangoDB key of a stakeholder object       |
| `hunks`        | Array\[[OwnershipHunk](#ownershiphunk-object)] | which parts of the file this stakeholder owns       |

##### OwnershipHunk Object

| attribute name   | type                           | details                                                              |
|------------------|--------------------------------|----------------------------------------------------------------------|
| `originalCommit` | string                         | sha of the commit where these lines were modified by the stakeholder |
| `lines`          | Array\[[Lines](#lines-object)] | lines that were modified by this commit                              |

##### Lines Object

| attribute name | type   | details                |
|----------------|--------|------------------------|
| `from`         | number | start line (inclusive) |
| `to`           | number | end line (inclusive)   |

#### Example

- A file `f` was altered by a commit `c`.
  - There exists a connection `cf` from `f` to `c` in `commits-files`.
  - There exist connections `cfs0`...`cfsn` from `cf` to each stakeholder `s` that owns lines of `f` at the time of
    commit `c` in `commits-files-stakeholders`.

![commits-files-stakeholders.png](assets/commits-files-stakeholders.png)

#### Details

This connection is meant to encode the output
of `git blame` ([git blame documentation](https://git-scm.com/docs/git-blame)).

Example 2:

![commits-files-stakeholders_example.png](assets/commits-files-stakeholders_example.png)

Stakeholder `alice` creates file `f` consisting of 4 lines in commit `c0`:

There now is the following document `c0f` in the `commits-files` collection:

```
_from: files/f
_to: commits/c0
{
  lineCount: 4,
  hunks: [...],
  stats: {...},
  action: 'added',
}
```

Furthermore, there is a document `c0fa` in the `commits-files-stakeholders` collection:

```
_from: commits-files/c0f
_to: stakeholders/alice
{
  hunks: [
    {
      originalCommit: sha_of_c0,
      lines: [
        {
          from: 1,
          to: 4,
        }
      ],
    }
  ]
}
```

This document tells us that right after commit `c0`, `alice` owns 4 lines of the file `f` (lines 1 to 4).

Now the stakeholder `bob` modifies `f` in commit `c1` by changing the second line.

There is now one additional document `c1f` in the `commits-files` collection:

```
_from: files/f
_to: commits/c1
{
  ...
  action: 'modified',
}
```

Additionally, there are two more documents in the `commits-files-stakeholders` collection (`c1fa` and `c1fb`):

```
_from: commits-files/c1f
_to: stakeholders/alice
{
  hunks: [
    {
      originalCommit: sha_of_c0, // NOTE: this is the sha of c0 because alice changed these lines in c0
      lines: [
        {
          from: 1,
          to: 1,
        },
        {
          from: 3,
          to: 4,
        }
      ],
    }
  ]
}
```

```
_from: commits-files/c1f
_to: stakeholders/bob
{
  hunks: [
    {
      startLine: 1,
      endLine: 1,
      originalCommit: sha_of_c1,
      lines: [
        {
          from: 2,
          to: 2,
        }
      ],
    }
  ]
}
```

This models that after commit `c1`, bob owns line 2 of file `f`, while alice still owns lines 1, 3 and 4.
In `c1fa`, the attribute `originalCommit` of the hunk still contains the sha of `c0`, because alice modified these lines
in `c0`, not in `c1`.
Note that the other connections (`c0f` and `c0fa`) remain in the database, even if there are newer commits that
changed `f`.
This is because we want to track the ownership of files over time.

### commits-modules

Tracks which modules were modified by this commit.

| attribute name | type         | details                                                 |
|----------------|--------------|---------------------------------------------------------|
| `_from`        | string       | internal ArangoDB key of a module object                |
| `_to`          | string       | internal ArangoDB key of a commit object                |
| `stats`        | Stats Object | how many lines were added to / deleted from this module |
| `webUrl`       | string       | link to GitHub                                          |

#### Stats Object

| attribute name | type   | details                                                 |
|----------------|--------|---------------------------------------------------------|
| `additions`    | number | number of lines added to this module in this commit     |
| `deletions`    | number | number of lines deleted from this module in this commit |                                                       |

### commits-stakeholders

Tracks which stakeholder committed the specified commit.

| attribute name | type   | details                                       |
|----------------|--------|-----------------------------------------------|
| `_from`        | string | internal ArangoDB key of a stakeholder object |
| `_to`          | string | internal ArangoDB key of a commit object      |

### issues-commits

Tracks which commits belong to an issue (which use `#iid` in the commit message)

| attribute name | type    | details                                  |
|----------------|---------|------------------------------------------|
| `_from`        | string  | internal ArangoDB key of a commit object |
| `_to`          | string  | internal ArangoDB key of an issue object |
| `closes`       | boolean | does this commit close the issue         |

### issues-stakeholders

Tracks which stakeholders are involved in an issue through commits that reference that issue.

| attribute name | type   | details                                       |
|----------------|--------|-----------------------------------------------|
| `_from`        | string | internal ArangoDB key of an issue object      |
| `_to`          | string | internal ArangoDB key of a stakeholder object |

### modules-files

Which files belong to which modules.

| attribute name | type   | details                                  |
|----------------|--------|------------------------------------------|
| `_from`        | string | internal ArangoDB key of a file object   |
| `_to`          | string | internal ArangoDB key of a module object |

### modules-modules

Which submodules belong to which modules.
For example `./src/backend` belongs to `./src`.

| attribute name | type   | details                                           |
|----------------|--------|---------------------------------------------------|
| `_from`        | string | internal ArangoDB key of the submodule object     |
| `_to`          | string | internal ArangoDB key of the parent module object |
