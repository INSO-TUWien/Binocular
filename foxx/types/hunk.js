'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const filesToHunks = db._collection('files-hunks');
const fileType = require('./file.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Hunk',
  description: 'A hunk of changes',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      newStart: {
        type: gql.GraphQLInt,
        description: 'The starting line number of the hunk'
      },
      newLines: {
        type: gql.GraphQLInt
      },
      oldStart: {
        type: gql.GraphQLInt,
        description: 'The starting line number of the hunk'
      },
      oldLines: {
        type: gql.GraphQLInt
      },
      file: {
        type: fileType,
        description: 'The file this hunk occurs in',
        args: {},
        resolve(hunk /*, args*/) {
          return db
            ._query(
              aql`
            FOR
            file
            IN
            INBOUND ${hunk} ${filesToHunks}
              RETURN file
          `
            )
            .toArray()[0];
        }
      }
    };
  }
});
