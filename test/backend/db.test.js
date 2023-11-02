'use strict';

const chai = require('chai');
const expect = chai.expect;

const config = require('../../lib/config.js').get();

const Db = require('../../lib/core/db/db');
const TestModel = require('./helper/db/testModel');

describe('db', function () {
  const db = new Db(config.arango);

  const t1 = {
    id: 1,
    someText: 'someText1',
    someOtherText: 'someOtherText1',
  };
  const t2 = {
    id: 2,
    someText: 'someText2',
    someOtherText: 'someOtherText2',
  };
  const t3 = {
    id: 3,
    someText: 'someText3',
    someOtherText: 'someOtherText3',
  };

  describe('#ensureDatabase', function () {
    it('ensure a database', async function () {
      const ensuredDB = await db.ensureDatabase('test');
      expect(ensuredDB._name).to.equal('test');
    });
  });

  describe('#ensureCollection', function () {
    it('ensure a collection', async function () {
      await db.ensureDatabase('test');
      await db.truncate();
      const ensuredCollection = await TestModel.ensureCollection();
      expect(ensuredCollection.name).to.equal('tests');
    });
  });

  describe('#persistData', function () {
    it('persist data to tests collection', async function () {
      await db.ensureDatabase('test');
      await db.truncate();
      await TestModel.ensureCollection();

      await TestModel.persist(t1);
      const dbTestCollectionData1 = await (await db.query('FOR i IN tests RETURN i')).all();
      expect(dbTestCollectionData1.length).to.equal(1);

      await TestModel.persist(t2);
      const dbTestCollectionData2 = await (await db.query('FOR i IN tests RETURN i')).all();
      expect(dbTestCollectionData2.length).to.equal(2);

      await TestModel.persist(t3);
      const dbTestCollectionData3 = await (await db.query('FOR i IN tests RETURN i')).all();
      expect(dbTestCollectionData3.length).to.equal(3);
    });
  });

  describe('#turncate', function () {
    it('turncate Data', async function () {
      await db.ensureDatabase('test');
      await db.truncate();
      await TestModel.ensureCollection();

      await TestModel.persist(t1);
      await TestModel.persist(t2);
      await TestModel.persist(t3);

      const dbTestCollectionData1 = await (await db.query('FOR i IN tests RETURN i')).all();
      expect(dbTestCollectionData1.length).to.equal(3);

      await db.truncate();
      const dbTestCollectionData2 = await (await db.query('FOR i IN tests RETURN i')).all();
      expect(dbTestCollectionData2.length).to.equal(0);
    });
  });
});
