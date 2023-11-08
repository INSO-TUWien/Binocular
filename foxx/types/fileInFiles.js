'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'FileInFiles',
  description: 'A previous version of a file (previous name)',
  fields() {
    return {
      // id: {
      //   type: new gql.GraphQLNonNull(gql.GraphQLString),
      //   resolve: (e) => e._key,
      // },
      oldFilePath: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
      },
      hasThisNameFrom: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
      },
      hasThisNameUntil: {
        type: gql.GraphQLString,
      },
    };
  },
});
