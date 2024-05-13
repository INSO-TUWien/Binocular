import dashboardStyles from './dashboard.module.scss';
import { createRef, useEffect, useState } from 'react';
import DashboardItem, { DashboardItemDTO } from './dashboardItem/dashboardItem.tsx';
import { showDialog } from '../informationDialog/dialogHelper.ts';
import { DragResizeMode } from './resizeMode.ts';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../redux';
import { addDashboardItem, moveDashboardItem, setDragResizeMode } from '../../redux/DashboardReducer.ts';

function Dashboard() {
  const dispatch: AppDispatch = useAppDispatch();

  const [itemMoved, setItemMoved] = useState(false);

  const [columnCount] = useState(20);
  const [rowCount] = useState(20);

  const dashboardRef = createRef<HTMLDivElement>();
  const dragIndicatorRef = createRef<HTMLDivElement>();
  const [cellSize, setCellSize] = useState(0);
  const [item, setItem] = useState<DashboardItemDTO>({ id: 0, x: 0, y: 0, width: 0, height: 0 });

  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);

  //const [dashboardItems, setDashboardItems] = useState<DashboardItemType[]>([]);

  const dashboardItems = useSelector((state: RootState) => state.dashboard.dashboardItems);
  const dragResizeMode = useSelector((state: RootState) => state.dashboard.dragResizeMode);
  const placeableItem = useSelector((state: RootState) => state.dashboard.placeableItem);

  function setDragResizeItem(item: DashboardItemDTO, mode: DragResizeMode) {
    setItem(item);
    dispatch(setDragResizeMode(mode));
  }

  function clearHighlightDropArea(columnCount: number, rowCount: number) {
    if (dragIndicatorRef.current !== null) {
      dragIndicatorRef.current.style.display = 'none';
    }
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < columnCount; x++) {
        document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightActive);
      }
    }
  }

  function highlightDropArea(posX: number, posY: number, width: number, height: number) {
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < columnCount; x++) {
        if (y > posY - 1 && x > posX - 1 && y < posY + height && x < posX + width) {
          document.getElementById('highlightY' + y + 'X' + x)?.classList.add(dashboardStyles.dashboardBackgroundCellHighlightActive);
        } else {
          document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightActive);
        }
      }
    }
  }

  useEffect(() => {
    if (dashboardRef.current !== null) {
      setCellSize(dashboardRef.current.offsetWidth / columnCount);
    }
  }, [dashboardRef]);

  return (
    <>
      <div className={dashboardStyles.dashboard} ref={dashboardRef}>
        <div className={dashboardStyles.dashboardContent}>
          <table className={dashboardStyles.dashboardBackground}>
            <tbody>
              {[...Array(rowCount).keys()].map((row) => {
                return (
                  <tr key={'dashboardBackgroundRow' + row}>
                    {[...Array(columnCount).keys()].map((col) => {
                      return (
                        <td
                          key={'dashboardBackgroundCol' + col}
                          style={{
                            width: cellSize,
                            height: cellSize,
                          }}>
                          <div id={'cellY' + row + 'X' + col} className={dashboardStyles.dashboardBackgroundCell}>
                            <div id={'highlightY' + row + 'X' + col} className={dashboardStyles.dashboardBackgroundCellHighlight}></div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={dashboardStyles.dragIndicator} ref={dragIndicatorRef} id={'dragIndicator'}></div>
          <>
            {dashboardItems.map((dashboardItem) => {
              return (
                <DashboardItem
                  key={'dashboardItem' + dashboardItem.id}
                  cellSize={cellSize}
                  item={dashboardItem}
                  colCount={columnCount}
                  rowCount={rowCount}
                  setDragResizeItem={setDragResizeItem}></DashboardItem>
              );
            })}
          </>
          {dragResizeMode !== DragResizeMode.none && (
            <>
              <div
                className={dashboardStyles.dragResizeZone}
                onMouseEnter={(event) => {
                  setItemMoved(true);
                  event.stopPropagation();
                  if (dragIndicatorRef.current !== null) {
                    if (dragResizeMode === DragResizeMode.place) {
                      dragIndicatorRef.current.style.display = 'block';
                      dragIndicatorRef.current.style.top = `calc(${(50.0 / columnCount) * (1 - placeableItem.width)}% + 10px)`;
                      dragIndicatorRef.current.style.left = `calc(${(50.0 / columnCount) * (1 - placeableItem.height)}% + 10px)`;
                      dragIndicatorRef.current.style.width = `calc(${(100.0 / columnCount) * placeableItem.width}% - 20px)`;
                      dragIndicatorRef.current.style.height = `calc(${(100.0 / rowCount) * placeableItem.height}% - 20px)`;
                    } else {
                      dragIndicatorRef.current.style.display = 'block';
                      dragIndicatorRef.current.style.top = `calc(${(100.0 / rowCount) * item.y}% + 10px)`;
                      dragIndicatorRef.current.style.left = `calc(${(100.0 / columnCount) * item.x}% + 10px)`;
                      dragIndicatorRef.current.style.width = `calc(${(100.0 / columnCount) * item.width}% - 20px)`;
                      dragIndicatorRef.current.style.height = `calc(${(100.0 / rowCount) * item.height}% - 20px)`;
                    }
                  }
                }}
                onMouseMove={(event) => {
                  event.stopPropagation();
                  if (dragIndicatorRef.current !== null) {
                    switch (dragResizeMode) {
                      case DragResizeMode.drag:
                        dragIndicatorRef.current.style.left = dragIndicatorRef.current.offsetLeft + event.movementX + 'px';
                        dragIndicatorRef.current.style.top = dragIndicatorRef.current.offsetTop + event.movementY + 'px';
                        setTargetX(Math.round((dragIndicatorRef.current.offsetLeft + event.movementX) / cellSize));
                        setTargetY(Math.round((dragIndicatorRef.current.offsetTop + event.movementY) / cellSize));
                        setTargetWidth(item.width);
                        setTargetHeight(item.height);
                        break;
                      case DragResizeMode.resizeTop:
                        dragIndicatorRef.current.style.top = dragIndicatorRef.current.offsetTop + event.movementY + 'px';
                        dragIndicatorRef.current.style.height = dragIndicatorRef.current.offsetHeight - event.movementY + 'px';
                        setTargetX(item.x);
                        setTargetY(Math.round((dragIndicatorRef.current.offsetTop + event.movementY) / cellSize));
                        setTargetWidth(item.width);
                        setTargetHeight(Math.round((dragIndicatorRef.current.offsetHeight + event.movementY) / cellSize));
                        break;
                      case DragResizeMode.resizeRight:
                        dragIndicatorRef.current.style.width = dragIndicatorRef.current.offsetWidth + event.movementX + 'px';
                        setTargetX(item.x);
                        setTargetY(item.y);
                        setTargetWidth(Math.round((dragIndicatorRef.current.offsetWidth + event.movementX) / cellSize));
                        setTargetHeight(item.height);
                        break;
                      case DragResizeMode.resizeBottom:
                        dragIndicatorRef.current.style.height = dragIndicatorRef.current.offsetHeight + event.movementY + 'px';
                        setTargetX(item.x);
                        setTargetY(item.y);
                        setTargetWidth(item.width);
                        setTargetHeight(Math.round((dragIndicatorRef.current.offsetHeight + event.movementX) / cellSize));
                        break;
                      case DragResizeMode.resizeLeft:
                        dragIndicatorRef.current.style.left = dragIndicatorRef.current.offsetLeft + event.movementX + 'px';
                        dragIndicatorRef.current.style.width = dragIndicatorRef.current.offsetWidth - event.movementX + 'px';
                        setTargetX(Math.round((dragIndicatorRef.current.offsetLeft + event.movementX) / cellSize));
                        setTargetY(item.y);
                        setTargetWidth(Math.round((dragIndicatorRef.current.offsetWidth + event.movementX) / cellSize));
                        setTargetHeight(item.height);
                        break;
                      case DragResizeMode.place:
                        dragIndicatorRef.current.style.left = dragIndicatorRef.current.offsetLeft + event.movementX + 'px';
                        dragIndicatorRef.current.style.top = dragIndicatorRef.current.offsetTop + event.movementY + 'px';
                        setTargetX(Math.round((dragIndicatorRef.current.offsetLeft + event.movementX) / cellSize));
                        setTargetY(Math.round((dragIndicatorRef.current.offsetTop + event.movementY) / cellSize));
                        setTargetWidth(placeableItem.width);
                        setTargetHeight(placeableItem.height);
                        break;
                      default:
                        break;
                    }

                    highlightDropArea(targetX, targetY, targetWidth, targetHeight);
                  }
                }}
                onMouseUp={() => {
                  if (itemMoved) {
                    if (targetX < 0 || targetY < 0 || targetX + targetWidth > columnCount || targetY + targetHeight > rowCount) {
                      setTargetX(item.x);
                      setTargetY(item.y);
                      setTargetWidth(item.width);
                      setTargetHeight(item.height);
                      showDialog(
                        'Warning!',
                        `Cannot move/resize to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as its out of bounds`,
                      );
                      console.warn(
                        `Cannot move/resize to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as its out of bounds`,
                      );
                      return;
                    }

                    if (targetWidth < 1 || targetHeight < 1) {
                      setTargetX(item.x);
                      setTargetY(item.y);
                      setTargetWidth(item.width);
                      setTargetHeight(item.height);
                      showDialog('Warning!', `Cannot resize to size ${targetWidth},${targetHeight} as its too small`);
                      console.warn(`Cannot resize to size ${targetWidth},${targetHeight} as its too small`);
                      return;
                    }

                    if (dragResizeMode === DragResizeMode.place) {
                      dispatch(
                        addDashboardItem({
                          id: item.id,
                          x: targetX,
                          y: targetY,
                          width: targetWidth,
                          height: targetHeight,
                          pluginName: placeableItem.pluginName,
                        }),
                      );
                    } else {
                      dispatch(moveDashboardItem({ id: item.id, x: targetX, y: targetY, width: targetWidth, height: targetHeight }));
                    }
                  }
                  setItemMoved(false);
                  clearHighlightDropArea(columnCount, rowCount);
                  dispatch(setDragResizeMode(DragResizeMode.none));
                }}
                onMouseLeave={() => {
                  setItemMoved(false);
                  dispatch(setDragResizeMode(DragResizeMode.none));
                  clearHighlightDropArea(columnCount, rowCount);
                }}></div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
