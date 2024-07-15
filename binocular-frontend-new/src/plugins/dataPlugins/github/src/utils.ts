'use strict';

import { ApolloClient, InMemoryCache } from '@apollo/client';

class GraphQL {
  public client;

  constructor(apiKey: string) {
    this.client = new ApolloClient({
      uri: 'https://api.github.com/graphql',
      headers: { authorization: `Bearer ${apiKey}` },
      cache: new InMemoryCache(),
    });
  }
}

export { GraphQL };
