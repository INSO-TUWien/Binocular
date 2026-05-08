'use strict';

const gql = require("graphql-sync");
const arangodb = require("@arangodb");
const Timestamp = require("./Timestamp");
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToUsers = db._collection('commits-users');
const accountsToUsers = db._collection('accounts-users')
const issuesToAccounts = db._collection('issues-accounts')
const mergeRequestsToAccounts = db._collection('mergeRequests-accounts')
const paginated = require("./paginated.js");

module.exports = new gql.GraphQLObjectType({
  name: 'Account',
  description: 'A GitAccount',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      platform: {
        type: gql.GraphQLString,
        description: 'The platform of this account',
      },
      login: {
        type: gql.GraphQLString,
        description: 'The username of this account',
      },
      name: {
        type: gql.GraphQLString,
        description: 'The full name of the user this account belongs to',
      },
      url: {
        type: gql.GraphQLString,
        description: 'A link to the user profile on the respective platform',
      },
      avatarUrl: {
        type: gql.GraphQLString,
        description: "A link to the profile picture of this account",
      },
      issues: {
        type: new gql.GraphQLList(require('./issue.js')),
        description: 'Issues where this account is an assignee',
        args: { from: { type: Timestamp }, to: { type: Timestamp } },
        resolve(account, args) {
          return db._query(aql`
            FOR issue, edge IN INBOUND ${account} ${issuesToAccounts}
              FILTER edge.role IN ["assignees","author","reviewer","commenter"]
              ${args.from ? aql`FILTER DATE_TIMESTAMP(issue.createdAt) >= DATE_TIMESTAMP(${args.from})` : aql``}
              ${args.to   ? aql`FILTER DATE_TIMESTAMP(issue.createdAt) <= DATE_TIMESTAMP(${args.to})` : aql``}
              RETURN issue
          `).toArray();
        },
      },
      mergeRequests: {
        type: new gql.GraphQLList(require('./mergeRequest.js')),
        description: 'Merge requests where this account is an author or assignee',
        args: { from: { type: Timestamp }, to: { type: Timestamp } },
        resolve(account, args) {
          return db._query(aql`
            FOR mr, edge IN INBOUND ${account} ${mergeRequestsToAccounts}
              FILTER edge.role IN ["assignees","author","reviewer","commenter"]
              ${args.from ? aql`FILTER DATE_TIMESTAMP(mr.createdAt) >= DATE_TIMESTAMP(${args.from})` : aql``}
              ${args.to   ? aql`FILTER DATE_TIMESTAMP(mr.createdAt) <= DATE_TIMESTAMP(${args.to})` : aql``}
              RETURN mr
          `).toArray();
        },
      },
      user: {
        type: require('./user.js'),
        description: 'The user details related to this GitHub account',
        resolve: function(account, args) {
          return db
            ._query(
              aql`
                FOR user 
                IN 
                OUTBOUND ${account} ${accountsToUsers}
                RETURN user`
            ).next();
        },
      }
    };
  },
});
