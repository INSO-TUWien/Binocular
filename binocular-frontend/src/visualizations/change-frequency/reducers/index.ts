import { combineReducers } from 'redux';
import config, { ChangeFrequencyConfigState } from './config';
import data, { ChangeFrequencyDataState } from './data';
import stateReducer, { ChangeFrequencyState } from './state';

export interface ChangeFrequencyReducerState {
  config: ChangeFrequencyConfigState;
  data: ChangeFrequencyDataState;
  state: ChangeFrequencyState;
}

export default combineReducers<ChangeFrequencyReducerState>({
  config,
  data,
  state: stateReducer,
});
