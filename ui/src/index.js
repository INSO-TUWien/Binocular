import { createRoot } from 'react-dom/client';
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
import dataExport from './visualizations/dataExport';
import dashboard from './visualizations/legacy/dashboard';
import issueImpact from './visualizations/legacy/issue-impact';
import codeHotspots from './visualizations/legacy/code-hotspots';
import languageModuleRiver from './visualizations/legacy/language-module-river';
import codeExpertise from './visualizations/code-expertise';
import ciBuilds from './visualizations/VisualizationComponents/ciBuilds';
import issues from './visualizations/VisualizationComponents/issues';
import issueBreakdown from './visualizations/VisualizationComponents/issueBreakdown';
import changes from './visualizations/VisualizationComponents/changes';
import sprints from './visualizations/VisualizationComponents/sprints';
import timeSpent from './visualizations/VisualizationComponents/timeSpent';
import codeOwnership from './visualizations/code-ownership';
import distributionDials from './visualizations/distribution-dials';
import RootOffline from './components/RootOffline';

const visualizationModules = [
  newDashboard,
  dashboard,
  codeOwnership,
  issueImpact,
  distributionDials,
  codeHotspots,
  languageModuleRiver,
  ciBuilds,
  issues,
  issueBreakdown,
  changes,
  sprints,
  codeExpertise,
  timeSpent,
  dataExport,
];

Database.checkBackendConnection().then((connection) => {
  const visualizations = {};
  _.each(visualizationModules, (viz) => {
    visualizations[viz.id] = viz;
  });

  let activeVisualization = _.keys(visualizations)[0];

  const previousActiveVisualization = localStorage.getItem('previousActiveVisualization');

  if (previousActiveVisualization !== null) {
    activeVisualization = previousActiveVisualization;
  }

  const container = document.getElementById('root');
  const rootContainer = createRoot(container);
  if (connection) {
    const app = makeAppReducer(visualizationModules);

    const socket = io({ path: '/wsapi' });
    const socketIo = createSocketIoMiddleware(socket, 'api/');

    const store = createStore(
      app,
      {
        activeVisualization: activeVisualization,
        visualizations,
        config: {
          isFetching: false,
          lastFetched: null,
          isShown: false,
          offlineMode: false,
        },
      },
      applyMiddleware(socketIo, saga, logger)
    );

    saga.run(root);

    rootContainer.render(<Root store={store} />);
    if (module.hot) {
      module.hot.accept('./components/Root', () => {
        const NewRoot = require('./components/Root').default;
        rootContainer.render(<NewRoot store={store} />);
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
          offlineMode: true,
        },
      },
      applyMiddleware(saga, logger)
    );

    saga.run(root);

    rootContainer.render(<RootOffline store={store} />);
    if (module.hot) {
      module.hot.accept('./components/Root', () => {
        const NewRoot = require('./components/Root').default;
        rootContainer.render(<NewRoot store={store} />);
      });
    }
  }
});
