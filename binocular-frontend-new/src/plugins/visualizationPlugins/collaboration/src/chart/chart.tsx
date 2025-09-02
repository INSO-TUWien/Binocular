import { NetworkChart } from "./networkChart.tsx";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { convertIssuesToGraphData } from "../utilities/dataConverter.ts";
import { DataState, type DateRange, setDateRange } from "../reducer";
import type { DataPluginAccountIssues } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts";
import type { VisualizationPluginProperties } from "../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts";
import type { CollaborationSettings } from "../settings/settings.tsx";
import { handelPopoutResizing } from "../../../../utils/resizing.ts";

type RootState = {
  plugin: {
    accounts: DataPluginAccountIssues[];
    dataState: DataState;
    dateRange: DateRange;
  };
};

export default function Chart<
  SettingsType extends CollaborationSettings,
  DataType,
>(props: VisualizationPluginProperties<SettingsType, DataType>) {
  const { store, chartContainerRef, settings } = props;
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.getState() as RootState,
    () => store.getState() as RootState,
  );
  const accounts = state.plugin.accounts ?? [];
  const dataState = state.plugin.dataState;
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(150);

  function resize() {
    const el = chartContainerRef.current as HTMLDivElement | null;
    if (!el) return;
    if (el.offsetWidth !== chartWidth) setChartWidth(el.offsetWidth);
    if (el.offsetHeight !== chartHeight) setChartHeight(el.offsetHeight);
  }
  handelPopoutResizing(store, () => resize());

  useEffect(() => {
    if (props.parameters?.parametersDateRange) {
      // only dispatch if it's a full DateRange
      console.log(props.parameters.parametersDateRange);
      store.dispatch(setDateRange(props.parameters.parametersDateRange));
    } else {
      // ensure we always have a valid object with strings
      const now = new Date().toISOString();
      store.dispatch(setDateRange({ from: now, to: now }));
    }
  }, [props.parameters, store]);

  useEffect(() => {
    store.dispatch({ type: "REFRESH" });
  }, [store]);

  const graphData = useMemo(() => {
    if (!accounts || accounts.length === 0) return { nodes: [], links: [] };
    return convertIssuesToGraphData(accounts, settings);
  }, [accounts, settings.minEdgeValue, settings.maxEdgeValue]);

  if (dataState === DataState.FETCHING) {
    return (
      <div
        ref={chartContainerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <span className="loading loading-spinner loading-lg text-accent" />
      </div>
    );
  }
  return (
    <>
      <div className={"w-full h-full"} ref={chartContainerRef}>
        <NetworkChart
          data={{
            nodes: graphData.nodes,
            links: graphData.links,
          }}
          width={chartWidth}
          height={chartHeight}
        />
      </div>
    </>
  );
}
