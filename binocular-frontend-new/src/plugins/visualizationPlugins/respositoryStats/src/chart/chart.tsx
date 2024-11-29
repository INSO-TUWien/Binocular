import styles from './chartStyles.module.scss';
import { SettingsType } from '../settings/settings.tsx';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { ParametersType } from '../../../../../types/parameters/parametersType.ts';
import { RefObject, useEffect, useState } from 'react';
import { Store } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { DataState, setDateRange } from '../reducer';
import { throttle } from 'throttle-debounce';

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

function Chart(props: {
  settings: SettingsType;
  dataConnection: DataPlugin;
  parameters: ParametersType;
  chartContainerRef: RefObject<HTMLDivElement>;
  store: Store;
}) {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const commitNumber = useSelector((state: RootState) => state.commitNumber);
  const userNumber = useSelector((state: RootState) => state.userNumber);
  const issueNumber = useSelector((state: RootState) => state.issueNumber);
  const dataState = useSelector((state: RootState) => state.dataState);
  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [commits, setCommits] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [issues, setIssues] = useState<number>(0);

  /*
Throttle the resize of the svg (refresh rate) to every 1s to not overwhelm the renderer,
This isn't really necessary for this visualization, but for bigger visualization this can be quite essential
 */
  const throttledResize = throttle(
    1000,
    () => {
      if (!props.chartContainerRef.current) return;
      if (props.chartContainerRef.current?.offsetWidth !== chartWidth) {
        setChartWidth(props.chartContainerRef.current.offsetWidth);
      }
      if (props.chartContainerRef.current?.offsetHeight !== chartHeight) {
        setChartHeight(props.chartContainerRef.current.offsetHeight);
      }
    },
    { noLeading: false, noTrailing: false },
  );

  //Resize Observer -> necessary for dynamically refreshing d3 chart
  useEffect(() => {
    if (!props.chartContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      throttledResize();
    });
    resizeObserver.observe(props.chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [props.chartContainerRef, chartHeight, chartWidth]);

  // Effect on data change
  useEffect(() => {
    setCommits(commitNumber);
    setUsers(userNumber);
    setIssues(issueNumber);
  }, [commitNumber, users, props.parameters]);

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
              <div className="stat">
                <div className="stat-title">Contributors</div>
                <div className="stat-value text-primary">{users}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Commits</div>
                <div className="stat-value text-primary">{commits}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Issues</div>
                <div className="stat-value text-primary">{issues}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chart;
