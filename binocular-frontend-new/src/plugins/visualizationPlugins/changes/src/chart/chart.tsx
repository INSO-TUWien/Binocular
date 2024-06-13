import { StackedAreaChart } from './stackedAreaChart.tsx';
import { createRef, useEffect, useState } from 'react';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { SettingsType } from '../settings/settings.tsx';
import { Author } from '../../../../../types/authorType.ts';
import { convertCommitDataToChangesChartData } from '../utilies/dataConverter.ts';
import { ParametersInitialState } from '../../../../../redux/parametersReducer.ts';

export interface CommitChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

function Chart(props: { settings: SettingsType; dataConnection: DataPlugin; authorList: Author[]; parameters: ParametersInitialState }) {
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
      .getAll(props.parameters.parametersDateRange.from, props.parameters.parametersDateRange.to)
      .then((commits) => {
        const { commitChartData, commitScale, commitPalette } = convertCommitDataToChangesChartData(
          commits,
          props.authorList,
          props.settings.splitAdditionsDeletions,
          props.parameters,
        );
        setChartData(commitChartData);
        setChartScale(commitScale);
        setChartPalette(commitPalette);
      })
      .catch(() => console.log('Promise Error'));
  }, [props.dataConnection, props.authorList, props.settings, props.parameters]);

  return (
    <>
      <div className={'w-full h-full'} ref={chartContainerRef}>
        <StackedAreaChart
          data={chartData}
          scale={chartScale}
          palette={chartPalette}
          width={chartWidth}
          height={chartHeight}
          visualizationStyle={props.settings.visualizationStyle}
        />
      </div>
    </>
  );
}

export default Chart;
