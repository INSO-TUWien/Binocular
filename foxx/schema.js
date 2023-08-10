'use strict';

/**
 * The GraphQL-Schema exposed by our FOXX service
 */

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const qb = require('aqb');
const paginated = require('./types/paginated.js');
const queryHelpers = require('./query-helpers.js');
const Timestamp = require('./types/Timestamp.js');
const Sort = require('./types/Sort.js');
const DateHistogramGranularity = require('./types/DateHistogramGranularity.js');

const commits = db._collection('commits');
const files = db._collection('files');
const stakeholders = db._collection('stakeholders');
const modules = db._collection('modules');
const issues = db._collection('issues');
const builds = db._collection('builds');
const languages = db._collection('languages');
const branches = db._collection('branches');

const ISSUE_NUMBER_REGEX = /^#?(\d+).*$/;

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
          let q = qb.for('commit').in('commits').sort('commit.date', args.sort);

          q = queryHelpers.addDateFilter('commit.date', 'gte', args.since, q);
          q = queryHelpers.addDateFilter('commit.date', 'lte', args.until, q);

          q = q.limit(limit.offset, limit.count).return('commit');

          return q;
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
      commitDateHistogram: makeDateHistogramEndpoint(commits, 'date', {
        args: {
          buildFilter: {
            type: new gql.GraphQLEnumType({
              name: 'BuildFilter',
              values: {
                successful: {
                  value: 'successful',
                },
                failed: {
                  value: 'failed',
                },
                all: {
                  value: 'all',
                },
              },
            }),
            description: 'Include/exclude commits that have successful builds',
          },
        },
        makeFilter: (args) => {
          if (!args.buildFilter || args.buildFilter === 'all') {
            return true;
          }

          const comparatorMap = {
            successful: 'gt',
            failed: 'eq',
          };

          return qb[comparatorMap[args.buildFilter]](
            qb.LENGTH(
              qb
                .for('build')
                .in('builds')
                .filter(qb.and(qb.eq('build.sha', 'item.sha'), qb.eq('build.status', qb.str('success'))))
                .return(1)
            ),
            0
          );
        },
      }),
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
      languages: paginated({
        type: require('./types/language'),
        query: (root, args, limit) => aql`
          FOR language
            IN
            ${languages}
            ${limit}
              RETURN language`,
      }),
      language: {
        type: require('./types/language'),
        args: {
          name: {
            description: 'name of language',
            type: new gql.GraphQLNonNull(gql.GraphQLString),
          },
        },
        resolve(root, args) {
          return languages.firstExample({ name: args.name });
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
              FOR commit IN ${commits}
                SORT commit.signature ASC
                RETURN DISTINCT commit.signature`
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
          // let q = qb.for('build').in('builds').sort('build.createdAt', 'ASC');

          // q = queryHelpers.addDateFilter('build.createdAt', 'gte', args.since, q);
          // q = queryHelpers.addDateFilter('build.createdAt', 'lte', args.until, q);

          // let countsByStatus = qb.for('other').in('builds');
          // countsByStatus = countsByStatus.filter(qb.lte('other.finishedAt', 'build.createdAt'));
          // countsByStatus = countsByStatus
          //   .collect('status', 'other.status')
          //   .withCountInto('statusCount')
          //   .return({ ['status']: 'statusCount' });

          // q = q.limit(limit.offset, limit.count).return('build');

          // //TODO: RETURN MERGE(build, { stats: MERGE(countsByStatus) })`;

          // return q;
          if (args.since && args.until) {
            return aql`
          FOR build IN ${builds}
            SORT build.createdAt ASC
            ${limit}
            FILTER DATE_TIMESTAMP(build.createdAt) >= DATE_TIMESTAMP(${args.since})
            FILTER DATE_TIMESTAMP(build.createdAt) <= DATE_TIMESTAMP(${args.until})
            LET countsByStatus = (
              COLLECT status = build.status WITH COUNT INTO statusCount
              RETURN { [status]: statusCount }
            )
            RETURN MERGE(build, { stats: MERGE(countsByStatus) })`;
          }
          return aql`
          FOR build IN ${builds}
            SORT build.createdAt ASC
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
          q: { type: gql.GraphQLString },
          since: { type: Timestamp },
          until: { type: Timestamp },
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          let exactQuery = [];
          let fuzzyQuery = qb.for('issue').in('issues').sort('issue.createdAt', args.sort);

          if (args.q) {
            const searchString = qb.str('%' + args.q.replace(/\s+/g, '%') + '%');
            fuzzyQuery = fuzzyQuery.filter(qb.LIKE(qb.CONCAT(qb.str('#'), 'issue.iid', qb.str(' '), 'issue.title'), searchString, true));

            const issueNumberMatch = args.q.match(ISSUE_NUMBER_REGEX);
            if (issueNumberMatch) {
              exactQuery = qb.for('issue').in('issues').filter(qb.eq('issue.iid', issueNumberMatch[1])).return('issue');

              fuzzyQuery = fuzzyQuery.filter(qb.neq('issue.iid', issueNumberMatch[1]));
            }
          }

          fuzzyQuery = fuzzyQuery.return('issue');

          let q = qb.let('fullList', qb.APPEND(exactQuery, fuzzyQuery)).for('issue').in('fullList');

          q = queryHelpers.addDateFilter('issue.createdAt', 'gte', args.since, q);
          q = queryHelpers.addDateFilter('issue.createdAt', 'lte', args.until, q);

          q = q.limit(limit.offset, limit.count).return('issue');

          return q;
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
          let q = qb.for('branch').in('branches').sort('branch.id', args.sort);

          q = q.limit(limit.offset, limit.count).return('branch');

          return q;
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
          let q = qb.for('mergeRequest').in('mergeRequests').sort('mergeRequest.createdAt', args.sort);

          q = queryHelpers.addDateFilter('mergeRequest.createdAt', 'gte', args.since, q);
          q = queryHelpers.addDateFilter('mergeRequest.createdAt', 'lte', args.until, q);

          q = q.limit(limit.offset, limit.count).return('mergeRequest');

          return q;
        },
      }),
      milestones: paginated({
        type: require('./types/milestone.js'),
        args: {
          since: { type: Timestamp },
          until: { type: Timestamp },
          sort: { type: Sort },
        },
        query: (root, args, limit) => {
          let q = qb.for('milestone').in('milestones').sort('milestone.startDate', args.sort);

          q = queryHelpers.addDateFilter('mergeRequest.startDate', 'gte', args.since, q);
          q = queryHelpers.addDateFilter('mergeRequest.startDate', 'lte', args.until, q);

          q = q.limit(limit.offset, limit.count).return('milestone');

          return q;
        },
      }),
      issueDateHistogram: makeDateHistogramEndpoint(issues),
    };
  },
});

module.exports = new gql.GraphQLSchema({
  query: queryType,
});

function makeDateHistogramEndpoint(collection, dateFieldName, { makeFilter, args } = {}) {
  const extendedArgs = Object.assign(
    {
      granularity: {
        type: new gql.GraphQLNonNull(DateHistogramGranularity),
      },
      since: { type: Timestamp },
      until: { type: Timestamp },
    },
    args
  );

  if (!dateFieldName) {
    extendedArgs.dateField = {
      type: new gql.GraphQLNonNull(gql.GraphQLString),
    };
  }

  return {
    type: require('./types/histogram.js')(gql.GraphQLInt),
    args: extendedArgs,
    resolve(root, args) {
      let q = qb.for('item').in(collection);

      q = queryHelpers.addDateFilter('item.' + (dateFieldName || args.dateField), 'gte', args.since, q);
      q = queryHelpers.addDateFilter('item.' + (dateFieldName || args.dateField), 'lte', args.until, q);

      if (makeFilter) {
        q = q.filter(makeFilter(args));
      }

      q = q
        .collect('category', args.granularity(`item.${dateFieldName || args.dateField}`))
        .withCountInto('length')
        .return({
          category: 'category',
          count: 'length',
        })
        .toAQL();

      return db._query(q).toArray();
    },
  };
}
