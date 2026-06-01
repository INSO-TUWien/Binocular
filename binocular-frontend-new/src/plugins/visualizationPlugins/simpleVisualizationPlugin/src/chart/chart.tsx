import { StackedAreaChart, type ChartData, type Palette } from '../../../../../components/stackedAreaChart/StackedAreaChart.tsx';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataState, getDataSlice } from '../reducer';
import type { DefaultSettings } from '../settings/settings.tsx';
import { handlePopoutResizing } from '../../../../utils/resizing.ts';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import { VisualizationPluginDependencyType } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginDependencies.ts';

export type { ChartData, Palette };

function Chart<SettingsType extends DefaultSettings, DataType>(props: VisualizationPluginProperties<SettingsType, DataType>) {
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
  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);
  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [chartPalette, setChartPalette] = useState<Palette>({});
  const [calculating, setCalculating] = useState(false);

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

  const resizeFnRef = useRef<() => void>(() => {});
  resizeFnRef.current = resize;

  function recalculate() {
    try {
      if (props.dataConverter) {
        setCalculating(true);
        const { chartData, scale, palette } = props.dataConverter(data, props);
        setChartData(chartData);
        setChartScale(scale);
        setChartPalette(palette);
        setCalculating(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    resize();
  }, [props.chartContainerRef]);

  useEffect(() => {
    return handlePopoutResizing(props.store, () => resizeFnRef.current());
  }, [props.store]);
  /**
   * RESIZE Logic END
   */

  // Effect on data change
  useEffect(() => {
    recalculate();
  }, [data, props.settings]);

  // Effect on parameters general change
  useEffect(() => {
    // when dependency information not provided refresh just to be safe
    if (!props.dependencies) dispatch({ type: 'REFRESH' });
    else {
      switch (props.dependencies.generalParameters) {
        case VisualizationPluginDependencyType.Refresh:
          dispatch({ type: 'REFRESH' });
          break;
        case VisualizationPluginDependencyType.Recalculate:
          recalculate();
          break;
      }
    }
  }, [props.parameters.parametersGeneral]);

  // Effect on authors list change
  useEffect(() => {
    // when dependency information not provided refresh just to be safe
    if (!props.dependencies) dispatch({ type: 'REFRESH' });
    else {
      switch (props.dependencies.authors) {
        case VisualizationPluginDependencyType.Refresh:
          dispatch({ type: 'REFRESH' });
          break;
        case VisualizationPluginDependencyType.Recalculate:
          recalculate();
          break;
      }
    }
  }, [props.authorList]);

  // Effect on file list change
  useEffect(() => {
    // when dependency information not provided refresh just to be safe
    if (!props.dependencies) dispatch({ type: 'REFRESH' });
    else {
      switch (props.dependencies.files) {
        case VisualizationPluginDependencyType.Refresh:
          dispatch({ type: 'REFRESH' });
          break;
        case VisualizationPluginDependencyType.Recalculate:
          recalculate();
          break;
      }
    }
  }, [props.fileList]);

  // Effect on date range change
  useEffect(() => {
    if (!props.dependencies) dispatch(getDataSlice(props.dataName!).actions.setDateRange(props.parameters.parametersDateRange));
    else {
      switch (props.dependencies.dateRange) {
        case VisualizationPluginDependencyType.Refresh:
          dispatch(getDataSlice(props.dataName!).actions.setDateRange(props.parameters.parametersDateRange));
          break;
        case VisualizationPluginDependencyType.Recalculate:
          recalculate();
          break;
      }
    }
  }, [props.parameters.parametersDateRange]);

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
        {(dataState === DataState.FETCHING || calculating) && (
          <div>
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE &&
          !calculating &&
          (chartData.length !== 0 ? (
            <StackedAreaChart
              data={chartData}
              scale={chartScale}
              palette={chartPalette}
              sprintList={props.sprintList}
              width={chartWidth}
              height={chartHeight}
              settings={props.settings}
            />
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))}
      </div>
    </>
  );
}

export default Chart;
