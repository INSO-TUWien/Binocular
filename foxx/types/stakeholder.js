'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToStakeholders = db._collection('commits-stakeholders');

module.exports = new gql.GraphQLObjectType({
  name: 'Stakeholder',
  description: 'A project stakeholder (developer, issue-reporter, etc...)',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      gitSignature: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root'
      },
      commits: {
        type: new gql.GraphQLList(require('./commit.js')),
        description: 'The commits made by this stakeholder',
        resolve(stakeholder, args) {
          return db
            ._query(
              aql`FOR commit
                  IN
                  OUTBOUND ${stakeholder} ${commitsToStakeholders}
                    RETURN commit`
            )
            .toArray();
        }
      }
    };
  }
});
