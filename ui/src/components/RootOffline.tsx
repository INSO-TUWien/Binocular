'use strict';

import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import App from './App';
import Database from '../database/database';
import { useOfflineContainer, useContainer } from '../database/DatabaseContainerContext';
import createSagaMiddleware from 'redux-saga';
import { root } from "../sagas";
import { createLogger } from 'redux-logger';
import { applyMiddleware, createStore } from 'redux';
import Layout from '../pages/Layout/Layout';
import Footer from './Footer/Footer';
import Navbar from './Navbar/Navbar';
import Demo from './Demo/Demo';
import DataExport from '../pages/DataExport';
import LoadingSpinnerComponent from './LoadingSpinner/LoadingSpinner';

import Dashboard from "../visualizations/dashboard";

const saga = createSagaMiddleware();
const logger = createLogger({
  collapsed: () => true,
});

export interface RootOfflineProps {
  // store: any,
  app: any,
  activeVisualization: any,
  visualizations: any,
  config: any
}

const RootOffline: React.FC<RootOfflineProps> = ({
  // store,
  app,
  activeVisualization,
  visualizations,
  config
}) => {
  // const { initDb } = useContainer();
  const [store, setStore] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  let render_component;

  useEffect(() => {
    // initDb()
    // const _store = createStore(
    //   app,
    //   {
    //     activeVisualization: activeVisualization,
    //     visualizations,
    //     config: config,
    //   },
    //   applyMiddleware(saga, logger),
    // );
    // setStore(_store)
    // saga.run(root);
    // setLoading(false)
  }, []);

  if (loading) {
    return <div>
      <LoadingSpinnerComponent />
    </div>
  } else if (error) {
    return <div>Error: {error.message}</div>;
  } else if (store) {
    // render_component = <>
    //   <Provider store={store}><App /></Provider>
    //   <Provider store={store}>
    //     <Dashboard.ChartComponent />
    //   </Provider>
    // </>
    return <Demo />
  }

  return <>
    {/* <Provider store={store}> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="" element={render_component} />
            {/* <Route path="dashboard" element={<Provider store={store}>
              <Dashboard.ChartComponent />
            </Provider>
            } />
            <Route path="export" element={<Provider store={store}>
              <DataExport.ChartComponent />
            </Provider>
            } /> */}
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    {/* </Provider> */}
  </>
}



export default RootOffline;
