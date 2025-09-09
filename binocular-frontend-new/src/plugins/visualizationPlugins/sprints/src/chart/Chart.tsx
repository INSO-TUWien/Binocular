import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataState, type IssuesState } from '../reducer';
import type { SprintSettings } from '../settings/settings.tsx';
import { handelPopoutResizing } from '../../../../utils/resizing.ts';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { SprintChart } from './SprintChart.tsx';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { getDataSlice } from '../../../simpleVisualizationPlugin/src/reducer/index.ts';

export interface ChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

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
  const data = useSelector<RootState, IssuesState['issues']>(
    (state) => state.plugin.issues,
  );
  const dataState = useSelector<RootState, IssuesState['dataState']>(
    (state: RootState) => state.plugin.dataState,
  );
  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [_chartScale, setChartScale] = useState<number[]>([]);
  const [_chartPalette, setChartPalette] = useState<Palette>({});

  /**
   * RESIZE Logic START
   */
  function resize() {
    if (!props.chartContainerRef?.current) return;
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

  handelPopoutResizing(props.store, resize);
  /**
   * RESIZE Logic END
   */

  // Effect on data change
  useEffect(() => {
    try {
      if (props.dataConverter) {
        const { chartData, scale, palette } = props.dataConverter(data, props);
        setChartData(chartData);
        setChartScale(scale);
        setChartPalette(palette);
      }
    } catch (e) {
      console.error(e);
    }
  }, [data, props]);

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
    dispatch({
      type: 'REFRESH',
    });
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
          (chartData.length !== 0 ? (
            <SprintChart />
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))}
      </div>
    </>
  );
};

export default Chart;
