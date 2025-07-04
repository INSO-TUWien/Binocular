import { extractOwnershipFromFileExcludingCommits } from '../utils/ownershipUtils.ts';
import { useDispatch, useSelector } from 'react-redux';
import StackedAreaChart from './StackedAreaChart';
import * as d3 from 'd3';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { CodeOwnerShipSettings } from '../settings/settings.tsx';
import { Palette } from '../../../../../types/data/authorType.ts';
import { FileOwnershipCollection, OwnershipData, PreviousFileData } from '../../../../../types/data/ownershipType.ts';
import { DataState, setCurrentBranch } from '../reducer';
import { getBranches } from '../saga/helper.ts';
import { handelPopoutResizing } from '../../../../utils/resizing.ts';
import { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';

function Chart<SettingsType extends CodeOwnerShipSettings, DataType>(props: VisualizationPluginProperties<SettingsType, DataType>) {
  // /!*
  //  * Creating Dispatch and Root State for interaction with the reducer State
  //  *!/
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();
  // /!*
  //  * -----------------------------
  //  *!/
  // //Redux Global State
  const data = useSelector((state: RootState) => state.plugin.data);
  const dataState = useSelector((state: RootState) => state.plugin.dataState);

  //React Component State
  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(150);
  const [chartScale, setChartScale] = useState<number[]>([]);
  const [chartPalette, setChartPalette] = useState<Palette>({});

  //local state used for the chart
  const [ownershipData, setOwnershipData] = useState<OwnershipData[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{ [id: string]: number }[]>([]);

  //global state
  const relevantOwnershipData = data.rawData;
  const fileList = props.fileList;
  const previousFilenames: { [id: string]: PreviousFileData[] } = data.previousFilenames;
  const granularity = props.parameters.parametersGeneral.granularity;

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

  handelPopoutResizing(props.store, resize);

  const resetData = () => {
    setKeys([]);
    setChartData([]);
    setChartScale([]);
  };

  //when a new branch is selected, new data is fetched. When the data is ready, prepare it for further processing.
  useEffect(() => {
    if (relevantOwnershipData === undefined || relevantOwnershipData === null || fileList === undefined || fileList === null) {
      return;
    }
    const activeFiles: { [id: string]: boolean } = {};
    fileList.map((item) => {
      activeFiles[item.element.path] = item.checked;
    });

    const resultOwnershipData: OwnershipData[] = [];

    //stores the current ownership distribution for each file
    const fileCache: FileOwnershipCollection = {};

    //step through the commits sequentially, starting with the oldest one
    for (const commit of relevantOwnershipData) {
      const commitResult: OwnershipData = { sha: commit.sha, date: commit.date, ownership: {} };

      //update fileCache for each file this commit touches
      for (const file of commit.files) {
        //if the file was deleted in this commit, delete it from the filecache
        if (file.action === 'deleted') {
          delete fileCache[file.path];
        } else {
          //if the file was either added or modified, we add it to the filecache (if it is relevant)
          //the file is relevant if it is either one of the currently active files
          // or if it is a previous version of an active file.
          let relevant = activeFiles[file.path];

          if (!relevant) {
            //look at the previous filenames of all active files
            for (const [fileName, previousNames] of Object.entries(previousFilenames)) {
              if (!activeFiles[fileName]) continue;
              if (relevant) break;
              //for all previous filenames of the file we are currently looking at
              for (const name of previousNames) {
                //if this old filename is the one the current commit touches
                // (same path and committed at a time when the file had that path),
                // this file is relevant
                if (
                  name.oldFilePath === file.path &&
                  new Date(name.hasThisNameFrom) <= new Date(commit.date) &&
                  new Date(commit.date) <= new Date(name.hasThisNameUntil)
                ) {
                  relevant = true;
                  break;
                }
              }
            }
          }

          if (relevant) {
            fileCache[file.path] = extractOwnershipFromFileExcludingCommits(file.ownership, []);
          }
        }
      }
      let sum = 0;
      //now filecache stores the current ownership for each file that exists at the time of the current commit
      for (const [, fileOwnershipData] of Object.entries(fileCache)) {
        for (const ownershipOfUser of fileOwnershipData) {
          if (commitResult.ownership[ownershipOfUser.user]) {
            commitResult.ownership[ownershipOfUser.user] += ownershipOfUser.ownedLines;
          } else {
            commitResult.ownership[ownershipOfUser.user] = ownershipOfUser.ownedLines;
          }
          sum += ownershipOfUser.ownedLines;
        }
      }
      if (sum !== 0) {
        resultOwnershipData.push(commitResult);
      }
    }
    setOwnershipData(resultOwnershipData);
  }, [relevantOwnershipData, previousFilenames]);

  //everytime the settings change (different files selected, mode changed etc.) recompute the chart data
  useEffect(() => {
    //if the global state has not loaded yet, return
    if (ownershipData === undefined || ownershipData === null) {
      return;
    }

    if (ownershipData.length === 0) {
      resetData();
    }

    //filter ownership data for commits that are in the right timespan
    const filteredOwnershipData = ownershipData.filter((o) => {
      const date = new Date(o.date);
      const minDate = props.parameters.parametersDateRange.from ? new Date(props.parameters.parametersDateRange.from) : new Date(0);
      const maxDate = props.parameters.parametersDateRange.to ? new Date(props.parameters.parametersDateRange.to) : new Date();
      return minDate <= date && date <= maxDate;
    });
    const palette: Palette = {};

    //compute scale
    // in relative mode, the scale is always min=0, max=1.
    // in absolute mode, the max value has to be computed
    if (props.settings.displayMode === 'relative') {
      setChartScale([0, 1]);
    } else {
      let max = 0;
      for (const commit of filteredOwnershipData) {
        let tmp = 0;
        for (const [, ownership] of Object.entries(commit.ownership)) {
          tmp += ownership;
        }
        if (tmp > max) {
          max = tmp;
        }
      }
      setChartScale([0, max * 1.1]);
    }

    //get all users
    const tempKeys: string[] = [];
    const selectedAuthors = props.authorList.filter((author) => author.selected && author.parent == -1);
    const mergedAuthors = props.authorList.filter((author) => author.selected && author.parent > 0);
    const otherAuthors = props.authorList.filter((author) => author.selected && author.parent == 0);
    selectedAuthors.forEach((author) => tempKeys.push(author.user.gitSignature));

    setKeys(tempKeys);

    const result = filteredOwnershipData.map((d) => {
      const result: { [id: string]: number } = {};
      //set the date as timestamp (in ms)
      result.date = new Date(d.date).getTime();

      //set the ownership to 0 for all users
      for (const name of tempKeys) {
        result[name] = 0;
        palette[name] = props.authorList.find((user) => user.user.gitSignature == name)!.color.main;
      }

      //also for special user "other"
      result['other'] = 0;

      //set the ownership of everyone to the real value
      for (const [authorName, ownership] of Object.entries(d.ownership)) {
        //if the author is in the "other" category, add the ownership to the "other" author
        if (otherAuthors.map((oa) => oa.user.gitSignature).includes(authorName)) {
          result['other'] += ownership;
        }
        if (keys.includes(authorName)) result[authorName] += ownership;
        else {
          //check if the author is part of a merges author from the universal settings
          for (const mergedAuthor of mergedAuthors) {
            if (mergedAuthor.user.gitSignature.includes(authorName)) {
              const mainAuthor = selectedAuthors.find((author) => author.id == mergedAuthor.parent)?.user.gitSignature;
              if (mainAuthor) result[mainAuthor] += ownership;
              break;
            }
          }
        }
      }
      return result;
    });

    if (granularity === 'days') {
      setChartData(result);
    } else {
      let groupedResult;

      if (granularity === 'years') {
        groupedResult = _.groupBy(result, (dataPoint) => '' + new Date(dataPoint.date).getFullYear());
      } else if (props.parameters.parametersGeneral.granularity === 'months') {
        groupedResult = _.groupBy(
          result,
          (dataPoint) => '' + new Date(dataPoint.date).getMonth() + '-' + new Date(dataPoint.date).getFullYear(),
        );
      } else if (granularity === 'weeks') {
        groupedResult = _.groupBy(result, (dataPoint) => {
          const d = new Date(dataPoint.date);
          const onejan = new Date(d.getFullYear(), 0, 1);
          const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          return '' + week + '-' + d.getFullYear();
        });
      } else {
        //invalid granularity
        console.log('Error in Code Ownership: granularity "' + granularity + '" not valid');
        setChartData(result);
        return;
      }

      const coarseResult: { [id: string]: number }[] = [];

      const firstDataPoint = result.sort((a, b) => a.date - b.date)[0];
      if (firstDataPoint) {
        coarseResult.push(firstDataPoint);
      }

      for (const [, points] of Object.entries(groupedResult)) {
        const dataPoints = points.sort((a, b) => a.date - b.date);
        //only consider last element
        coarseResult.push(dataPoints.slice(-1)[0]);
      }
      setChartPalette(palette);
      setChartData(coarseResult);
    }
  }, [ownershipData, granularity, props.settings.displayMode, props.parameters.parametersDateRange, props.authorList]);

  useEffect(() => {
    void getBranches(props.dataConnection).then((branches) => (props.settings.allBranches = branches));
  }, [props.dataConnection]);

  useEffect(() => {
    dispatch(setCurrentBranch(props.settings.currentBranch ? props.settings.currentBranch : 0));
  }, [props.settings.currentBranch]);

  //Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataConnection, fileList]);

  return (
    <>
      <div className={'w-full h-full flex justify-center items-center'} ref={props.chartContainerRef}>
        {dataState === DataState.EMPTY && ownershipData.length === 0 && <div>NoData</div>}
        {dataState === DataState.FETCHING && (
          <div>
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}
        {dataState !== DataState.FETCHING && ownershipData.length > 0 && (
          <StackedAreaChart
            content={chartData}
            palette={chartPalette}
            paddings={{ top: 20, left: 70, bottom: 40, right: 30 }}
            height={chartHeight}
            width={chartWidth}
            yDims={chartScale}
            d3offset={props.settings.displayMode === 'relative' ? d3.stackOffsetExpand : d3.stackOffsetNone}
            resolution={granularity}
            keys={keys}
            order={keys.reverse()}
          />
        )}
      </div>
    </>
  );
}

export default Chart;
