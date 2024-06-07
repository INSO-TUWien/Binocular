'use strict';

import debug from 'debug';
import Paginator from '../../paginator';
import urlJoin from 'url-join';
import {
  JiraCommitsDetails,
  JiraCommitsFullDetails,
  JiraCommitsSummary,
  JiraDevelopmentSummary,
  JiraFullAuthor,
  JiraPullRequestDetails,
  JiraPullRequestsFullDetails,
  JiraPullRequestsSummary,
  JiraUserEndpoint,
} from '../../types/jiraTypes';

const log = debug('jira');

class Jira {
  private readonly API_VERSION = '2';
  private baseUrl;
  private applicationbaseUrl;
  private count!: number;
  private privateToken;
  private requestTimeout;
  private stopping;
  private usermail: string | undefined;

  constructor(options: { baseUrl: string; email?: string | undefined; privateToken: string; requestTimeout: number }) {
    this.baseUrl = urlJoin(options.baseUrl, `/rest/api/${this.API_VERSION}/`);
    this.applicationbaseUrl = options.baseUrl;
    this.privateToken = options.privateToken;
    this.usermail = options.email;
    this.requestTimeout = options.requestTimeout;
    this.stopping = false;
  }

  getIssuesWithJQL(jql: string) {
    log('getIssuesWithJQL(%o)', jql);
    const jqlSearchString = `fields=*all&jql=${jql}&expand=changelog`;

    return this.paginatedRequest('search?' + jqlSearchString + '&');
  }

  getProjectVersions(projectKey: string) {
    log('getProjectVersions(%o)', projectKey);
    return this.paginatedRequest(`project/${projectKey}/version?`);
  }

  private getDetailsPromises(issueId: string, summaryObject: JiraCommitsSummary | JiraPullRequestsSummary) {
    const promises: Promise<any>[] = [];

    for (const [key] of Object.entries(summaryObject.byInstanceType)) {
      promises.push(
        this.request(
          'dev-status/latest/issue/detail?issueId=' + issueId + `&dataType=${summaryObject.overall.dataType}&applicationType=` + key
        )
      );
    }

    return promises;
  }

  getCommitDetails(issueId: string, summaryObject: JiraCommitsSummary, shouldFetch: boolean) {
    if (!summaryObject || !shouldFetch) {
      return Promise.resolve([]);
    }
    const promises: Promise<JiraCommitsFullDetails[]>[] = this.getDetailsPromises(issueId, summaryObject);

    let informationToReturn: JiraCommitsDetails[] = [];

    return Promise.all(promises).then((responses) => {
      for (const response of responses) {
        response.forEach((developmentDetailedObject) => {
          informationToReturn = informationToReturn.concat(developmentDetailedObject.repositories).flat();
        });
      }
      return informationToReturn;
    });
  }

  getPullrequestDetails(issueId: string, summaryObject: JiraPullRequestsSummary) {
    if (!summaryObject) {
      return Promise.resolve([]);
    }
    const promises: Promise<JiraPullRequestsFullDetails[]>[] = this.getDetailsPromises(issueId, summaryObject);

    let informationToReturn: JiraPullRequestDetails[] = [];

    return Promise.all(promises).then((responses) => {
      for (const response of responses) {
        response.forEach((developmentDetailedObject) => {
          developmentDetailedObject.pullRequests.forEach((pullRequestDetails) => {
            pullRequestDetails.instance = developmentDetailedObject._instance;
          });
          informationToReturn = informationToReturn.concat(developmentDetailedObject.pullRequests).flat();
        });
      }
      return informationToReturn;
    });
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }

  getDevelopmentSummary(issueId: string) {
    log('getMergeRequests(%o)', issueId);

    return this.request('dev-status/latest/issue/summary?issueId=' + issueId).then((developmentInformation: JiraDevelopmentSummary) => ({
      commits: developmentInformation?.repository,
      pullrequests: developmentInformation?.pullrequest,
    }));
  }

  getWorklog(issueKey: string) {
    log('getWorklog(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/worklog?`);
  }

  getChangelog(issueKey: string) {
    log('getChangelog(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/changelog?`);
  }

  getComments(issueKey: string) {
    log('getComments(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/comment?`);
  }

  paginatedRequest(path: string) {
    log('paginatedRequest(%o)', path);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return new Paginator(
      (start_at: number, per_request: number) => {
        // needs to be changed since in Jira pagination uses startAt index and not page
        if (this.stopping) {
          return Promise.resolve([]);
        }
        return this.request(path + `startAt=${start_at}&maxResults=${per_request}`);
      },
      (resp: any) => {
        if (path.includes('/comment')) {
          return resp.body.comments;
        } else if (path.includes('/version') || path.includes('/changelog')) {
          return resp.body.values;
        } else if (path.includes('/worklog')) {
          return resp.body.worklogs;
        }
        // for issues
        return resp.body.issues || [];
      },
      (resp: { headers: any; body: { total: string; [key: string]: any } }) => {
        return (this.count = parseInt(resp.body.total, 10));
      },
      { its: 'jira' }
    );
  }

  private request(path: string) {
    log('request(%o)', path);
    const credentials = this.usermail + ':' + this.privateToken;
    const header = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        Accept: 'application/json',
      },
      timeout: this.requestTimeout || 3000,
    };
    const isNonOfficial = path.includes('dev-status');
    const requestUrl = isNonOfficial ? this.baseUrl.split(`api/${this.API_VERSION}`)[0] + path : urlJoin(this.baseUrl, path);
    return fetch(requestUrl, header).then((response) => {
      const successful = response.ok;
      if (!successful) {
        console.log('different response code: ' + response.status + '\n' + requestUrl);
        return { headers: response.headers, body: [] };
      }
      return response.json().then((data) => {
        if (path.includes('user?accountId=')) {
          return data;
        } else if (!isNonOfficial) {
          return { headers: response.headers, body: data };
        } else if (path.includes('detail')) {
          return data.detail;
        } else {
          return data.summary;
        }
      });
    });
  }

  private requestTeamMembers(path: string) {
    log('team(%o)', path);
    const credentials = this.usermail + ':' + this.privateToken;
    const header = {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        Accept: 'application/json',
      },
      timeout: this.requestTimeout || 3000,
    };

    return fetch(path, header).then((response) => {
      const successful = response.ok;

      return response.json().then((data) => {
        if (!successful) {
          log('different response code: ' + response.status + '\n' + data);
        }
        return data.results;
      });
    });
  }

  getTeamMembers(
    organizationId: string | undefined,
    teamsId: string | undefined,
    originalAssignee: JiraFullAuthor | null,
    seenUsers: Map<string, JiraFullAuthor>
  ) {
    log('getTeamMembers()');
    const retAssignees = originalAssignee ? [originalAssignee] : [];
    if (!organizationId || !teamsId) {
      return Promise.resolve(retAssignees);
    }

    const teamMembersUrl = `${this.applicationbaseUrl}gateway/api/public/teams/v1/org/${organizationId}/teams/${teamsId}/members`;

    return this.requestTeamMembers(teamMembersUrl).then((response: [{ accountId: string }]) => {
      const membersPromises: any[] = response.map((memberId) => {
        if (originalAssignee && originalAssignee.accountId !== memberId.accountId) {
          const cachedUser = seenUsers.get(memberId.accountId);
          if (!cachedUser) {
            return this.request(`/user?accountId=${memberId.accountId}`);
          } else {
            retAssignees.push(cachedUser);
          }
        }
      });

      return Promise.all(membersPromises).then((assignees: any[]) => {
        return assignees.concat(retAssignees);
      });
    });
  }
}

export default Jira;
