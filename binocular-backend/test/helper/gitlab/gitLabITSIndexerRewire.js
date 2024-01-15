import GitlabITSIndexer from '../../../indexers/its/GitLabITSIndexer.js';
import GitLabBaseIndexerMock from './gitLabBaseIndexerMock.js';

GitlabITSIndexer.prototype.constructor = GitLabBaseIndexerMock.prototype.constructor;
GitlabITSIndexer.prototype.setupGitlab = GitLabBaseIndexerMock.prototype.setupGitlab;
GitlabITSIndexer.prototype.setupUrlProvider = GitLabBaseIndexerMock.prototype.setupUrlProvider;
GitlabITSIndexer.prototype.getProject = GitLabBaseIndexerMock.prototype.getProject;
GitlabITSIndexer.prototype.stop = GitLabBaseIndexerMock.prototype.stop;
GitlabITSIndexer.prototype.isStopping = GitLabBaseIndexerMock.prototype.isStopping;
export default GitlabITSIndexer;
