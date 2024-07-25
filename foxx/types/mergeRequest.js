'use strict';

const gql = require('graphql-sync');
const Timestamp = require('./Timestamp');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;

module.exports = new gql.GraphQLObjectType({
  name: 'mergeRequest',
  description: 'A mergeRequest (Gitlab Only Github MergeRequests are equivalent to Issues)',
  fields() {
    return {
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github/gitlab author of this mergeRequest',
      },
      assignee: {
        type: require('./gitHubUser.js'),
        description: 'The assignee of this mergeRequest',
      },
      assignees: { type: new gql.GraphQLList(require('./gitHubUser.js')), description: 'All the assignees of this mergeRequest' },
      id: {
        type: gql.GraphQLString,
        description: 'id of the mergeRequest',
      },
      iid: {
        type: gql.GraphQLString,
        description: 'iid of the mergeRequest',
      },
      title: {
        type: gql.GraphQLString,
        description: 'title of the mergeRequest',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'webUrl of the mergeRequest',
      },
      sourceBranch: {
        type: gql.GraphQLString,
        description: 'sourceBranch of the mergeRequest',
      },
      targetBranch: {
        type: gql.GraphQLString,
        description: 'targetBranch of the mergeRequest',
      },
      state: {
        type: gql.GraphQLString,
        description: 'state of the mergeRequest',
      },
      timeStats: {
        type: require('./timeStats.js'),
        description: 'time_stats of the mergeRequest',
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the mergeRequest',
      },
      closedAt: {
        type: Timestamp,
        description: 'Close date of the mergeRequest',
      },
      notes: {
        type: new gql.GraphQLList(require('./gitlabNote.js')),
        description: 'Notes attached to the Merge Request',
      },
      comments: {
        type: new gql.GraphQLList(require('./comment.js')),
        description: 'The comments belonging to the mergeRequest',
        resolve(mergeRequest) {
          return db
            ._query(
              aql`
            FOR mrc IN \`mergeRequests-comments\`
            FILTER mrc._from == ${mergeRequest._id}
            FOR comment IN comments
            FILTER mrc._to == comment._id
            RETURN comment
            `,
            )
            .toArray();
        },
      },
      reviewThreads: {
        type: new gql.GraphQLList(require('./reviewThread.js')),
        description: 'The review threads belonging to this mergeRequest',
        resolve(reviewThread) {
          return db
            ._query(
              aql`
            FOR mrr IN \`mergeRequests-reviewThreads\`
            FILTER mrr._from == ${reviewThread._id}
            FOR reviewThread IN reviewThreads
            FILTER reviewThread._id == mrr._to
            RETURN reviewThread
            `,
            )
            .toArray();
        },
      },
    };
  },
});
