'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToLanguages = db._collection('commits-languages');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Language',
  description: 'A language in the git-repository related to a commit',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      name: {
        type: gql.GraphQLString,
        description: 'The name of the particular language'
      },
      shortName: {
        type: gql.GraphQLString,
        description: 'The short name of the particular language'
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'The commits touching this file',
        query: (language, args, limit) => aql`
          FOR commit
          IN
          OUTBOUND ${language} ${commitsToLanguages}
            ${limit}
            RETURN commit`
      })
    };
  }
});
