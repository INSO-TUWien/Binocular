'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToBlameHunks = db._collection('commits-blameHunks');
const blameHunksToFiles = db._collection('blameHunks-files');

module.exports = new gql.GraphQLObjectType({
  name: 'File',
  description: 'A file in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root'
      },
      commits: {
        type: new gql.GraphQLList(require('./commit.js')),
        description: 'The commits touching this file',
        resolve(file /*, args*/) {
          return db
            ._query(
              aql`FOR hunk
                  IN
                  OUTBOUND ${file} ${blameHunksToFiles}
                    FOR commit
                    IN
                    OUTBOUND
                    hunk ${commitsToBlameHunks}
                      RETURN commit`
            )
            .toArray();
        }
      }
    };
  }
});
