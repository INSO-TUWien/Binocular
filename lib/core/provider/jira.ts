'use strict';

import debug from 'debug';
import Paginator from '../../paginator';
import urlJoin from 'url-join';

const log = debug('jira');

class Jira {
  private baseUrl: any;
  private privateToken: any;
  private requestTimeout: any;
  private count: number;
  private stopping = false;
  private usermail: any;

  constructor(options: { baseUrl: any; email?: any; privateToken: any; requestTimeout: any }) {
    this.baseUrl = urlJoin(options.baseUrl, '/rest/api/3/');
    this.privateToken = options.privateToken;
    this.usermail = options.email;
    this.requestTimeout = options.requestTimeout;
    this.count = 0;
    this.stopping = false;
  }

  getIssuesWithJQL(jql: string) {
    //can use simple /search requests with jql and expand the results,
    // should be no need to do a request for every single issue to get full data, max return size = 100
    log('getIssuesWithJQL(%o)', jql);
    const jqlSearchString = `fields=*all&jql=${encodeURIComponent(jql)}`; // part after the "jql=" needs to be encoded

    return this.paginatedRequest('search?' + jqlSearchString + '&');
  }

  getProjectVersions(projectKey: string) {
    log('getProjectVersions(%o)', projectKey);
    return this.paginatedRequest(`project/${projectKey}/version?`);
  }

  getDevelopmentInformation(issueId: string) {
    log('getMergeRequests(%o)', issueId);
    return this.request('dev-status/latest/issue/detail?issueId=' + issueId);
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }

  getMergeRequest(issueId: string) {
    log('getMergeRequests(%o)', issueId);
    return new Promise((resolve) => {
      this.request('dev-status/latest/issue/summary?issueId=' + issueId).then((developmentInformation) => {
        const pullrequests = developmentInformation.pullrequest;
        if (pullrequests.overall.count !== 0) {
          const mergeRequests: any[] = [];

          const promises: Promise<any>[] = [];

          for (const [key, value] of Object.entries(pullrequests.byInstanceType)) {
            promises.push(this.getDevelopmentInformation(issueId + '&dataType=pullrequest&applicationType=' + key));
          }

          Promise.all(promises).then((responses) => {
            let mergeRequests: any[] = [];
            for (const response of responses) {
              mergeRequests = mergeRequests.concat(response[0].pullRequests);
            }
            resolve(mergeRequests);
          });
        } else {
          resolve([]);
        }
      });
    });
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
          // for comments
          return resp.body.comments;
        } else if (path.includes('/version')) {
          // for projectversions
          return resp.body.values;
        }
        // for issues
        return resp.body.issues || [];
      },
      (resp: any) => {
        return (this.count = parseInt(resp.body.total, 10));
      },
      { its: 'jira' }
    );
  }

  request(path: string) {
    log('request(%o)', path);
    const credentials = this.usermail + ':' + this.privateToken;
    const header = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        Accept: 'application/json',
        'Accept-Language': 'en_us',
      },
    };
    const isNonOfficial = path.includes('dev-status');
    const requestUrl = isNonOfficial ? this.baseUrl.split('api/3')[0] + path : urlJoin(this.baseUrl, path);
    return fetch(requestUrl, header).then((response) => {
      return response.json().then((data) => {
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
