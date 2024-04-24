import Paginator from '../../../../lib/paginator';

class JiraMock {
  private stopping;

  constructor() {
    this.stopping = false;
  }

  getIssuesWithJQL() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve({
            headers: null,
            body: {
              expand: 'names,schema',
              startAt: 0,
              maxResults: 50,
              total: 2,
              issues: [
                {
                  id: '1',
                  self: 'testurl',
                  key: 'TEST-1',
                  fields: {
                    timespent: null,
                    resolution: null,
                    resolutiondate: '2022',
                    issuerestriction: {
                      issuerestrictions: {},
                      shouldDisplay: true,
                    },
                    watches: {
                      watchCount: 1,
                    },
                    status: {
                      statusCategory: {
                        key: 'done',
                      },
                    },
                    created: '2023-11-21T16:32:04.631+0100',
                    labels: ['hallo'],
                    aggregatetimeoriginalestimate: null,
                    timeestimate: null,
                    versions: [],
                    issuelinks: [],
                    updated: '2024-02-21T00:58:25.812+0100',
                    components: [],
                    timeoriginalestimate: null,
                    description: 'desc1',
                    timetracking: {},
                    security: null,
                    summary: 'Test1',
                    subtasks: [],
                    assignee: {
                      self: 'test',
                      accountId: '1',
                      emailAddress: 'testmail',
                      displayName: 'am',
                      active: true,
                      timeZone: 'Europe/Berlin',
                      accountType: 'atlassian',
                      avatarUrls: {
                        '48x48': 'test',
                      },
                    },
                    reporter: {
                      self: 'test',
                      accountId: '3',
                      emailAddress: 'mail-rep',
                      displayName: 'reporter',
                      active: true,
                      timeZone: 'Europe/Berlin',
                      avatarUrls: {
                        '48x48': 'test',
                        '24x24':
                          'https://secure.gravatar.com/avatar/bbc72e095bfe08ad62e75c558adeed0f?d=h' +
                          'ttps%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-0.png',
                        '16x16':
                          'https://secure.gravatar.com/avatar/bbc72e095bfe08ad62e75c558adeed0f?d=h' +
                          'ttps%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-0.png',
                        '32x32': 'test',
                      },
                      accountType: 'atlassian',
                    },
                    customfield_10000:
                      '{pullrequest={dataType=pullrequest, state=OPEN, stateCount=2}, json={cachedValue:{errors:[],' +
                      'summary:{pullrequest:{overall:{count:2,lastUpdated:2024-02-14T17:02:08.000+0100,stateCount:2' +
                      ',state:OPEN,dataType:pullrequest,open:true},byInstanceType:{GitHub:{count:2,name:GitHub},' +
                      'GitLab:{count:1,name:GitLab}}}}},isStale:true}}',
                    environment: null,
                    duedate: '2024-01-19',
                    votes: {
                      votes: 1,
                      hasVoted: true,
                    },
                    fixVersions: [],
                  },
                },
                {
                  id: '2',
                  self: 'testurl',
                  key: 'TEST-2',
                  fields: {
                    timespent: null,
                    status: {
                      statusCategory: {
                        key: 'new',
                      },
                    },
                    fixVersions: [
                      {
                        id: '10002',
                        description: 'this is some sketchy description',
                        name: 'this is test1',
                        archived: false,
                        released: true,
                        releaseDate: '2024-01-11',
                      },
                    ],
                    votes: {
                      votes: 5,
                    },
                    watches: {
                      watchCount: 5,
                    },
                    resolution: null,
                    resolutiondate: null,
                    issuerestriction: {
                      issuerestrictions: {},
                      shouldDisplay: true,
                    },
                    created: '2023-11-21T16:32:04.631+0100',
                    labels: ['foo'],
                    aggregatetimeoriginalestimate: null,
                    timeestimate: null,
                    versions: [],
                    issuelinks: [],
                    assignee: {
                      self: 'test',
                      accountId: '1',
                      emailAddress: 'testmail',
                      displayName: 'am',
                      active: true,
                      timeZone: 'Europe/Berlin',
                      accountType: 'atlassian',
                      avatarUrls: {
                        '48x48': 'test',
                      },
                    },
                    updated: '2024-02-21T00:58:25.812+0100',
                    components: [],
                    timeoriginalestimate: null,
                    description: 'desc2',
                    timetracking: {},
                    security: null,
                    summary: 'Test1',
                    duedate: '2024-01-19',
                  },
                },
              ],
            },
          });
        });
      },
      (resp) => {
        return resp.body.issues;
      },
      () => {
        return 2;
      },
      { its: 'jira' }
    );
  }

  getProjectVersions() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve({
            header: null,
            body: {
              self: 'https://bakk-mart.atlassian.net/rest/api/3/project/TEST/version?maxResults=50&startAt=0',
              maxResults: 50,
              startAt: 0,
              total: 11,
              isLast: true,
              values: [
                {
                  self: 'version/1',
                  id: '1',
                  name: 'test1',
                  archived: false,
                  released: true,
                  releaseDate: '2024-03-16',
                  userReleaseDate: '16/Mar/24',
                  projectId: 1,
                },
                {
                  self: 'version/2',
                  id: '2',
                  description: 'desc2',
                  name: 'test2',
                  archived: false,
                  released: false,
                  releaseDate: '2024-03-14',
                  overdue: true,
                  userReleaseDate: '14/Mar/24',
                  projectId: 1,
                },
              ],
            },
          });
        });
      },
      (resp) => {
        return resp.body.values;
      },
      () => {
        return 2;
      },
      { its: 'jira' }
    );
  }

  stop() {
    this.stopping = true;
  }

  isStopping() {
    return this.stopping;
  }

  getDevelopmentSummary() {
    return Promise.resolve({ commits: undefined, pullrequests: undefined });
  }

  getPullrequestDetails() {
    return Promise.resolve([
      {
        instance: 'instance1',
        id: '2',
        lastUpdate: '2022',
        reviewers: [],
        source: {
          branch: 'first',
        },
        destination: {
          branch: 'second',
        },
      },
    ]);
  }

  getCommitDetails() {
    return Promise.resolve([]);
  }

  getTeamMembers() {
    return Promise.resolve({ teamsAssignees: [], assigneeMissing: true });
  }
}

export default JiraMock;
