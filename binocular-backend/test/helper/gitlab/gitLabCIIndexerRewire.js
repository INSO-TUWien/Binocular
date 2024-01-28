import GitLabCIIndexer from '../../../indexers/ci/GitLabCIIndexer.js';
import GitLabBaseIndexerMock from './gitLabBaseIndexerMock.js';

GitLabCIIndexer.prototype.constructor = GitLabBaseIndexerMock.prototype.constructor;
GitLabCIIndexer.prototype.setupGitlab = GitLabBaseIndexerMock.prototype.setupGitlab;
GitLabCIIndexer.prototype.setupUrlProvider = GitLabBaseIndexerMock.prototype.setupUrlProvider;
GitLabCIIndexer.prototype.getProject = GitLabBaseIndexerMock.prototype.getProject;
GitLabCIIndexer.prototype.stop = GitLabBaseIndexerMock.prototype.stop;
GitLabCIIndexer.prototype.isStopping = GitLabBaseIndexerMock.prototype.isStopping;

export default GitLabCIIndexer;
