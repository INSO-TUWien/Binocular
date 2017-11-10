'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const Timestamp = require('./Timestamp.js');
const commits = db._collection('commits');

module.exports = new gql.GraphQLObjectType({
  name: 'Build',
  description: 'A single of a CI build run',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      sha: {
        type: gql.GraphQLString,
        description: 'Sha of the commit that triggered the build'
      },
      beforeSha: {
        type: gql.GraphQLString
      },
      ref: {
        type: gql.GraphQLString
      },
      status: {
        type: new gql.GraphQLEnumType({
          name: 'BuildStatus',
          values: {
            failed: {},
            success: {},
            pending: {},
            running: {},
            cancelded: {},
            skipped: {}
          }
        }),
        description: 'Status of the build'
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the build'
      },
      updatedAt: {
        type: Timestamp,
        description: 'Time of last update to the build'
      },
      startedAt: {
        type: Timestamp,
        description: 'When the build was started'
      },
      finishedAt: {
        type: Timestamp,
        description: 'When the build finished'
      },
      committedAt: {
        type: Timestamp,
        description: 'When the triggering commit happened'
      },
      duration: {
        type: gql.GraphQLInt,
        description: 'Run duration in seconds'
      },
      coverage: {
        type: gql.GraphQLString,
        description: 'Coverage information'
      },
      commit: {
        type: require('./commit.js'),
        description: 'The commit that triggered this build',
        resolve(build) {
          return db
            ._query(
              aql`
            FOR commit IN ${commits}
              FILTER commit.sha == ${build.sha}
              RETURN commit`
            )
            .toArray()[0];
        }
      }
    };
  }
});
