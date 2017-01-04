import { combineReducers } from 'redux';
import activeVisualization from './activeVisualization.jsx';
import visualizations from './visualizations.jsx';
import config from './config.jsx';

const app = combineReducers( {
  activeVisualization,
  visualizations,
  config
} );

export default app;
