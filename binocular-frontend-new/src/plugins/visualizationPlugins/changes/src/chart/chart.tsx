import { AreaChart } from './areaChart.tsx';
import { createRef, useEffect, useRef, useState } from 'react';
import { Commit, DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { SettingsType } from '../settings/settings.tsx';

function Chart(props: { settings: SettingsType; dataConnection: DataPlugin }) {
  const chartContainerRef = createRef<HTMLDivElement>();

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const commitData = useRef<Commit[]>([]);

  props.dataConnection.commits
    .getAll('2010-01-01T12:00:00.000Z', new Date().toISOString())
    .then((commits) => {
      console.log(commits);
      commitData.current = commits;
    })
    .catch(() => console.log('Promise Error'));

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
      <div className={'w-full h-full'} ref={chartContainerRef}>
        <AreaChart data={commitData.current} width={chartWidth} height={chartHeight} color={props.settings.color} />
      </div>
    </>
  );
}

export default Chart;
