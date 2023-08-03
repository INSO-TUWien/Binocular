'use strict';
const Paginator = require('../../../../lib/paginator');

class GitLabMock {
  constructor() {}

  getProject() {
    return new Promise((resolve) => {
      resolve({ id: 1, path_with_namespace: 'Test/Test-Project' });
    });
  }

  getIssues() {
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve([
            { id: 0, iid: 1001, updated_at: '1970-01-01T07:00:00.000Z' },
            { id: 1, iid: 1002, updated_at: '1970-01-01T07:00:00.000Z' },
            { id: 2, iid: 1003, updated_at: '1970-01-01T07:00:00.000Z' },
          ]);
        });
      },
      (resp) => {
        return resp;
      },
      (resp) => {
        this.count = resp.length;
        return this.count;
      }
    );
  }

  getNotes() {
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve([
            { id: 0, created_at: '1970-01-01T07:00:00.000Z', body: 'closed' },
            { id: 1, created_at: '1970-01-01T07:00:00.000Z', body: 'mentioned in commit 1234567890' },
            { id: 2, created_at: '1970-01-01T07:00:00.000Z', body: 'some text' },
          ]);
        });
      },
      (resp) => {
        return resp;
      },
      () => {
        this.count = 3;
        return this.count;
      }
    );
  }

  getPipelines() {
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve([{ id: '0' }, { id: '1' }, { id: '2' }]);
        });
      },
      (resp) => {
        return resp;
      },
      () => {
        this.count = 3;
        return this.count;
      }
    );
  }

  getPipeline() {
    return new Promise((resolve) => {
      resolve({ id: '1' });
    });
  }

  getPipelineJobs() {
    return [{ id: '0' }, { id: '1' }, { id: '2' }];
  }

  getMergeRequests() {
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve([
            { id: 1, iid: 1 },
            { id: 2, iid: 2 },
            { id: 3, iid: 3 },
          ]);
        });
      },
      (resp) => {
        return resp;
      },
      (resp) => {
        this.count = resp.length;
        return this.count;
      }
    );
  }

  getMergeRequestNotes() {
    return new Paginator(
      () => {
        return new Promise((resolve) => {
          resolve([
            { id: 0, created_at: '1970-01-01T07:00:00.000Z', body: 'closed' },
            { id: 0, created_at: '1970-01-01T07:00:00.000Z', body: 'mentioned in commit 1234567890' },
            { id: 0, created_at: '1970-01-01T07:00:00.000Z', body: 'some text' },
          ]);
        });
      },
      (resp) => {
        return resp;
      },
      () => {
        this.count = 3;
        return this.count;
      }
    );
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }
}

module.exports = GitLabMock;
