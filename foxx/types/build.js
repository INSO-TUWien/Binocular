'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const Timestamp = require('./Timestamp.js');
const commits = db._collection('commits');

const BuildStatus = new gql.GraphQLEnumType({
  name: 'BuildStatus',
  values: {
    failed: {},
    success: {},
    pending: {},
    running: {},
    cancelded: {},
    skipped: {}
  }
});

const Job = new gql.GraphQLObjectType({
  name: 'Job',
  description: 'A job within a CI build',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLInt)
      },
      name: {
        type: gql.GraphQLString,
        description: 'Job name'
      },
      status: {
        type: BuildStatus,
        description: 'Status of the build'
      },
      stage: {
        type: gql.GraphQLString,
        description: 'Build stage'
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'Web-url of this job'
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the build'
      },
      finishedAt: {
        type: Timestamp,
        description: 'When the build finished'
      }
    };
  }
});

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
        type: BuildStatus,
        description: 'Status of the build'
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'Web-url of this build'
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
      stats: {
        type: new gql.GraphQLObjectType({
          name: 'BuildStats',
          fields: {
            success: {
              type: gql.GraphQLInt
            },
            failed: {
              type: gql.GraphQLInt
            },
            running: {
              type: gql.GraphQLInt
            },
            pending: {
              type: gql.GraphQLInt
            },
            canceled: {
              type: gql.GraphQLInt
            }
          }
        })
      },
      jobs: {
        type: new gql.GraphQLList(Job),
        description: 'Jobs in this build'
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
