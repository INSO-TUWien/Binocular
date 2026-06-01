import { useEffect, useRef, useState } from 'react';
import type { HeatmapCell } from '../utilities/types';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { RepositoryActivitySettings } from '../settings/settings';
import Heatmap from './heatmap';
import { useDispatch, useSelector } from 'react-redux';
import { convertToActivityTimelineFormat } from '../utilities/activityTimelineUtils';
import { handlePopoutResizing } from '../../../../../utils/resizing';
import { DataState, setDateRange, setShowActivityTimeline } from '../reducer';
import { convertToWeeklyFormat } from '../utilities/weeklyUtils';
import WeekPicker from './weekPicker';
import ActivityTimeline from './activityTimeline';

function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + diff);
  now.setHours(0, 0, 0, 0);
  return now;
}

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
  const [selectedWeek, setSelectedWeek] = useState(getMondayOfCurrentWeek());
  const showActivityTimeline = useSelector((state: RootState) => state.plugin.showActivityTimeline);

  const weekPickerHeight = 60;

  // Resize logic start

  function resize() {
    if (!props.chartContainerRef.current) return;
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

  // resize logic end

  const handleWeekChange = (weekStart: Date) => {
    setSelectedWeek(weekStart);
  };

  // Effect on data change - convert data to chart format
  useEffect(() => {
    if (showActivityTimeline) {
      const { chartData: chartData } = convertToActivityTimelineFormat(data);
      setChartData(chartData);
    } else {
      const { chartData: chartData, rowLabels: rowLabels, colLabels: colLabels } = convertToWeeklyFormat(data, selectedWeek);
      setChartData(chartData);
      setRowLabels(rowLabels);
      setColLabels(colLabels);
    }
  }, [data, props, selectedWeek, showActivityTimeline]);

  // Set Global state when parameters change
  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters.parametersDateRange, dispatch]);

  // Sync showActivityTimeline setting to Redux state
  useEffect(() => {
    dispatch(setShowActivityTimeline(props.settings.showActivityTimeline));
  }, [props.settings.showActivityTimeline, dispatch]);

  // Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({ type: 'REFRESH' });
  }, [props.dataConnection, dispatch]);

  const selectedColor = props.authorList[0]?.color?.main || '#3182bd';

  const handleBack = () => {
    dispatch(setShowActivityTimeline(true));
    setSelectedWeek(getMondayOfCurrentWeek());
  };

  const handleDayCellClick = (cell: HeatmapCell) => {
    if (!cell.metadata?.date) return;
    const clickedDate = new Date(cell.metadata.date);
    // Calculate Monday of the clicked week
    const day = clickedDate.getDay();
    const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, else go to Monday
    const weekStart = new Date(clickedDate);
    weekStart.setDate(clickedDate.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    setSelectedWeek(weekStart);
    dispatch(setShowActivityTimeline(false));
  };

  return (
    <div className={'w-full h-full flex justify-center items-center'} ref={props.chartContainerRef}>
      {dataState === DataState.EMPTY && <div>No Data</div>}
      {dataState === DataState.FETCHING && (
        <div>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
      {!showActivityTimeline
        ? dataState === DataState.COMPLETE &&
          (chartData.length !== 0 ? (
            <div style={{ width: '100%', maxHeight: '100%', overflow: 'auto' }}>
              <WeekPicker onChange={handleWeekChange} onBack={handleBack} initialWeek={selectedWeek}></WeekPicker>
              <Heatmap
                data={chartData as HeatmapCell[]}
                colLabels={colLabels}
                rowLabels={rowLabels}
                minCellSize={10}
                color={selectedColor}
                cellPadding={3}
                showLegend={true}
                legendTitle="Activities"
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
              <ActivityTimeline
                data={chartData as Array<{ date: Date; value: number; tooltip?: string }>}
                startDate={new Date(props.parameters.parametersDateRange.from)}
                endDate={new Date(props.parameters.parametersDateRange.to)}
                minCellSize={12}
                cellPadding={3}
                color={selectedColor}
                showLegend={true}
                legendTitle="Activities"
                onCellClick={handleDayCellClick}
                scaleHorizontal={true}
                scaleVertical={true}
                containerWidth={chartWidth}
                containerHeight={chartHeight}
              />
            </div>
          ) : (
            <div>No Data matching the selected Parameters!</div>
          ))}
    </div>
  );
}
export default Chart;
