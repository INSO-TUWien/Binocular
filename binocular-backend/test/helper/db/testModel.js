'use strict';
import Model from '../../../models/Model';
import _ from 'lodash';

class TestModel extends Model {
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
