"use-strict";

import { useSelector } from "react-redux";
import StackedAreaChart from "../../../components/StackedAreaChart";
import * as d3 from "d3";
import { useState, useEffect } from "react";

export default () => {
  
  //local state used for the chart
  const [keys, setKeys] = useState([]);
  const [scale, setScale] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartComponent, setChartComponent] = useState(null);

  //global state
  const ownershipState = useSelector((state) => state.visualizations.codeOwnership.state);
  const isLoading = ownershipState.data.isFetching;
  const ownershipData = ownershipState.data.data.ownershipData;
  const displayMode = ownershipState.config.mode;
  const currentBranch = ownershipState.config.currentBranch;
  const activeFiles = ownershipState.config.activeFiles;

  const universalSettings = useSelector((state) => state.universalSettings);
  const selectedAuthors = universalSettings.selectedAuthorsGlobal;
  const otherAuthors = universalSettings.otherAuthors;
  const mergedAuthors = universalSettings.mergedAuthors;
  const tooltipGranularity = universalSettings.chartResolution;
  const authorColors = universalSettings.universalSettingsData.data.palette;
  const dateFrom = universalSettings.chartTimeSpan.from;
  const dateUntil = universalSettings.chartTimeSpan.to;

  const resetData = () => {
    setKeys([]);
    setChartData([]);
    setScale([]);
  }

  //everytime the settings change (new data comes in, different files selected, mode changed etc.) recompute the chart data
  useEffect(() => {
    //if the global state has not loaded yet, return
    if (
      ownershipData === undefined ||
      ownershipData === null
    ) {
      return;
    }

    if (ownershipData.length === 0) {
        resetData();
    }

    //filter ownership data for commits that are in the right timespan
    const filteredOwnershipData = ownershipData.filter((o) => {
      const date = new Date(o.date)
      const minDate = new Date(dateFrom);
      const maxDate = new Date(dateUntil);
      return minDate <= date && date <= maxDate;
    });


    //get all stakeholders
    let tempKeys = [];
    filteredOwnershipData.map((d) => {
      for (const [authorName] of Object.entries(d.ownership)) {
        //only display authors that are selected in the universal settings
        if (!tempKeys.includes(authorName) && selectedAuthors.includes(authorName)) {
          tempKeys.push(authorName);
        }
      }
    });
    tempKeys.push('other')

    setKeys(tempKeys);

    setChartData(
      filteredOwnershipData.map((d) => {
        let result = {};
        //set the date as timestamp (in ms)
        result.date = new Date(d.date).getTime();

        //set the ownership to 0 for all stakeholders
        for (const name of tempKeys) {
          result[name] = 0;
        }

        //also for special stakeholder "other"
        result['other'] = 0;

        //set the ownership of everyone to the real value
        for (const [authorName, ownership] of Object.entries(d.ownership)) {
          //if the author is in the "other" category, add the ownership to the "other" author
          if (otherAuthors.map((oa) => oa.signature).includes(authorName)) {
            result['other'] += ownership;
          }

          //check if the author is part of a merges author from the universal settings
          for (const mergedAuthor of mergedAuthors) {
            if (mergedAuthor.committers.map((c) => c.signature).includes(authorName)) {
              result[mergedAuthor.mainCommitter] += ownership;
              break;
            }
          }
        }
        return result;
      })
    );

    //compute scale
    // in relative mode, the scale is always min=0, max=1.
    // in absolute mode, the max value has to be computed
    if (displayMode === 'relative') {
      setScale([0,1]);
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
      setScale([0, max * 1.1]);
    }
  }, [ownershipData, displayMode, universalSettings]);



  //check if the data needed for the chart has all been set
  useEffect(() => {
      
    if(chartData && chartData.length !== 0 && scale && scale.length !== 0 && keys && keys.length !== 0) {

      setChartComponent(
        <StackedAreaChart
          content={chartData}
          palette={authorColors}
          paddings={{ top: 20, left: 70, bottom: 40, right: 30 }}
          yDims={scale}
          d3offset={displayMode === 'relative' ? d3.stackOffsetExpand : d3.stackOffsetNone}
          resolution={tooltipGranularity}
          keys={keys}
          order={keys.reverse()}
        />
      )

      
    } else {
      setChartComponent(null)
    }
  
  }, [chartData, scale, keys, authorColors])

  if(isLoading) {
    return <div>Loading...</div>;
  }

  if (currentBranch === undefined || currentBranch === null) {
    return <div>Select a branch</div>;
  }

  if (activeFiles && activeFiles.length === 0) {
    return <div>Select Files/Modules to be visualized</div>;
  }

  if (chartData === undefined || chartData === null || chartData.length === 0) {
    return <div>Loading...</div>;
  }


  return(
    <>
    {chartComponent}
    </> 
  )
};
