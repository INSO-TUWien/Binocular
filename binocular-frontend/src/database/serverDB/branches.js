'use strict';

import { graphQl } from '../../utils';

export default class Branches {
  static getAllBranches() {
    return graphQl.query(
      `
      query{
       branches(sort: "ASC"){
          data{branch,active,tracksFileRenames,latestCommit}
        }
      }
      `,
      {},
    );
  }
}
