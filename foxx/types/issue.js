'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
// const blameHunkType = require('./blameHunk.js');
// const commitsToBlameHunks = db._collection('commits-blameHunks');
// const blameHunksToFiles = db._collection('blameHunks-files');
// const commitsToStakeholders = db._collection('commits-stakeholders');
const issuesToStakeholders = db._collection('issues-stakeholders');

module.exports = new gql.GraphQLObjectType({
  name: 'Issue',
  description: 'A GitLab issue',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      iid: {
        type: gql.GraphQLString,
        description: 'The issue number within its project'
      },
      title: {
        type: gql.GraphQLString,
        description: 'The issue title'
      },
      description: {
        type: gql.GraphQLString,
        description: 'The issue description'
      },
      state: {
        type: gql.GraphQLString,
        description: 'The issue state'
      },
      upvotes: {
        type: gql.GraphQLInt,
        description: 'Number of upvotes on this issue'
      },
      downvotes: {
        type: gql.GraphQLInt,
        description: 'Number of downvotes on this issue'
      },
      due_date: {
        type: gql.GraphQLString,
        description: 'The due date of this issue'
      },
      confidential: {
        type: gql.GraphQLBoolean,
        description: 'Wether or not this issue is confidential'
      },
      weight: {
        type: gql.GraphQLInt,
        description: 'Weight of the issue'
      },
      web_url: {
        type: gql.GraphQLString,
        description: 'Web URL of the issue'
      },
      created_at: {
        type: gql.GraphQLString,
        description: 'Creation date of the issue'
      },
      creator: {
        type: require('./stakeholder.js'),
        description: 'The creator of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
          FOR
          stakeholder
          IN
          OUTBOUND ${issue} ${issuesToStakeholders}
            RETURN stakeholder
        `
            )
            .toArray()[0];
        }
      }
    };
  }
});
