import { NetworkChart } from "./networkChart.tsx";
import { RefObject, useEffect, useMemo, useState } from "react";
import { SettingsType } from "../settings/settings.tsx";
import { Store } from "@reduxjs/toolkit";
import { convertIssuesToGraphData } from "../utilities/dataConverter.ts";
import { DataState } from "../reducer";
import { DataPluginAccount } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccount.ts";

export default function Chart(
  props: {
    settings: SettingsType;
    dataConnection: any;
    chartContainerRef: RefObject<HTMLDivElement>;
    showAfterCooldown: boolean;
  } & { store: Store },
) {
  const chartContainerRef = props.chartContainerRef;

  // force re-render on change
  const [, forceUpdate] = useState(0);
  useEffect(
    () => props.store.subscribe(() => forceUpdate((v) => v + 1)),
    [props.store],
  );

  // dispatch your refresh
  useEffect(() => {
    props.store.dispatch({ type: "REFRESH" });
  }, [props.store]);

  // read slice from store
  const state = props.store.getState() as {
    accounts: DataPluginAccount[];
    dataState: DataState;
  };
  const { accounts, dataState } = state;

  const graphData = useMemo(
    () => convertIssuesToGraphData(accounts, { settings: props.settings }),
    [accounts, props.settings.minEdgeValue, props.settings.maxEdgeValue],
  );

  if (dataState !== DataState.COMPLETE || accounts.length === 0) {
    return (
      <div
        ref={props.chartContainerRef}
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
          width={chartContainerRef.current!.offsetWidth}
          height={chartContainerRef.current!.offsetHeight}
          color={props.settings.color}
        />
      </div>
    </>
  );
}
