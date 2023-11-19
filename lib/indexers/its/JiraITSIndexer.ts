/* eslint-disable no-useless-escape */
'use strict';
//rewrite in typescript
import _ from 'lodash'
import Jira from '../../core/provider/jira'

import debug from 'debug';

const log = debug('paginator');

import ConfigurationError from '../../errors/ConfigurationError';

import querystring from 'querystring';
import Issue from '../../models/Issue.js';

class JiraITSIndexer {
  private repo: string;
  private stopping: boolean;
  private reporter: string;
  private jira: any;
  private projectKey: string = "SCRUM"; // a key of a project is needed to get the issues needed
  constructor(repo: string, reporter: string) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config: any){
    if(!config){
      throw new ConfigurationError("Config is not set")
    }
    let options = {
      baseUrl: config.url,
      email: config.username,
      privateToken: config.token,
      requestTimeout: 40000,
    }

    this.jira = new Jira(options);



  }

  index(){
    let omitCount = 0
    let persistCount = 0
    return Promise.all([
        this.jira.getIssuesWithJQL("project=" + this.projectKey).
            each(function (issue: any) {
              if (this.stopping) {
                return false;
              }

              issue.id = issue.id.toString()
              return Issue.findById(issue.id)
                  .then ((persistedIssue) => {

                    if (!persistedIssue) {
                      log('Processing issue #' + issue.iid);

                    } else {
                      omitCount++;
                    }



                  })

        })





    ]);

  }

  stop(){
    this.stopping = true;
  }

  isStopping(){
    return this.stopping;
  }

}

export default JiraITSIndexer;

