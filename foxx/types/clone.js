'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const aql = arangodb.aql;
const db = arangodb.db;
const clonesToFiles = db._collection('clones-files');
const clonesToCommits = db._collection('clones-commits');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Clone',
  description: 'A duplicated piece of source code.',
  fields() {
    return {
      fingerprint: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The fingerprint of the duplicated sourcecode',
        resolve: e => e._key
      },
      sourcecode: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The duplicated source code'
      },
      type: {
        type: gql.GraphQLInt,
        description: 'Specifies the type of the clone. (classes 1, 2 or 3)'
      },
      revisions: {
        type: new gql.GraphQLList(gql.GraphQLString),
        description: 'The revisions a clone occurs in',
        resolve(clone /*, args*/) {
          return db
            ._query(
              aql`
            FOR
            commit
            IN
            INBOUND ${clone} ${clonesToCommits}
              RETURN commit.sha
          `
            )
            .toArray();
        }
      },
      files: paginated({
        type: require('./cloneInFile.js'),
        description: 'The files touched by this commit',
        query: (clone, args, limit) => aql`
          FOR file, edge
            IN INBOUND ${clone} ${clonesToFiles}
            ${limit}
            RETURN {
              file,
              startline: edge.startline,
              endline: edge.endline,
              path: edge.path,
              revision: edge.revision
            }`
      }),
      commits: {
        type: new gql.GraphQLList(require('./commit.js')),
        description: 'The commits a clone occurs in',
        resolve(clone /*, args*/) {
          return db
            ._query(
              aql`
            FOR
            commit
            IN
            INBOUND ${clone} ${clonesToCommits}
              RETURN commit
          `
            )
            .toArray();
        }
      }
    };
  }
});
