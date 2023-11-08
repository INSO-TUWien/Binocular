'use strict';

class OctokitMock {
  constructor() {
    this.issues = {
      listForRepo: new Promise((resolve) => {
        resolve([
          {
            id: '0',
            iid: 0,
            number: 0,
            title: 'test issue 1',
            body: 'test',
            state: 'closed',
            url: 'https://github.com/Test/Test-Project.git',
            closed_at: '1970-01-01T07:00:00.000Z',
            created_at: '1970-01-01T07:00:00.000Z',
            updated_at: '1970-01-01T07:00:00.000Z',
            labels: '',
            milestone: '',
            user: { login: 'tester1' },
            assignee: { login: 'tester2' },
            assignees: [{ login: 'tester2' }],
            html_url: 'https://github.com/Test/Test-Project.git',
          },
          {
            id: '1',
            iid: 1,
            number: 1,
            title: 'test issue 2',
            body: 'test',
            state: 'closed',
            url: 'https://github.com/Test/Test-Project.git',
            closed_at: '1970-01-01T07:00:00.000Z',
            created_at: '1970-01-01T07:00:00.000Z',
            updated_at: '1970-01-01T07:00:00.000Z',
            labels: '',
            milestone: '',
            user: { login: 'tester2' },
            assignee: { login: 'tester1' },
            assignees: [{ login: 'tester1' }, { login: 'tester2' }],
            html_url: 'https://github.com/Test/Test-Project.git',
          },
        ]);
      }),
      listEvents: new Promise((resolve) => {
        resolve([
          {
            event: 'referenced',
            commit_id: '1234567890',
            created_at: '1970-01-01T07:00:00.000Z',
          },
          {
            event: 'closed',
            commit_id: '',
            created_at: '1970-01-01T07:00:00.000Z',
          },
        ]);
      }),
    };

    this.users = {
      getByUsername: (user) => {
        return new Promise((resolve) => {
          if (user.username !== 'tester1') {
            if (user.username === 'tester2') {
              resolve({ data: { name: 'Tester Test 2' } });
            }
          } else {
            resolve({ data: { name: 'Tester Test 1' } });
          }
        });
      },
    };
  }

  paginate(resp) {
    return resp;
  }
}

export default OctokitMock;
