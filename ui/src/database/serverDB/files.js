'use strict';

import { graphQl } from '../../utils';

export default class Files {
  static requestFileStructure() {
    return graphQl.query(
      `
      query{
       files(sort: "ASC"){
          data{path,webUrl}
        }
      }
      `,
      {}
    );
  }
}
