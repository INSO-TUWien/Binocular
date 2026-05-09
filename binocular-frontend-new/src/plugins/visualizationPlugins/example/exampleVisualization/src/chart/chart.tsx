import { AreaChart } from './areaChart.tsx';
import { useEffect, useRef, useState } from 'react';
import type { SettingsType } from '../settings/settings.tsx';
import { handlePopoutResizing } from '../../../../../utils/resizing.ts';
import type { Store } from '@reduxjs/toolkit';

function Chart(props: { settings: SettingsType; store: Store }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  /**
   * RESIZE Logic START
   */
  function resize() {
    if (!chartContainerRef.current) return;
    if (chartContainerRef.current?.offsetWidth !== chartWidth) {
      setChartWidth(chartContainerRef.current.offsetWidth);
    }
    if (chartContainerRef.current?.offsetHeight !== chartHeight) {
      setChartHeight(chartContainerRef.current.offsetHeight);
    }
  }

  const resizeFnRef = useRef<() => void>(() => {});
  resizeFnRef.current = resize;

  useEffect(() => {
    resize();
  }, [chartContainerRef]);

  useEffect(() => {
    return handlePopoutResizing(props.store, () => resizeFnRef.current());
  }, [props.store]);
  /**
   * RESIZE Logic END
   */

  return (
    <>
      <div className={'w-full h-full'} ref={chartContainerRef}>
        <AreaChart data={props.settings.data} width={chartWidth} height={chartHeight} color={props.settings.color} />
      </div>
    </>
  );
}

export default Chart;
