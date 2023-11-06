import GitHubCIIndexer from '../../../../lib/indexers/ci/GitHubCIIndexer.js';
import GitHubCIIndexerMock from './gitHubCIIndexerMock.js';

GitHubCIIndexer.prototype.setupOctokit = GitHubCIIndexerMock.prototype.setupOctokit;
GitHubCIIndexer.prototype.setupGithub = GitHubCIIndexerMock.prototype.setupGithub;
export default GitHubCIIndexer;
