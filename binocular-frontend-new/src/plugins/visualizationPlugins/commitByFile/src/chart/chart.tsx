import { createRef, useEffect, useState } from 'react';
import { CommitByFileViz } from './commitByFileViz.tsx';
import type { SettingsType } from '../settings/settings.tsx';
import type { DataPluginCommitFile } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';
import { DataState, setSha } from '../reducer';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import type { DataPluginCommitShort } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';

function Chart(props: Readonly<VisualizationPluginProperties<SettingsType, DataPluginCommitFile>>) {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.plugin.commitFiles);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);
  const commits = useSelector((state: RootState) => state.plugin.commits);
  const commitOptions = commits.map((commit: DataPluginCommitShort) => ({
    value: commit.sha,
    label: `${commit.messageHeader} (${commit.sha.slice(0, 7)})`,
  }));

  const [selectedCommit, setSelectedCommit] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataConnection]);

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
        setChartHeight(chartContainerRef.current.offsetHeight - 20);
      }
    });
    resizeObserver.observe(chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [chartContainerRef, chartHeight, chartWidth]);

  const handleCommitSelect = (selectedOption: { value: string; label: string } | null) => {
    if (!selectedOption) {
      return;
    }
    setSelectedCommit(selectedOption);
    dispatch(setSha(selectedOption.value));
  };

  return (
    <div className={'w-full h-full flex flex-col items-center'} ref={chartContainerRef}>
      {dataState !== DataState.FETCHING && commits.length > 0 && (
        <Select
          className="text-sm w-100 m-2"
          value={selectedCommit}
          options={commitOptions}
          onChange={handleCommitSelect}
          placeholder="Select a commit..."
          isSearchable
        />
      )}
      {dataState !== DataState.FETCHING && commits.length === 0 && <div>No Commits Found</div>}
      {dataState === DataState.EMPTY && <div>No Data</div>}
      {dataState === DataState.FETCHING && (
        <div>
          <span className="loading loading-spinner loading-lg text-accent"></span>
        </div>
      )}
      {dataState === DataState.COMPLETE && <CommitByFileViz data={data} width={chartWidth} height={chartHeight} />}
    </div>
  );
}

export default Chart;
