import { handleActions } from 'redux-actions';
import _ from 'lodash';

export interface ChangeFrequencyConfigState {
  commitSpan: [Date, Date];
}

const initialState: ChangeFrequencyConfigState = {
  commitSpan: [new Date(0), new Date()],
};

export default handleActions<ChangeFrequencyConfigState, any>(
  {
    SET_CHANGE_FREQUENCY_CONFIG: (state, action) => _.assign({}, state, action.payload),
  },
  initialState,
);
