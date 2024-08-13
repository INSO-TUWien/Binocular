import dashboardItemStyles from './dashboardItem.module.scss';
import { DragResizeMode } from '../resizeMode.ts';
import { dataPlugins, visualizationPlugins } from '../../../plugins/pluginRegistry.ts';
import { useRef, useState } from 'react';
import DashboardItemPopout from '../dashboardItemPopout/dashboardItemPopout.tsx';
import { increasePopupCount, updateDashboardItem } from '../../../redux/general/dashboardReducer.ts';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';
import openInNewGray from '../../../assets/open_in_new_white.svg';
import openInNewBlack from '../../../assets/open_in_new_black.svg';
import { useSelector } from 'react-redux';
import DashboardItemSettings from '../dashboardItemSettings/dashboardItemSettings.tsx';
import { parametersInitialState } from '../../../redux/parameters/parametersReducer.ts';
import { DashboardItemDTO, DashboardItemType } from '../../../types/general/dashboardItemType.ts';
import { ExportType, setExportName, setExportSVGData, setExportType } from '../../../redux/export/exportReducer.ts';
import ReduxSubAppStoreWrapper from '../reduxSubAppStoreWrapper/reduxSubAppStoreWrapper.tsx';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';
import _ from 'lodash';

const logger = createLogger({
  collapsed: () => true,
});

