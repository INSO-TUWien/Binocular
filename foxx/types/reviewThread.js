'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;

module.exports = new gql.GraphQLObjectType({
  name: 'reviewThread',
  description: 'A review thread',
  fields() {
    return {
      id: {
        type: gql.GraphQLString,
        description: 'id of the review thread',
      },
      isResolved: {
        type: gql.GraphQLBoolean,
        description: 'resolved state of the review thread',
      },
      resolvedBy: {
        type: require('./gitHubUser.js'),
        description: 'the github/gitlab user that marked this thread as resolved',
      },
      path: {
        type: gql.GraphQLString,
        description: 'the path to the file this thread is referencing',
      },
      rt: {
        type: gql.GraphQLString,
        resolve(reviewThread) {
          return reviewThread._id;
        },
      },
      comments: {
        type: new gql.GraphQLList(require('./comment.js')),
        description: 'the comments belonging to this review thread',
        resolve(reviewThread) {
          return db
            ._query(
              aql`
              FOR rtc IN \`reviewThreads-comments\`
              FILTER rtc._from == ${reviewThread._id}
              FOR comment IN comments
              FILTER comment._id == rtc._to
              RETURN comment
            `,
            )
            .toArray();
        },
      },
    };
  },
});
