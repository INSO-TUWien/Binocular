import styles from './chartStyles.module.scss';
import type { SettingsType } from '../settings/settings.tsx';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { ParametersType } from '../../../../../types/parameters/parametersType.ts';
import { type RefObject, useEffect, useState } from 'react';
import type { Store } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { DataState, setDateRange } from '../reducer';

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

function Chart(props: {
  settings: SettingsType;
  dataConnection: DataPlugin;
  parameters: ParametersType;
  chartContainerRef: RefObject<HTMLDivElement | null>;
  store: Store;
}) {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const commitNumber = useSelector((state: RootState) => state.plugin.commitNumber);
  const userNumber = useSelector((state: RootState) => state.plugin.userNumber);
  const issueNumber = useSelector((state: RootState) => state.plugin.issueNumber);
  const buildNumber = useSelector((state: RootState) => state.plugin.buildNumber);
  const mergeRequestNumber = useSelector((state: RootState) => state.plugin.mergeRequestNumber);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);
  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [commits, setCommits] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [issues, setIssues] = useState<number>(0);
  const [builds, setBuilds] = useState<number>(0);
  const [mergeRequests, setMergeRequests] = useState<number>(0);

  /**
   * RESIZE Logic START
   */
  function resize() {
    if (!props.chartContainerRef.current) return;
    if (props.chartContainerRef.current?.offsetWidth !== chartWidth) {
      setChartWidth(props.chartContainerRef.current.offsetWidth);
    }
    if (props.chartContainerRef.current?.offsetHeight !== chartHeight) {
      setChartHeight(props.chartContainerRef.current.offsetHeight);
    }
  }

  useEffect(() => {
    resize();
  }, [props.chartContainerRef, chartHeight, chartWidth]);

  // Effect on data change
  useEffect(() => {
    setCommits(commitNumber);
    setUsers(userNumber);
    setIssues(issueNumber);
    setBuilds(buildNumber);
    setMergeRequests(mergeRequestNumber);
  }, [commitNumber, users, props.parameters, userNumber, issueNumber, buildNumber]);

  //Set Global state when parameters change. This will also conclude in a refresh of the data.
  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters]);

  //Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataConnection]);

  return (
    <>
      <div className={'w-full h-full flex justify-center items-center'} ref={props.chartContainerRef}>
        {dataState === DataState.EMPTY && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div>
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE && (
          <div className={styles.chartContainer}>
            <div className="stats shadow stats-vertical m-2 w-11/12">
              {props.settings.contributors && (
                <div className="stat">
                  <div className="stat-title">Contributors</div>
                  <div className="stat-value text-primary">{users}</div>
                </div>
              )}
              {props.settings.commits && (
                <div className="stat">
                  <div className="stat-title">Commits</div>
                  <div className="stat-value text-primary">{commits}</div>
                </div>
              )}
              {props.settings.issues && (
                <div className="stat">
                  <div className="stat-title">Issues</div>
                  <div className="stat-value text-primary">{issues}</div>
                </div>
              )}
              {props.settings.builds && (
                <div className="stat">
                  <div className="stat-title">Builds</div>
                  <div className="stat-value text-primary">{builds}</div>
                </div>
              )}
              {props.settings.mergeRequests && (
                <div className="stat">
                  <div className="stat-title">Merge requests</div>
                  <div className="stat-value text-primary">{mergeRequests}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chart;
