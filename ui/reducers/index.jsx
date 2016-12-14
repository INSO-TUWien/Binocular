import { combineReducers } from 'redux';
import activeVisualization from './activeVisualization.jsx';
import visualizations from './visualizations.jsx';

const app = combineReducers( {
  activeVisualization,
  visualizations
} );

export default app;
