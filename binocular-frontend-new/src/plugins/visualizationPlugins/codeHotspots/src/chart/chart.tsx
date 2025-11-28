import { type RefObject, useEffect, useRef, useState } from 'react';
import type { Store } from '@reduxjs/toolkit';
import { handelPopoutResizing } from '../../../../utils/resizing.ts';
import type { DataPlugin } from '../../../../interfaces/dataPlugin';
import type { ParametersType } from '../../../../../types/parameters/parametersType';
import type { SettingsType } from '../settings/settings';
import type { AuthorType } from '../../../../../types/data/authorType';
import type { SprintType } from '../../../../../types/data/sprintType';
import type { FileListElementType } from '../../../../../types/data/fileListType';
import FileBrowser from '../components/fileBrowser/fileBrowser';

function Chart(props: {
  settings: SettingsType;
  dataConnection: DataPlugin;
  authorList: AuthorType[];
  sprintList: SprintType[];
  fileList: FileListElementType[];
  parameters: ParametersType;
  chartContainerRef: RefObject<HTMLDivElement | null>;
  store: Store;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(100);

  /**
   * RESIZE Logic START
   */
  function resize() {
    if (!chartContainerRef.current) return;
    if (chartContainerRef.current?.offsetWidth !== chartWidth) {
      setChartWidth(chartContainerRef.current.offsetWidth);
    }
    if (chartContainerRef.current?.offsetHeight !== chartHeight) {
      setChartHeight(chartContainerRef.current.offsetHeight);
    }
  }

  useEffect(() => {
    resize();
  }, [chartContainerRef, chartHeight, chartWidth]);

  handelPopoutResizing(props.store, resize);
  /**
   * RESIZE Logic END
   */

  console.log(props);

  return (
    <>
      <div className={'w-full h-full flex flex-row'} ref={chartContainerRef}>
        <div style={{ width: '20rem' }}>
          <FileBrowser
            files={props.fileList}
            onSetFile={(url, path) => {
              console.log(path);
              console.log(url);
            }}></FileBrowser>
        </div>
        <div>Chart</div>
      </div>
    </>
  );
}

export default Chart;
