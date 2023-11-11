const ConfigurationError = require('../errors/ConfigurationError.js');
const joinUrl = require('url-join');
const config = require("../config");


class JiraUrlProvider {
  constructor(repo, projectRegex, defaultURI, provider) {


    const config = require('../config.js');

    const jiraUrl = config.get('jira').url
    console.log(jiraUrl);
    // repo braucht man nicht bei jira
    this.defaultURI = jiraUrl;
    this.provider = "jira"


  }

  configure() {

  }
}

module.exports = JiraUrlProvider;
