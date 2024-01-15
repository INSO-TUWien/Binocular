'use strict';

import _ from 'lodash';
import { aql } from 'arangojs';
import Model from './Model.js';
import Stakeholder from './Stakeholder.js';
import debug from 'debug';

const log = debug('db:Issue');

const Issue = Model.define('Issue', {
  attributes: [
    'id',
    'iid',
    'title',
    'description',
    'state',
    'url',
    'closedAt',
    'createdAt',
    'updatedAt',
    'labels',
    'milestone',
    'author',
    'assignee',
    'assignees',
    'userNotesCount',
    'upvotes',
    'downvotes',
    'dueDate',
    'confidential',
    'weight',
    'webUrl',
    'subscribed',
    'mentions',
    'notes',
  ],
  keyAttribute: 'id',
});

Issue.persist = function (_issueData) {
  const issueData = _.clone(_issueData);
  if (_issueData.id) {
    issueData.id = _issueData.id.toString();
  }

  delete issueData.projectId;
  delete issueData.timeStats;

  return Issue.ensureById(issueData.id, issueData, { ignoreUnknownAttributes: true });
};

Issue.deduceStakeholders = async function () {
  const IssueStakeholderConnection = (await import('./IssueStakeholderConnection.js')).default;
  return Promise.resolve(
    Issue.rawDb.query(
      aql`
    FOR issue IN ${Issue.collection}
        LET stakeholders = (FOR stakeholder
                            IN
                            INBOUND issue ${IssueStakeholderConnection.collection}
                                RETURN stakeholder)
        FILTER LENGTH(stakeholders) == 0
        COLLECT authorId = issue.author.id INTO issuesPerAuthor = issue
        RETURN {
          "author": FIRST(issuesPerAuthor).author,
          "issues": issuesPerAuthor
        }`,
    ),
  )
    .then((cursor) => cursor.all())
    .then((authors) => {
      return authors.map(function (issuesPerAuthor) {
        return Stakeholder.findOneByGitlabId(issuesPerAuthor.author.id)
          .then(function (stakeholder) {
            if (!stakeholder) {
              log('No existing stakeholder found for gitlabId %o', issuesPerAuthor.author.id);
              return findBestStakeholderMatch(issuesPerAuthor.author).then(function (stakeholder) {
                if (!stakeholder) {
                  return;
                }

                log('Best stakeholder match: %o', stakeholder.toString());

                stakeholder.gitlabId = issuesPerAuthor.author.id;
                stakeholder.gitlabName = issuesPerAuthor.author.name;
                stakeholder.gitlabWebUrl = issuesPerAuthor.author.web_url;
                stakeholder.gitlabAvatarUrl = issuesPerAuthor.author.avatar_url;
                return stakeholder.save();
              });
            }

            return stakeholder;
          })
          .then(function (stakeholder) {
            if (!stakeholder) {
              log('No stakeholder match found for %o', issuesPerAuthor.author.name);
              return;
            }
            return issuesPerAuthor.issues.map((issue) => stakeholder.connect(Issue.parse(issue)));
          });
      });
    });
};

Issue.deleteMentionsAttribute = async function () {
  return Issue.rawDb.query(
    aql`
    FOR i IN issues
    REPLACE i WITH UNSET(i, "mentions") IN issues`,
  );
};

export default Issue;

function findBestStakeholderMatch(author) {
  return Stakeholder.findAll()
    .then((stakeholder) =>
      stakeholder.reduce(function (best, stakeholder) {
        const stakeholderName = normalizeName(stakeholder.gitSignature);
        const authorName = normalizeName(author.name);
        let score = 0;

        if (stakeholderName.plain === authorName.plain) {
          score++;
        }

        if (stakeholderName.sorted === authorName.sorted) {
          score++;
        }

        if (!best || score > best.score) {
          return { score, stakeholder };
        } else if (score > 0) {
          return best;
        }
      }, null),
    )
    .then(function (bestMatch) {
      return bestMatch ? bestMatch.stakeholder : null;
    });
}

function normalizeName(name) {
  const plain = _.chain(name).deburr().lowerCase().trim().value();
  const sorted = _.chain(plain).split(/\s+/).sort().join(' ').value();

  return { plain, sorted };
}
