import { type RefObject, useEffect, useRef, useState } from 'react';
import type { Store } from '@reduxjs/toolkit';
import { handelPopoutResizing } from '../../../../utils/resizing.ts';
import type { DataPlugin } from '../../../../interfaces/dataPlugin';
import type { ParametersType } from '../../../../../types/parameters/parametersType';
import type { SettingsType } from '../settings/settings';
import type { AuthorType } from '../../../../../types/data/authorType';
import type { SprintType } from '../../../../../types/data/sprintType';
import { type FileListElementType, type FileTreeElementType, FileTreeElementTypeType } from '../../../../../types/data/fileListType';
import { useDispatch, useSelector } from 'react-redux';
import { type CodeHotspotsState, DataState, setFile } from '../reducer';
import CodeViewer from './codeViewer/codeViewer';
import HeatMap from './heatmap/heatMap';
import { EditorView } from '@codemirror/view';
import ColumnOverview from './columnOverview/columnOverview';
import RowOverview from './rowOverview/rowOverview';
import { filterFileTree, generateFileTree, updateFileTreeRecursive } from '../../../../../components/fileTree/utils/fileTreeUtilities';
import FileTreeFolder from '../../../../../components/fileTree/fileTreeElements/fileTreeFolder/fileTreeFolder';
import SearchBar from '../../../../../components/searchBar/searchBar';

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

  const lineHeight = 18;
  const leftOffset = 35;
  const rowOverviewWidth = lineHeight * 2;
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
  const files = useSelector((state: State) => state.plugin.files);

  const [fileTree, setFileTree] = useState<FileTreeElementType>({
    name: '/',
    type: FileTreeElementTypeType.Folder,
    children: generateFileTree(files),
    checked: true,
    foldedOut: true,
    isRoot: true,
  });

  useEffect(() => {
    setFileTree({
      name: '/',
      type: FileTreeElementTypeType.Folder,
      children: generateFileTree(files),
      checked: true,
      foldedOut: true,
      isRoot: true,
    });
  }, [files]);

  const [search, setSearch] = useState<string>('');

  return (
    <>
      {data.dataState === DataState.FETCHING && (
        <div className={'p-1 fixed w-full border border-base-300 card bg-base-100 shadow-sm'} style={{ zIndex: '+1', bottom: '0' }}>
          <progress className="progress progress-accent w-full"></progress>
        </div>
      )}
      <div className={'w-full h-full flex flex-row'} ref={chartContainerRef}>
        <div style={{ width: '20rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SearchBar onSearch={(search) => setSearch(search)} />
          <div style={{ width: '100%', flexGrow: 1, overflowY: 'auto' }}>
            <FileTreeFolder
              folder={filterFileTree(fileTree, search)}
              foldedOut={true}
              showSelect={false}
              onElementClick={(element, foldOutState) => {
                if (element.type === FileTreeElementTypeType.Folder && foldOutState !== undefined) {
                  updateFileTreeRecursive(fileTree, { ...element, foldedOut: foldOutState });
                  setFileTree({ ...fileTree });
                }
                if (element.type === FileTreeElementTypeType.File && element.element !== undefined) {
                  dispatch(setFile({ path: element.element.path, url: element.element.webUrl }));
                }
              }}
            />
          </div>
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
              <ColumnOverview
                file={data.selectedFile}
                commits={data.commits}
                onSetFile={(path, url) => {
                  if (path && url) {
                    dispatch(setFile({ path: path, url: url }));
                  }
                }}></ColumnOverview>
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
              <RowOverview
                file={data.selectedFile}
                commits={data.commits}
                lineHeight={lineHeight}
                topOffset={heatmapTopOffset}></RowOverview>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chart;
