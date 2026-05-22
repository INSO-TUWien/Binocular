import dashboardItemStyles from './dashboardItem.module.scss';
import { DragResizeMode } from '../resizeMode.ts';
import { visualizationPlugins } from '../../../plugins/pluginRegistry.ts';
import { memo, useEffect, useRef, useState } from 'react';
import DashboardItemPopout from '../dashboardItemPopout/dashboardItemPopout.tsx';
import { increasePopupCount, updateDashboardItem } from '../../../redux/reducer/general/dashboardReducer.ts';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../redux';
import { Icon } from '../../icon';
import { useSelector } from 'react-redux';
import DashboardItemSettings from '../dashboardItemSettings/dashboardItemSettings.tsx';
import { parametersInitialState } from '../../../redux/reducer/parameters/parametersReducer.ts';
import type { DashboardItemType } from '../../../types/general/dashboardItemType.ts';
import { ExportType, setExportName, setExportSVGData, setExportType } from '../../../redux/reducer/export/exportReducer.ts';
import ReduxSubAppStoreWrapper from '../reduxSubAppStoreWrapper/reduxSubAppStoreWrapper.tsx';
import PopoutLayout from '../popoutLayout/popoutLayout.tsx';
import { combineReducers, configureStore, type Store } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';
import _ from 'lodash';
import type { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';
import DataPluginStorage from '../../../utils/dataPluginStorage.ts';
import { store as globalStore } from '../../../redux';
import actionsReducer from '../../../redux/reducer/general/actionsReducer.ts';
import actionsMiddleware from '../../../redux/middleware/actions/actionsMiddleware.ts';
import { refreshFileList } from '../../tabs/fileTree/utils/fileListUtilities';
import type { FileListElementType } from '../../../types/data/fileListType.ts';

const logger = createLogger({
  collapsed: () => true,
});

const DashboardItem = memo(function DashboardItem(props: {
  item: DashboardItemType;
  cellSize: number;
  colCount: number;
  rowCount: number;
  setDragResizeItem: (itemId: number, mode: DragResizeMode) => void;
  deleteItem: (itemId: number) => void;
}) {
  const dispatch: AppDispatch = useAppDispatch();

  const [poppedOut, setPoppedOut] = useState(false);

  const authorLists = useSelector((state: RootState) => state.authors.authorLists);
  const fileLists = useSelector((state: RootState) => state.files.fileLists);
  const filesInitialized = useSelector((state: RootState) => state.files.initialized);
  const sprintList = useSelector((state: RootState) => state.sprints.sprintList);
  const availableDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [ignoreGlobalParameters, setIgnoreGlobalParameters] = useState(props.item.ignoreGlobalParameters ?? false);
  const [doAutomaticUpdate, setDoAutomaticUpdate] = useState(false);
  const parametersGeneralGlobal = useSelector((state: RootState) => state.parameters.parametersGeneral);
  const [parametersGeneralLocal, setParametersGeneralLocal] = useState(
    props.item.localParametersGeneral ?? parametersInitialState.parametersGeneral,
  );
  const parametersDateRangeGlobal = useSelector((state: RootState) => state.parameters.parametersDateRange);
  const [parametersDateRangeLocal, setParametersDateRangeLocal] = useState(
    props.item.localParametersDateRange ?? parametersInitialState.parametersDateRange,
  );

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const [selectedDataPlugin, setSelectedDataPlugin] = useState<DatabaseSettingsDataPluginType | undefined>(undefined);

  useEffect(() => {
    if (props.item.dataPluginId !== undefined) {
      setSelectedDataPlugin(availableDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id === props.item.dataPluginId)[0]);
    } else {
      setSelectedDataPlugin(availableDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.isDefault)[0]);
    }
  }, [availableDataPlugins, props.item.dataPluginId]);

  const [plugin] = useState(visualizationPlugins.filter((p) => p.name === props.item.pluginName)[0]);

  const [dataPlugin, setDataPlugin] = useState<DataPlugin | undefined>(undefined);

  /**
   * Redux Store will be created for individual item once a data plugin is selected.
   * To run the correct middleware it has to be reconfigured everytime the dataplugin changes.
   */
  const [store, setStore] = useState<Store | undefined>(undefined);

  useEffect(() => {
    if (selectedDataPlugin && selectedDataPlugin.id !== undefined) {
      if (selectedDataPlugin.parameters.progressUpdate?.useAutomaticUpdate) {
        setDoAutomaticUpdate(selectedDataPlugin.parameters.progressUpdate.useAutomaticUpdate);
      }
      DataPluginStorage.getDataPlugin(selectedDataPlugin)
        .then((newDataPlugin) => {
          if (newDataPlugin) {
            const sagaMiddleware = createSagaMiddleware();
            setStore(
              configureStore({
                reducer: combineReducers({ plugin: plugin.reducer, actions: actionsReducer }),
                middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware, logger, actionsMiddleware()),
                // preserve state if store already existed
                preloadedState: store ? store.getState() : undefined,
              }),
            );
            sagaMiddleware.run(() => plugin.saga(newDataPlugin, plugin.name, plugin.dataConnectionName));

            setDataPlugin(newDataPlugin);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [selectedDataPlugin]);

  const [authors, setAuthors] = useState([]);
  useEffect(() => {
    if (props.item.dataPluginId !== undefined) {
      setAuthors(authorLists[props.item.dataPluginId]);
    }
  }, [authorLists, props.item.dataPluginId]);

  const [files, setFiles] = useState<FileListElementType[]>([]);

  useEffect(() => {
    if (!filesInitialized) return;
    if (props.item.dataPluginId !== undefined) {
      if (fileLists[props.item.dataPluginId] == undefined) {
        const dataPlugin = availableDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id === props.item.dataPluginId)[0];
        refreshFileList(dataPlugin, dispatch);
      }
      if (JSON.stringify(fileLists[props.item.dataPluginId]) !== JSON.stringify(files)) {
        setFiles(fileLists[props.item.dataPluginId]);
      }
    }
  }, [availableDataPlugins, fileLists, filesInitialized, props.item.dataPluginId]);
  const [settings, setSettingsState] = useState(props.item.settings ?? plugin.defaultSettings);

  // Persist settings changes to the dashboard store (and localStorage)
  const setSettings = (newSettings: typeof settings) => {
    setSettingsState(newSettings);
    const updatedItem = _.clone(props.item);
    updatedItem.settings = newSettings as DashboardItemType['settings'];
    dispatch(updateDashboardItem(updatedItem));
  };

  // Persist local parameter changes to the dashboard store
  useEffect(() => {
    const updatedItem = _.clone(props.item);
    updatedItem.ignoreGlobalParameters = ignoreGlobalParameters;
    updatedItem.localParametersGeneral = parametersGeneralLocal;
    updatedItem.localParametersDateRange = parametersDateRangeLocal;
    dispatch(updateDashboardItem(updatedItem));
  }, [ignoreGlobalParameters, parametersGeneralLocal, parametersDateRangeLocal]);

  // Ensure only one listener is active at a time
  useEffect(() => {
    const unsubscribe = globalStore.subscribe(() => {
      if (store !== undefined) {
        switch (globalStore.getState().actions.lastAction) {
          case 'REFRESH_PLUGIN':
            if (selectedDataPlugin && doAutomaticUpdate) {
              if ((globalStore.getState().actions.payload as { pluginId: number }).pluginId === props.item.dataPluginId) {
                console.log(`REFRESH ${props.item.pluginName} (${selectedDataPlugin.name} #${selectedDataPlugin.id})`);
                store.dispatch({ type: 'REFRESH' });
              }
            }
            break;
          case 'RESIZE_DASHBOARD_ITEM':
            if ((globalStore.getState().actions.payload as { dashboardItemId: number }).dashboardItemId === props.item.id) {
              store.dispatch({ type: 'RESIZE' });
            }
            break;
          case 'RESIZE':
            store.dispatch({ type: 'RESIZE' });
            break;
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [store]);

  // WINDOW SHIFT MODE
  function keyDown(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      if (settingsButtonRef.current) {
        settingsButtonRef.current.style.display = 'none';
      }
      if (deleteButtonRef.current) {
        deleteButtonRef.current.style.display = 'block';
      }
    }
  }

  function keyUp(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      if (settingsButtonRef.current) {
        settingsButtonRef.current.style.display = 'block';
      }
      if (deleteButtonRef.current) {
        deleteButtonRef.current.style.display = 'none';
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  return (
    props.item.y !== undefined &&
    props.item.x !== undefined && (
      <>
        <div
          className={dashboardItemStyles.dashboardItem}
          id={'dashboardItem' + props.item.id}
          style={{
            top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px)`,
            left: `calc(${(100.0 / props.colCount) * props.item.x}% + 10px)`,
            width: `calc(${(100.0 / props.colCount) * props.item.width}% - 20px)`,
            height: `calc(${(100.0 / props.rowCount) * props.item.height}% - 20px)`,
          }}>
          {poppedOut ? (
            <div className={dashboardItemStyles.dashboardItemContent}>
              <div className={dashboardItemStyles.popoutTextContainer}>
                <div>
                  <Icon name="open_in_new" size="w-8 h-8" />
                  <div className={'font-bold text-2xl'}>Popped Out!</div>
                </div>
                <button
                  className={'btn btn-sm'}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPoppedOut(false);
                  }}>
                  <div>Close Popout</div>
                </button>
              </div>
              {dataPlugin && store ? (
                <DashboardItemPopout
                  name={plugin.name}
                  onClosing={() => setPoppedOut(false)}
                  onResize={() => store?.dispatch({ type: 'RESIZE' })}>
                  <PopoutLayout
                    plugin={plugin}
                    chartContainerRef={chartContainerRef}
                    settingsElement={
                      <DashboardItemSettings
                        selectedDataPlugin={selectedDataPlugin ? selectedDataPlugin : undefined}
                        onSelectDataPlugin={(dP: DatabaseSettingsDataPluginType) => {
                          const newItem = _.clone(props.item);
                          newItem.dataPluginId = dP.id;
                          dispatch(updateDashboardItem(newItem));
                        }}
                        item={props.item}
                        settingsComponent={
                          <plugin.settingsComponent
                            key={plugin.name}
                            settings={settings}
                            setSettings={setSettings}
                            store={store}></plugin.settingsComponent>
                        }
                        onClickDelete={() => props.deleteItem(props.item.id)}
                        onClickRefresh={() => store?.dispatch({ type: 'REFRESH' })}
                        ignoreGlobalParameters={ignoreGlobalParameters}
                        setIgnoreGlobalParameters={setIgnoreGlobalParameters}
                        doAutomaticUpdate={doAutomaticUpdate}
                        setDoAutomaticUpdate={setDoAutomaticUpdate}
                        parametersGeneral={parametersGeneralLocal}
                        setParametersGeneral={setParametersGeneralLocal}
                        parametersDateRange={parametersDateRangeLocal}
                        setParametersDateRange={setParametersDateRangeLocal}
                      />
                    }>
                    <ReduxSubAppStoreWrapper store={store}>
                      {plugin.chartComponent !== undefined ? (
                        <plugin.chartComponent
                          key={plugin.name}
                          settings={settings}
                          authorList={authors}
                          fileList={files}
                          sprintList={sprintList}
                          parameters={{
                            parametersGeneral: ignoreGlobalParameters ? parametersGeneralLocal : parametersGeneralGlobal,
                            parametersDateRange: ignoreGlobalParameters ? parametersDateRangeLocal : parametersDateRangeGlobal,
                          }}
                          dataConnection={dataPlugin}
                          dataConverter={plugin.dataConverter}
                          chartContainerRef={chartContainerRef}
                          store={store}
                          dependencies={plugin.dependencies}
                          dataName={plugin.name.toLowerCase()}></plugin.chartComponent>
                      ) : (
                        <div>No Chart Component Found!</div>
                      )}
                    </ReduxSubAppStoreWrapper>
                  </PopoutLayout>
                </DashboardItemPopout>
              ) : (
                <div>No Data Plugin Selected</div>
              )}
            </div>
          ) : (
            <div className={dashboardItemStyles.dashboardItemContent}>
              {plugin.capabilities.popoutOnly ? (
                <div className={dashboardItemStyles.popoutWarning}>
                  <div>This Visualization is too complex to display as part of the Dashboard.</div>
                  <div> Please open it in a new window to view!</div>
                  <button
                    className={'btn btn-primary'}
                    onClick={(event) => {
                      event.stopPropagation();
                      dispatch(increasePopupCount());
                      setPoppedOut(true);
                    }}>
                    <div>Open Visualization in new Window</div>
                    <Icon name="open_in_new" colorClass="primary-content" />
                  </button>
                </div>
              ) : dataPlugin && store && authors ? (
                <ReduxSubAppStoreWrapper store={store}>
                  {plugin.chartComponent !== undefined ? (
                    <plugin.chartComponent
                      key={plugin.name}
                      settings={settings}
                      authorList={authors}
                      fileList={files}
                      sprintList={sprintList}
                      parameters={{
                        parametersGeneral: ignoreGlobalParameters ? parametersGeneralLocal : parametersGeneralGlobal,
                        parametersDateRange: ignoreGlobalParameters ? parametersDateRangeLocal : parametersDateRangeGlobal,
                      }}
                      dataConnection={dataPlugin}
                      dataConverter={plugin.dataConverter}
                      chartContainerRef={chartContainerRef}
                      store={store}
                      dependencies={plugin.dependencies}
                      dataName={plugin.name.toLowerCase()}></plugin.chartComponent>
                  ) : (
                    <div>No Chart Component Found!</div>
                  )}
                </ReduxSubAppStoreWrapper>
              ) : (
                <div>No Data Plugin Selected</div>
              )}
            </div>
          )}
          <div
            className={dashboardItemStyles.dashboardItemInteractionBar}
            style={{
              background: `linear-gradient(90deg, ${selectedDataPlugin ? selectedDataPlugin.color : 'var(--color-base-200)'}, var(--color-base-200)`,
            }}
            onMouseDown={() => {
              console.log('Start dragging dashboard item ' + props.item.pluginName);
              props.setDragResizeItem(props.item.id, DragResizeMode.drag);
            }}>
            <div className={dashboardItemStyles.dashboardItemInteractionBarLeft}>
              <span>{props.item.pluginName}</span>
              {selectedDataPlugin && (
                <span>
                  ({selectedDataPlugin.name} #{selectedDataPlugin.id})
                </span>
              )}
            </div>
            <div className={dashboardItemStyles.dashboardItemInteractionBarRight}>
              {plugin.capabilities.export && (
                <button
                  className={dashboardItemStyles.exportButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(setExportType(ExportType.image));
                    dispatch(setExportSVGData(plugin.export.getSVGData(chartContainerRef)));
                    dispatch(setExportName(`${plugin.name}Export`));
                    (document.getElementById('exportDialog') as HTMLDialogElement).showModal();
                  }}
                  onMouseDown={(event) => event.stopPropagation()}></button>
              )}
              <button
                className={dashboardItemStyles.popoutButton}
                onClick={(event) => {
                  event.stopPropagation();
                  dispatch(increasePopupCount());
                  setPoppedOut(true);
                }}
                onMouseDown={(event) => event.stopPropagation()}></button>
              <button
                className={dashboardItemStyles.helpButton}
                onClick={(event) => {
                  event.stopPropagation();
                  if (helpRef.current) {
                    helpRef.current.style.display = 'block';
                  }
                }}
                onMouseDown={(event) => event.stopPropagation()}></button>
              <button
                className={dashboardItemStyles.deleteButton}
                ref={deleteButtonRef}
                style={{ display: 'none' }}
                onClick={(event) => {
                  event.stopPropagation();
                  props.deleteItem(props.item.id);
                }}
                onMouseDown={(event) => event.stopPropagation()}></button>
              <button
                className={dashboardItemStyles.settingsButton}
                ref={settingsButtonRef}
                onClick={(event) => {
                  event.stopPropagation();
                  if (settingsRef.current) {
                    settingsRef.current.style.display = 'block';
                  }
                }}
                onMouseDown={(event) => event.stopPropagation()}></button>
            </div>
          </div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarTopLeft}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the top left');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeTopLeft);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarTop}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the top');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeTop);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarTopRight}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the top right');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeTopRight);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarRight}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the right');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeRight);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarBottomRight}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the bottom right');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeBottomRight);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarBottom}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the bottom');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeBottom);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarBottomLeft}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the bottom left');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeBottomLeft);
            }}></div>
          <div
            className={dashboardItemStyles.dashboardItemResizeBarLeft}
            onMouseDown={() => {
              console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the left');
              props.setDragResizeItem(props.item.id, DragResizeMode.resizeLeft);
            }}></div>
        </div>
        <>
          <div
            id={`dashboardItem${props.item.id}_settings`}
            ref={settingsRef}
            className={dashboardItemStyles.subWindowBackground}
            onClick={() => {
              if (settingsRef.current) {
                settingsRef.current.style.display = 'none';
              }
            }}
            style={{ display: 'none' }}>
            <div
              onClick={(event) => event.stopPropagation()}
              className={'text-xs ' + dashboardItemStyles.subWindow}
              style={{
                top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px + 1.5rem)`,
                left: `calc(${(100.0 / props.colCount) * (props.item.x + props.item.width)}% - 10px - 20rem)`,
              }}>
              <DashboardItemSettings
                selectedDataPlugin={selectedDataPlugin ? selectedDataPlugin : undefined}
                onSelectDataPlugin={(dP: DatabaseSettingsDataPluginType) => {
                  const newItem = _.clone(props.item);
                  newItem.dataPluginId = dP.id;
                  dispatch(updateDashboardItem(newItem));
                }}
                item={props.item}
                settingsComponent={
                  <plugin.settingsComponent
                    key={plugin.name}
                    settings={settings}
                    setSettings={setSettings}
                    store={store}></plugin.settingsComponent>
                }
                onClickDelete={() => props.deleteItem(props.item.id)}
                onClickRefresh={() => store?.dispatch({ type: 'REFRESH' })}
                ignoreGlobalParameters={ignoreGlobalParameters}
                setIgnoreGlobalParameters={setIgnoreGlobalParameters}
                doAutomaticUpdate={doAutomaticUpdate}
                setDoAutomaticUpdate={setDoAutomaticUpdate}
                parametersGeneral={parametersGeneralLocal}
                setParametersGeneral={setParametersGeneralLocal}
                parametersDateRange={parametersDateRangeLocal}
                setParametersDateRange={setParametersDateRangeLocal}></DashboardItemSettings>
            </div>
          </div>
        </>
        <>
          <div
            id={`dashboardItem${props.item.id}_help`}
            ref={helpRef}
            className={dashboardItemStyles.subWindowBackground}
            onClick={() => {
              if (helpRef.current) {
                helpRef.current.style.display = 'none';
              }
            }}
            style={{ display: 'none' }}>
            <div
              onClick={(event) => event.stopPropagation()}
              className={'text-xs ' + dashboardItemStyles.subWindow}
              style={{
                top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px + 1.5rem)`,
                left: `calc(${(100.0 / props.colCount) * (props.item.x + props.item.width)}% - 10px - 20rem)`,
              }}>
              <plugin.helpComponent key={plugin.name}></plugin.helpComponent>
            </div>
          </div>
        </>
      </>
    )
  );
});

export default DashboardItem;
