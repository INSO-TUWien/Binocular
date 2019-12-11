'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const aql = arangodb.aql;
const db = arangodb.db;
const clonesToFiles = db._collection('clones-files');

module.exports = new gql.GraphQLObjectType({
  name: 'Clone',
  description: 'A duplicated piece of source code.',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      fingerprint: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The fingerprint of the duplicated sourcecode'
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
        description: 'A list of all revisions the clone occurs in',
        resolve(clone) {
          return db._query(
            aql`
              FOR c
              IN clones
              FILTER c.fingerprint == ${clone.fingerprint}
                RETURN c.revision`
          );
        }
      },
      files: {
        type: require('./cloneInFile.js'),
        description: 'The files the clone occurs in',
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
      }
    };
  }
});
