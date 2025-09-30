import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataState, type IssuesState } from '../reducer';
import type { SprintSettings } from '../settings/settings.tsx';
import { handelPopoutResizing } from '../../../../utils/resizing.ts';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { SprintChart } from './SprintChart.tsx';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { getDataSlice } from '../../../simpleVisualizationPlugin/src/reducer/index.ts';
import moment from 'moment';

const Chart = (
  props: VisualizationPluginProperties<SprintSettings, DataPluginIssue>,
) => {
  /*
   * Creating Dispatch and Root State for interaction with the reducer State
   */
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();
  /*
   * -----------------------------
   */
  //Redux Global State
  const issues = useSelector<RootState, IssuesState['issues']>(
    (data) => data.plugin.issues,
  );
  const mergeRequests = useSelector<RootState, IssuesState['mergeRequests']>(
    (data) => data.plugin.mergeRequests,
  );
  const dataState = useSelector<RootState, IssuesState['dataState']>(
    (state: RootState) => state.plugin.dataState,
  );

  /**
   * RESIZE Logic START
   */
  function resize() {}

  useEffect(() => {
    resize();
  }, [props.chartContainerRef]);

  handelPopoutResizing(props.store, resize);
  /**
   * RESIZE Logic END
   */

  //Set Global state when parameters change. This will also conclude in a refresh of the data.
  useEffect(() => {
    dispatch(
      getDataSlice(props.dataName!).actions.setDateRange(
        props.parameters.parametersDateRange,
      ),
    );
  }, [props.parameters]);

  //Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [props.dataConnection]);

  return (
    <>
      <div
        className={'w-full h-full flex justify-center items-center'}
        ref={props.chartContainerRef}
      >
        {dataState === DataState.EMPTY && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div>
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE &&
          (issues.length > 0 || mergeRequests.length > 0 ? (
            <SprintChart
              authors={props.authorList}
              issues={issues}
              mergeRequests={mergeRequests}
              coloringMode={props.settings.coloringMode}
              sprints={props.sprintList}
              minDate={moment(props.parameters.parametersDateRange.from)}
              maxDate={moment(props.parameters.parametersDateRange.to)}
              showSprints={props.settings.showSprints}
            />
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))}
      </div>
    </>
  );
};

export default Chart;
