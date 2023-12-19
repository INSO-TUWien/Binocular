import { createRoot } from "react-dom/client";
import { LazyExoticComponent, lazy, useEffect, useState } from "react";
import { createStore, applyMiddleware } from "redux";
import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from "redux-logger";

import io from "socket.io-client";
import createSocketIoMiddleware from "redux-socket.io";
import createSagaMiddleware from "redux-saga";
import { root } from "./sagas";
import _ from "lodash";
import Database from "./database/database";

import Root from "./components/Root";
import makeAppReducer from "./reducers";

// import PreflighCheck from "./preflight";
import "react-tippy/dist/tippy.css";
import "@fortawesome/fontawesome-free/js/all";
import "./global.scss";



const logger = createLogger({
  collapsed: () => true,
});

import dashboard from "./visualizations/dashboard";
// const dataExport from "./visualizations/dataExport");
import dataExport from "./pages/DataExport";
import issueImpact from "./visualizations/legacy/issue-impact";
import codeHotspots from "./visualizations/legacy/code-hotspots";
import codeExpertise from "./visualizations/code-expertise";
import ciBuilds from "./visualizations/VisualizationComponents/ciBuilds";
import issues from "./visualizations/VisualizationComponents/issues";
import issueBreakdown from "./visualizations/VisualizationComponents/issueBreakdown";
import changes from "./visualizations/VisualizationComponents/changes";
import sprints from "./visualizations/VisualizationComponents/sprints";
import timeSpent from "./visualizations/VisualizationComponents/timeSpent";
import codeOwnership from "./visualizations/code-ownership";
import distributionDials from "./visualizations/distribution-dials";
import RootOffline from "./components/RootOffline";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import { LandingPage } from "./pages/Landing/Landing";
import { Provider } from "react-redux";
// import { useContainer } from "./database/DatabaseContainerContext";
import Dashboard from "./visualizations/dashboard";
import Demo from "./components/Demo/Demo";
import DataExport from './pages/DataExport';

type VisualizationModuleType = {
  id: string;
  // component: LazyExoticComponent<any>;
  component: any;
};


const initOnline = (visualizationModules: VisualizationModuleType[]) => {
  const saga = createSagaMiddleware();
  const app = makeAppReducer(visualizationModules.map(v => v.component));

  const socket = io({ path: "/wsapi" });
  const socketIo = createSocketIoMiddleware(socket, "api/");

  const _store = createStore(
    app,
    {
      // activeVisualization: _.keys(visualizations)[0],
      // visualizations,
      config: {
        isFetching: false,
        lastFetched: null,
        isShown: false,
        offlineMode: false,
      },
    },
    applyMiddleware(socketIo, saga, logger),
  );

  saga.run(root);

  return _store;
  //     return <Root store={store} />;
}

const initOffline = (visualizationModules: VisualizationModuleType[], visualizations) => {
  const saga = createSagaMiddleware();
  // Database.initDB().then();
  const app = makeAppReducer(visualizationModules.map(v => v.component));

  const _store = createStore(
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

  return _store;

  // return <RootOffline
  // // store={store}
  // app={app}
  // activeVisualization={_.keys(visualizations)[0]}
  // visualizations={visualizations}
  // config={{
  //   isFetching: false,
  //   lastFetched: null,
  //   isShown: false,
  //   offlineMode: true,
  // }}
  // />
}


const MainApp: React.FC = () => {

  const visualizationModules: VisualizationModuleType[] = [
    {
      id: 'dashboard',
      component: dashboard
    },
    // { id: 'codeOwnership', component: codeOwnership },
    // { id: 'distributionDials', component: distributionDials },
    // { id: 'sprints', component: sprints },
    // { id: 'codeHotspots', component: codeHotspots },
    // { id: 'codeExpertise', component: codeExpertise },
    // { id: 'issueImpact', component: issueImpact },
    // { id: 'timeSpent', component: timeSpent },
    { id: 'ciBuilds', component: ciBuilds },
    { id: 'issues', component: issues },
    // { id: 'issueBreakdown', component: issueBreakdown },
    { id: 'changes', component: changes },
    { id: 'export', component: dataExport },
  ]

  const visualizations = {};
  _.each(visualizationModules, (viz) => {
    visualizations[viz.id] = viz.component;
  });

  let activeVisualization = _.keys(visualizations)[0];

  const previousActiveVisualization = localStorage.getItem(
    "previousActiveVisualization",
  );

  if (previousActiveVisualization !== null) {
    activeVisualization = previousActiveVisualization;
  }
  // const isOnline = PreflighCheck.preflightCheck().online;


  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(undefined);
  // const { initDb } = useContainer();

  let render_component;

  useEffect(() => {
    console.log("useEffect")

    async function init() {
      // setStore(() => {
      //   if (isOnline) {
      //     throw new Error("Not yet implemented")
      //   } else {
      //     return initOffline(visualizationModules, visualizations)
      //   }
      // })
      setStore(initOffline(visualizationModules, visualizations))

      await new Promise(r => setTimeout(r, 3000));
      setLoading(false)
    }

    init()

    return () => {
      setLoading(true)
    }
  }, []);

  if (loading) {
    return <LandingPage />
  // } else if (isOnline) {
  //   render_component = <>online</>
  } else {
    // render_component = <Demo />
    render_component = <Dashboard.ChartComponent />
  }

  return <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="" element={render_component} />
          {/* <Route path="dashboard" element={<Provider store={store}>
              <Dashboard.ChartComponent />
            </Provider>
            } /> */}
          <Route path="export" element={<Provider store={store}>
            <DataExport.ChartComponent />
          </Provider>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </Provider>
}

export default MainApp;

