import { ColumnChart, type ColumnChartData, type Palette } from './columnChart.tsx';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { DataState} from '../reducer';
import type { LizardSettings } from '../settings/settings.tsx';
import { handlePopoutResizing } from '../../../../../utils/resizing.ts';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { DataPluginLizard } from '../../../../../interfaces/dataPluginInterfaces/dataPluginLizards';
import { convertToChartData } from '../utilities/dataConverter';

export type { ColumnChartData, Palette };

function Chart(props: VisualizationPluginProperties<LizardSettings, DataPluginLizard>) {
  const { store } = props;
  type RootState = ReturnType<typeof store.getState>;

  /*
   * -----------------------------
   */
  //Redux Global State
  const lizardRows = useSelector((state: RootState) => state.plugin.lizardRows);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);
  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);
  const [chartData, setChartData] = useState<ColumnChartData[]>([]);
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
    try {
      setCalculating(true);
      const { chartData, scale, palette } = convertToChartData(lizardRows, props);
      setChartData(chartData);
      setChartScale(scale);
      setChartPalette(palette);
      setCalculating(false);
    } catch (e) {
      setCalculating(false);
      console.error(e);
    }
  }, [lizardRows, props.settings]);

  useEffect(() => {
    store.dispatch({
      type: 'REFRESH',
    });
  }, [store, props.dataConnection]);

  return (
    <div className="w-full h-full flex justify-center items-center" ref={props.chartContainerRef}>
      {dataState === DataState.EMPTY && <div>NoData</div>}

      {(dataState === DataState.FETCHING || calculating) && (
        <div>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {dataState === DataState.COMPLETE &&
        !calculating &&
        (chartData.length !== 0 ? (
          <ColumnChart
            data={chartData}
            scale={chartScale}
            palette={chartPalette}
            width={chartWidth}
            height={chartHeight}
            settings={props.settings}
          />
        ) : (
          <div>No Data matching the selected Parameters!</div>
        ))}
    </div>
  );
}

export default Chart;
