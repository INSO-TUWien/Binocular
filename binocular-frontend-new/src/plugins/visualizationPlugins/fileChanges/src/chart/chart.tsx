import { StackedAreaChart } from "./stackedAreaChart.tsx";
import { RefObject, useEffect, useState, useMemo } from "react";
import { DataPlugin } from "../../../../interfaces/dataPlugin.ts";
import { SettingsType } from "../settings/settings.tsx";
import { AuthorType } from "../../../../../types/data/authorType.ts";
import {
  convertCommitDataToChangesChartData,
  convertCommitDataToMetrics,
} from "../utilities/dataConverter.ts";
import { SprintType } from "../../../../../types/data/sprintType.ts";
import { throttle } from "throttle-debounce";
import { useDispatch, useSelector } from "react-redux";
import { ParametersType } from "../../../../../types/parameters/parametersType.ts";
import { Store } from "@reduxjs/toolkit";
import { DataState, setDateRange } from "../reducer";
import { MetricsChart } from "./metricsCharts.tsx";
import { DataPluginCommit } from "../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts";

export interface CommitChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

function Chart(props: {
  settings: SettingsType;
  dataConnection: DataPlugin;
  authorList: AuthorType[];
  sprintList: SprintType[];
  parameters: ParametersType;
  chartContainerRef: RefObject<HTMLDivElement>;
  store: Store;
}) {
  /*
   * Creating Dispatch and Root State for interaction with the reducer State
   */
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();
  /*
   * -----------------------------
   */
  //Redux Global State
  const current_file_total_commits: DataPluginCommit[] = useSelector(
    (state: RootState) => state.plugin.current_file_total_commits,
  );
  const file_name = useSelector((state: RootState) => state.plugin.current_file);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);
  const dateOverallFirstCommit = useSelector(
    (state: RootState) => state.plugin.dateOfOverallFirstCommit,
  );
  const dateOverallLastCommit = useSelector(
    (state: RootState) => state.plugin.dateOfOverallLastCommit,
  );
  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  const [chartData, setChartData] = useState<CommitChartData[]>([]);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [chartPalette, setChartPalette] = useState<Palette>({});

  const [mpc, setMpc] = useState<number>(0);
  const [entropy, setEntropy] = useState<number>(0);
  const [maxBurst, setMaxBurst] = useState<number>(0);
  const [maxChangeset, setMaxChangeset] = useState<number>(0);
  const [avgChangeset, setAvgChangeset] = useState<number>(0);

  const current_file_commits = useMemo(() => {
    if (!current_file_total_commits) return [];
    return current_file_total_commits.filter(
      (commit) =>
        commit.date >= props.parameters.parametersDateRange.from &&
        commit.date <= props.parameters.parametersDateRange.to,
    );
  }, [current_file_total_commits, props.parameters.parametersDateRange]);

  /*
  Throttle the resize of the svg (refresh rate) to every 1s to not overwhelm the renderer,
  This isn't really necessary for this visualization, but for bigger visualization this can be quite essential
   */
  const throttledResize = throttle(
    1000,
    () => {
      if (!props.chartContainerRef.current) return;
      if (props.chartContainerRef.current?.offsetWidth !== chartWidth) {
        setChartWidth(props.chartContainerRef.current.offsetWidth);
      }
      if (props.chartContainerRef.current?.offsetHeight !== chartHeight) {
        setChartHeight(props.chartContainerRef.current.offsetHeight);
      }
    },
    { noLeading: false, noTrailing: false },
  );

  function resize() {
    if (!props.chartContainerRef.current) return;
    if (props.chartContainerRef.current?.offsetWidth !== chartWidth) {
      setChartWidth(props.chartContainerRef.current.offsetWidth);
    }
    if (props.chartContainerRef.current?.offsetHeight !== chartHeight) {
      setChartHeight(props.chartContainerRef.current.offsetHeight);
    }
  }

  useEffect(() => {
    resize();
  }, [props.chartContainerRef, chartHeight, chartWidth]);

  //Resize Observer -> necessary for dynamically refreshing d3 chart
  useEffect(() => {
    if (!props.chartContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      throttledResize();
    });
    resizeObserver.observe(props.chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [props.chartContainerRef, chartHeight, chartWidth]);

  //Effect on data change
  useEffect(() => {
    const { commitChartData, commitScale, commitPalette } =
      convertCommitDataToChangesChartData(
        current_file_commits,
        props.authorList,
        props.settings.splitAdditionsDeletions,
        props.parameters,
      );
    setChartData(commitChartData);
    setChartScale(commitScale);
    setChartPalette(commitPalette);
  }, [
    current_file_commits,
    props.authorList,
    props.parameters,
    props.settings.splitAdditionsDeletions,
  ]);

  useEffect(() => {
    const { mpc, entropy, maxBurst, maxChangeset, avgChangeset } =
      convertCommitDataToMetrics(
        current_file_total_commits,
        dateOverallFirstCommit,
        dateOverallLastCommit,
      );

    setMpc(mpc);
    setEntropy(entropy);
    setMaxBurst(maxBurst);
    setMaxChangeset(maxChangeset);
    setAvgChangeset(avgChangeset);
  }, [
    current_file_total_commits,
    dateOverallFirstCommit,
    dateOverallLastCommit,
  ]);

  //Set Global state when parameters change. This will also conclude in a refresh of the data.
  useEffect(() => {
    dispatch(setDateRange(props.parameters.parametersDateRange));
  }, [props.parameters]);

  //Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({
      type: "REFRESH",
    });
  }, [props.dataConnection]);

  if (props.settings.file == null || props.settings.file === "") {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="text-center">
          <span className="text-lg font-semibold">No file selected</span>
          <p className="text-sm text-gray-500">
            Please select a file to view the chart.
          </p>
        </div>
      </div>
    );
  }

  if (!props.settings.showExtraMetrics) {
    if (
      current_file_total_commits == null ||
      current_file_total_commits.length === 0
    ) {
      return (
        <div className="w-full h-full flex justify-center items-center">
          <div className="text-center">
            <span className="text-lg font-semibold">No commits found</span>
            <p className="text-sm text-gray-500">
              Please select a file with commits to view the chart.
            </p>
          </div>
        </div>
      );
    }

    if (current_file_commits == null || current_file_commits.length === 0) {
      return (
        <div className="w-full h-full flex justify-center items-center">
          <div className="text-center">
            <span className="text-lg font-semibold">
              No commits found in the selected time range.
            </span>
            <p className="text-sm text-gray-500">
              Please select a time range with enough data.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <div
        className={"w-full h-full flex justify-center items-center"}
        ref={props.chartContainerRef}
      >
        {dataState === DataState.EMPTY && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div>
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState === DataState.COMPLETE &&
          !props.settings.showExtraMetrics && (
            <StackedAreaChart
              data={chartData}
              scale={chartScale}
              palette={chartPalette}
              sprintList={props.sprintList}
              width={chartWidth}
              height={chartHeight}
              settings={props.settings}
            />
          )}
        {dataState === DataState.COMPLETE && props.settings.showExtraMetrics && (
          <MetricsChart
            width={chartWidth}
            height={chartHeight}
            metrics={{
              mpc: mpc,
              entropy: entropy,
              maxburst: maxBurst,
              maxchangeset: maxChangeset,
              avgchangeset: avgChangeset,
            }}
          />
        )}
      </div>
    </>
  );
}

export default Chart;
