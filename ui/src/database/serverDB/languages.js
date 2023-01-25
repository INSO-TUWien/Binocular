'use strict';

import { graphQl } from '../../utils';

export default class Languages {
  static getAllLanguages() {
    return graphQl.query(
      `
      query{
       languages{
          data{
            id,
            name,
            aliases,
            popular,
            color
          }
        }
      }
      `,
      {}
    );
  }
}
