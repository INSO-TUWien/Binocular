'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToUsers = db._collection('commits-users');
const paginated = require('./paginated.js');

// TODO rename to Account
module.exports = new gql.GraphQLObjectType({
  name: 'GitHubUser',
  description: 'A GithubUser',
  fields() {
    return {
      platform: {
        type: gql.GraphQLString,
        description: 'The platform of this account',
      },
      login: {
        type: gql.GraphQLString,
        description: 'The username of this account',
      },
      name: {
        type: gql.GraphQLString,
        description: 'The full name of the user this account belongs to',
      },
      url: {
        type: gql.GraphQLString,
        description: 'A link to the user profile on the respective platform',
      },
      avatarUrl: {
        type: gql.GraphQLString,
        description: 'A link to the profile picture of this account',
      },
    };
  },
});
