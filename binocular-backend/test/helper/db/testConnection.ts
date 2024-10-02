'use strict';

import Connection from '../../../models/Connection.ts';
import TestModel, { TestModelDataType } from './testModel.ts';

export interface TestConnectionDataType {
  connectionData: string;
}

class TestConnection extends Connection<TestConnectionDataType, TestModelDataType, TestModelDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(TestModel, TestModel);
  }
}

export default new TestConnection();
