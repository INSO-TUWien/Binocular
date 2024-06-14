'use strict';

import _ from 'lodash';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const graphQl = new ApolloClient({
  uri: '/graphQl',
  cache: new InMemoryCache(),
});

export { graphQl };

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export async function traversePages(getPage, fn, pageNumber = 1, perPage = 1000) {
  const page = await Promise.resolve(getPage(pageNumber, perPage));
  if (!page) {
    return;
  }
  const data = page.data || [];
  _.each(data, fn);
  if (data.length + (page.page - 1) * page.perPage < page.count) {
    return traversePages(getPage, fn, pageNumber + 1, perPage);
  }
}
