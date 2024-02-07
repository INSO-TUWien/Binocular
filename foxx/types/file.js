'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const commitsToFiles = db._collection('commits-files');
const branchesToFiles = db._collection('branches-files');
const branchesToFilesToFiles = db._collection('branches-files-files');
const commitsToFilesToStakeholders = db._collection('commits-files-stakeholders');
const paginated = require('./paginated.js');

module.exports = new gql.GraphQLObjectType({
  name: 'File',
  description: 'A file in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the file, relative to the repository root',
      },
      maxLength: {
        type: gql.GraphQLInt,
        description: 'The maximum number of lines this file ever had over the course of the whole project',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'The URL (if available) to the master-version of this file on the ITS',
      },
      commits: paginated({
        type: require('./commitInFile.js'),
        description: 'The commits touching this file',
        query: (file, args, limit) => aql`
          FOR commit, edge
            IN OUTBOUND ${file} ${commitsToFiles}
            let o = (
              FOR stakeholder, conn
                  IN OUTBOUND edge ${commitsToFilesToStakeholders}
                      RETURN {
                          stakeholder: stakeholder.gitSignature,
                          ownedLines: conn.ownedLines,
                          hunks: conn.hunks,
                      }
            )
            ${limit}
            SORT commit.date ASC
            RETURN {
              commit: commit,
              ownership: o,
            }`,
      }),
      oldFileNames: paginated({
        type: require('./fileInFiles.js'),
        args: {
          branch: {
            description: 'branch of this file',
            type: new gql.GraphQLNonNull(gql.GraphQLString),
          },
        },
        query: (file, args, limit) => aql`
          FOR branch IN branches
          FILTER branch.branch == ${args.branch}
          FOR file, edge
              IN OUTBOUND ${file} ${branchesToFiles}
              FOR oldFile, conn
                  IN OUTBOUND edge ${branchesToFilesToFiles}
                      RETURN {
                          oldFilePath:oldFile.path,
                          hasThisNameFrom: conn.hasThisNameFrom,
                          hasThisNameUntil: conn.hasThisNameUntil
                      }`,
      }),
    };
  },
});
