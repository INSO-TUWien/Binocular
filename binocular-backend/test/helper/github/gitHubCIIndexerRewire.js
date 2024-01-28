import GitHubCIIndexer from '../../../indexers/ci/GitHubCIIndexer.js';
import GitHubCIIndexerMock from './gitHubCIIndexerMock.js';

GitHubCIIndexer.prototype.setupOctokit = GitHubCIIndexerMock.prototype.setupOctokit;
GitHubCIIndexer.prototype.setupUrlProvider = GitHubCIIndexerMock.prototype.setupUrlProvider;
GitHubCIIndexer.prototype.setupGithub = GitHubCIIndexerMock.prototype.setupGithub;
export default GitHubCIIndexer;
