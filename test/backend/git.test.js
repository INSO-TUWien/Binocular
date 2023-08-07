'use strict';

const chai = require('chai');

const fake = require('./helper/git/repositoryFake.js');
const helpers = require('./helper/git/helpers.js');

const expect = chai.expect;

describe('git', function () {
  const alice = { name: 'Alice Alisson', email: 'alice@gmail.com' };
  const bob = { name: 'Bob Barker', email: 'bob@gmail.com' };

  describe('#getAllCommits', function () {
    it('should get an empty array for an empty repo', function () {
      return fake
        .repository()
        .then(function (repo) {
          return repo.listAllCommits();
        })
        .then(function (commits) {
          expect(commits).to.have.length(0);
        });
    });

    it('should get the commits of a repository', function () {
      return fake
        .repository()
        .then((repo) => {
          this.repo = repo;

          return Promise.all([
            fake.file(repo, 'README.md', fake.lorem(5).paragraphs()),
            fake.file(repo, 'some-file.txt', fake.lorem(3).paragraphs()),
            fake.file(repo, 'another-file.txt', fake.lorem(10).paragraphs()),
          ]);
        })
        .then(() => {
          return helpers.commit(this.repo, ['README.md'], alice, 'Initial');
        })
        .then(() => {
          return helpers.commit(this.repo, ['some-file.txt'], bob);
        })
        .then(() => {
          return helpers.commit(this.repo, ['another-file.txt'], alice);
        })
        .then(() => {
          return this.repo.listAllCommits();
        })
        .then((commits) => {
          expect(commits).to.have.length(3);
        });
    });
  });
});
