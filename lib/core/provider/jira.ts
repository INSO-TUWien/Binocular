"use strict";



import debug from 'debug';

const log = debug('jira');

import Paginator from "../../paginator";
import urlJoin from "url-join";


class Jira {
    private baseUrl: any;
    private privateToken: any;
    private requestTimeout: any;
    private count: number;
    private stopping: boolean;
  private usermail: any;
  constructor(options: { baseUrl: any; email?: any; privateToken: any; requestTimeout: any; }) {
    this.baseUrl = urlJoin(options.baseUrl, "/rest/api/3/");
    this.privateToken = options.privateToken;
    this.usermail = options.email;
    this.requestTimeout = options.requestTimeout;
    this.count = 0;
    this.stopping = false;

  }

  getProjects() {} // can use this route to get projects paginated project/search

  getIssuesWithJQL(jql: string) {
    //can use simple /search requests with jql and expand the results, should be no need to do a request for every single issue to get full data, max return size = 100
    log("getIssuesWithJQL(%o)", jql);
    const jqlSearchString = `jql=${encodeURIComponent(jql)}`; // part after the "jql=" needs to be encoded

    return this.paginatedRequest(
      "search?" + jqlSearchString
    );
  }

  paginatedRequest(path: string) {
    return new (Paginator as any)(
      (start_at: number, per_request: number) => {
        // needs to be changed since in Jira pagination uses startAt index and not page
        if (this.stopping) {
          return Promise.resolve([]);
        }
        return this.request(path + "&startAt=" + (start_at - 1));
      },
      (resp: any) => {
        return resp.body;
      },
      (resp: any) => {
        return (this.count = parseInt(resp.headers.get("total"), 10));
      },
      null
    );
  }

  async request(path: string) {

    const credentials = this.usermail + ":" + this.privateToken;
    const header = {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          credentials
        ).toString('base64')}`,
        'Accept': 'application/json',
        "Accept-Language": "en_us"
      }

    };
    return fetch(urlJoin(this.baseUrl, path), header
    ).then(async (response) => {
      const data = await response.json();
      return {headers: response.headers, body: data};
    });
  }
}

export default Jira
