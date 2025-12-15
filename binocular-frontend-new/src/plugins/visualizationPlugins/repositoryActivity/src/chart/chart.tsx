import { useEffect, useState } from 'react';
import type { HeatmapCell } from '../utilities/types';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { RepositoryActivitySettings } from '../settings/settings';
import Heatmap from './heatmap';
import CalendarHeatmap from './calendarHeatmap';
import { useDispatch, useSelector } from 'react-redux';
import { convertToCalendarFormat } from '../utilities/monthlyUtils';
import { handelPopoutResizing } from '../../../../utils/resizing';
import { DataState, setDateRange } from '../reducer';
import { convertToWeeklyFormat } from '../utilities/weeklyUtils';
import WeekPicker from './weekPicker';

function Chart(props: VisualizationPluginProperties<RepositoryActivitySettings, DataPluginCommit>) {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(150);
  const [chartData, setChartData] = useState<Array<{ date: Date; value: number; tooltip?: string }> | HeatmapCell[]>([]);
  const [rowLabels, setRowLabels] = useState<Array<string>>([]);
  const [colLabels, setColLabels] = useState<Array<string>>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const weekPickerHeight = 60;

  const handleWeekChange = (weekStart: Date) => {
    console.log('Selected week:', weekStart);
    setSelectedWeek(weekStart);
  };

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

  handelPopoutResizing(props.store, resize);

  // Effect on data change - convert real data to chart format
  useEffect(() => {
    if (!props.settings.displayWeekly) {
      const { chartData: chartData } = convertToCalendarFormat(data, props);
      setChartData(chartData);
    } else {
      const { chartData: chartData, rowLabels: rowLabels, colLabels: colLabels } = convertToWeeklyFormat(data, props, selectedWeek);
      setChartData(chartData);
      setRowLabels(rowLabels);
      setColLabels(colLabels);
    }
  }, [data, props, selectedWeek]);

  // Set Global state when parameters change
  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters, dispatch, props.dataName]);

  // Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [props.dataConnection, dispatch]);

  const selectedColor = props.authorList[0]?.color?.main || '#3182bd';

  return (
    <div className={'w-full h-full flex justify-center items-center'} ref={props.chartContainerRef}>
      {dataState === DataState.EMPTY && <div>No Data</div>}
      {dataState === DataState.FETCHING && (
        <div>
          <span className="loading loading-spinner loading-lg text-accent"></span>
        </div>
      )}
      {props.settings.displayWeekly
        ? dataState === DataState.COMPLETE &&
          (chartData.length !== 0 ? (
            <div style={{ width: '100%', maxHeight: '100%', overflow: 'auto' }}>
              <WeekPicker onChange={handleWeekChange} initialWeek={selectedWeek}></WeekPicker>
              <Heatmap
                data={chartData as HeatmapCell[]}
                colLabels={colLabels}
                rowLabels={rowLabels}
                minCellSize={10}
                color={selectedColor}
                cellPadding={3}
                showLegend={true}
                legendTitle="Values"
                scaleHorizontal={true}
                scaleVertical={true}
                containerWidth={chartWidth}
                containerHeight={chartHeight - weekPickerHeight}
              />
            </div>
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))
        : dataState === DataState.COMPLETE &&
          (chartData.length !== 0 ? (
            <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
              <CalendarHeatmap
                data={chartData as Array<{ date: Date; value: number; tooltip?: string }>}
                startDate={new Date(props.parameters.parametersDateRange.from)}
                endDate={new Date(props.parameters.parametersDateRange.to)}
                minCellSize={12}
                cellPadding={3}
                color={selectedColor}
                showLegend={true}
                legendTitle="Contributions"
              />
            </div>
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))}
    </div>
  );
}
export default Chart;
