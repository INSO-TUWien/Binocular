'use strict';

import { expect } from 'chai';
import conf from '../utils/config.js';

import Db from '../core/db/db';
import TestModel from './helper/db/testModel';
import path from 'path';
import ctx from '../utils/context.ts';
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
      const ensuredDB = await db.ensureDatabase('test', ctx);
      expect(ensuredDB._name).to.equal('test');
    });
  });

  describe('#ensureCollection', function () {
    it('ensure a collection', async function () {
      await db.ensureDatabase('test', ctx);
      await db.truncate();
      const ensuredCollection = await TestModel.ensureCollection();
      expect(ensuredCollection.name).to.equal('tests');
    });
  });

  describe('#persistData', function () {
    it('persist data to tests collection', async function () {
      await db.ensureDatabase('test', ctx);
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
      await db.ensureDatabase('test', ctx);
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
