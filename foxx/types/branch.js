'use strict';

const gql = require('graphql-sync');
const paginated = require('./paginated.js');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const branchesToFiles = db._collection('branches-files');

module.exports = new gql.GraphQLObjectType({
  name: 'Branch',
  description: 'A branch in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      branch: {
        type: gql.GraphQLString,
        description: 'The name of the branch',
      },
      active: {
        type: gql.GraphQLString,
        description: 'True if this is the current active branch on your system.',
      },
      latestCommit: {
        type: gql.GraphQLString,
        description: 'latest commit on this branch',
      },
      tracksFileRenames: {
        type: gql.GraphQLString,
        description: 'True if renames of files connected to this branch are tracked.',
      },
      files: paginated({
        type: require('./fileInBranch.js'),
        description: 'The files existing in this branch',
        query: (branch, args, limit) => aql`
          FOR file, edge
            IN OUTBOUND ${branch} ${branchesToFiles}
            ${limit}
            RETURN {
              file,
            }`,
      }),
    };
  },
});
