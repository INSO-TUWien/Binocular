'use strict';

import { expect } from 'chai';
import conf from '../utils/config.js';

import Db from '../core/db/db';
import TestModel from './helper/db/testModel';
import path from 'path';
import ctx from '../utils/context.ts';
import { expectExamples, getAllEntriesInCollection } from './helper/utils';
import _ from 'lodash';
import TestConnection from './helper/db/testConnection';
import TestConnToModelConnection from './helper/db/testConnToModelConnection';
const indexerOptions = {
  backend: true,
  frontend: false,
  open: false,
  clean: true,
  its: true,
  ci: true,
  export: true,
  server: false,
};
const targetPath = path.resolve('.');
ctx.setOptions(indexerOptions);
ctx.setTargetPath(targetPath);
conf.loadConfig(ctx);
const config = conf.get();

describe('db', function () {
  const db = new Db(config.arango);

  const t1 = {
    id: '1',
    someText: 'someText1',
    someOtherText: 'someOtherText1',
  };
  const t2 = {
    id: '2',
    someText: 'someText2',
    someOtherText: 'someOtherText2',
  };
  const t3 = {
    id: '3',
    someText: 'someText3',
    someOtherText: 'someOtherText3',
  };

  const getAllInCollection = async (collection) => getAllEntriesInCollection(db, collection);

  // these tests cover the basic functionality of the database,
  //  as well as the functions in the Model class (binocular-backend/models/Model.ts)
  describe('db/model basic functionality', function () {
    const testModelDbSetup = async () => {
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await TestModel.ensureCollection();
    };

    it('ensure a database', async function () {
      const ensuredDB = await db.ensureDatabase('test', ctx);
      expect(ensuredDB._name).to.equal('test');
    });

    it('ensure a collection', async function () {
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      const ensuredCollection = await TestModel.ensureCollection();
      expect(ensuredCollection.name).to.equal('tests');
    });

    it('truncate db', async function () {
      await testModelDbSetup();

      await TestModel.persist(t1);
      await TestModel.persist(t2);
      await TestModel.persist(t3);

      const dbTestCollectionData1 = await getAllInCollection('tests');
      expect(dbTestCollectionData1.length).to.equal(3);

      await db.truncate();
      const dbTestCollectionData2 = await getAllInCollection('tests');
      expect(dbTestCollectionData2.length).to.equal(0);
    });

    it('persist data to tests collection', async function () {
      await testModelDbSetup();

      await TestModel.persist(t1);
      const dbTestCollectionData1 = await getAllInCollection('tests');
      expect(dbTestCollectionData1.length).to.equal(1);

      await TestModel.persist(t2);
      const dbTestCollectionData2 = await getAllInCollection('tests');
      expect(dbTestCollectionData2.length).to.equal(2);

      await TestModel.persist(t3);
      const dbTestCollectionData3 = await getAllInCollection('tests');
      expect(dbTestCollectionData3.length).to.equal(3);
    });

    it('firstExample: should return entry when example matches', async function () {
      await testModelDbSetup();

      // persist t1
      await TestModel.persist(t1);

      // should retrieve t1 entry
      const example = (await TestModel.firstExample({ someText: 'someText1' })).data;
      expect(example.id).to.equal(t1.id);
    });

    it('firstExample: should return null when no entry matches', async function () {
      await testModelDbSetup();

      // should return null
      const nonexistentExample = await TestModel.firstExample({ someText: 'doesNotExist' });
      expect(nonexistentExample).to.equal(null);
    });

    it('findOneById: should return persisted entry', async function () {
      await testModelDbSetup();

      await TestModel.persist(t1);
      const t1Entry = (await getAllInCollection('tests'))[0];

      // find persisted t1
      const findT1Result = (await TestModel.findOneById(t1Entry._id)).data;
      expect(_.isEqual(t1Entry, findT1Result)).to.equal(true, 'findOneById returns object not equal to db entry');
    });

    it('findOneById: should return null when id does not exist', async function () {
      await testModelDbSetup();

      // find nonexistent entry
      const nonexistentResult = await TestModel.findOneById('doesNotExist');
      expect(nonexistentResult).to.equal(null);
    });

    it('ensureBy: should persist and return entry', async function () {
      await testModelDbSetup();

      // persist t1. There should be no entry in the db with `someOtherText: 'someOtherText1'`,
      // so a new entry should be created and returned
      const persistedT1 = (await TestModel.ensureBy('someOtherText', t1.someOtherText, t1))[0];
      // should return the persisted entry with a generated id
      expect(persistedT1._id.split('/')[0]).to.equal('tests');
      expect(persistedT1.data.someOtherText).to.equal(t1.someOtherText);

      // test collection should have size 1
      const dbTestCollection = await getAllInCollection('tests');
      expectExamples({}, dbTestCollection, 1);
    });

    it('ensureBy: should not persist another entry if key/value pair matches already persisted entry', async function () {
      await testModelDbSetup();

      // persist t1. There should be no entry in the db with `someOtherText: 'someOtherText1'`,
      // so a new entry should be created and returned
      await TestModel.ensureBy('someOtherText', t1.someOtherText, t1);

      // try to persist the same object again, using its `someOtherText` property
      await TestModel.ensureBy('someOtherText', t1.someOtherText, t1);

      // nothing should have been persisted
      // test collection should still have size 1
      const dbTestCollectionNew = await getAllInCollection('tests');
      expectExamples({}, dbTestCollectionNew, 1);

      // try to persist t2, using someOtherText of t1
      // this should not overwrite anything
      const returnedT1 = (await TestModel.ensureBy('someOtherText', t1.someOtherText, t2))[0];
      // the returned entry should still be t1, not t2
      expect(returnedT1.data.someOtherText).to.equal(t1.someOtherText);

      // nothing should have been overwritten
      // test collection should still have size 1
      const dbTestCollectionNewer = await getAllInCollection('tests');

      expectExamples({}, dbTestCollectionNewer, 1);
      // object with attributes from t1 should be in the database
      expectExamples(t1, dbTestCollectionNewer, 1);
      // no object with attributes from t2 should be in the db, as otherwise the ensure method would have overwritten something
      expectExamples(t2, dbTestCollectionNewer, 0);
    });

    it('findOneBy: should return persisted entry', async function () {
      await testModelDbSetup();

      await TestModel.persist(t1);
      const t1Entry = (await getAllInCollection('tests'))[0];

      // find persisted t1 using its `someText` attribute
      const findT1Result = (await TestModel.findOneBy('someText', t1.someText)).data;
      expect(_.isEqual(t1Entry, findT1Result)).to.equal(true, 'findOneById returns object not equal to db entry');
    });

    it('findOneBy: should return null when no object in db matches example', async function () {
      await testModelDbSetup();

      // find nonexistent entry
      const nonexistentResult = await TestModel.findOneBy('someText', 'doesNotExist');
      expect(nonexistentResult).to.equal(null);
    });

    it('ensureByExample: should persist and return entry', async function () {
      await testModelDbSetup();

      // persist t1. There should be no matching entry,
      // so a new entry should be created and returned
      const persistedT1 = (await TestModel.ensureByExample(t1, t1))[0];
      // should return the persisted entry with a generated id
      expect(persistedT1._id.split('/')[0]).to.equal('tests');
      expect(persistedT1.data.someOtherText).to.equal(t1.someOtherText);

      // test collection should have size 1
      const dbTestCollection = await getAllInCollection('tests');
      expectExamples({}, dbTestCollection, 1);
    });

    it('ensureByExample: should not persist another entry if example matches already persisted entry', async function () {
      await testModelDbSetup();

      // persist t1. There should be no entry in the db with `someOtherText: 'someOtherText1'`,
      // so a new entry should be created and returned
      await TestModel.ensureByExample(t1, t1);

      // try to persist the same object again, using its `someOtherText` property
      await TestModel.ensureByExample(t1, t1);

      // nothing should have been persisted
      // test collection should still have size 1
      const dbTestCollectionNew = await getAllInCollection('tests');
      expectExamples({}, dbTestCollectionNew, 1);

      // try to persist t2, using someOtherText of t1
      // this should not overwrite anything
      const returnedT1 = (await TestModel.ensureByExample(t1, t2))[0];
      // the returned entry should still be t1, not t2
      expect(returnedT1.data.someOtherText).to.equal(t1.someOtherText);

      // nothing should have been overwritten
      // test collection should still have size 1
      const dbTestCollectionNewer = await getAllInCollection('tests');

      expectExamples({}, dbTestCollectionNewer, 1);
      // object with attributes from t1 should be in the database
      expectExamples(t1, dbTestCollectionNewer, 1);
      // no object with attributes from t2 should be in the db, as otherwise the ensure method would have overwritten something
      expectExamples(t2, dbTestCollectionNewer, 0);
    });

    it('findOneByExample: should return persisted entry', async function () {
      await testModelDbSetup();

      await TestModel.persist(t1);
      const t1Entry = (await getAllInCollection('tests'))[0];

      // find persisted t1 using it as example
      const findT1Result = (await TestModel.findOneByExample(t1)).data;
      expect(_.isEqual(t1Entry, findT1Result)).to.equal(true, 'findOneById returns object not equal to db entry');
    });

    it('findOneByExample: should return null when no object in db matches example', async function () {
      await testModelDbSetup();

      // find nonexistent entry
      const nonexistentResult = await TestModel.findOneByExample(t2);
      expect(nonexistentResult).to.equal(null);
    });

    it('parse: should return null when data parameter is null', async function () {
      await testModelDbSetup();
      const entry = TestModel.parse(null);
      expect(entry).to.equal(null);
    });

    it('parse: should return entry object with same _id and _key as data object', async function () {
      await testModelDbSetup();

      const testKey = 'keykeykey';
      const testId = 'ididid';
      const testdata = _.cloneDeep(t1);
      testdata._key = testKey;
      testdata._id = testId;

      const entry = TestModel.parse(testdata);
      expect(entry._key).to.equal(testKey);
      expect(entry._id).to.equal(testId);
      expect(_.isEqual(entry.data, testdata)).to.equal(true);
    });

    it('findAll: return correct number of entries', async function () {
      await testModelDbSetup();
      expect((await TestModel.findAll()).length).to.equal(0);

      await TestModel.persist(t1);
      expect((await TestModel.findAll()).length).to.equal(1);

      await TestModel.persist(t2);
      expect((await TestModel.findAll()).length).to.equal(2);

      await TestModel.persist(t3);
      expect((await TestModel.findAll()).length).to.equal(3);
    });

    it('create: store same entry twice if isNew is true both times', async function () {
      await testModelDbSetup();

      // create should not check if there already is an entry with that _id and create a second one anyway
      const test1 = _.cloneDeep(t1);
      test1._id = t1.id;
      await TestModel.create(test1, { isNew: true });
      await TestModel.create(test1, { isNew: true });
      expect((await TestModel.findAll()).length).to.equal(2);
    });

    it('bulkCreate: can handle empty array', async function () {
      await testModelDbSetup();
      await TestModel.bulkCreate([]);
      expect((await TestModel.findAll()).length).to.equal(0);
    });

    it('bulkCreate:stores all objects', async function () {
      await testModelDbSetup();
      await TestModel.bulkCreate([t1, t2, t3, t1]);
      expect((await TestModel.findAll()).length).to.equal(4);
      const dbTestCollection = await getAllInCollection('tests');
      expectExamples({ someText: t1.someText }, dbTestCollection, 2);
      expectExamples({ someText: t2.someText }, dbTestCollection, 1);
      expectExamples({ someText: t3.someText }, dbTestCollection, 1);
    });

    it('ensure: doesnt store same object twice', async function () {
      await testModelDbSetup();
      const testKey = 'keykeykey';
      const testId = 'ididid';
      const testdata = _.cloneDeep(t1);
      testdata._key = testKey;
      testdata._id = testId;

      await TestModel.ensure(TestModel.parse(testdata));
      expect((await TestModel.findAll()).length).to.equal(1);

      await TestModel.ensure(TestModel.parse(testdata));
      expect((await TestModel.findAll()).length).to.equal(1);
    });

    it('save: save object', async function () {
      await testModelDbSetup();
      const testKey = 'keykeykey';
      const testId = 'ididid';
      const testdata = _.cloneDeep(t1);
      testdata._key = testKey;
      testdata._id = testId;

      await TestModel.save(TestModel.parse(testdata));
      expect((await TestModel.findAll()).length).to.equal(1);
    });

    it('save: update object', async function () {
      await testModelDbSetup();
      const testdata = _.cloneDeep(t1);
      const t1Stored = await TestModel.save(TestModel.parse(testdata));

      // mutate object
      t1Stored.data.someText = 'newText';
      // update the entry using save
      await TestModel.save(t1Stored);

      const allEntries = await TestModel.findAll();
      expect(allEntries.length).to.equal(1);
      expect(allEntries[0].data.someText).to.equal('newText');
    });

    // TODO tests for cursor
  });

  // these tests cover the basic functions of the Connection class (binocular-backend/models/Connection.ts)
  describe('connection basic functionality', function () {
    const testConnectionDbSetup = async () => {
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      await TestModel.ensureCollection();
      await TestConnection.ensureCollection();
      await TestConnToModelConnection.ensureCollection();
      const test1 = await TestModel.create(t1);
      const test2 = await TestModel.create(t2);
      const test3 = await TestModel.create(t3);
      return {
        t1: test1,
        t2: test2,
        t3: test3,
      };
    };

    const testConnectionDbSetupWithConnections = async () => {
      const testEntries = await testConnectionDbSetup();
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t3 });
    };

    it('ensure a connection collection', async function () {
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      const ensuredCollection = await TestConnection.ensureCollection();
      expect(ensuredCollection.name).to.equal('tests-tests');
      const ensuresConnToModelConnection = await TestConnToModelConnection.ensureCollection();
      expect(ensuresConnToModelConnection.name).to.equal('tests-tests-tests');
    });

    it('connect: stores data correctly', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      let allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id }, allConnections, 1);

      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t3 });
      allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(2);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id }, allConnections, 1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t3._id }, allConnections, 1);
    });

    it('connect: stores connection with same nodes but different data correctly', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      let allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id }, allConnections, 1);

      await TestConnection.connect({ connectionData: 'different data' }, { from: testEntries.t1, to: testEntries.t2 });
      allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(2);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'different data' }, allConnections, 1);
    });

    it('connect: stores data correctly for complex connections', async function () {
      // for more complex relations, we need connections from a connection to a model
      // test if this works as expected
      await testConnectionDbSetupWithConnections();
      const modelEntries = await getAllInCollection('tests');
      const connectionEntries = await getAllInCollection('tests-tests');

      // now connect the t1->t2 connection to t3, so we have (t1-t2)->t3
      await TestConnToModelConnection.connect({ connectionData: 'data' }, { from: connectionEntries[0], to: modelEntries[2] });
      const allComplexConnections = await getAllInCollection('tests-tests-tests');
      expect(allComplexConnections.length).to.equal(1);
      expectExamples({ _from: connectionEntries[0]._id, _to: modelEntries[2]._id }, allComplexConnections, 1);
    });

    it('findByIds: returns correct entry', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      const connectionEntries = await getAllInCollection('tests-tests');
      const result = await TestConnection.findByIds({ from: testEntries.t1, to: testEntries.t2 });
      expect(_.isEqual(result, connectionEntries[0])).to.equal(true);
    });

    it('findByIds: returns null if not found', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      // search for t1->t3, which should return null
      const result = await TestConnection.findByIds({ from: testEntries.t1, to: testEntries.t3 });
      expect(result).to.equal(null);
    });

    it('findByIdsAndData: returns correct entry', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      const connectionEntries = await getAllInCollection('tests-tests');
      const result = await TestConnection.findByIdsAndData({ from: testEntries.t1, to: testEntries.t2 }, { connectionData: 'data' });
      expect(_.isEqual(result, connectionEntries[0])).to.equal(true);
    });

    it('findByIdsAndData: returns correct null if data does not match', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.connect({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      const result = await TestConnection.findByIdsAndData({ from: testEntries.t1, to: testEntries.t2 }, { connectionData: 'not correct' });
      expect(result).to.equal(null);
    });

    it('ensure: connects entries correctly', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.ensure({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      const allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
      // another call to ensure with different data should NOT store another entry or overwrite the stored one
      await TestConnection.ensure({ connectionData: 'different data' }, { from: testEntries.t1, to: testEntries.t2 });
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
    });

    it('ensureWithData: connects entries twice if data is different', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.ensure({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      let allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
      // another call to ensure with different data should store another entry
      await TestConnection.ensureWithData({ connectionData: 'different data' }, { from: testEntries.t1, to: testEntries.t2 });
      allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(2);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'different data' }, allConnections, 1);
    });

    it('ensureWithData: does not connect twice if data also matches', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.ensure({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      let allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
      // another call to ensureWithData with the same data should NOT store another entry
      await TestConnection.ensureWithData({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
    });

    it('store: stores new connection correctly', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.store({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      let allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'data' }, allConnections, 1);
    });

    it('store: updates connection correctly', async function () {
      const testEntries = await testConnectionDbSetup();
      // store t1 -> t2 connection
      await TestConnection.store({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      // another call to store with the same ids but different data should replace connection
      await TestConnection.store({ connectionData: 'different data' }, { from: testEntries.t1, to: testEntries.t2 });
      const allConnections = await getAllInCollection('tests-tests');
      expect(allConnections.length).to.equal(1);
      expectExamples({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'different data' }, allConnections, 1);
    });

    it('parse: returns null if data is null', async function () {
      expect(TestConnection.parse(null)).to.equal(null);
    });

    it('parse: parses data correctly', async function () {
      const testEntries = await testConnectionDbSetup();
      const parsed = TestConnection.parse({ _from: testEntries.t1._id, _to: testEntries.t2._id, connectionData: 'different data' });
      expect(parsed._from).to.equal(testEntries.t1._id);
      expect(parsed._to).to.equal(testEntries.t2._id);
    });

    it('findAll: return correct number of entries', async function () {
      const testEntries = await testConnectionDbSetup();
      expect((await TestConnection.findAll()).length).to.equal(0);

      await TestConnection.store({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t2 });
      expect((await TestConnection.findAll()).length).to.equal(1);

      await TestConnection.store({ connectionData: 'data' }, { from: testEntries.t1, to: testEntries.t3 });
      expect((await TestConnection.findAll()).length).to.equal(2);

      await TestConnection.store({ connectionData: 'data' }, { from: testEntries.t2, to: testEntries.t3 });
      expect((await TestConnection.findAll()).length).to.equal(3);
    });
  });
});
