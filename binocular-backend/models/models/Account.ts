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

  ensureGitLabAccount(acc: any) {
    if (acc === undefined || acc === null) return;
    return this.ensureByExample(
      {
        platform: 'GitLab',
        login: acc.username,
      },
      {
        platform: 'GitHub',
        login: acc.username,
        name: acc.name,
        avatarUrl: acc.avatar_url,
        url: acc.web_url,
      },
    );
  }
}

export default new Account();
