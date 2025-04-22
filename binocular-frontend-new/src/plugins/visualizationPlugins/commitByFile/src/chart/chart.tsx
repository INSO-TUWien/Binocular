import { createRef, useEffect, useState } from 'react';
import { CommitChangeViz } from './newVis.tsx';
import { Properties } from '../../../../interfaces/visualizationPluginInterfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';
import { DataPluginCommitFileChanges } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFilesChanges.ts';
import { DataState, setSha } from '../reducer';
import { useDispatch, useSelector } from 'react-redux';

function Chart(props: Readonly<Properties<SettingsType, DataPluginCommitFileChanges>>) {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.commitFiles);
  const dataState = useSelector((state: RootState) => state.dataState);

  useEffect(() => {
    dispatch(setSha(props.settings.sha));
  }, [props.settings]);

  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataConnection]);

  const chartContainerRef = createRef<HTMLDivElement>();

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current) return;
      if (chartContainerRef.current?.offsetWidth !== chartWidth) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
      if (chartContainerRef.current?.offsetHeight !== chartHeight) {
        setChartHeight(chartContainerRef.current.offsetHeight);
      }
    });
    resizeObserver.observe(chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [chartContainerRef, chartHeight, chartWidth]);
  return (
    <div className={'w-full h-full flex justify-center items-center'} ref={chartContainerRef}>
      {dataState === DataState.EMPTY && <div>No Data</div>}
      {dataState === DataState.FETCHING && (
        <div>
          <span className="loading loading-spinner loading-lg text-accent"></span>
        </div>
      )}
      {dataState === DataState.COMPLETE && (
        <CommitChangeViz data={data} width={chartWidth} height={chartHeight} />
      )}
    </div>
  );
}

export default Chart;
