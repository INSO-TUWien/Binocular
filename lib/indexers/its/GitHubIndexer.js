'use strict';

const Promise = require('bluebird');
const GitHubApi = require('github');
const log = require('debug')('idx:its:github');
const querystring = require('querystring');

const Issue = require('../../models/Issue.js');

const GITHUB_ORIGIN_REGEX = /(?:git@github.com:|https:\/\/github.com\/)([^\/]+)\/(.*)\.git/;

function GitHubIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitHubIndexer.prototype.configure = function(config) {
  this.github = new GitHubApi({
    Promise,
    host: 'api.github.com',
    protocol: 'https'
  });

  if (config.auth) {
    this.github.authenticate(config.auth);
  }

  return Promise.resolve();
};

GitHubIndexer.prototype.index = function() {
  let owner, repo;
  let omitCount = 0;
  let persistCount = 0;

  return this.repo
    .getOriginUrl()
    .then(url => {
      const match = url.match(GITHUB_ORIGIN_REGEX);
      if (!match) {
        throw new Error('Unable to determine github owner and repo from origin url: ' + url);
      }

      owner = match[1];
      repo = match[2];

      log('Getting issues for', `${owner}/${repo}`);
      return depaginate(
        this.github,
        this.github.issues.getForRepo({
          owner,
          repo,
          state: 'all',
          per_page: 100
        }),
        count => {
          this.reporter.setIssueCount(count);
        },
        issue => {
          log('Processing Issue #' + issue.number);

          return Issue.persist({
            id: issue.id,
            iid: issue.number,
            title: issue.title,
            description: issue.body,
            state: issue.state,
            url: issue.url,
            closedAt: issue.closed_at,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            labels: issue.labels,
            milestone: issue.milestone,
            author: issue.user,
            assignee: issue.assignee,
            assignees: issue.assignees,
            webUrl: issue.html_url
          }).spread((issue, wasCreated) => {
            return Promise.try(() => {
              if (wasCreated) {
                persistCount++;

                const mentions = [];

                return depaginate(
                  this.github,
                  this.github.issues.getEvents({
                    owner,
                    repo,
                    issue_number: issue.iid,
                    per_page: 100
                  }),
                  eventCount => log('Processing', eventCount, 'events for Issue #' + issue.iid),
                  event => {
                    if (event.event === 'referenced' || event.event === 'closed') {
                      mentions.push({
                        commit: event.commit_id,
                        createdAt: event.created_at,
                        closes: event.event === 'closed'
                      });
                    }
                  }
                ).then(() => {
                  if (mentions.length > 0) {
                    issue.mentions = mentions;
                    return issue.save();
                  }
                });
              } else {
                omitCount++;
              }
            }).then(() => this.reporter.finishIssue());
          });
        }
      );
    })
    .tap(() => {
      log('Persisted %d new issues (%d already present)', persistCount, omitCount);
    });
};

GitHubIndexer.prototype.stop = function() {
  log('Stopping');
  this.stopping = true;
};

module.exports = GitHubIndexer;

function depaginate(github, firstPage, countHandler, handler) {
  return determineItemCount(github, firstPage)
    .then(count => countHandler(count))
    .then(() => traversePages(github, firstPage, handler));
}

function determineItemCount(github, firstPage) {
  // first get the initial page
  return Promise.resolve(firstPage).then(resp => {
    // see if there are more pages
    if (github.hasNextPage(resp)) {
      // there are more pages => we need to see how many items are
      // on the last page in order to determine the total amount of items

      // amount of items on a full page
      let perPage = resp.data.length;

      const lastLink = resp.meta.link
        .split(',')
        .map(link => {
          const linkData = link.split('; ');
          return {
            link: linkData[0].match(/<(.*)>/)[1],
            rel: linkData[1].match(/rel="(.*)"/)[1]
          };
        })
        .find(link => link.rel === 'last');

      const pageCount = querystring.parse(lastLink.link).page;

      // get the amount of items on the last page
      return github.getLastPage(resp).then(function(lastResp) {
        return (pageCount - 1) * perPage + lastResp.data.length;
      });
    } else {
      // there are no more pages, all items are on the first page
      return resp.data.length;
    }
  });
}

function traversePages(github, firstPage, handler) {
  return Promise.resolve(firstPage).then(resp => {
    return eachPromised(resp.data, handler).then(result => {
      if (result === false) {
        log('Handler stopped iteration by returning false');
      } else if (github.hasNextPage(resp)) {
        return traversePages(github, github.getNextPage(resp), handler);
      }
    });
  });
}

function eachPromised(array, handler, i = 0) {
  if (i >= array.length) {
    return Promise.resolve(array);
  }

  return Promise.resolve(handler(array[i])).then(result => {
    return result !== false && eachPromised(array, handler, i + 1);
  });
}
