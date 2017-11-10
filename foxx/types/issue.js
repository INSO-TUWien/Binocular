'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const issuesToStakeholders = db._collection('issues-stakeholders');
const paginated = require('./paginated.js');
const Timestamp = require('./Timestamp.js');

module.exports = new gql.GraphQLObjectType({
  name: 'Issue',
  description: 'A GitLab issue',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      iid: {
        type: gql.GraphQLString,
        description: 'The issue number within its project'
      },
      title: {
        type: gql.GraphQLString,
        description: 'The issue title'
      },
      description: {
        type: gql.GraphQLString,
        description: 'The issue description'
      },
      state: {
        type: gql.GraphQLString,
        description: 'The issue state'
      },
      upvotes: {
        type: gql.GraphQLInt,
        description: 'Number of upvotes on this issue'
      },
      downvotes: {
        type: gql.GraphQLInt,
        description: 'Number of downvotes on this issue'
      },
      dueDate: {
        type: gql.GraphQLString,
        description: 'The due date of this issue'
      },
      confidential: {
        type: gql.GraphQLBoolean,
        description: 'Wether or not this issue is confidential'
      },
      weight: {
        type: gql.GraphQLInt,
        description: 'Weight of the issue'
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'Web URL of the issue'
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the issue'
      },
      closedAt: {
        type: Timestamp,
        description: 'Close date of the issue'
      },
      creator: {
        type: require('./stakeholder.js'),
        description: 'The creator of this issue',
        resolve(issue /*, args*/) {
          return db
            ._query(
              aql`
              FOR
              stakeholder
              IN
              OUTBOUND ${issue} ${issuesToStakeholders}
                RETURN stakeholder
              `
            )
            .toArray()[0];
        }
      },
      commits: paginated({
        type: require('./commit.js'),
        description: 'All commits mentioning this issue',
        query: (issue, args, limit) => aql`
          FOR commit IN (
              FOR mention IN ${issue.mentions || []}
                FILTER mention.commit != NULL
                RETURN DOCUMENT(CONCAT("commits/", mention.commit))
              )
              FILTER commit != NULL
              ${limit}
              RETURN commit`
      }),
      mentions: {
        type: new gql.GraphQLList(gql.GraphQLString),
        description: 'The shas of all commits mentioning this issue',
        resolve(issue) {
          return (issue.mentions || []).map(m => m.commit);
        }
      }
    };
  }
});
