'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToStakeholders = db._collection('commits-stakeholders');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Stakeholder',
  description: 'A project stakeholder (developer, issue-reporter, etc...)',
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
        description: 'The name of the stakeholder, according to GitLab',
      },
      gitlabWebUrl: {
        type: gql.GraphQLString,
        description: "The GitLab-Web-URL to the stakeholder's GitLab profile",
      },
      gitlabAvatarUrl: {
        type: gql.GraphQLString,
        description: "The URL to the stakeholder's gitlab avatar picture",
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'The commits made by this stakeholder',
        resolve(stakeholder, args, limit) {
          return db
            ._query(
              aql`FOR commit
                  IN
                  OUTBOUND ${stakeholder} ${commitsToStakeholders}
                  ${limit}
                    RETURN commit`
            )
            .toArray();
        },
      }),
    };
  },
});
