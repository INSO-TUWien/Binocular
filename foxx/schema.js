'use strict';

/**
 * The GraphQL-Schema exposed by our FOXX service
 */

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const paginated = require('./types/paginated.js');
const queryHelpers = require('./query-helpers.js');
const Timestamp = require('./types/Timestamp.js');
const Sort = require('./types/Sort.js');

const commits = db._collection('commits');
const files = db._collection('files');
const stakeholders = db._collection('stakeholders');
const modules = db._collection('modules');
const issues = db._collection('issues');
const builds = db._collection('builds');
const branches = db._collection('branches');
const mergeRequests = db._collection('mergeRequests');
const milestones = db._collection('milestones');

const queryType = new gql.GraphQLObjectType({
  name: 'Query',
  fields() {
    return {
      commits: paginated({
        type: require('./types/commit.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp },
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          return aql`
            FOR commit
            IN ${commits}
            ${args.since ? queryHelpers.addDateFilterAQL('commit.date', '>=', args.since) : aql``}
            ${args.until ? queryHelpers.addDateFilterAQL('commit.date', '<=', args.until) : aql``}
            ${limit}
            RETURN commit`;
        },
      }),
      commit: {
        type: require('./types/commit.js'),
        args: {
          sha: {
            description: 'sha of the commit',
            type: new gql.GraphQLNonNull(gql.GraphQLString),
          },
        },
        resolve(root, args) {
          return commits.document(args.sha);
        },
      },
      latestCommit: {
        type: require('./types/commit.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp },
        },
        resolve(root, args) {
          return commits.document(args.sha);
        },
      },
      files: paginated({
        type: require('./types/file.js'),
        args: {
          sort: { type: Sort },
          paths: { type: new gql.GraphQLList(gql.GraphQLString) },
        },
        query: (root, args, limit) => {
          //if the paths argument exists, only return files where the path is contained in paths
          if (args.paths) {
            return aql`
            FOR file in ${files}
              FILTER POSITION(${args.paths}, file.path)
              SORT file.path ${args.sort}
              ${limit}
              RETURN file
            `;
          } else {
            return aql`
            FOR file in ${files}
              SORT file.path ${args.sort}
              ${limit}
              RETURN file
            `;
          }
        },
      }),
      file: {
        type: require('./types/file.js'),
        args: {
          path: {
            description: 'Path of the file',
            type: new gql.GraphQLNonNull(gql.GraphQLString),
          },
        },
        resolve(root, args) {
          return files.firstExample({ path: args.path });
        },
      },
      modules: paginated({
        type: require('./types/module'),
        query: (root, args, limit) => aql`
          FOR module
            IN
            ${modules}
            ${limit}
              RETURN module`,
      }),
      module: {
        type: require('./types/module'),
        args: {
          path: {
            description: 'path of module',
            type: new gql.GraphQLNonNull(gql.GraphQLString),
          },
        },
        resolve(root, args) {
          return modules.firstExample({ path: args.path });
        },
      },
      stakeholders: paginated({
        type: require('./types/stakeholder.js'),
        query: (root, args, limit) => aql`
          FOR stakeholder
            IN
            ${stakeholders}
            ${limit}
              RETURN stakeholder`,
      }),
      committers: {
        type: new gql.GraphQLList(gql.GraphQLString),
        resolve: () => {
          return db
            ._query(
              aql`
              FOR stakeholder IN ${stakeholders}
                SORT stakeholder.gitSignature ASC
                RETURN DISTINCT stakeholder.gitSignature`
            )
            .toArray();
        },
      },
      baseBuilds: paginated({
        type: require('./types/build.js'),
        args: {},
        query: (root, args, limit) => aql`
          FOR build IN ${builds}
            SORT build.createdAt ASC
            ${limit}
            RETURN build`,
      }),
      builds: paginated({
        type: require('./types/build.js'),
        args: { since: { type: Timestamp }, until: { type: Timestamp } },
        query: (root, args, limit) => {
          return aql`
          FOR build IN ${builds}
            SORT build.createdAt ASC
            ${args.since ? queryHelpers.addDateFilterAQL('build.createdAt', '>=', args.since) : aql``}
            ${args.until ? queryHelpers.addDateFilterAQL('build.createdAt', '<=', args.until) : aql``}
            ${limit}
            LET countsByStatus = (
              COLLECT status = build.status WITH COUNT INTO statusCount
              RETURN { [status]: statusCount }
            )
            RETURN MERGE(build, { stats: MERGE(countsByStatus) })`;
        },
      }),
      issues: paginated({
        type: require('./types/issue.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp },
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          return aql`
          FOR issue
          IN issues
          ${args.since ? queryHelpers.addDateFilterAQL('issue.createdAt', '>=', args.since) : aql``}
          ${args.until ? queryHelpers.addDateFilterAQL('issue.createdAt', '<=', args.until) : aql``}
          SORT issue.createdAt ${args.sort}
          ${limit}
          RETURN issue`;
        },
      }),
      issue: {
        type: require('./types/issue.js'),
        args: {
          iid: {
            description: 'Project-Internal issue number',
            type: new gql.GraphQLNonNull(gql.GraphQLInt),
          },
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
        },
      },
      branches: paginated({
        type: require('./types/branch.js'),
        args: {
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          return aql`
            FOR branch
            IN ${branches}
            SORT branch.id ${args.sort}
            ${limit}
            RETURN branch`;
        },
      }),
      branch: {
        type: require('./types/branch.js'),
        args: {
          branchName: {
            description: 'name of the branch',
            type: new gql.GraphQLNonNull(gql.GraphQLString),
          },
        },
        resolve(root, args) {
          return db
            ._query(
              aql`FOR branch
                  IN
                  ${branches}
                  FILTER branch.branch == ${args.branchName}
                    RETURN branch`
            )
            .toArray()[0];
        },
      },
      mergeRequests: paginated({
        type: require('./types/mergeRequest.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp },
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          return aql`
            FOR mergeRequest
            IN ${mergeRequests}
            SORT mergeRequest.createdAt ${args.sort}
            ${args.since ? queryHelpers.addDateFilterAQL('mergeRequest.createdAt', '>=', args.since) : aql``}
            ${args.until ? queryHelpers.addDateFilterAQL('mergeRequest.createdAt', '<=', args.until) : aql``}
            ${limit}
            RETURN mergeRequest`;
        },
      }),
      milestones: paginated({
        type: require('./types/milestone.js'),
        args: {
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          return aql`
            FOR milestone
            IN ${milestones}
            SORT milestone.startDate ${args.sort}
            ${limit}
            RETURN milestone`;
        },
      }),
    };
  },
});

module.exports = new gql.GraphQLSchema({
  query: queryType,
});
