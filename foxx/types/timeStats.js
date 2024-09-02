'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToUsers = db._collection('commits-users');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'time_stats',
  description: 'A time statistic storage for gitlab',
  fields() {
    return {
      time_estimate: {
        type: gql.GraphQLString,
        description: 'The estimated time',
      },
      total_time_spent: {
        type: gql.GraphQLString,
        description: 'The total time spent',
      },
    };
  },
});
