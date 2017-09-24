'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToFiles = db._collection('commits-files');
const commitsToStakeholders = db._collection('commits-stakeholders');
const paginated = require('./paginated.js');
const Timestamp = require('./Timestamp.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Commit',
  description: 'A single git commit',
  fields() {
    return {
      sha: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      shortSha: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key.substring(0, 7)
      },
      message: {
        type: gql.GraphQLString,
        description: 'The commit message'
      },
      messageHeader: {
        type: gql.GraphQLString,
        description: 'Header of the commit message',
        resolve: c => c.message.split('\n')[0]
      },
      signature: {
        type: gql.GraphQLString,
        description: "The commit author's signature"
      },
      date: {
        type: Timestamp,
        description: 'The date of the commit'
      },
      stats: {
        type: new gql.GraphQLObjectType({
          name: 'Stats',
          fields: {
            additions: {
              type: gql.GraphQLInt
            },
            deletions: {
              type: gql.GraphQLInt
            }
          }
        })
      },
      files: paginated({
        type: require('./fileInCommit.js'),
        description: 'The files touched by this commit',
        query: (commit, args, limit) => aql`
          FOR file, edge
            IN INBOUND ${commit} ${commitsToFiles}
            ${limit}
            RETURN {
              file,
              lineCount: edge.lineCount,
              hunks: edge.hunks
            }`
      }),
      stakeholder: {
        type: require('./stakeholder.js'),
        description: 'The author of this commit',
        resolve(commit /*, args*/) {
          return db
            ._query(
              aql`
            FOR
            stakeholder
            IN
            INBOUND ${commit} ${commitsToStakeholders}
              RETURN stakeholder
          `
            )
            .toArray()[0];
        }
      }
    };
  }
});
