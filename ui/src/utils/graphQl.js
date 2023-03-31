'use strict';

import _ from 'lodash';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
const graphQl = new Lokka({ transport: new Transport('/graphQl') });

export { graphQl };

export function traversePages(getPage, fn, pageNumber = 1, perPage = 1000) {
  return Promise.resolve(getPage(pageNumber, perPage)).then((page) => {
    if (!page) {
      return;
    }
    const data = page.data || [];
    _.each(data, fn);
    if (data.length + (page.page - 1) * page.perPage < page.count) {
      return traversePages(getPage, fn, pageNumber + 1, perPage);
    }
  });
}

export function collectPages(getPage, fn, pageNumber = 1, perPage = 1000) {
  const items = [];
  return traversePages(getPage, (item) => items.push(item), pageNumber, perPage).thenReturn(items);
}
