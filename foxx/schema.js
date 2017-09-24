'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const qb = require('aqb');
const paginated = require('./types/paginated.js');
const queryHelpers = require('./query-helpers.js');
const Timestamp = require('./types/Timestamp.js');
const Sort = require('./types/Sort.js');

const commits = db._collection('commits');
const files = db._collection('files');
const stakeholders = db._collection('stakeholders');
const issues = db._collection('issues');

const queryType = new gql.GraphQLObjectType({
  name: 'Query',
  fields() {
    return {
      commits: paginated({
        type: require('./types/commit.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp },
          sort: { type: Sort }
        },
        query: (root, args, limit) => {
          let q = qb.for('commit').in('commits').sort('commit.date', args.sort);

          q = queryHelpers.addDateFilter('commit.date', 'gte', args.since, q);
          q = queryHelpers.addDateFilter('commit.date', 'lte', args.until, q);

          q = q.limit(limit.offset, limit.count).return('commit');

          return q;
        }
      }),
      commit: {
        type: require('./types/commit.js'),
        args: {
          sha: {
            description: 'sha of the commit',
            type: new gql.GraphQLNonNull(gql.GraphQLString)
          }
        },
        resolve(root, args) {
          return commits.document(args.sha);
        }
      },
      latestCommit: {
        type: require('./types/commit.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp }
        },
        resolve(root, args) {
          return commits.document(args.sha);
        }
      },
      file: {
        type: require('./types/file.js'),
        args: {
          path: {
            description: 'Path of the file',
            type: new gql.GraphQLNonNull(gql.GraphQLString)
          }
        },
        resolve(root, args) {
          return files.firstExample({ path: args.path });
        }
      },
      stakeholders: paginated({
        type: require('./types/stakeholder.js'),
        query: (root, args, limit) => aql`
          FOR stakeholder
            IN
            ${stakeholders}
            ${limit}
              RETURN stakeholder`
      }),
      issues: paginated({
        type: require('./types/issue.js'),
        query: (root, args, limit) => aql`
          FOR issue
          IN
          ${issues}
            SORT issue.createdAt ASC
            ${limit}
            RETURN issue`
      }),
      issue: {
        type: require('./types/issue.js'),
        args: {
          iid: {
            description: 'Project-Internal issue number',
            type: new gql.GraphQLNonNull(gql.GraphQLInt)
          }
        },
        resolve(root, args) {
          return db
            ._query(
              aql`FOR issue
                  IN
                  ${issues}
                  FILTER issue.iid == ${args.iid}
                    RETURN issue`
            )
            .toArray()[0];
        }
      }
    };
  }
});

// This is the GraphQL schema object we need to execute
// queries. See "controller.js" for an example of how it
// is used. Also see the "test" folder for more in-depth
// examples.
module.exports = new gql.GraphQLSchema({
  query: queryType
});
