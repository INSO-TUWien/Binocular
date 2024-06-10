import { createRef, useEffect, useState } from 'react';
import { SunburstChart } from './sunburstChart.tsx';

function Chart() {
  const chartContainerRef = createRef<HTMLDivElement>();

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  useEffect(() => {
    if (chartContainerRef.current) {
      if (chartContainerRef.current?.offsetWidth !== chartWidth) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
      if (chartContainerRef.current?.offsetHeight !== chartHeight) {
        setChartHeight(chartContainerRef.current.offsetHeight);
      }
    }
  }, [chartContainerRef, chartHeight, chartWidth]);

  return (
    <>
      <div className={'w-full h-full'} ref={chartContainerRef}>
        <SunburstChart width={chartWidth} height={chartHeight} />
      </div>
    </>
  );
}

export default Chart;
