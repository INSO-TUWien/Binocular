'use strict';

import Model from '../Model';
import { GithubUser } from '../../types/GithubTypes.ts';

export interface AccountDataType {
  login: string;
  name: string;
  url: string;
  avatarUrl: string;
  platform: string;
}

class Account extends Model<AccountDataType> {
  constructor() {
    super({
      name: 'Account',
    });
  }

  ensureGitHubAccount(acc: GithubUser) {
    return this.ensureByExample(
      {
        platform: 'GitHub',
        login: acc.login,
      },
      {
        platform: 'GitHub',
        login: acc.login,
        name: acc.name,
        avatarUrl: acc.avatarUrl,
        url: acc.url,
      },
    );
  }
}

export default new Account();
