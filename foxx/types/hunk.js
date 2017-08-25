'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;

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
      }
    };
  }
});
