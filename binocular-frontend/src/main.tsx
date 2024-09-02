import { createRoot } from 'react-dom/client';
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';

import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
import createSagaMiddleware from 'redux-saga';
import { root } from './sagas';
import _ from 'lodash';
import Database from './database/database';

import Root from './components/Root';
import makeAppReducer from './reducers';

// import 'bulma';
import 'react-tippy/dist/tippy.css';
import '@fortawesome/fontawesome-free/js/all';
import './global.scss';

const saga = createSagaMiddleware();

const logger = createLogger({
  collapsed: () => true,
});

import dashboard from './visualizations/dashboard/index.ts';
import dataExport from './visualizations/dataExport';
import issueImpact from './visualizations/legacy/issue-impact';
import codeHotspots from './visualizations/legacy/code-hotspots';
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
import codeReviewMetrics from './visualizations/code-review-metrics/index.ts';
import mergeRequestLifecycle from './visualizations/merge-request-lifecycle/index.ts';
import mergeRequestOwnership from './visualizations/merge-request-ownership/index.tsx';

const visualizationModules = [
  dashboard,
  codeOwnership,
  distributionDials,
  sprints,
  codeHotspots,
  codeExpertise,
  issueImpact,
  timeSpent,
  ciBuilds,
  issues,
  issueBreakdown,
  changes,
  codeReviewMetrics,
  mergeRequestLifecycle,
  mergeRequestOwnership,
  dataExport,
];

Database.checkBackendConnection().then(async (connection) => {
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
  const rootContainer = createRoot(container!);

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
          // @ts-ignore
          isFetching: false,
          lastFetched: null,
          isShown: false,
          offlineMode: false,
        },
      },
      applyMiddleware(socketIo, saga, logger),
    );

    saga.run(root);

    rootContainer.render(<Root store={store} />);
  } else {
    await Database.initDB();
    const app = makeAppReducer(visualizationModules);

    const store = createStore(
      app,
      {
        activeVisualization: _.keys(visualizations)[0],
        visualizations,
        config: {
          // @ts-ignore
          isFetching: false,
          lastFetched: null,
          isShown: false,
          offlineMode: true,
        },
      },
      applyMiddleware(saga, logger),
    );

    saga.run(root);

    rootContainer.render(<RootOffline store={store} />);
  }
});
