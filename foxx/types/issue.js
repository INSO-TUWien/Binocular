'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const issuesToStakeholders = db._collection('issues-stakeholders');
const issuesToCommits = db._collection('issues-commits');
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
      upvotes: {
        type: gql.GraphQLInt,
        description: 'Number of upvotes on this issue',
      },
      downvotes: {
        type: gql.GraphQLInt,
        description: 'Number of downvotes on this issue',
      },
      dueDate: {
        type: gql.GraphQLString,
        description: 'The due date of this issue',
      },
      confidential: {
        type: gql.GraphQLBoolean,
        description: 'Wether or not this issue is confidential',
      },
      weight: {
        type: gql.GraphQLInt,
        description: 'Weight of the issue',
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
        type: require('./stakeholder.js'),
        description: 'The creator of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              stakeholder
              IN
              OUTBOUND ${issue} ${issuesToStakeholders}
                RETURN stakeholder
              `
            )
            .toArray()[0];
        },
      },
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github author of this issue',
      },
      assignee: {
        type: require('./gitHubUser.js'),
        description: 'The assignee of this issue',
      },
      assignees: { type: new gql.GraphQLList(require('./gitHubUser.js')), description: 'All the assignees of this issue' },
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
            INBOUND ${issue} ${issuesToCommits}`;

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
      notes: {
        type: new gql.GraphQLList(require('./gitlabNote.js')),
        description: 'Notes attached to the issue',
      },
    };
  },
});
