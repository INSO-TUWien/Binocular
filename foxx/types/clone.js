'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const aql = arangodb.aql;
const paginated = require('./paginated.js');

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
        description: 'The of the duplicated sourcecode'
      },
      sourcecode: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The duplicated source code'
      },
      numlines: {
        type: gql.GraphQLInt,
        description: 'Number of lines the clone has'
      },
      startline: {
        type: gql.GraphQLString,
        description: 'First line of the clone'
      },
      clonetype: {
        type: gql.GraphQLInt,
        description: 'Specifies the type of the clone. (classes 1, 2 or 3)'
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root'
      },
      origin: {
        type: gql.GraphQLBoolean,
        description: 'Specifies if the clone is the origin'
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'All commits/revisions the clone occurs in',
        query: (clone, args, limit) => aql`
          FOR commit IN (
              FOR relation IN ${clone.revisions || []}
                FILTER relation.sha != NULL
                RETURN DOCUMENT(CONCAT("commits/", relation.sha))
              )
              FILTER commit != NULL
              ${limit}
              RETURN commit`
      }),
      revisions: {
        type: new gql.GraphQLList(gql.GraphQLString),
        description: 'A list of all revisions the clone occurs in',
        resolve(clone) {
          return (clone.revisions || []).map(m => m.sha);
        }
      }
    };
  }
});
