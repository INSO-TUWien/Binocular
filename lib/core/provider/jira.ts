'use strict';

import debug from 'debug';
import Paginator from '../../paginator';
import urlJoin from 'url-join';
import {
  CommitRestResponse,
  CommitsFullDetail,
  CommitSummary,
  DevelopmentSummary,
  PullRequestDetail,
  PullrequestRestResponse,
  PullRequestsSummary,
} from '../../types/jiraRestApiTypes';

const log = debug('jira');

class Jira {
  private readonly API_VERSION = '2';
  private baseUrl;
  private count!: number;
  private privateToken;
  private requestTimeout;
  private stopping;
  private usermail: string | undefined;

  constructor(options: { baseUrl: string; email?: string | undefined; privateToken: string; requestTimeout: number }) {
    this.baseUrl = urlJoin(options.baseUrl, `/rest/api/${this.API_VERSION}/`);
    this.privateToken = options.privateToken;
    this.usermail = options.email;
    this.requestTimeout = options.requestTimeout;
    this.stopping = false;
  }

  getIssuesWithJQL(jql: string) {
    //can use simple /search requests with jql and expand the results,
    // should be no need to do a request for every single issue to get full data, max return size = 100
    log('getIssuesWithJQL(%o)', jql);
    const jqlSearchString = `fields=*all&jql=${encodeURIComponent(jql)}&expand=changelog`; // part after the "jql=" needs to be encoded

    return this.paginatedRequest('search?' + jqlSearchString + '&');
  }

  getProjectVersions(projectKey: string) {
    log('getProjectVersions(%o)', projectKey);
    return this.paginatedRequest(`project/${projectKey}/version?`);
  }

  private getDetailsPromises(issueId: string, summaryObject: CommitSummary | PullRequestsSummary, dataType: string) {
    const promises: Promise<any>[] = [];

    for (const [key] of Object.entries(summaryObject.byInstanceType)) {
      promises.push(this.request('dev-status/latest/issue/detail?issueId=' + issueId + `&dataType=${dataType}&applicationType=` + key));
    }

    return promises;
  }

  getCommitDetails(issueId: string, summaryObject: CommitSummary) {
    if (!summaryObject) {
      return Promise.resolve([]);
    }
    const promises: Promise<CommitRestResponse[]>[] = this.getDetailsPromises(issueId, summaryObject, 'repository');

    let informationToReturn: CommitsFullDetail[] = [];

    return Promise.all(promises).then((responses) => {
      for (const response of responses) {
        response.forEach((developmentDetailedObject) => {
          informationToReturn = informationToReturn.concat(developmentDetailedObject.repositories).flat();
        });
      }
      return informationToReturn;
    });
  }

  getPullrequestDetails(issueId: string, summaryObject: PullRequestsSummary) {
    if (!summaryObject) {
      return Promise.resolve([]);
    }
    const promises: Promise<PullrequestRestResponse[]>[] = this.getDetailsPromises(issueId, summaryObject, 'pullrequest');

    let informationToReturn: PullRequestDetail[] = [];

    return Promise.all(promises).then((responses) => {
      for (const response of responses) {
        response.forEach((developmentDetailedObject) => {
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

    return this.request('dev-status/latest/issue/summary?issueId=' + issueId).then((developmentInformation: DevelopmentSummary) => ({
      commits: developmentInformation.repository,
      pullrequests: developmentInformation.pullrequest,
    }));
  }

  getWorklog(issueKey: string) {
    log('getWorklog(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/worklog?expand=properties`);
  }

  getChangelog(issueKey: string) {
    log('getChangelog(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/getChangelog`);
  }

  getComments(issueKey: string) {
    log('getComments(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/comment?`);
  }

  paginatedRequest(path: string) {
    log('paginatedRequest(%o)', path);
    return new (Paginator as any)(
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

      return response.json().then((data) => {
        if (!successful) {
          log('different response code: ' + response.status + '\n' + data);
        }
        if (!isNonOfficial) {
          return { headers: response.headers, body: data };
        } else if (path.includes('detail')) {
          return data.detail;
        } else {
          return data.summary;
        }
      });
    });
  }
}

export default Jira;
