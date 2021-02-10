import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
import createSagaMiddleware from 'redux-saga';
import { root } from './sagas';

import Root from './components/Root.js';
import makeAppReducer from './reducers';

import 'bulma';
import 'react-tippy/dist/tippy.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './global.scss';

const socket = io({ path: '/wsapi' });
const socketIo = createSocketIoMiddleware(socket, 'api/');
const saga = createSagaMiddleware();

const logger = createLogger({
  collapsed: () => true
});

import dashboard from './visualizations/dashboard';
import codeOwnershipRiver from './visualizations/code-ownership-river';
import issueImpact from './visualizations/issue-impact';
import hotspotDials from './visualizations/hotspot-dials';
import symbolLifespan from './visualizations/symbol-lifespan';

const visualizationModules = [dashboard, codeOwnershipRiver, issueImpact, hotspotDials, symbolLifespan];

const visualizations = {};
for (let visualization of visualizationModules) {
  visualizations[visualization.id] = visualization;
}

const app = makeAppReducer(visualizationModules);

const store = createStore(
  app,
  {
    activeVisualization: Object.keys(visualizations)[0],
    visualizations,
    config: {
      isFetching: false,
      lastFetched: null,
      isShown: false
    }
  },
  applyMiddleware(socketIo, saga, logger)
);

saga.run(root);

render(<Root store={store} />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NewRoot = require('./components/Root').default;
    render(<NewRoot store={store} />, document.getElementById('root'));
  });
}
