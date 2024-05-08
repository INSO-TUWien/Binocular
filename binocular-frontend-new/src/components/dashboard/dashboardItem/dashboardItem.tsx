import dashboardItemStyles from './dashboardItem.module.scss';
import { createRef, useState } from 'react';

enum dragResizeModes {
  none,
  drag,
  resizeTop,
  resizeRight,
  resizeBottom,
  resizeLeft,
}

function DashboardItem(props: {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  cellSize: number;
  colCount: number;
  rowCount: number;
  highlightDropArea: (posX: number, posY: number, width: number, height: number) => void;
  clearHighlightDropArea: () => void;
}) {
  const [dragResizeMode, setDragResizeMode] = useState(dragResizeModes.none);

  const [x, setX] = useState(props.x);
  const [y, setY] = useState(props.y);
  const [width, setWidth] = useState(props.width);
  const [height, setHeight] = useState(props.height);
  const [targetX, setTargetX] = useState(props.x);
  const [targetY, setTargetY] = useState(props.y);
  const [targetWidth, setTargetWidth] = useState(props.width);
  const [targetHeight, setTargetHeight] = useState(props.height);
  const dragIndicatorRef = createRef<HTMLDivElement>();

  return (
    <>
      <div
        className={dashboardItemStyles.dashboardItem}
        style={{
          top: props.cellSize * y + 10,
          left: props.cellSize * x + 10,
          width: props.cellSize * width - 20,
          height: props.cellSize * height - 20,
        }}>
        <div className={dashboardItemStyles.dashboardItemContent}>test</div>
        <div
          className={dashboardItemStyles.dashboardItemInteractionBar}
          onMouseDown={() => {
            console.log('Start dragging dashboard item ' + props.name);
            setDragResizeMode(dragResizeModes.drag);
          }}>
          <span>{props.name}</span>
        </div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarTop}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the top');
            setDragResizeMode(dragResizeModes.resizeTop);
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarRight}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the right');
            setDragResizeMode(dragResizeModes.resizeRight);
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarBottom}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the bottom');
            setDragResizeMode(dragResizeModes.resizeBottom);
          }}></div>
        <div
          className={dashboardItemStyles.dashboardItemResizeBarLeft}
          onMouseDown={() => {
            console.log('Start resizing dashboard item ' + props.name + ' at the left');
            setDragResizeMode(dragResizeModes.resizeLeft);
          }}></div>
      </div>
      {dragResizeMode !== dragResizeModes.none && (
        <>
          <div
            ref={dragIndicatorRef}
            className={dashboardItemStyles.dragIndicator}
            style={{
              top: props.cellSize * y + 10,
              left: props.cellSize * x + 10,
              width: props.cellSize * width - 20,
              height: props.cellSize * height - 20,
            }}></div>
          <div
            className={dashboardItemStyles.dragResizeZone}
            onMouseMove={(event) => {
              event.stopPropagation();
              const target = dragIndicatorRef.current;
              if (target !== null) {
                const currX = Number(target.style.left.substring(0, target.style.left.length - 2));
                const currY = Number(target.style.top.substring(0, target.style.top.length - 2));
                const currWidth = Number(target.style.width.substring(0, target.style.width.length - 2));
                const currHeight = Number(target.style.height.substring(0, target.style.height.length - 2));
                switch (dragResizeMode) {
                  case dragResizeModes.drag:
                    target.style.top = currY + event.movementY + 'px';
                    target.style.left = currX + event.movementX + 'px';
                    setTargetX(Math.round((currX + event.movementX) / props.cellSize));
                    setTargetY(Math.round((currY + event.movementY) / props.cellSize));
                    break;
                  case dragResizeModes.resizeTop:
                    target.style.top = currY + event.movementY + 'px';
                    target.style.height = currHeight - event.movementY + 'px';
                    setTargetY(Math.round((currY + event.movementY) / props.cellSize));
                    setTargetHeight(Math.round((currHeight + event.movementY) / props.cellSize));
                    break;
                  case dragResizeModes.resizeRight:
                    target.style.width = currWidth + event.movementX + 'px';
                    setTargetWidth(Math.round((currWidth + event.movementX) / props.cellSize));
                    break;
                  case dragResizeModes.resizeBottom:
                    target.style.height = currHeight + event.movementY + 'px';
                    setTargetHeight(Math.round((currHeight + event.movementX) / props.cellSize));
                    break;
                  case dragResizeModes.resizeLeft:
                    target.style.left = currX + event.movementX + 'px';
                    target.style.width = currWidth - event.movementX + 'px';
                    setTargetX(Math.round((currX + event.movementX) / props.cellSize));
                    setTargetWidth(Math.round((currWidth + event.movementX) / props.cellSize));
                    break;
                  default:
                    break;
                }

                props.highlightDropArea(targetX, targetY, targetWidth, targetHeight);
              }
            }}
            onMouseUp={() => {
              setDragResizeMode(dragResizeModes.none);
              props.clearHighlightDropArea();
              if (targetX < 0 || targetY < 0 || targetX + targetWidth > props.colCount || targetY + targetHeight > props.rowCount) {
                console.warn(
                  `Cannot move/resize to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as its out of bounds`,
                );
                return;
              }
              setX(targetX);
              setY(targetY);
              setWidth(targetWidth);
              setHeight(targetHeight);
            }}
            onMouseLeave={() => {
              setDragResizeMode(dragResizeModes.none);
              props.clearHighlightDropArea();
            }}></div>
        </>
      )}
    </>
  );
}

export default DashboardItem;
