'use strict';

import { graphQl } from '../../utils';

export default class Modules {
  static getAllModules() {
    return graphQl.query(
      `
      query{
       modules{
          data{
            id,
            path
          }
        }
      }
      `,
      {},
    );
  }
}
