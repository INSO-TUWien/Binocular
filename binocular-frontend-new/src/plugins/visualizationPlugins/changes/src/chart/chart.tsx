import { StackedAreaChart } from './stackedAreaChart.tsx';
import { createRef, useEffect, useState } from 'react';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { SettingsType } from '../settings/settings.tsx';
import { Author } from '../../../../../types/authorType.ts';
import { convertCommitDataToChangesChartData } from '../utilies/dataConverter.ts';

export interface CommitChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

function Chart(props: { settings: SettingsType; dataConnection: DataPlugin; authorList: Author[] }) {
  const chartContainerRef = createRef<HTMLDivElement>();

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [chartData, setChartData] = useState<CommitChartData[]>([]);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [chartPalette, setChartPalette] = useState<Palette>({});

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

  useEffect(() => {
    props.dataConnection.commits
      .getAll('2010-01-01T12:00:00.000Z', new Date().toISOString())
      .then((commits) => {
        const { commitChartData, commitScale, commitPalette } = convertCommitDataToChangesChartData(commits, props.authorList);
        setChartData(commitChartData);
        setChartScale(commitScale);
        setChartPalette(commitPalette);
      })
      .catch(() => console.log('Promise Error'));
  }, [props.dataConnection, props.authorList]);

  return (
    <>
      <div className={'w-full h-full'} ref={chartContainerRef}>
        <StackedAreaChart data={chartData} scale={chartScale} palette={chartPalette} width={chartWidth} height={chartHeight} />
      </div>
    </>
  );
}

export default Chart;