function DashboardItem(props: {
  item: DashboardItemType;
  cellSize: number;
  colCount: number;
  rowCount: number;
  setDragResizeItem: (item: DashboardItemDTO, mode: DragResizeMode) => void;
  deleteItem: (item: DashboardItemDTO) => void;
}) {
  const dispatch: AppDispatch = useAppDispatch();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const [poppedOut, setPoppedOut] = useState(false);

  const authorLists = useSelector((state: RootState) => state.authors.authorLists);
  const sprintList = useSelector((state: RootState) => state.sprints.sprintList);
  const avaliableDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [ignoreGlobalParameters, setIgnoreGlobalParameters] = useState(false);
  const parametersGeneralGlobal = useSelector((state: RootState) => state.parameters.parametersGeneral);
  const [parametersGeneralLocal, setParametersGeneralLocal] = useState(parametersInitialState.parametersGeneral);
  const parametersDateRangeGlobal = useSelector((state: RootState) => state.parameters.parametersDateRange);
  const [parametersDateRangeLocal, setParametersDateRangeLocal] = useState(parametersInitialState.parametersDateRange);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const plugin = visualizationPlugins.filter((p) => p.name === props.item.pluginName)[0];
  const selectedDataPlugin =
    props.item.dataPluginId !== undefined
      ? avaliableDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id === props.item.dataPluginId)[0]
      : undefined;
  const dataPlugin =
    selectedDataPlugin !== undefined ? dataPlugins.filter((dataPlugin) => dataPlugin.name === selectedDataPlugin.name)[0] : undefined;
  if(dataPlugin){
    dataPlugin.init(selectedDataPlugin.parameters.apiKey,selectedDataPlugin.parameters.endpoint)
  }

  const authors = props.item.dataPluginId !== undefined ? authorLists[props.item.dataPluginId] : [];
  const [settings, setSettings] = useState(plugin.defaultSettings);

  /**
   * Create Redux Store from Reducer for individual Item and run saga
   */
  let store;
  if (dataPlugin) {
    const sagaMiddleware = createSagaMiddleware();
    store = configureStore({
      reducer: plugin.reducer,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware, logger),
    });
    sagaMiddleware.run(() => plugin.saga(dataPlugin));
  } else {
    store = undefined;
  }

  return (
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
                <img src={openInNewBlack} alt="Open Visualization" style={{ width: '2rem', height: '2rem' }} />
                <div className={'font-bold text-2xl'}>Popped Out!</div>
              </div>
              <button
                className={'btn btn-sm'}
                onClick={(event) => {
                  event.stopPropagation();
                  setPoppedOut(false);
                }}>
                <div>Dispatch Popout</div>
              </button>
            </div>
            {dataPlugin && store ? (
              <DashboardItemPopout name={plugin.name} onClosing={() => setPoppedOut(false)}>
                <ReduxSubAppStoreWrapper store={store}>
                  <plugin.chartComponent
                    key={plugin.name}
                    settings={settings}
                    authorList={authors}
                    sprintList={sprintList}
                    parameters={{
                      parametersGeneral: ignoreGlobalParameters ? parametersGeneralLocal : parametersGeneralGlobal,
                      parametersDateRange: ignoreGlobalParameters ? parametersDateRangeLocal : parametersDateRangeGlobal,
                    }}
                    dataConnection={dataPlugin}
                    chartContainerRef={chartContainerRef}
                    store={store}></plugin.chartComponent>
                </ReduxSubAppStoreWrapper>
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
                  className={'btn btn-accent'}
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(increasePopupCount());
                    setPoppedOut(true);
                  }}>
                  <div>Open Visualization in new Window</div>
                  <img src={openInNewGray} alt="Open Visualization" />
                </button>
              </div>
            ) : dataPlugin && store ? (
              <ReduxSubAppStoreWrapper store={store}>
                <plugin.chartComponent
                  key={plugin.name}
                  settings={settings}
                  authorList={authors}
                  sprintList={sprintList}
                  parameters={{
                    parametersGeneral: ignoreGlobalParameters ? parametersGeneralLocal : parametersGeneralGlobal,
                    parametersDateRange: ignoreGlobalParameters ? parametersDateRangeLocal : parametersDateRangeGlobal,
                  }}
                  dataConnection={dataPlugin}
                  chartContainerRef={chartContainerRef}
                  store={store}></plugin.chartComponent>
              </ReduxSubAppStoreWrapper>
            ) : (
              <div>No Data Plugin Selected</div>
            )}
          </div>
        )}
        <div
          className={dashboardItemStyles.dashboardItemInteractionBar}
          style={{ background: `linear-gradient(90deg, ${selectedDataPlugin ? selectedDataPlugin.color : 'white'}, white)` }}
          onMouseDown={() => {
            console.log('Start dragging dashboard item ' + props.item.pluginName);
            props.setDragResizeItem(
              { id: props.item.id, x: props.item.x, y: props.item.y, width: props.item.width, height: props.item.height },
              DragResizeMode.drag,
            );
          }}>
          <span>{props.item.pluginName}</span>
          {selectedDataPlugin && (
            <span>
              ({selectedDataPlugin.name} #{selectedDataPlugin.id})
            </span>
          )}
          <button
            className={dashboardItemStyles.settingsButton}
            onClick={(event) => {
              event.stopPropagation();
              setSettingsVisible(!settingsVisible);
            }}
            onMouseDown={(event) => event.stopPropagation()}></button>
          <button
            className={dashboardItemStyles.helpButton}
            onClick={(event) => {
              event.stopPropagation();
              setHelpVisible(!helpVisible);
            }}
            onMouseDown={(event) => event.stopPropagation()}></button>
          <button
            className={dashboardItemStyles.popoutButton}
            onClick={(event) => {
              event.stopPropagation();
              dispatch(increasePopupCount());
              setPoppedOut(true);
            }}
            onMouseDown={(event) => event.stopPropagation()}></button>
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
        </div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarTop}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the top');
            props.setDragResizeItem(
              { id: props.item.id, x: props.item.x, y: props.item.y, width: props.item.width, height: props.item.height },
              DragResizeMode.resizeTop,
            );
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarRight}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the right');
            props.setDragResizeItem(
              { id: props.item.id, x: props.item.x, y: props.item.y, width: props.item.width, height: props.item.height },
              DragResizeMode.resizeRight,
            );
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarBottom}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the bottom');
            props.setDragResizeItem(
              { id: props.item.id, x: props.item.x, y: props.item.y, width: props.item.width, height: props.item.height },
              DragResizeMode.resizeBottom,
            );
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarLeft}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.item.pluginName + ' at the left');
            props.setDragResizeItem(
              { id: props.item.id, x: props.item.x, y: props.item.y, width: props.item.width, height: props.item.height },
              DragResizeMode.resizeLeft,
            );
          }}></div>
      </div>
      <>
        {settingsVisible && (
          <div className={dashboardItemStyles.settingsBackground} onClick={() => setSettingsVisible(false)}>
            <div
              onClick={(event) => event.stopPropagation()}
              className={'text-xs ' + dashboardItemStyles.settingsWindow}
              style={{
                top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px + 1.5rem)`,
                left: `calc(${(100.0 / props.colCount) * (props.item.x + props.item.width)}% - 10px - 20rem)`,
              }}>
              <DashboardItemSettings
                selectedDataPluginId={selectedDataPlugin ? selectedDataPlugin : undefined}
                onSelectDataPlugin={(dP: DatabaseSettingsDataPluginType) => {
                  const newItem = _.clone(props.item);
                  newItem.dataPluginId = dP.id;
                  dispatch(updateDashboardItem(newItem));
                }}
                item={props.item}
                settingsComponent={
                  <plugin.settingsComponent key={plugin.name} settings={settings} setSettings={setSettings}></plugin.settingsComponent>
                }
                onClickDelete={() => props.deleteItem(props.item)}
                ignoreGlobalParameters={ignoreGlobalParameters}
                setIgnoreGlobalParameters={setIgnoreGlobalParameters}
                parametersGeneral={parametersGeneralLocal}
                setParametersGeneral={setParametersGeneralLocal}
                parametersDateRange={parametersDateRangeLocal}
                setParametersDateRange={setParametersDateRangeLocal}></DashboardItemSettings>
            </div>
          </div>
        )}
      </>
      <>
        {helpVisible && (
          <div className={dashboardItemStyles.settingsBackground} onClick={() => setHelpVisible(false)}>
            <div
              onClick={(event) => event.stopPropagation()}
              className={'text-xs ' + dashboardItemStyles.settingsWindow}
              style={{
                top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px + 1.5rem)`,
                left: `calc(${(100.0 / props.colCount) * (props.item.x + props.item.width)}% - 10px - 20rem)`,
              }}>
              <plugin.helpComponent key={plugin.name}></plugin.helpComponent>
            </div>
          </div>
        )}
      </>
    </>
  );
}

export default DashboardItem;
