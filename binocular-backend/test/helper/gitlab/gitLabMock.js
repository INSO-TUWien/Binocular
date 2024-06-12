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
import _ from 'lodash';

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

  getNotes(projectId, issueId) {
    // each note is unique, there are no notes that belong to multiple issues/mrs. Therefore, ids have to be unique.
    return this.testPaginator(
      testNotes.map((note) => {
        const newNote = _.clone(note);
        newNote.id = issueId * 100 + note.id;
        return newNote;
      }),
    );
  }

  getPipelines() {
    return new Promise((resolve) => {
      resolve(testPipelines);
    });
  }

  getMileStones() {
    return this.testPaginator(testMilestones);
  }

  getPipelineJobs() {
    return 'gitlab';
  }

  getMergeRequests() {
    return this.testPaginator(testMergeRequests);
  }

  getMergeRequestNotes(projectId, issueId) {
    return this.testPaginator(
      testMergeRequestNotes.map((note) => {
        const newNote = _.clone(note);
        newNote.id = issueId * 100 + note.id;
        return newNote;
      }),
    );
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }
}

export default GitLabMock;
