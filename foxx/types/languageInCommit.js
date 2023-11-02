'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'LanguagesInCommit',
  description: 'A language used in a single commit',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      language: {
        type: require('./language.js'),
        description: 'The language that touches the commit',
      },
      commit: {
        type: require('./commit'),
        description: 'contains the commit that touches the corresponding language',
      },
      stats: {
        type: require('./stats'),
        description: 'The changing stats of the commit',
      },
    };
  },
});
