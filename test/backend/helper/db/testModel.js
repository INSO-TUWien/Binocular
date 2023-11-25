'use strict';
import Model from '../../../../lib/models/Model.js';
import _ from 'lodash';

const TestModel = Model.define('Test', {
  attributes: ['id', 'someText', 'someOtherText'],
  keyAttribute: 'id',
});

TestModel.persist = function (_buildData) {
  const buildData = _.clone(_buildData);
  if (_buildData.id) {
    buildData.id = _buildData.id.toString();
  }

  return TestModel.ensureById(buildData.id, buildData, { ignoreUnknownAttributes: true });
};

export default TestModel;
