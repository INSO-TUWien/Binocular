'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;
const CommitsToModules = db._collection('commits-modules');
const ModulesToFiles = db._collection('modules-files');
const ModulesToModules = db._collection('modules-modules');
const paginated = require('./paginated.js');

const Module = new gql.GraphQLObjectType({
  name: 'Module',
  description: 'A directory in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      path: {
        type: gql.GraphQLString,
        description: 'The path of the module, relative to the repository root',
      },
      files: paginated({
        type: require('./file'),
        description: 'The files touching this module',
        query: (module, args, limit) => aql`
          FOR file
          IN
          INBOUND ${module} ${ModulesToFiles}
            ${limit}
            RETURN file`,
      }),
      commits: paginated({
        type: require('./moduleInCommit.js'),
        description: 'The commits touching this module',
        query: (module, args, limit) => aql`
          FOR commit, edge
          IN
          OUTBOUND ${module} ${CommitsToModules}
            ${limit}
            RETURN {
              commit,
              webUrl: edge.webUrl,
              stats: edge.stats
            }`,
      }),
      subModules: paginated({
        type: require('./module'),
        description: 'The module touching this module',
        query: (module, args, limit) => aql`
          FOR module
          IN
          INBOUND ${module} ${ModulesToModules}
            ${limit}
            RETURN module`,
      }),
    };
  },
});

module.exports = Module;
