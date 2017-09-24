'use strict';

import { handleActions } from 'redux-actions';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

export default handleActions(
  {
    RECEIVE_CONFIGURATION: (state, action) => {
      const config = action.payload;

      return new Lokka({
        transport: new Transport(`${config.arango.webUrl}_db/pupil-${config.repoName}/pupil-ql`)
      });
    }
  },
  null
);
