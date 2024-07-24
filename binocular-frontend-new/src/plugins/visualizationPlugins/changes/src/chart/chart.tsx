import { StackedAreaChart } from './stackedAreaChart.tsx';
import { RefObject, useEffect, useState } from 'react';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { SettingsType } from '../settings/settings.tsx';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { convertCommitDataToChangesChartData } from '../utilities/dataConverter.ts';
import { SprintType } from '../../../../../types/data/sprintType.ts';
import { throttle } from 'throttle-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { ParametersType } from '../../../../../types/parameters/parametersType.ts';
import { Store } from '@reduxjs/toolkit';
import { setDateRange } from '../reducer';

export interface CommitChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

function Chart(props: {
  settings: SettingsType;
  dataConnection: DataPlugin;
  authorList: AuthorType[];
  sprintList: SprintType[];
  parameters: ParametersType;
  chartContainerRef: RefObject<HTMLDivElement>;
  store: Store;
}) {
  /*
   * Creating Dispatch and Root State for interaction with the reducer State
   */
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();
  const changesState = useSelector((state: RootState) => state);
  // Effect on state change
  useEffect(() => {
    const { commitChartData, commitScale, commitPalette } = convertCommitDataToChangesChartData(
      changesState.commits,
      props.authorList,
      props.settings.splitAdditionsDeletions,
      props.parameters,
    );
    setChartData(commitChartData);
    setChartScale(commitScale);
    setChartPalette(commitPalette);
  }, [changesState]);
  /*
   * -----------------------------
   */

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [chartData, setChartData] = useState<CommitChartData[]>([]);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [chartPalette, setChartPalette] = useState<Palette>({});

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

  useEffect(() => {
    if (!props.chartContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      throttledResize();
    });
    resizeObserver.observe(props.chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [props.chartContainerRef, chartHeight, chartWidth]);

  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters]);

  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataConnection, props.authorList, props.settings]);

  return (
    <>
      <div className={'w-full h-full'} ref={props.chartContainerRef}>
        <StackedAreaChart
          data={chartData}
          scale={chartScale}
          palette={chartPalette}
          sprintList={props.sprintList}
          width={chartWidth}
          height={chartHeight}
          settings={props.settings}
        />
      </div>
    </>
  );
}

export default Chart;
