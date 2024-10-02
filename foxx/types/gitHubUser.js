'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToStakeholders = db._collection('commits-stakeholders');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'GitHubUser',
  description: 'A GithubUser',
  fields() {
    return {
      login: {
        type: gql.GraphQLString,
        description: 'The Username of a github user',
      },
      name: {
        type: gql.GraphQLString,
        description: 'The name of a github user',
      },
    };
  },
});
