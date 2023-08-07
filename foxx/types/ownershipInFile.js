'use strict';

const gql = require('graphql-sync');
const Timestamp = require('./Timestamp.js');

module.exports = new gql.GraphQLObjectType({
  name: 'OwnershipInFile',
  description: 'how many lines of a file does a stakeholder own at the time of a commit',
  fields() {
    return {
      commit: {
        type: require('./commit.js'),
      },
      ownership: {
        type: new gql.GraphQLList(require('./stakeholderInFile.js')),
      },
    };
  },
});
