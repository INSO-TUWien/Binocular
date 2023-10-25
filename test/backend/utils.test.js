'use strict';

import { expect } from 'chai';

import conf from '../../lib/config.js';
import Db from '../../lib/core/db/db';
import TestModel from './helper/db/testModel';

import * as utils from '../../lib/utils';
const config = conf.get();

describe('utils', function () {
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

  describe('#getDbExport', function () {
    it('get an export of all db collections', async function () {
      await db.ensureDatabase('test');
      await db.ensureDatabase('test');
      await db.truncate();
      await TestModel.ensureCollection();

      await TestModel.persist(t1);
      await TestModel.persist(t2);
      await TestModel.persist(t3);

      const dbExport = await utils.getDbExport(db);
      expect(dbExport['tests']).to.not.equal(undefined);
      expect(dbExport['tests'].length).to.equal(3);

      expect(dbExport['tests'][0].id).to.equal(t1.id.toString());
      expect(dbExport['tests'][0].someText).to.equal(t1.someText);
      expect(dbExport['tests'][0].someOtherText).to.equal(t1.someOtherText);

      expect(dbExport['tests'][1].id).to.equal(t2.id.toString());
      expect(dbExport['tests'][1].someText).to.equal(t2.someText);
      expect(dbExport['tests'][1].someOtherText).to.equal(t2.someOtherText);

      expect(dbExport['tests'][2].id).to.equal(t3.id.toString());
      expect(dbExport['tests'][2].someText).to.equal(t3.someText);
      expect(dbExport['tests'][2].someOtherText).to.equal(t3.someOtherText);
    });
  });
});
