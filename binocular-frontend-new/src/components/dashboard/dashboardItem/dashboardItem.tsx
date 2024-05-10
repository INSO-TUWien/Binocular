import dashboardItemStyles from './dashboardItem.module.scss';
import { DragResizeMode } from '../resizeMode.ts';

export interface DashboardItemDTO {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardItemType extends DashboardItemDTO {}
function DashboardItem(props: {
  id: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  cellSize: number;
  colCount: number;
  rowCount: number;
  setDragResizeItem: (item: DashboardItemDTO, mode: DragResizeMode) => void;
}) {
  return (
    <>
      <div
        className={dashboardItemStyles.dashboardItem}
        id={'dashboardItem' + props.id}
        style={{
          top: `calc(${(100.0 / props.rowCount) * props.y}% + 10px)`,
          left: `calc(${(100.0 / props.colCount) * props.x}% + 10px)`,
          width: `calc(${(100.0 / props.colCount) * props.width}% - 20px)`,
          height: `calc(${(100.0 / props.rowCount) * props.height}% - 20px)`,
        }}>
        <div className={dashboardItemStyles.dashboardItemContent}>test</div>
        <div
          className={dashboardItemStyles.dashboardItemInteractionBar}
          onMouseDown={() => {
            console.log('Start dragging dashboard item ' + props.name);
            props.setDragResizeItem(
              { id: props.id, x: props.x, y: props.y, width: props.width, height: props.height },
              DragResizeMode.drag,
            );
          }}>
          <span>{props.name}</span>
        </div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarTop}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the top');
            props.setDragResizeItem(
              { id: props.id, x: props.x, y: props.y, width: props.width, height: props.height },
              DragResizeMode.resizeTop,
            );
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarRight}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the right');
            props.setDragResizeItem(
              { id: props.id, x: props.x, y: props.y, width: props.width, height: props.height },
              DragResizeMode.resizeRight,
            );
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarBottom}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the bottom');
            props.setDragResizeItem(
              { id: props.id, x: props.x, y: props.y, width: props.width, height: props.height },
              DragResizeMode.resizeBottom,
            );
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarLeft}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the left');
            props.setDragResizeItem(
              { id: props.id, x: props.x, y: props.y, width: props.width, height: props.height },
              DragResizeMode.resizeLeft,
            );
          }}></div>
      </div>
    </>
  );
}

export default DashboardItem;
