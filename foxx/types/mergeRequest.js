'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const Timestamp = require('./Timestamp');
const db = arangodb.db;
const aql = arangodb.aql;
const mergeRequestsToAccounts = db._collection('mergeRequests-accounts')
const mergeRequestsToMilestones = db._collection('mergeRequests-milestones');
const mergeRequestsToNotes = db._collection('mergeRequests-notes');


module.exports = new gql.GraphQLObjectType({
  name: 'mergeRequest',
  description: 'A mergeRequest (Gitlab Only Github MergeRequests are equivalent to Issues)',
  fields() {
    return {
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github/gitlab author of this mergeRequest',
        resolve(mr /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${mr} ${mergeRequestsToAccounts}
              FILTER edge.role == "author"
              RETURN account
              `
            )
            .toArray()[0];
        },
      },
      assignee: {
        type: require('./gitHubUser.js'),
        description: 'The assignee of this mergeRequest',
        resolve(mr /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${mr} ${mergeRequestsToAccounts}
              FILTER edge.role == "assignee"
              RETURN account
              `
            )
            .toArray()[0];
        },
      },
      assignees: {
        type: new gql.GraphQLList(require('./gitHubUser.js')),
        description: 'All the assignees of this mergeRequest',
        resolve(mr /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${mr} ${mergeRequestsToAccounts}
              FILTER edge.role == "assignees"
              RETURN account
              `
            )
            .toArray();
        },
      },
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
      milestone: {
        type: require('./milestone.js'),
        description: 'The milestone this issue belongs to',
        resolve(mr /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              milestone, edge
              IN
              OUTBOUND ${mr} ${mergeRequestsToMilestones}
              RETURN milestone
              `
            )
            .toArray()[0];
        },
      },
      notes: {
        type: new gql.GraphQLList(require('./gitlabNote.js')),
        description: 'Notes attached to the Merge Request',
        resolve(mr /*, args*/) {
          return db
            ._query(
              aql`
              FOR note, edge
              IN outbound ${mr} ${mergeRequestsToNotes}
              RETURN note
              `
            )
            .toArray();
        },
      },
    };
  },
});
