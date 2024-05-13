import dashboardItemStyles from './dashboardItem.module.scss';
import { DragResizeMode } from '../resizeMode.ts';
import { visualizationPlugins } from '../../../plugins/pluginRegistry.ts';
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
}) {
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
        <div className={dashboardItemStyles.dashboardItemContent}>
          {props.item.pluginName !== ''
            ? visualizationPlugins
                .filter((p) => p.name === props.item.pluginName)
                .map((p) => {
                  return <p.chart key={p.name}></p.chart>;
                })
            : ''}
        </div>
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
    </>
  );
}

export default DashboardItem;
