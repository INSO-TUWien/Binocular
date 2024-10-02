'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const issuesToUsers = db._collection('issues-users');
const issuesToAccounts = db._collection('issues-accounts')
const issuesToCommits = db._collection('issues-commits');
const issuesToMilestones = db._collection('issues-milestones');
const issuesToNotes = db._collection('issues-notes');
const paginated = require('./paginated.js');
const Timestamp = require('./Timestamp.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Issue',
  description: 'A GitLab issue',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      iid: {
        type: gql.GraphQLString,
        description: 'The issue number within its project',
      },
      title: {
        type: gql.GraphQLString,
        description: 'The issue title',
      },
      description: {
        type: gql.GraphQLString,
        description: 'The issue description',
      },
      state: {
        type: gql.GraphQLString,
        description: 'The issue state',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'Web URL of the issue',
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the issue',
      },
      closedAt: {
        type: Timestamp,
        description: 'Close date of the issue',
      },
      creator: {
        type: require('./user.js'),
        description: 'The creator of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              user
              IN
              OUTBOUND ${issue} ${issuesToUsers}
                RETURN user
              `
            )
            .toArray()[0];
        },
      },
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github author of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${issue} ${issuesToAccounts}
              FILTER edge.role == "author"
              RETURN account
              `
            )
            .toArray()[0];
        },
      },
      assignee: {
        type: require('./gitHubUser.js'),
        description: 'The assignee of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${issue} ${issuesToAccounts}
              FILTER edge.role == "assignee"
              RETURN account
              `
            )
            .toArray()[0];
        },
      },
      assignees: {
        type: new gql.GraphQLList(require('./gitHubUser.js')),
        description: 'All the assignees of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${issue} ${issuesToAccounts}
              FILTER edge.role == "assignees"
              RETURN account
              `
            )
            .toArray();
        },
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'All commits mentioning this issue',
        args: {
          since: { type: Timestamp, required: false },
          until: { type: Timestamp, required: false },
        },
        query: (issue, args, limit) => {
          let query = aql`
            FOR commit, edge IN
            OUTBOUND ${issue} ${issuesToCommits}`;

          if (args.since !== undefined) {
            query = aql`${query} FILTER DATE_TIMESTAMP(commit.date) >= DATE_TIMESTAMP(${args.since})`;
          }

          if (args.until !== undefined) {
            query = aql`${query} FILTER DATE_TIMESTAMP(commit.date) <= DATE_TIMESTAMP(${args.until})`;
          }

          query = aql`${query} ${limit} RETURN commit`;
          return query;
        },
      }),
      milestone: {
        type: require('./milestone.js'),
        description: 'The milestone this issue belongs to',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              milestone, edge
              IN
              OUTBOUND ${issue} ${issuesToMilestones}
              RETURN milestone
              `
            )
            .toArray()[0];
        },
      },
      notes: {
        type: new gql.GraphQLList(require('./gitlabNote.js')),
        description: 'Notes attached to the issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR note, edge
              IN outbound ${issue} ${issuesToNotes}
              RETURN note
              `
            )
            .toArray();
        },
      },
    };
  },
});
