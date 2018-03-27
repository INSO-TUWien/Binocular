'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLScalarType({
  name: 'Timestamp',
  description: 'An ISO8601-compliant timestamp',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => {
    if (ast.kind === gql.Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    } else if (ast.kind === gql.Kind.STRING) {
      const ms = Date.parse(ast.value);

      if (isNaN(ms)) {
        throw new gql.GraphQLError('Query error: Illegal ISO8601 date string: ' + ast.value);
      }

      return new Date(ms);
    } else {
      throw new gql.GraphQLError(
        'Query error: Can only parse int or string but got a: ' + ast.kind,
        [ast]
      );
    }
  }
});
