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
          top: `calc(${100.0/props.rowCount*y}% + 10px)`,
          left: `calc(${100.0/props.colCount*x}% + 10px)`,
          width: `calc(${100.0/props.colCount*width}% - 20px)`,
          height: `calc(${100.0/props.rowCount*height}% - 20px)`,
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
              top: `calc(${100.0/props.rowCount*y}% + 10px)`,
              left: `calc(${100.0/props.colCount*x}% + 10px)`,
              width: `calc(${100.0/props.colCount*width}% - 20px)`,
              height: `calc(${100.0/props.rowCount*height}% - 20px)`,
            }}></div>
          <div
            className={dashboardItemStyles.dragResizeZone}
            onMouseMove={(event) => {
              event.stopPropagation();
              const target = dragIndicatorRef.current;
              if (target !== null) {
                switch (dragResizeMode) {
                  case dragResizeModes.drag:
                    target.style.left = target.offsetLeft + event.movementX + 'px';
                    target.style.top = target.offsetTop + event.movementY + 'px';
                    setTargetX(Math.round((target.offsetLeft + event.movementX) / props.cellSize));
                    setTargetY(Math.round((target.offsetTop + event.movementY) / props.cellSize));
                    break;
                  case dragResizeModes.resizeTop:
                    target.style.top = target.offsetTop + event.movementY + 'px';
                    target.style.height = target.offsetHeight - event.movementY + 'px';
                    setTargetY(Math.round((target.offsetTop + event.movementY) / props.cellSize));
                    setTargetHeight(Math.round((target.offsetHeight  + event.movementY) / props.cellSize));
                    break;
                  case dragResizeModes.resizeRight:
                    target.style.width = target.offsetWidth  + event.movementX + 'px';
                    setTargetWidth(Math.round((target.offsetWidth + event.movementX) / props.cellSize));
                    break;
                  case dragResizeModes.resizeBottom:
                    target.style.height = target.offsetHeight  + event.movementY + 'px';
                    setTargetHeight(Math.round((target.offsetHeight  + event.movementX) / props.cellSize));
                    break;
                  case dragResizeModes.resizeLeft:
                    target.style.left = target.offsetLeft + event.movementX + 'px';
                    target.style.width = target.offsetWidth  - event.movementX + 'px';
                    setTargetX(Math.round((target.offsetLeft + event.movementX) / props.cellSize));
                    setTargetWidth(Math.round((target.offsetWidth  + event.movementX) / props.cellSize));
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
                setTargetX(x)
                setTargetY(y)
                setTargetWidth(width);
                setTargetHeight(height);
                console.warn(
                  `Cannot move/resize to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as its out of bounds`,
                );
                return;
              }

              if (targetWidth < 1 || targetHeight < 1 ) {
                setTargetX(x)
                setTargetY(y)
                setTargetWidth(width);
                setTargetHeight(height);
                console.warn(
                  `Cannot resize to size ${targetWidth},${targetHeight} as its too small`,
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
