'use strict';
import Paginator from '../../../utils/paginator.ts';
import {
  testIssues,
  testMergeRequestNotes,
  testMergeRequests,
  testMilestones,
  testNotes,
  testPipelines,
  testProject,
} from './gitLabTestData';

class GitLabMock {
  testPaginator = (data) => {
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve(data);
        });
      },
      (resp) => {
        return resp;
      },
      (resp) => {
        this.count = resp.length;
        return this.count;
      },
    );
  };

  getProject() {
    return new Promise((resolve) => {
      resolve(testProject);
    });
  }

  getIssues() {
    return this.testPaginator(testIssues);
  }

  getNotes() {
    return this.testPaginator(testNotes);
  }

  getPipelines() {
    return new Promise((resolve) => {
      resolve(testPipelines);
    });
  }

  getMileStones() {
    return this.testPaginator(testMilestones)
  }

  getPipelineJobs() {
    return 'gitlab';
  }

  getMergeRequests() {
    return this.testPaginator(testMergeRequests);
  }

  getMergeRequestNotes() {
    return this.testPaginator(testMergeRequestNotes);
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }
}

export default GitLabMock;
