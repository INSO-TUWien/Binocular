'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'LastRevision',
  description: 'Last revision that has already been indexed by the clone detection tool.',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      sha: {
        type: gql.GraphQLString,
        description: 'The sha of the commmit'
      }
    };
  }
});
