'use strict';
import Model from '../../../models/Model';
import _ from 'lodash';


export interface TestModelDataType {
  id: string;
  someText: string;
  someOtherText: string;
}

class TestModel extends Model<TestModelDataType> {
  constructor() {
    super({
      name: 'Test',
      keyAttribute: 'id',
    });
  }

  persist(_buildData) {
    const buildData = _.clone(_buildData);
    if (_buildData.id) {
      buildData.id = _buildData.id.toString();
    }

    return this.ensureByExample({ id: buildData.id }, buildData);
  }
}

export default new TestModel();
