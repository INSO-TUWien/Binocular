'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'FileInBranch',
  description: 'A file existing in the current state of a branch',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      file: {
        type: require('./file.js'),
      },
    };
  },
});
