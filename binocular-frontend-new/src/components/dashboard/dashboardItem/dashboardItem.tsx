import dashboardItemStyles from './dashboardItem.module.scss';
import { DragResizeMode } from '../resizeMode.ts';
import { dataPlugins, visualizationPlugins } from '../../../plugins/pluginRegistry.ts';
import { useState } from 'react';
import DashboardItemPopout from '../dashboardItemPopout/dashboardItemPopout.tsx';
import { increasePopupCount } from '../../../redux/dashboardReducer.ts';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';
import openInNewGray from '../../../assets/open_in_new_white.svg';
import { useSelector } from 'react-redux';

export interface DashboardItemDTO {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardItemType extends DashboardItemDTO {
  pluginName?: string;
}
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
  const plugin = visualizationPlugins.filter((p) => p.name === props.item.pluginName)[0];
  const [settings, setSettings] = useState(plugin.defaultSettings);

  const [poppedOut, setPoppedOut] = useState(false);

  const currentDataPlugin = useSelector((state: RootState) => state.settings.dataPlugin);
  const authorList = useSelector((state: RootState) => state.authors.authorList);

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
            <span>Popped Out!</span>
            <DashboardItemPopout onClosing={() => setPoppedOut(false)}>
              <plugin.chartComponent
                key={plugin.name}
                settings={settings}
                authorList={authorList}
                dataConnection={dataPlugins.filter((plugin) => plugin.name === currentDataPlugin)[0]}></plugin.chartComponent>
            </DashboardItemPopout>
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
            ) : (
              <plugin.chartComponent
                key={plugin.name}
                settings={settings}
                authorList={authorList}
                dataConnection={dataPlugins.filter((plugin) => plugin.name === currentDataPlugin)[0]}></plugin.chartComponent>
            )}
          </div>
        )}
        <div
          className={dashboardItemStyles.dashboardItemInteractionBar}
          onMouseDown={() => {
            console.log('Start dragging dashboard item ' + props.item.pluginName);
            props.setDragResizeItem(
              { id: props.item.id, x: props.item.x, y: props.item.y, width: props.item.width, height: props.item.height },
              DragResizeMode.drag,
            );
          }}>
          <span>{props.item.pluginName}</span>
          <button
            className={dashboardItemStyles.settingsButton}
            onClick={(event) => {
              event.stopPropagation();
              setSettingsVisible(!settingsVisible);
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
      {settingsVisible && (
        <div className={dashboardItemStyles.settingsBackground} onClick={() => setSettingsVisible(false)}>
          <div
            onClick={(event) => event.stopPropagation()}
            className={'text-xs ' + dashboardItemStyles.settingsWindow}
            style={{
              top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px + 1.5rem)`,
              left: `calc(${(100.0 / props.colCount) * (props.item.x + props.item.width)}% - 10px - 20rem)`,
            }}>
            <div className={'font-bold underline'}>{props.item.pluginName + ' (#' + props.item.id + ')'}</div>
            <hr className={'text-base-300 m-1'} />
            <div>
              <label className="label cursor-pointer">
                <span className="label-text">Ignore Global Parameters:</span>
                <input type="checkbox" className="toggle toggle-accent toggle-sm"/>
              </label>
            </div>
            <hr className={'text-base-300 m-1'}/>
            {visualizationPlugins
              .filter((p) => p.name === props.item.pluginName)
              .map((p) => {
                return <p.settingsComponent key={p.name} settings={settings} setSettings={setSettings}></p.settingsComponent>;
              })}
            <hr className={'text-base-300 m-1'} />
            <button className={'btn btn-error btn-xs w-full'} onClick={() => props.deleteItem(props.item)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardItem;
