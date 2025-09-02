import { NetworkChart } from "./networkChart.tsx";
import {
  RefObject,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { SettingsType } from "../settings/settings.tsx";
import { Store } from "@reduxjs/toolkit";
import { convertIssuesToGraphData } from "../utilities/dataConverter.ts";
import { DataState, DateRange, setDateRange } from "../reducer";
import { DataPluginAccountIssues } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts";

type RootState = {
  accounts: DataPluginAccountIssues[];
  dataState: DataState;
  dateRange: DateRange;
};

type ChartProps = {
  settings: SettingsType;
  dataConnection: any;
  chartContainerRef: RefObject<HTMLDivElement>;
  store: Store<RootState>;
  parameters?: {
    parametersDateRange?: DateRange;
  };
};

export default function Chart(props: ChartProps) {
  const { store, chartContainerRef, settings } = props;
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.getState() as RootState,
    () => store.getState() as RootState,
  );
  const { accounts, dataState } = state;

  useEffect(() => {
    if (props.parameters?.parametersDateRange) {
      store.dispatch(setDateRange(props.parameters.parametersDateRange));
    }
  }, [props.parameters, store]);

  useEffect(() => {
    store.dispatch({ type: "REFRESH" });
  }, [store]);

  const graphData = useMemo(
    () => convertIssuesToGraphData(accounts, settings),
    [accounts, settings.minEdgeValue, settings.maxEdgeValue],
  );

  if (dataState !== DataState.COMPLETE || accounts.length === 0) {
    return (
      <div
        ref={chartContainerRef}
        className="w-full h-full flex items-center justify-center"
      >
        Loading graph…
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
          width={chartContainerRef.current!.clientWidth}
          height={chartContainerRef.current!.clientHeight}
        />
      </div>
    </>
  );
}
