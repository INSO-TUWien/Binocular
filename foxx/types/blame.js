'use strict';
const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Blame',
  description: 'Blame for a file in git',
  fields() {
    return {
      commitsFiles: {
        type: require('./fileInCommit.js'),
        description: 'The Edge between a file and a commit (commits-files)'
      },
      commit: {
        type: require('./commit.js'),
        description: 'The Edge between a file and a commit (commits-files)'
      }
    };
  }
});
