'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToUsers = db._collection('commits-users');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'User',
  description: 'A project user (developer, issue-reporter, etc...)',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      gitSignature: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root',
      },
      gitlabName: {
        type: gql.GraphQLString,
        description: 'The name of the user, according to GitLab',
      },
      gitlabWebUrl: {
        type: gql.GraphQLString,
        description: "The GitLab-Web-URL to the user's GitLab profile",
      },
      gitlabAvatarUrl: {
        type: gql.GraphQLString,
        description: "The URL to the user's gitlab avatar picture",
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'The commits made by this user',
        resolve(user, args, limit) {
          return db
            ._query(
              aql`FOR commit
                  IN
                  OUTBOUND ${user} ${commitsToUsers}
                  ${limit}
                    RETURN commit`
            )
            .toArray();
        },
      }),
    };
  },
});
