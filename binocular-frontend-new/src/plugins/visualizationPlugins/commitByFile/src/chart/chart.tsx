import { createRef, useEffect, useState } from 'react';
import { CommitChangeViz } from './newVis.tsx';

function Chart(props) {
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
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className={'w-full h-full flex content-center align-center'}
      ref={chartContainerRef}>
      <CommitChangeViz data={props.store.getState().commitFiles} width={chartWidth} height={chartHeight} />
    </div>
  );
}

export default Chart;
