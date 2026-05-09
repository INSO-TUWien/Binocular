import { type RefObject, useEffect, useRef, useState } from 'react';
import type { Store } from '@reduxjs/toolkit';
import type { DataPlugin } from '../../../../../interfaces/dataPlugin';
import type { ParametersType } from '../../../../../../types/parameters/parametersType';
import type { SettingsType } from '../settings/settings';
import type { AuthorType } from '../../../../../../types/data/authorType';
import type { SprintType } from '../../../../../../types/data/sprintType';
import { type FileListElementType, type FileTreeElementType, FileTreeElementTypeType } from '../../../../../../types/data/fileListType';
import { useDispatch, useSelector } from 'react-redux';
import { type CodeHotspotsState, DataState, setFile } from '../reducer';
import CodeViewer from './codeViewer/codeViewer';
import HeatMap from './heatmap/heatMap';
import { EditorView } from '@codemirror/view';
import ColumnOverview from './columnOverview/columnOverview';
import RowOverview from './rowOverview/rowOverview';
import { filterFileTree, generateFileTree, updateFileTreeRecursive } from '../../../../../../components/fileTree/utils/fileTreeUtilities';
import FileTreeFolder from '../../../../../../components/fileTree/fileTreeElements/fileTreeFolder/fileTreeFolder';
import SearchBar from '../../../../../../components/searchBar/searchBar';
import type { DataPluginBranch } from '../../../../../interfaces/dataPluginInterfaces/dataPluginBranches';
import { OverLaySettings } from '../components/overLaySettings/overLaySettings';
import type { CodeHotspotsGitlabSettings } from '../types/CodeHotspotsGitlabSettings';
import { handlePopoutResizing } from '../../../../../utils/resizing';

const CODE_HOTSPOTS_GITLAB_SETTINGS_KEY = 'code_hotspots_gitlab_settings';

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

  const resizeFnRef = useRef<() => void>(() => {});
  resizeFnRef.current = resize;

  useEffect(() => {
    resize();
  }, [chartContainerRef]);

  useEffect(() => {
    return handlePopoutResizing(props.store, () => resizeFnRef.current());
  }, [props.store]);
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

  const [selectedBranch, setSelectedBranch] = useState<DataPluginBranch | undefined>(data.currentBranch);

  useEffect(() => {
    setSelectedBranch(data.currentBranch);
  }, [data.currentBranch]);

  const overLaySettingsRef = useRef<HTMLDialogElement>(null);
  const [gitlabSettings, setGitlabSettings] = useState<CodeHotspotsGitlabSettings>({ serverUrl: '', projectId: '', apiKey: '' });

  useEffect(() => {
    const loadedGitlabSettings = localStorage.getItem(CODE_HOTSPOTS_GITLAB_SETTINGS_KEY);

    if (loadedGitlabSettings) {
      try {
        setGitlabSettings(JSON.parse(loadedGitlabSettings));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const [selectedSha, setSelectedSha] = useState<string | undefined>();

  return (
    <div className={'bg-base-100'}>
      <OverLaySettings
        ref={overLaySettingsRef}
        gitlabSettings={gitlabSettings}
        onGitLabSettingsChange={(newGitlabSettings) => {
          setGitlabSettings(newGitlabSettings);
          localStorage.setItem(CODE_HOTSPOTS_GITLAB_SETTINGS_KEY, JSON.stringify(newGitlabSettings));
        }}></OverLaySettings>
      {data.dataState === DataState.FETCHING && (
        <div className={'p-1 fixed w-full border border-base-300 card bg-base-100 shadow-sm'} style={{ zIndex: '+1', bottom: '0' }}>
          <progress className="progress progress-accent w-full"></progress>
        </div>
      )}
      <div className={'w-full h-full flex flex-row p-1'} ref={chartContainerRef}>
        <div style={{ width: '20rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className={'flex items-center space-x-2'}>
            <button className="btn btn-circle btn-sm" onClick={() => overLaySettingsRef.current?.showModal()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 h-2/3">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            {selectedBranch && (
              <button
                className={'btn mb-1 btn-outline btn-sm'}
                disabled={selectedSha === undefined}
                onClick={() => setSelectedSha(undefined)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 h-2/3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
                Return to branch {selectedBranch.branch}
              </button>
            )}
          </div>
          <h2>Branch</h2>
          <div className={'p-2'}>
            {data.branches.length > 0 ? (
              <select
                defaultValue={data.currentBranch?.branch}
                className={'select p-2'}
                onChange={(e) => {
                  const branch = data.branches.find((b) => b.branch === e.target.value);
                  if (branch) {
                    setSelectedBranch(branch);
                  }
                }}>
                {data.branches.map((branch, i) => (
                  <option key={'branch_' + i} value={branch.branch}>
                    {branch.branch}
                  </option>
                ))}
              </select>
            ) : (
              <div>Loading Branches ...</div>
            )}
          </div>
          <h2>Files</h2>
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
                  setSelectedSha(undefined);
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
                }}
                onSelectCommit={(sha) => setSelectedSha(sha)}></ColumnOverview>
            </div>
            <div
              style={{
                width: `calc(100% - ${leftOffset}px - ${rowOverviewWidth}px)`,
                position: 'absolute',
                top: `${columnOverviewHeight}px`,
                left: `${leftOffset}px`,
              }}>
              <HeatMap file={data.selectedFile} commits={data.commits} lineHeight={lineHeight} topOffset={heatmapTopOffset}></HeatMap>
            </div>
            <div
              style={{
                width: `calc(100% - ${rowOverviewWidth}px)`,
                position: 'absolute',
                top: `${columnOverviewHeight}px`,
                left: 0,
              }}>
              <CodeViewer
                ref={codeViewerRef}
                file={data.selectedFile}
                selectedBranch={selectedBranch}
                gitlabSettings={gitlabSettings}
                selectedSha={selectedSha}></CodeViewer>
            </div>
            <div
              style={{
                width: `${rowOverviewWidth}px`,
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
    </div>
  );
}

export default Chart;
