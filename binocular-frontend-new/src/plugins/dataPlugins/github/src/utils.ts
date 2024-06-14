'use strict';

import { ApolloClient, InMemoryCache } from '@apollo/client';

const token = '';

const graphQl = new ApolloClient({
  uri: 'https://api.github.com/graphql',
  headers: { authorization: `Bearer ${token}` },
  cache: new InMemoryCache(),
});

export { graphQl };
