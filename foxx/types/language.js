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
        resolve: (e) => e._key,
        description: 'The GitHub linguist id of the particular language',
      },
      name: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The name of the particular language',
      },
      aliases: {
        type: new gql.GraphQLList(gql.GraphQLString),
        description: 'All aliases of the particular language',
      },
      popular: {
        type: gql.GraphQLBoolean,
        description: 'Whether or not this language is popular',
      },
      color: {
        type: gql.GraphQLString,
        description: 'Holds the hex code of the color of the particular language that is used in the GitHub ui',
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'The commits touching this file',
        query: (language, args, limit) => aql`
          FOR commit
          IN
          OUTBOUND ${language} ${commitsToLanguages}
            ${limit}
            RETURN commit`,
      }),
    };
  },
});
