'use strict';

import { graphQl } from '../../utils';

export default class Stakeholders {
  static getAllStakeholders() {
    return graphQl.query(
      `
      query{
       stakeholders{
           data{
               id,
               gitSignature,
               gitlabName,
               gitlabWebUrl,
               gitlabAvatarUrl           
          }
        }
      }
      `,
      {},
    );
  }
}
