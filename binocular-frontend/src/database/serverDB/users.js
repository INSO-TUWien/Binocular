'use strict';

import { graphQl } from '../../utils';

export default class Users {
  static getAllUsers() {
    return graphQl.query(
      `
      query{
       users{
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
