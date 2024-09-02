'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const Timestamp = require('./Timestamp');
const commentsToAccounts = db._collection('comments-accounts');

module.exports = new gql.GraphQLObjectType({
  name: 'comment',
  description: 'A github/gitlab comment',
  fields() {
    return {
      id: {
        type: gql.GraphQLString,
        description: 'id of the comment',
      },
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github/gitlab author of this comment',
        resolve(comment /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              account, edge
              IN
              OUTBOUND ${comment} ${commentsToAccounts}
              FILTER edge.role == "author"
              RETURN account
              `,
            )
            .toArray()[0];
        },
      },
      createdAt: {
        type: Timestamp,
        description: 'Creating date of comment',
      },
      updatedAt: {
        type: Timestamp,
        description: 'Update date of comment',
      },
      lastEditedAt: {
        type: Timestamp,
        description: 'Last edit date of comment',
      },
      path: {
        type: gql.GraphQLString,
        description: 'Path to file the comment is referencing',
      },
      bodyText: {
        type: gql.GraphQLString,
        description: 'Content of the comment',
      },
    };
  },
});
