import type {
  DataPluginAccountMergeRequests,
  DataPluginAccountsMergeRequests,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';

export default class AccountsMergeRequests implements DataPluginAccountsMergeRequests {
  constructor() {}

  public async getAll(from: string, to: string): Promise<DataPluginAccountMergeRequests[]> {
    console.log(`Getting all plugin accounts with merge requests from ${from} to ${to}`);
    return new Promise<DataPluginAccountMergeRequests[]>((resolve) => {
      resolve([
        {
          id: 'alice',
          login: 'alice',
          name: 'Alice',
          avatarUrl: 'https://ui-avatars.com/api/?name=Alice&background=random&color=fff',
          url: 'https://example.com/alice',
          mergeRequests: [],
        },
        {
          id: 'bob',
          login: 'bob',
          name: 'Bob',
          avatarUrl: 'https://ui-avatars.com/api/?name=Bob&background=random&color=fff',
          url: 'https://example.com/bob',
          mergeRequests: [],
        },
        {
          id: 'carol',
          login: 'carol',
          name: 'Carol',
          avatarUrl: 'https://ui-avatars.com/api/?name=Carol&background=random&color=fff',
          url: 'https://example.com/carol',
          mergeRequests: [],
        },
        {
          id: 'dave',
          login: 'dave',
          name: 'Dave',
          avatarUrl: 'https://ui-avatars.com/api/?name=Dave&background=random&color=fff',
          url: 'https://example.com/dave',
          mergeRequests: [],
        },
        {
          id: 'eve',
          login: 'eve',
          name: 'Eve',
          avatarUrl: 'https://ui-avatars.com/api/?name=Eve&background=random&color=fff',
          url: 'https://example.com/eve',
          mergeRequests: [],
        },
      ]);
    });
  }
}
