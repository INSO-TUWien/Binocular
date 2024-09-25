'use strict';

import Connection from '../../../models/Connection.ts';
import TestModel, { TestModelDataType } from './testModel.ts';
import TestConnection, { TestConnectionDataType } from './testConnection.ts';

interface TestConnToModelConnectionDataType {
  connectionData: string;
}

class TestConnToModelConnection extends Connection<TestConnToModelConnectionDataType, TestConnectionDataType, TestModelDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(TestConnection, TestModel);
  }
}

export default new TestConnToModelConnection();
