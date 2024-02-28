'use strict';

class OctokitMock {
  constructor() {
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
