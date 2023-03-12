'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'ModuleInCommit',
  description: 'A particular module modified in a single commit',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      module: {
        type: require('./module'),
        description: 'contains the module that touches the corresponding commit',
      },
      commit: {
        type: require('./commit'),
        description: 'contains the commit that touches the corresponding module',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'The URL (if available) to the current selected branch-version of this file on the ITS',
      },
      stats: {
        type: require('./stats'),
        description: 'The changing stats of the commit',
      },
    };
  },
});
