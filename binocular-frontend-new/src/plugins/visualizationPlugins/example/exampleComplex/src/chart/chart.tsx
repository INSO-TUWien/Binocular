import { useEffect, useRef, useState } from 'react';
import { SunburstChart } from './sunburstChart.tsx';
import type { Store } from '@reduxjs/toolkit';
import { handlePopoutResizing } from '../../../../../utils/resizing.ts';

function Chart(props: { store: Store }) {
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
        <SunburstChart width={chartWidth} height={chartHeight} />
      </div>
    </>
  );
}

export default Chart;
