import { combineReducers } from 'redux';
import activeVisualization from './activeVisualization.jsx';
import visualizations from './visualizations.jsx';
import config from './config.jsx';
import { reducer as formReducer } from 'redux-form';

const app = combineReducers( {
  activeVisualization,
  visualizations,
  config,
  form: formReducer
} );

export default app;
