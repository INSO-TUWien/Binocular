'use strict';

const Promise = require('bluebird');
const chai = require('chai');

const fake = require('./fake.js');
const helpers = require('./helpers.js');

const expect = chai.expect;

describe('git', function () {
  const alice = { name: 'Alice Alisson', email: 'alice@gmail.com' };
  const bob = { name: 'Bob Barker', email: 'bob@gmail.com' };

  describe('#getAllCommits', function () {
    it('should get an empty array for an empty repo', function () {
      return fake
        .repository()
        .then(function (repo) {
          return repo.getAllCommits();
        })
        .then(function (commits) {
          expect(commits).to.have.length(0);
        });
    });

    it('should get the commits of a repository', function () {
      return fake
        .repository()
        .then(function (repo) {
          this.repo = repo;

          return Promise.join(
            fake.file(repo, 'README.md', fake.lorem(5).paragraphs()),
            fake.file(repo, 'some-file.txt', fake.lorem(3).paragraphs()),
            fake.file(repo, 'another-file.txt', fake.lorem(10).paragraphs())
          );
        })
        .then(function () {
          return helpers.commit(this.repo.repo, ['README.md'], alice, 'Initial');
        })
        .then(function () {
          return helpers.commit(this.repo.repo, ['some-file.txt'], bob);
        })
        .then(function () {
          return helpers.commit(this.repo.repo, ['another-file.txt'], alice);
        })
        .then(function () {
          return this.repo.getAllCommits();
        })
        .then(function (commits) {
          expect(commits).to.have.length(3);
        });
    });
  });
});
