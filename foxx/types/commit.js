'use strict';

const gql = require('graphql-sync');
const blameHunkType = require('./blameHunk.js');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToBlameHunks = db._collection('commits-blameHunks');
const blameHunksToFiles = db._collection('blameHunks-files');

module.exports = new gql.GraphQLObjectType({
  name: 'Commit',
  description: 'A single git commit',
  fields() {
    return {
      sha: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      message: {
        type: gql.GraphQLString,
        description: 'The commit message'
      },
      signature: {
        type: gql.GraphQLString,
        description: "The commit author's signature"
      },
      date: {
        type: gql.GraphQLString,
        description: 'The date of the commit'
      },
      hunks: {
        type: new gql.GraphQLList(blameHunkType),
        description: 'The hunks in this commit',
        args: {},
        resolve(commit, args) {
          return db
            ._query(
              aql`FOR hunk
                  IN
                  INBOUND ${commit} ${commitsToBlameHunks}
                  SORT hunk._key ASC
                    RETURN hunk`
            )
            .toArray();
        }
      },
      files: {
        type: new gql.GraphQLList(require('./file.js')),
        description: 'The files touched by this commit',
        args: {},
        resolve(commit, args) {
          return db
            ._query(
              aql`FOR hunk
                IN
                INBOUND ${commit} ${commitsToBlameHunks}
                  FOR file
                  IN
                  INBOUND
                  hunk ${blameHunksToFiles}
                    RETURN file`
            )
            .toArray();
        }
      }
    };
  }
});
