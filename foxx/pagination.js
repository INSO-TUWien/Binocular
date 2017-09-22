'use strict';

const gql = require('graphql-sync');

module.exports = {
  paginationArgs: {
    page: {
      description: 'Page number to get',
      type: gql.GraphQLInt
    },
    perPage: {
      description: 'Amount of items per page',
      type: gql.GraphQLInt
    }
  },

  limitClause: function(args) {
    if (!args.perPage) {
      return { toAQL: () => '' };
    }

    const offset = ((args.page || 1) - 1) * args.perPage;
    let ret = `LIMIT ${offset}, ${args.perPage}`;

    return { toAQL: () => ret + '\n' };
  }
};
