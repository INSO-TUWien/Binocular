import { AreaChart } from './areaChart.tsx';
import styles from './chatStyles.module.scss';
import { createRef, useEffect, useState } from 'react';

function Chart() {
  const data = [
    { x: 1, y: 90 },
    { x: 2, y: 12 },
    { x: 3, y: 34 },
    { x: 4, y: 53 },
    { x: 5, y: 52 },
    { x: 6, y: 9 },
    { x: 7, y: 18 },
    { x: 8, y: 78 },
    { x: 9, y: 28 },
    { x: 10, y: 34 },
  ];

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
  }, [chartContainerRef]);

  return (
    <>
      <div className={styles.chartContainer} ref={chartContainerRef}>
        <AreaChart data={data} width={chartWidth} height={chartHeight} />
      </div>
    </>
  );
}

export default Chart;
