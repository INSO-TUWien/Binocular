import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StackedAreaChart, type ChartData, type Palette } from '../../../../../../components/stackedAreaChart/StackedAreaChart.tsx';
import { DataState, type IssueLabelsState, setDateRange } from '../reducer';
import type { IssueLabelsSettings } from '../settings/settings.tsx';
import { handlePopoutResizing } from '../../../../../utils/resizing.ts';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { convertToChartData } from '../utilities/dataConverter.ts';

const Chart = (props: VisualizationPluginProperties<IssueLabelsSettings, DataPluginIssue>) => {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const issues = useSelector<RootState, IssueLabelsState['issues']>((state) => state.plugin.issues);
  const dataState = useSelector<RootState, IssueLabelsState['dataState']>((state) => state.plugin.dataState);

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [chartPalette, setChartPalette] = useState<Palette>({});

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

  useEffect(() => {
    resize();
  }, [props.chartContainerRef]);

  useEffect(() => {
    return handlePopoutResizing(props.store, () => resizeFnRef.current());
  }, [props.store]);

  useEffect(() => {
    const { chartData, scale, palette } = convertToChartData(issues, props.settings.selectedLabels, props.parameters);
    setChartData(chartData);
    setChartScale(scale);
    setChartPalette(palette);
  }, [issues, props.settings.selectedLabels, props.parameters]);

  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters.parametersDateRange]);

  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [props.dataConnection]);

  return (
    <div className={'w-full h-full flex justify-center items-center'} ref={props.chartContainerRef}>
      {dataState === DataState.EMPTY && <div>NoData</div>}
      {dataState === DataState.FETCHING && (
        <div>
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}
      {dataState === DataState.COMPLETE &&
        (chartData.length > 0 ? (
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
  );
};

export default Chart;
