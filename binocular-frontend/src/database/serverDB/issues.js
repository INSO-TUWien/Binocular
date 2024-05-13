'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import moment from 'moment/moment';

export default class Issues {
  static getIssueData(issueSpan, significantSpan) {
    const issueList = [];

    const getIssuesPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `
          query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            issues(page: $page, perPage: $perPage, since: $since, until: $until) {
              count
              page
              perPage
              count
              data {
                iid
                title
                createdAt
                closedAt
                webUrl
                state
                author{
                  login
                  name
                }
                assignees{
                  login
                  name 
                }
                assignee{
                  login
                  name 
                }
                notes{
                  body
                  createdAt
                  author{
                    login
                    name
                  }
                }
              }
            }
          }`,
          { page, perPage, since, until },
        )
        .then((resp) => resp.issues);
    };

    return traversePages(getIssuesPage(significantSpan[0], significantSpan[1]), (issue) => {
      issueList.push(issue);
    }).then(function () {
      return issueList;
    });
  }

  static getCommitsForIssue(iid) {
    return graphQl
      .query(
        `query{
             issue (iid: ${iid}){
              commits {
                count
                data {
                  sha
                  shortSha
                  message
                  messageHeader
                  signature
                  branch
                  parents
                  date
                  webUrl
                  stats {
                    additions
                    deletions
                  }
                }
              }
             }
           }`,
        { iid },
      )
      .then((resp) => resp.issue.commits.data);
  }

  static issueImpactQuery(iid, since, until) {
    return graphQl.query(
      `query($iid: Int!, $since: Timestamp, $until: Timestamp) {
           issue(iid: $iid) {
             iid
             title
             createdAt
             closedAt,
             webUrl
             commits (since: $since, until: $until) {
               data {
                 sha
                 shortSha
                 messageHeader
                 date
                 webUrl
                 files {
                   data {
                     lineCount
                     hunks {
                       newStart
                       newLines
                       oldStart
                       oldLines
                       webUrl
                     }
                     stats {
                      additions
                      deletions
                     }
                     file {
                       id
                       path
                       webUrl
                       maxLength
                     }
                   }
                 }
                 builds {
                   id
                   createdAt
                   finishedAt
                   duration
                   status
                   webUrl
                   jobs {
                     id
                     name
                     stage
                     status
                     createdAt
                     finishedAt
                     webUrl
                   }
                 }
               }
             }
           }
         }`,
      { iid: iid, since: since, until: until },
    );
  }

  static searchIssues(text) {
    const issueList = [];

    const getIssuesPageSearch = () => (page, perPage) => {
      return graphQl
        .query(
          `query {
            issues(page: 1, perPage: 50, sort: "DESC") {
              data { iid title createdAt closedAt }
            }
          }`,
        )
        .then((resp) => resp.issues);
    };

    return traversePages(getIssuesPageSearch(), (issue) => {
      issueList.push(issue);
    }).then(function () {
      return issueList.filter((i) => i.title.includes(text) || `${i.iid}`.startsWith(text));
    });
  }

  static getCodeHotspotsIssueData(file) {
    return graphQl.query(
      `
        query($file: String!) {
          issues{
            data{
              title
              description
              iid
              commits{
                data{
                  message
                  sha
                  signature
                  branch
                  date
                  parents
                  stats{
                    additions
                    deletions
                  }
                  file(path: $file){
                    file{
                      path
                    }
                    lineCount
                    hunks{
                      newStart
                      newLines
                      oldStart
                      oldLines
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { file: file },
    );
  }
}
