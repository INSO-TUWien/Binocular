'use strict';

import debug from 'debug';

const log = debug('jira');

import Paginator from '../../paginator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import urlJoin from 'url-join';

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
  getComments(issueKey: string) {
    log('getComments(%o)', issueKey);
    return this.paginatedRequest(`issue/${issueKey}/comment?`);
  }

  paginatedRequest(path: string) {
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
        }
        return resp.body.issues;
      },
      (resp: any) => {
        return (this.count = parseInt(resp.body.total, 10));
      },
      { its: 'jira' }
    );
  }

  async request(path: string) {
    const credentials = this.usermail + ':' + this.privateToken;
    const header = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        Accept: 'application/json',
        'Accept-Language': 'en_us',
      },
    };
    return fetch(urlJoin(this.baseUrl, path), header).then(async (response) => {
      const data = await response.json();
      return { headers: response.headers, body: data };
    });
  }
}

export default Jira;
