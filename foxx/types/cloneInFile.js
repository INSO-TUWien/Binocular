'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'CloneInFile',
  description: 'Connection between a clone and the files it occurs in',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      file: {
        type: require('./file.js')
      },
      startline: {
        type: gql.GraphQLInt,
        description: 'The first line of the clone'
      },
      endline: {
        type: gql.GraphQLInt,
        description: 'The last line of the clone'
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the project root directory'
      },
      revision: {
        type: gql.GraphQLString,
        description: 'The revision the clone is present in'
      }
    };
  }
});
