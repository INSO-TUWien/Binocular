'use strict';

import _ from 'lodash';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import Paginator from '../utils/paginator';

const expect = chai.expect;

describe('Paginator', function () {
  describe('#execute', function () {
    it('should paginate properly', function () {
      const DATA_LENGTH = 500;
      const PAGE_SIZE = 49;

      const p = createArrayBasedPaginator(DATA_LENGTH);

      const onPage = sinon.spy();
      const onItem = sinon.spy();
      const onCount = sinon.spy();

      p.on('page', onPage);
      p.on('item', onItem);
      p.on('count', onCount);

      return p.execute(PAGE_SIZE).then(function () {
        expect(onPage).to.have.callCount(Math.ceil(DATA_LENGTH / PAGE_SIZE));
        expect(onCount).to.have.been.calledOnce;
        expect(onItem).to.have.callCount(DATA_LENGTH);
        expect(onPage).to.have.always.been.calledWithMatch(
          sinon.match(
            (page) => {
              return page.length === DATA_LENGTH % PAGE_SIZE || page.length === PAGE_SIZE;
            },
            `a page size of ${PAGE_SIZE} or ${DATA_LENGTH % PAGE_SIZE}`,
          ),
        );
      });
    });

    it('should stop pagination correctly if all items are on the first page', function () {
      const p = createArrayBasedPaginator(12);

      const onPage = sinon.spy();
      const onItem = sinon.spy();
      const onCount = sinon.spy();

      p.on('page', onPage);
      p.on('item', onItem);
      p.on('count', onCount);

      return p.execute(20).then(function () {
        expect(onPage).to.have.been.calledOnce;
        expect(onCount).to.have.been.calledOnce;
        expect(onItem).to.have.callCount(12);
        expect(onPage).to.have.always.been.calledWithMatch(
          sinon.match((page) => {
            return page.length === 12;
          }, 'a page size of 12'),
        );
      });
    });
  });

  describe('#then', function () {
    it('should be a thenable', function () {
      const DATA_LENGTH = 500;
      const PAGE_SIZE = 50;

      const p = createArrayBasedPaginator(DATA_LENGTH);

      const onPage = sinon.spy();
      const onItem = sinon.spy();
      const onCount = sinon.spy();

      p.on('page', onPage);
      p.on('item', onItem);
      p.on('count', onCount);

      return p.pageSize(PAGE_SIZE).then(function () {
        expect(onPage).to.have.callCount(Math.ceil(DATA_LENGTH / PAGE_SIZE));
        expect(onCount).to.have.been.calledOnce;
        expect(onItem).to.have.callCount(DATA_LENGTH);
      });
    });
  });

  describe('#collect', function () {
    it('should collect items', function () {
      const DATA_LENGTH = 500;
      const PAGE_SIZE = 50;

      const p = createArrayBasedPaginator(DATA_LENGTH);

      const onPage = sinon.spy();
      const onItem = sinon.spy();
      const onCount = sinon.spy();

      p.on('page', onPage);
      p.on('item', onItem);
      p.on('count', onCount);

      return p.pageSize(PAGE_SIZE).collect(function (items) {
        expect(onPage).to.have.callCount(Math.ceil(DATA_LENGTH / PAGE_SIZE));
        expect(onCount).to.have.been.calledOnce;
        expect(onItem).to.have.callCount(DATA_LENGTH);
        expect(items).to.have.length(DATA_LENGTH);
      });
    });
  });

  describe('#each', function () {
    it('should iterate over all items', function () {
      const DATA_LENGTH = 500;
      const PAGE_SIZE = 50;

      const p = createArrayBasedPaginator(DATA_LENGTH);

      const onPage = sinon.spy();
      const onItem = sinon.spy();
      const onCount = sinon.spy();

      p.on('page', onPage);
      p.on('item', onItem);
      p.on('count', onCount);

      const each = sinon.spy();

      return p
        .pageSize(PAGE_SIZE)
        .each(each)
        .then(function () {
          expect(onPage).to.have.callCount(Math.ceil(DATA_LENGTH / PAGE_SIZE));
          expect(onCount).to.have.been.calledOnce;
          expect(onItem).to.have.callCount(DATA_LENGTH);
          expect(each).to.have.callCount(DATA_LENGTH);
        });
    });
  });

  describe('#reduce', function () {
    it('should correctly apply reduce', function () {
      const DATA_LENGTH = 500;
      const PAGE_SIZE = 50;

      const p = createArrayBasedPaginator(DATA_LENGTH);

      const onPage = sinon.spy();
      const onItem = sinon.spy();
      const onCount = sinon.spy();

      p.on('page', onPage);
      p.on('item', onItem);
      p.on('count', onCount);

      return p
        .pageSize(PAGE_SIZE)
        .reduce((t, n) => t + n, 0)
        .then(function (sum) {
          expect(sum).to.equal((DATA_LENGTH * (DATA_LENGTH + 1)) / 2 - DATA_LENGTH);
        });
    });
  });
});

function createArrayBasedPaginator(arraySize) {
  const data = _.range(arraySize);

  const getPage = (page, perPage) => {
    const start = (page - 1) * perPage;
    return new Promise(function (resolve) {
      resolve(data.slice(start, start + perPage));
    });
  };

  const getItems = (page) => page;
  const getCount = () => data.length;

  return new Paginator(getPage, getItems, getCount);
}
