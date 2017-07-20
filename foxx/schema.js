'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;

const commits = db._collection('commits');
const files = db._collection('files');
const stakeholders = db._collection('stakeholders');
const issues = db._collection('issues');

const queryType = new gql.GraphQLObjectType({
  name: 'Query',
  fields() {
    return {
      commits: {
        type: new gql.GraphQLList(require('./types/commit.js')),
        args: {},
        resolve(/*root, args*/) {
          return db
            ._query(
              aql`FOR commit
                  IN
                  ${commits}
                  SORT commit.date ASC
                    RETURN commit`
            )
            .toArray();
        }
      },
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
      stakeholders: {
        type: new gql.GraphQLList(require('./types/stakeholder.js')),
        args: {},
        resolve(/*root, args*/) {
          return db
            ._query(
              aql`FOR stakeholder
                  IN
                  ${stakeholders}
                    RETURN stakeholder`
            )
            .toArray();
        }
      },
      issues: {
        type: new gql.GraphQLList(require('./types/issue.js')),
        args: {},
        resolve(/*root, args*/) {
          return db
            ._query(
              aql`FOR issue
                  IN
                  ${issues}
                    SORT issue.created_at ASC
                    RETURN issue`
            )
            .toArray();
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
