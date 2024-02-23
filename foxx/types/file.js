'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToFiles = db._collection('commits-files');
const LanguagesToFiles = db._collection('languages-files');
const paginated = require('./paginated.js');
const Timestamp = require('./Timestamp.js');

module.exports = new gql.GraphQLObjectType({
  name: 'File',
  description: 'A file in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root',
      },
      maxLength: {
        type: gql.GraphQLInt,
        description: 'The maximum number of lines this file ever had over the course of the whole project',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'The URL (if available) to the master-version of this file on the ITS',
      },
      language: {
        type: require('./language'),
        description: 'The used programming language in this file',
        query: (file, args, limit) => aql`
          FOR language
          IN
          INBOUND ${file} ${LanguagesToFiles}
            ${limit}
            RETURN language`,
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'The commits touching this file',
        args: {
          since: { type: Timestamp, required: false },
          until: { type: Timestamp, required: false },
        },
        query: (file, args, limit) => {
          let query = aql`
          FOR commit
          IN
          OUTBOUND ${file} ${commitsToFiles}
            ${limit}
            SORT commit.date ASC`;
          if (args.since !== undefined) {
            query = aql`${query} FILTER DATE_TIMESTAMP(commit.date) >= DATE_TIMESTAMP(${args.since})`;
          }
          if (args.until !== undefined) {
            query = aql`${query} FILTER DATE_TIMESTAMP(commit.date) <= DATE_TIMESTAMP(${args.until})`;
          }
          query = aql`${query} RETURN commit`;
          return query;
        },
      }),
    };
  },
});
