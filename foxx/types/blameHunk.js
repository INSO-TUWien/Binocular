'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const blameHunksToFiles = db._collection('blameHunks-files');
const fileType = require('./file.js');

module.exports = new gql.GraphQLObjectType({
  name: 'BlameHunk',
  description: 'A hunk of changes',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      startLine: {
        type: gql.GraphQLInt,
        description: 'The starting line number of the hunk'
      },
      lineCount: {
        type: gql.GraphQLInt
      },
      signature: {
        type: gql.GraphQLString,
        description: "Author's signature"
      },
      file: {
        type: fileType,
        description: 'The hunks in this commit',
        args: {},
        resolve(hunk /*, args*/) {
          return db
            ._query(
              aql`
            FOR
            file
            IN
            INBOUND ${hunk} ${blameHunksToFiles}
              RETURN file
          `
            )
            .toArray()[0];
        }
      }
    };
  }
});
