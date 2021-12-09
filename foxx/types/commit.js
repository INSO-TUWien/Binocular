'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToFiles = db._collection('commits-files');
const builds = db._collection('builds');
const commitsToStakeholders = db._collection('commits-stakeholders');
const commitsToLanguages = db._collection('commits-languages');
const CommitsToModules = db._collection('commits-modules');
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
      branch: {
        type: gql.GraphQLString,
        description: 'The commit branch'
      },
      parents: {
        type: gql.GraphQLString,
        description: 'Parents of the commit'
      },
      date: {
        type: Timestamp,
        description: 'The date of the commit'
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'Web-url (if available) of this commit'
      },
      stats: {
        type: require('./stats'),
        description: 'The changing stats of the commit'
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
              stats: edge.stats,
              hunks: edge.hunks
            }`
      }),
      file: {
        type: require('./fileInCommit.js'),
        args: {
          path: {
            description: 'Path of the file',
            type: new gql.GraphQLNonNull(gql.GraphQLString)
          }
        },
        description: 'The file with path touched by this commit',
        resolve(commit, args) {
          return db
            ._query(
              aql`
          FOR file, edge
            IN INBOUND ${commit} ${commitsToFiles}
            FILTER file.path == ${args.path}
            RETURN {
              file,
              lineCount: edge.lineCount,
              hunks: edge.hunks
            }`
            )
            .toArray()[0];
        }
      },
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
      languages: paginated({
        type: require('./languageInCommit'),
        description: 'languages modified in the particular commit',
        query: (commit, args, limit) => aql`
          FOR language, edge
            IN INBOUND ${commit} ${commitsToLanguages}
            ${limit}
            RETURN {
              language,
              stats: edge.stats
            }`
      }),
      modules: paginated({
        type: require('./moduleInCommit'),
        description: 'modules modified in the particular commit',
        query: (commit, args, limit) => aql`
          FOR module, edge
            IN INBOUND ${commit} ${CommitsToModules}
            ${limit}
            RETURN {
              module,
              webUrl: edge.webUrl,
              stats: edge.stats
            }`
      })
    };
  }
});
