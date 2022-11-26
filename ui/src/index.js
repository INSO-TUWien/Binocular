import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
import createSagaMiddleware from 'redux-saga';
import { root } from './sagas';
import _ from 'lodash';
import Database from './database/database';

import Root from './components/Root.js';
import makeAppReducer from './reducers';

import 'bulma';
import 'react-tippy/dist/tippy.css';
import '@fortawesome/fontawesome-free/js/all.js';
import './global.scss';

const saga = createSagaMiddleware();

const logger = createLogger({
  collapsed: () => true,
});

import newDashboard from './visualizations/dashboard';
import dashboard from './visualizations/legacy/dashboard';
import codeOwnershipRiver from './visualizations/legacy/code-ownership-river';
import issueImpact from './visualizations/legacy/issue-impact';
import hotspotDials from './visualizations/legacy/hotspot-dials';
import codeHotspots from './visualizations/legacy/code-hotspots';
import languageModuleRiver from './visualizations/legacy/language-module-river';
import ciBuilds from './visualizations/VisualizationComponents/ciBuilds';
import issues from './visualizations/VisualizationComponents/issues';
import changes from './visualizations/VisualizationComponents/changes';
import RootOffline from './components/RootOffline';
import fileTreeComparison from './visualizations/legacy/file-tree-comparison';

const visualizationModules = [
  newDashboard,
  dashboard,
  codeOwnershipRiver,
  issueImpact,
  hotspotDials,
  codeHotspots,
  languageModuleRiver,
  ciBuilds,
  issues,
  changes,
  fileTreeComparison,
];

Database.checkBackendConnection().then((connection) => {
  const visualizations = {};
  _.each(visualizationModules, (viz) => {
    visualizations[viz.id] = viz;
  });
  if (connection) {
    const app = makeAppReducer(visualizationModules);

    const socket = io({ path: '/wsapi' });
    const socketIo = createSocketIoMiddleware(socket, 'api/');
    const store = createStore(
      app,
      {
        activeVisualization: _.keys(visualizations)[0],
        visualizations,
        config: {
          isFetching: false,
          lastFetched: null,
          isShown: false,
        },
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
  } else {
    Database.initDB().then();
    const app = makeAppReducer(visualizationModules);

    const store = createStore(
      app,
      {
        activeVisualization: _.keys(visualizations)[0],
        visualizations,
        config: {
          isFetching: false,
          lastFetched: null,
          isShown: false,
        },
      },
      applyMiddleware(saga, logger)
    );

    saga.run(root);

    render(<RootOffline store={store} />, document.getElementById('root'));
    if (module.hot) {
      module.hot.accept('./components/Root', () => {
        const NewRoot = require('./components/Root').default;
        render(<NewRoot store={store} />, document.getElementById('root'));
      });
    }
  }
});
