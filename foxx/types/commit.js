'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToFiles = db._collection('commits-files');
const builds = db._collection('builds');
const commitsToStakeholders = db._collection('commits-stakeholders');
const commitsToBranches = db._collection('commits-branches');
const commitsToCommits = db._collection('commits-commits');
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
        description: "The committer's signature",
      },
      date: {
        type: Timestamp,
        description: 'The date of the commit',
      },
      author: {
        type: gql.GraphQLString,
        description: "The commit author's signature",
      },
      authorDate: {
        type: Timestamp,
        description: 'The date of the commit from the author',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'Web-url (if available) of this commit'
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
      },
      builds: {
        type: new gql.GraphQLList(require('./build.js')),
        description: 'Builds started on this commit',
        resolve(commit) {
          return db
            ._query(
              aql`
              FOR build
              IN ${builds}
              FILTER build.sha == ${commit.sha}
                RETURN build`
            )
            .toArray();
        }
      },
      branches: {
        type: new gql.GraphQLList(require('./branch.js')),
        description: 'The branches the commit is in',
        resolve(commit) {
          return db
            ._query(
              aql`
              FOR c IN OUTBOUND ${commit} ${commitsToBranches}
                RETURN c
              `
            )
            .toArray();
        },
      },
      children: {
        type: new gql.GraphQLList(require('./commit.js')),
        description: 'The children of the commit',
        resolve(commit) {
          return db
            ._query(
              aql`
              FOR c IN OUTBOUND ${commit} ${commitsToCommits}
                  RETURN c
              `
            )
            .toArray();
        },
      },
      parents: {
        type: new gql.GraphQLList(require('./commit.js')),
        description: 'The parents of the commit',
        resolve(commit) {
          return db
            ._query(
              aql`
              FOR c IN INBOUND ${commit} ${commitsToCommits}
                  RETURN c
              `
            )
            .toArray();
        },
      },
      projects: {
        type: new gql.GraphQLList(gql.GraphQLString),
        description: 'The projects the commit is in',
      },
    };
  }
});
