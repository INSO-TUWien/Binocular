'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLScalarType({
  name: 'Sort',
  description: 'Sorting direction. Either ASC (ascending) or DESC (descending)',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => {
    if (ast.kind !== gql.Kind.STRING) {
      throw new gql.GraphQLError('Query error: Must pass string for sort', [ast]);
    }

    const val = ast.value.toUpperCase();

    if (val !== 'ASC' && val !== 'DESC') {
      throw new gql.GraphQLError('Query error: Must pass "ASC" or "DESC" for sort', [ast]);
    }

    return val;
  }
});
