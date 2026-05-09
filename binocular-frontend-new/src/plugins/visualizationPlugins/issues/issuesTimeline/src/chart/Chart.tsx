import moment from 'moment';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { handlePopoutResizing } from '../../../../../utils/resizing.ts';
import { DataState, type IssuesTimelineState, setDateRange } from '../reducer';
import type { IssuesTimelineSettings } from '../settings/settings.tsx';
import { IssuesTimelineChart } from './IssuesTimelineChart.tsx';

const Chart = (props: VisualizationPluginProperties<IssuesTimelineSettings, DataPluginIssue>) => {
  /*
   * Creating Dispatch and Root State for interaction with the reducer State
   */
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const [chartWidth, setChartWidth] = React.useState(100);
  const [chartHeight, setChartHeight] = React.useState(100);

  /*
   * -----------------------------
   */
  //Redux Global State
  const issues = useSelector<RootState, IssuesTimelineState['issues']>((data) => data.plugin.issues);
  const mergeRequests = useSelector<RootState, IssuesTimelineState['mergeRequests']>((data) => data.plugin.mergeRequests);
  const dataState = useSelector<RootState, IssuesTimelineState['dataState']>((state: RootState) => state.plugin.dataState);

  /**
   * RESIZE Logic START
   */
  const resize = () => {
    if (!props.chartContainerRef?.current) return;
    if (props.chartContainerRef.current?.offsetWidth !== chartWidth) {
      setChartWidth(props.chartContainerRef.current.offsetWidth);
    }
    if (props.chartContainerRef.current?.offsetHeight !== chartHeight) {
      setChartHeight(props.chartContainerRef.current.offsetHeight);
    }
  };

  const resizeFnRef = useRef<() => void>(() => {});
  resizeFnRef.current = resize;

  useEffect(() => {
    resize();
  }, [props.chartContainerRef]);

  useEffect(() => {
    return handlePopoutResizing(props.store, () => resizeFnRef.current());
  }, [props.store]);
  /**
   * RESIZE Logic END
   */

  //Set Global state when parameters change. This will also conclude in a refresh of the data.
  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters.parametersDateRange]);

  //Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [props.dataConnection]);

  return (
    <>
      <div className={'w-full h-full flex justify-center items-center'} ref={props.chartContainerRef}>
        {dataState === DataState.EMPTY && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div>
            <span className="loading loading-spinner loading-lg text-accent" />
          </div>
        )}
        {dataState === DataState.COMPLETE &&
          (issues.length > 0 || mergeRequests.length > 0 ? (
            <IssuesTimelineChart
              authors={props.authorList}
              issues={issues}
              mergeRequests={mergeRequests}
              coloringMode={props.settings.coloringMode}
              sprints={props.sprintList}
              fromDate={moment(props.parameters.parametersDateRange.from)}
              toDate={moment(props.parameters.parametersDateRange.to)}
              showSprints={props.settings.showSprints}
              width={chartWidth}
              height={chartHeight}
              maxNumberOfDifferencesBetweenLabels={props.settings.maxNumberOfDifferencesBetweenLabels}
              minNumberOfLabelsPerGroup={props.settings.minNumberOfLabelsPerGroup}
            />
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))}
      </div>
    </>
  );
};

export default Chart;
