'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Hunk',
  description: 'A hunk of changes',
  fields() {
    return {
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
      webUrl: {
        type: gql.GraphQLString,
        description: 'Url (if available) to this hunk in the ITS'
      }
    };
  }
});
