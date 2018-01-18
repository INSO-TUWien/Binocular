'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToFiles = db._collection('commits-files');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'File',
  description: 'A file in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root'
      },
      maxLength: {
        type: gql.GraphQLInt,
        description:
          'The maximum number of lines this file ever had over the course of the whole project'
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'The URL (if available) to the master-version of this file on the ITS'
      },
      commits: paginated({
        type: new gql.GraphQLList(require('./commit.js')),
        description: 'The commits touching this file',
        query: (file, args, limit) => aql`
          FOR commit
          IN
          OUTBOUND ${file} ${commitsToFiles}
            ${limit}
            RETURN commit`
      })
    };
  }
});
