import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
import createSagaMiddleware from 'redux-saga';
import { root } from './sagas';

import Root from './components/Root.js';
import app from './reducers';

import 'bulma';
import 'font-awesome/css/font-awesome.css';
import './global.scss';

const socket = io({ path: '/wsapi' });
const socketIo = createSocketIoMiddleware(socket, 'api/');
const saga = createSagaMiddleware();

const logger = createLogger({
  collapsed: () => true
});

const store = createStore(
  app,
  {
    activeVisualization: 'HOTSPOT_DIALS',
    visualizations: {
      codeOwnershipRiver: {},
      issueImpact: {},
      hotspotDials: {}
    },
    visualizations: [
      { id: 'ISSUE_IMPACT', label: 'Issue Impact' },
      { id: 'CODE_OWNERSHIP_RIVER', label: 'Code ownership river' },
      { id: 'HOTSPOT_DIALS', label: 'Hotspot Dials' }
    ],
    codeOwnershipData: {
      data: []
    },
    codeOwnershipConfig: {
      showIssues: true,
      highlightedIssue: null,
      highlightedCommits: [],
      commitAttribute: 'count'
    },
    issueImpactData: {
      data: {
        issue: null,
        issues: []
      }
    },
    issueImpactConfig: {
      activeIssueId: 8,
      filteredCommits: []
    },
    hotspotDialsData: {
      data: {
        commits: {
          categories: [],
          maximum: 0
        },
        issues: {
          categories: [],
          maximum: 0
        }
      }
    },
    hotspotDialsConfig: {
      category: 'hour',
      splitCommits: true
    },
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
