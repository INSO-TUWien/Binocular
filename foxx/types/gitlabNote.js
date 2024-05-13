'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const Timestamp = require('./Timestamp');
const db = arangodb.db;
const aql = arangodb.aql;
const notesToAccounts = db._collection('notes-accounts');

module.exports = new gql.GraphQLObjectType({
  name: 'GitLabNote',
  description: 'A GitLabNote',
  fields() {
    return {
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github author of this issue',
        resolve(note /*, args*/) {
          return db
            ._query(
              aql`
              FOR author, edge
              IN outbound ${note} ${notesToAccounts}
              RETURN author
              `
            )
            .toArray()[0];
        },
      },
      body: {
        type: gql.GraphQLString,
        description: 'body of the note',
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the issue',
      },
      updatedAt: {
        type: Timestamp,
        description: 'Sate the issue was updated',
      },
      system: {
        type: gql.GraphQLBoolean,
      },
      resolvable: {
        type: gql.GraphQLBoolean,
      },
      confidential: {
        type: gql.GraphQLBoolean,
      },
      internal: {
        type: gql.GraphQLBoolean,
      }
    };
  },
});
