'use strict';

import Model from '../Model';

export interface UserDataType {
  gitSignature: string;
}

class User extends Model<UserDataType> {
  constructor() {
    super({
      name: 'User',
    });
  }
}

export default new User();
