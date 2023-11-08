import OctokitMock from './octokitMock.js';
import GitHubMock from './gitHubMock.js';

export default class GitHubCIIndexerMock {
  setupOctokit() {
    this.github = new OctokitMock();
  }

  setupGithub() {
    this.controller = new GitHubMock();
  }

  setupUrlProvider() {
    this.urlProvider = {};
  }
}
