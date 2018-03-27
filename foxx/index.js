'use strict';

/**
 * Main entry point for the FOXX-service that is installed into ArangoDB
 * See https://www.arangodb.com/why-arangodb/foxx/
 */

const schema = require('./schema');
const createGraphqlRouter = require('@arangodb/foxx/graphql');

// This is a regular Foxx router.
const router = createGraphqlRouter({ schema, graphiql: true })
  .summary('GraphQL endpoint')
  .description('GraphQL endpoint for the Star Wars GraphQL example.');

module.context.use(router);
