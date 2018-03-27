'use strict';

import { switchVisualization } from '../src/sagas';

describe('switchVisualization', function() {
  it('should generate an action holding the visualization to switch to', function() {
    const action = switchVisualization('MY_VIS');
    expect(action).toEqual({
      type: 'SWITCH_VISUALIZATION',
      payload: 'MY_VIS'
    });
  });
});
