import dashboardItemStyles from './dashboardItem.module.scss';
import { useState } from 'react';
function DashboardItem(props: {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  cellSize: number;
  highlightDropArea: (posY: number, posX: number, width: number, height: number) => void;
  clearHighlightDropArea: () => void;
}) {
  const [dragState, setDragState] = useState(false);

  const [x, setX] = useState(props.x);
  const [y, setY] = useState(props.y);
  const [width, setWidth] = useState(props.width);
  const [height, setHeight] = useState(props.height);
  const [targetX, setTargetX] = useState(props.x);
  const [targetY, setTargetY] = useState(props.y);
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
        <div
          className={dashboardItemStyles.dashboardItemsInteractionBar}
          onMouseDown={() => {
            console.log('Start dragging dashboard item ' + props.name);
            setDragState(true);
          }}>
          <span>{props.name}</span>
        </div>
        <div>test</div>
      </div>
      {dragState && (
        <div
          className={dashboardItemStyles.dragIndicator}
          style={{
            top: props.cellSize * y,
            left: props.cellSize * x,
            width: props.cellSize * width,
            height: props.cellSize * height,
          }}
          onMouseMove={(event) => {
            event.stopPropagation();
            const target = event.target as HTMLDivElement;
            const currY = Number(target.style.top.substring(0, target.style.top.length - 2));
            const currX = Number(target.style.left.substring(0, target.style.left.length - 2));
            target.style.top = currY + event.movementY + 'px';
            target.style.left = currX + event.movementX + 'px';
            const targetPosX = Math.floor((currX + event.movementX) / props.cellSize);
            const targetPosY = Math.floor((currY + event.movementY) / props.cellSize);
            setTargetX(targetPosX);
            setTargetY(targetPosY);
            props.highlightDropArea(targetPosY, targetPosX, props.width, props.height);
          }}
          onMouseUp={() => {
            setDragState(false);
            props.clearHighlightDropArea();
            setX(targetX);
            setY(targetY);
          }}
          onMouseLeave={() => {
            setDragState(false);
            props.clearHighlightDropArea();
          }}></div>
      )}
    </>
  );
}

export default DashboardItem;
