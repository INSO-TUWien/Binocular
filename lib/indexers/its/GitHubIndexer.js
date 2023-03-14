'use strict';

const Promise = require('bluebird');
const { Octokit } = require('@octokit/rest');
const log = require('debug')('idx:its:github');
const querystring = require('querystring');
const ConfigurationError = require('../../errors/ConfigurationError');

const Issue = require('../../models/Issue.js');

const GITHUB_ORIGIN_REGEX = /(?:git@github.com:|https:\/\/github.com\/)([^/]+)\/(.*)/;

function GitHubIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitHubIndexer.prototype.configure = function (config) {
  if (!config) {
    throw ConfigurationError('configuration object has to be set!');
  }

  this.github = new Octokit({
    baseUrl: 'https://api.github.com',
    auth: config?.auth?.token,
  });

  return Promise.resolve();
};

GitHubIndexer.prototype.index = function () {
  let owner, repo;
  let omitCount = 0;
  let persistCount = 0;

  return Promise.resolve(this.repo.getOriginUrl())
    .then((url) => {
      const match = url.match(GITHUB_ORIGIN_REGEX);
      if (!match) {
        throw new Error('Unable to determine github owner and repo from origin url: ' + url);
      }

      owner = match[1];
      repo = match[2];

      log('Getting issues for', `${owner}/${repo}`);
      return depaginate.bind(
        this,
        this.github,
        this.github.issues.listForRepo({
          owner,
          repo,
          state: 'all',
          per_page: 100,
        }),
        (count) => {
          this.reporter.setIssueCount(count);
        },
        async (issue) => {
          log('Processing Issue #' + issue.number);

          issue.user.name = (await this.github.users.getByUsername({ username: issue.user.login })).data.name;
          if (issue.assignee !== null) {
            issue.assignee.name = (await this.github.users.getByUsername({ username: issue.assignee.login })).data.name;
          }

          for (let i = 0; i < issue.assignees.length; i++) {
            issue.assignees[i].name = (await this.github.users.getByUsername({ username: issue.assignees[i].login })).data.name;
          }

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
            webUrl: issue.html_url,
          }).spread((issue, wasCreated) => {
            return Promise.try(() => {
              if (wasCreated) {
                persistCount++;

                const mentions = [];

                return depaginate
                  .bind(
                    this,
                    this.github,
                    this.github.issues.listEvents({
                      owner,
                      repo,
                      issue_number: issue.iid,
                      per_page: 100,
                    }),
                    (eventCount) => log('Processing', eventCount, 'events for Issue #' + issue.iid),
                    (event) => {
                      if (event.event === 'referenced' || event.event === 'closed') {
                        mentions.push({
                          commit: event.commit_id,
                          createdAt: event.created_at,
                          closes: event.event === 'closed',
                        });
                      }
                    }
                  )()
                  .then(() => {
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
      )();
    })
    .tap(() => {
      log('Persisted %d new issues (%d already present)', persistCount, omitCount);
    });
};

GitHubIndexer.prototype.isStopping = function () {
  return this.stopping;
};

GitHubIndexer.prototype.stop = function () {
  log('Stopping');
  this.stopping = true;
};

module.exports = GitHubIndexer;

function depaginate(github, firstPage, countHandler, handler) {
  return determineItemCount(github, firstPage)
    .then((count) => countHandler(count))
    .then(() => traversePages.bind(this, github, firstPage, handler)());
}

function determineItemCount(github, firstPage) {
  // first get the initial page
  return Promise.resolve(firstPage).then((resp) => {
    // see if there are more pages
    if (github.hasNextPage(resp)) {
      // there are more pages => we need to see how many items are
      // on the last page in order to determine the total amount of items

      // amount of items on a full page
      const perPage = resp.data.length;
      const lastLink = resp.headers.link
        .split(',')
        .map((link) => {
          const linkData = link.split('; ');
          return {
            link: linkData[0].match(/<(.*)>/)[1],
            rel: linkData[1].match(/rel="(.*)"/)[1],
          };
        })
        .find((link) => link.rel === 'last');

      const pageCount = querystring.parse(lastLink.link).page;

      // get the amount of items on the last page
      return github.getLastPage(resp).then(function (lastResp) {
        return (pageCount - 1) * perPage + lastResp.data.length;
      });
    } else {
      // there are no more pages, all items are on the first page
      return resp.data.length;
    }
  });
}

function traversePages(github, firstPage, handler) {
  return Promise.resolve(firstPage).then((resp) => {
    return eachPromised
      .bind(this, resp.data, handler)()
      .then((result) => {
        if (result === false) {
          log('Handler stopped iteration by returning false');
        } else if (!this.stopping && github.hasNextPage(resp)) {
          return traversePages.bind(this, github, github.getNextPage(resp), handler)();
        }
      });
  });
}

function eachPromised(array, handler, i = 0) {
  if (this.stopping) {
    return Promise.resolve([]);
  }
  if (i >= array.length) {
    return Promise.resolve(array);
  }

  return Promise.resolve(handler(array[i])).then((result) => {
    return !this.stopping && result !== false && eachPromised.bind(this, array, handler, i + 1)();
  });
}
