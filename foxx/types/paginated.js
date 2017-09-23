'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;

const PAGINATION_ARGS = {
  page: {
    description: 'Page number to get',
    type: gql.GraphQLInt
  },
  perPage: {
    description: 'Amount of items per page',
    type: gql.GraphQLInt
  }
};

const paginatedTypes = {};

module.exports = function paginated(innerSchema) {
  const args = Object.assign({}, PAGINATION_ARGS, innerSchema.args || {});

  if (!paginatedTypes[innerSchema.type.name]) {
    paginatedTypes[innerSchema.type.name] = createPaginatedType(innerSchema.type);
  }

  return {
    type: paginatedTypes[innerSchema.type.name],
    args,
    resolve(root, args) {
      return {
        data: getData(innerSchema, root, args, limitClause(args)),
        count: getCount(innerSchema, root, args),
        page: args.page || 1,
        perPage: args.perPage
      };
    }
  };
};

function getData(innerSchema, root, args) {
  if (typeof innerSchema.resolve === 'function') {
    return innerSchema.resolve(root, args, limitClause(args));
  } else {
    const query = innerSchema.query(root, args, limitClause(args));
    return db._query(query).toArray();
  }
}

function getCount(innerSchema, root, args) {
  if (typeof innerSchema.count === 'function') {
    return innerSchema.count(root, args);
  } else if (innerSchema.query) {
    const innerQuery = innerSchema.query(root, args, { toAQL: () => '' });
    return db
      ._query({
        query: `RETURN LENGTH(${innerQuery.query})`,
        bindVars: innerQuery.bindVars
      })
      .toArray()[0];
  }
}

function limitClause(args) {
  if (!args.perPage) {
    return { toAQL: () => '' };
  }

  const offset = ((args.page || 1) - 1) * args.perPage;
  let ret = `LIMIT ${offset}, ${args.perPage}`;

  return { toAQL: () => ret + '\n' };
}

function createPaginatedType(type) {
  return new gql.GraphQLObjectType({
    name: 'Paginated' + type.name,
    description: type.description + ' (paginated)',
    fields() {
      return {
        data: {
          type: new gql.GraphQLList(type),
          description: 'Paginated data'
        },
        count: {
          type: gql.GraphQLInt,
          description: 'Total amount of items'
        },
        page: {
          type: gql.GraphQLInt,
          description: 'Current page'
        },
        perPage: {
          type: gql.GraphQLInt,
          description: 'Number of items per page'
        }
      };
    }
  });
}
