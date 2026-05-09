import { NetworkChart } from './networkChart.tsx';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { convertToGraphData } from '../utilities/dataConverter.ts';
import { DataState, type DateRange, setDateRange } from '../reducer';
import type { DataPluginAccountIssues } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts';
import type { DataPluginAccountMergeRequests } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { CollaborationSettings } from '../settings/settings.tsx';
import { handlePopoutResizing } from '../../../../../utils/resizing.ts';

type RootState = {
  plugin: {
    issueAccounts: DataPluginAccountIssues[];
    mrAccounts: DataPluginAccountMergeRequests[];
    dataState: DataState;
    dateRange: DateRange;
  };
};

export default function Chart<SettingsType extends CollaborationSettings, DataType>(
  props: VisualizationPluginProperties<SettingsType, DataType>,
) {
  const { store, chartContainerRef, settings } = props;
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.getState() as RootState,
    () => store.getState() as RootState,
  );
  const issueAccounts = state.plugin.issueAccounts ?? [];
  const mrAccounts = state.plugin.mrAccounts ?? [];
  const dataState = state.plugin.dataState;
  const [chartWidth, setChartWidth] = useState(chartContainerRef.current?.offsetWidth ?? 150);
  const [chartHeight, setChartHeight] = useState(chartContainerRef.current?.offsetHeight ?? 100);

  function resize() {
    const el = chartContainerRef.current as HTMLDivElement | null;
    if (!el) return;
    if (el.offsetWidth !== chartWidth) setChartWidth(el.offsetWidth);
    if (el.offsetHeight !== chartHeight) setChartHeight(el.offsetHeight);
  }

  const resizeFnRef = useRef<() => void>(() => {});
  resizeFnRef.current = resize;

  useEffect(() => {
    resize();
  }, [chartContainerRef]);

  useEffect(() => {
    return handlePopoutResizing(store, () => resizeFnRef.current());
  }, [store]);

  useEffect(() => {
    if (props.parameters?.parametersDateRange) {
      // only dispatch if it's a full DateRange
      store.dispatch(setDateRange(props.parameters.parametersDateRange));
    } else {
      // ensure we always have a valid object with strings
      const now = new Date().toISOString();
      store.dispatch(setDateRange({ from: now, to: now }));
    }
  }, [props.parameters.parametersDateRange, store]);

  useEffect(() => {
    store.dispatch({ type: 'REFRESH' });
  }, [store]);

  const graphData = useMemo(() => {
    if (issueAccounts.length === 0 && mrAccounts.length === 0) return { nodes: [], links: [] };
    return convertToGraphData(issueAccounts, mrAccounts, settings);
  }, [issueAccounts, mrAccounts, settings]);

  const networkData = useMemo(() => ({ nodes: graphData.nodes, links: graphData.links }), [graphData]);

  if (dataState === DataState.FETCHING) {
    return (
      <div ref={chartContainerRef} className="w-full h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-accent" />
      </div>
    );
  }
  return (
    <>
      <div className={'w-full h-full'} ref={chartContainerRef}>
        <NetworkChart data={networkData} width={chartWidth} height={chartHeight} />
      </div>
    </>
  );
}
