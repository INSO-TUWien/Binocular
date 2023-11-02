'use strict';

const gql = require('graphql-sync');

const FileAction = new gql.GraphQLEnumType({
  name: 'FileAction',
  values: {
    added: {},
    deleted: {},
    modified: {},
  },
});

module.exports = new gql.GraphQLObjectType({
  name: 'FileInCommit',
  description: 'A file touched by a single commit',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      file: {
        type: require('./file.js'),
      },
      lineCount: {
        type: gql.GraphQLInt,
        description: 'The number of lines in this file at this commit',
      },
      stats: {
        type: require('./stats'),
        description: 'The number of lines added and removed in this file at this commit',
      },
      hunks: {
        type: new gql.GraphQLList(require('./hunk.js')),
        description: 'The hunks that affect this file',
      },
      action: {
        type: FileAction,
        description: 'How the file is affected (added, deleted, modified)',
      },
      ownership: {
        type: new gql.GraphQLList(require('./ownership.js')),
      },
    };
  },
});
