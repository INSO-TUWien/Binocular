import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { AppContainer } from 'react-hot-loader';
import thunk from 'redux-thunk';
import { logger } from 'redux-logger';
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
import createSagaMiddleware from 'redux-saga';
import { root } from './sagas.js';

import customErrorReporter from './customErrorReporter.js';
import Root from './components/Root.js';
import app from './reducers';

import 'bulma';
import 'font-awesome/css/font-awesome.css';
import './global.scss';

const socket = io({ path: '/wsapi' });
const socketIo = createSocketIoMiddleware(socket, 'api/');
const saga = createSagaMiddleware();

const store = createStore(
  app,
  {
    activeVisualization: 'ISSUE_IMPACT',
    visualizations: [
      { id: 'ISSUE_IMPACT', label: 'Issue Impact' },
      { id: 'CODE_OWNERSHIP_RIVER', label: 'Code ownership river' },
      { id: 'HOTSPOT_DIALS', label: 'Hotspot Dials' }
    ],
    config: {
      isFetching: false,
      lastFetched: null,
      isShown: false
    }
  },
  applyMiddleware(thunk, socketIo, saga, logger)
);

saga.run(root);

render(
  <AppContainer errorReporter={customErrorReporter}>
    <Root store={store} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NewRoot = require('./components/Root').default;
    render(
      <AppContainer errorReporter={customErrorReporter}>
        <NewRoot store={store} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

// store.dispatch(fetchConfig()).then(() => store.dispatch(fetchCommits()));
