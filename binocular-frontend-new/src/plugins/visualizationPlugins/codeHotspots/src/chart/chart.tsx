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
import { useDispatch, useSelector } from 'react-redux';
import { type CodeHotspotsState, setFile } from '../reducer';
import CodeViewer from './codeViewer/codeViewer';
import HeatMap from './heatmap/heatMap';
import { EditorView } from '@codemirror/view';
import ColumnOverview from './columnOverview/columnOverview';
import RowOverview from './rowOverview/rowOverview';

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

  const leftOffset = 35;
  const rowOverviewWidth = 35;
  const lineHeight = 18;
  const heatmapTopOffset = 4;

  const columnOverviewHeight = 100;

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

  type State = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const codeViewerRef = useRef<EditorView>(null);

  const data: CodeHotspotsState = useSelector((state: State) => state.plugin);

  return (
    <>
      <div className={'w-full h-full flex flex-row'} ref={chartContainerRef}>
        <div style={{ width: '20rem', height: '100%' }}>
          <FileBrowser
            files={props.fileList}
            onSetFile={(url, path) => {
              if (url && path) {
                dispatch(setFile({ url: url, path: path }));
              }
            }}></FileBrowser>
        </div>
        <div style={{ flexGrow: 1 }}>
          <div
            style={{ width: '100%', height: `100%`, position: 'relative', overflowY: 'scroll' }}
            onScroll={() => {
              if (codeViewerRef.current) {
                codeViewerRef.current.requestMeasure();
              }
            }}>
            <div
              style={{
                width: `calc(100% - ${leftOffset}px - ${rowOverviewWidth}px)`,
                height: `${columnOverviewHeight}px`,
                position: 'absolute',
                left: `${leftOffset}px`,
              }}>
              <ColumnOverview file={data.selectedFile} commits={data.commits}></ColumnOverview>
            </div>
            <div
              style={{
                width: `calc(100% - ${leftOffset}px - ${rowOverviewWidth}px)`,
                height: '100%',
                position: 'absolute',
                top: `${columnOverviewHeight}px`,
                left: `${leftOffset}px`,
              }}>
              <HeatMap file={data.selectedFile} commits={data.commits} lineHeight={lineHeight} topOffset={heatmapTopOffset}></HeatMap>
            </div>
            <div
              style={{
                width: `calc(100% - ${rowOverviewWidth}px)`,
                height: '100%',
                position: 'absolute',
                top: `${columnOverviewHeight}px`,
                left: 0,
              }}>
              <CodeViewer ref={codeViewerRef} file={data.selectedFile} currentBranch={data.currentBranch}></CodeViewer>
            </div>
            <div
              style={{
                width: `${rowOverviewWidth}px`,
                height: `100%`,
                position: 'absolute',
                top: `${columnOverviewHeight}px`,
                right: `0px`,
              }}>
              <RowOverview file={data.selectedFile} commits={data.commits}  lineHeight={lineHeight} topOffset={heatmapTopOffset}></RowOverview>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chart;
