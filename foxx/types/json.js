const gql = require('graphql-sync');

module.exports = new gql.GraphQLScalarType({
  name: 'JsonType',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => {
    if (ast.kind !== gql.Kind.OBJECT) {
      throw new gql.GraphQLError('Query error: Can only parse object but got a: ' + ast.kind, [
        ast
      ]);
    }
    return ast.value;
  }
});
