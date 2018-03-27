'use strict';
const schema = require('./schema');
const createGraphqlRouter = require('@arangodb/foxx/graphql');

// This is a regular Foxx router.
const router = createGraphqlRouter({ schema, graphiql: true })
  .summary('GraphQL endpoint')
  .description('GraphQL endpoint for the Star Wars GraphQL example.');

module.context.use(router);
