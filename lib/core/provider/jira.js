"use strict";

const _ = require("lodash");
const fetch = require("node-fetch");
const urlJoin = require("url-join");
const log = require("debug")("gitlab");
const Paginator = require("../../paginator.js");
const { GraphQLClient, gql } = require("graphql-request");

class Jira {
  constructor(options) {
    this.baseUrl = urlJoin(options.baseUrl, "/rest/api/3/");
    this.privateToken = options.privateToken;
    this.requestTimeout = options.requestTimeout;
    this.count = 0;
    this.stopping = false;
    this.graphQL = new GraphQLClient(urlJoin(options.baseUrl, "graphql"), {
      headers: {
        authorization: `Bearer ${options.privateToken}`,
      },
    });
  }

  getProjects() {} // can use this route to get projects paginated project/search

  getIssuesWithJQL(jql) {
    //can use simple /search requests with jql and expand the results, should be no need to do a request for every single issue to get full data, max return size = 100
    log("getIssuesWithJQL(%o)", jql);
    const jqlSearchString = `jql=${encodeURIComponent(jql)}`; // part after the "jql=" needs to be encoded

    return this.paginatedRequest(
      "search?jql=" + encodeURIComponent(jqlSearchString)
    );
  }

  paginatedRequest(path) {
    return new Paginator(
      (start_at, per_request) => {
        // needs to be changed since in Jira pagination uses startAt index and not page
        if (this.stopping) {
          return Promise.resolve([]);
        }
        return this.request(path + "&startAt=" + start_at);
      },
      (resp) => {
        return resp.body;
      },
      (resp) => {
        return (this.count = parseInt(resp.headers.get("total"), 10));
      }
    );
  }

  async request(path) {
    const header = {
      Authorization: `Basic ${Buffer.from(this.privateToken).toString(
        "base64"
      )}`,
      Accept: "application/json",
    };

    return fetch(urlJoin(this.baseUrl, path), header).then((response) => {
      console.log(response);
      return response.json().then((data) => {
        return { headers: response.headers, body: data };
      });
    });
  }
}
