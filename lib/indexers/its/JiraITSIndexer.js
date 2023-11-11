/* eslint-disable no-useless-escape */
'use strict';

const _ = require('lodash');
const Jira = require('../../core/provider/gitlab.js');
const getUrlProvider = require('../url-providers').getVcsUrlProvider;
const log = require('debug')('idx:its:jira');
const ConfigurationError = require('../../errors/ConfigurationError');

const querystring = require('querystring');
const Issue = require('../../models/Issue.js');

class JiraITSIndexer {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config){
    if(!config){
      throw new ConfigurationError("Config is not set")
    }
    this.jira = new Jira({
      baseUrl: baseUrl,
      privateToken: config.token,
      requestTimeout: 40000,
    });



  }

  index(){
    let omitCount = 0
    let persistCount = 0
    return Promise.all([
      this.jira
    ]);

  }

  stop(){
    this.stopping = true;
  }

  isStopping(){
    return this.stopping;
  }

}

module.exports = JiraITSIndexer;

