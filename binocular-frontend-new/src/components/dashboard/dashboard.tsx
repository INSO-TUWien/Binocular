import dashboardStyles from './dashboard.module.scss';
import { createRef, useEffect, useState } from 'react';
import DashboardItem from './dashboardItem/dashboardItem.tsx';
import { showDialog } from '../informationDialog/dialogHelper.ts';
import { DragResizeMode } from './resizeMode.ts';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../redux';
import { addDashboardItem, moveDashboardItem, setDragResizeMode, deleteDashboardItem } from '../../redux/general/dashboardReducer.ts';
import DashboardItemPlaceholder from './dashboardItemPlaceholder/dashboardItemPlaceholder.tsx';
import { SettingsGeneralGridSize } from '../../types/settings/generalSettingsType.ts';
import { DashboardItemDTO, DashboardItemType } from '../../types/general/dashboardItemType.ts';

function Dashboard() {
  const dispatch: AppDispatch = useAppDispatch();

  const [itemMoved, setItemMoved] = useState(false);

  const gridSize = useSelector((state: RootState) => state.settings.general.gridSize);
  let cellCount: number;
  let gridMultiplier: number;

  switch (gridSize) {
    case SettingsGeneralGridSize.small:
      cellCount = 40;
      gridMultiplier = 1;
      break;
    case SettingsGeneralGridSize.medium:
    default:
      cellCount = 20;
      gridMultiplier = 2;
      break;
    case SettingsGeneralGridSize.large:
      cellCount = 10;
      gridMultiplier = 4;
      break;
  }

  const columnCount = cellCount;
  const rowCount = cellCount;

  const dashboardRef = createRef<HTMLDivElement>();
  const dragIndicatorRef = createRef<HTMLDivElement>();
  const [cellSize, setCellSize] = useState(0);
  const [movingItem, setMovingItem] = useState<DashboardItemDTO>({ id: 0, x: 0, y: 0, width: 0, height: 0 });

  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);

  const dashboardItems = useSelector((state: RootState) => state.dashboard.dashboardItems);
  const dragResizeMode = useSelector((state: RootState) => state.dashboard.dragResizeMode);
  const placeableItem = useSelector((state: RootState) => state.dashboard.placeableItem);
  const dashboardState = useSelector((state: RootState) => state.dashboard.dashboardState);

  function setDragResizeItem(item: DashboardItemDTO, mode: DragResizeMode) {
    setMovingItem(item);
    dispatch(setDragResizeMode(mode));
  }

  function clearHighlightDropArea(columnCount: number, rowCount: number) {
    if (dragIndicatorRef.current !== null) {
      dragIndicatorRef.current.style.display = 'none';
    }
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < columnCount; x++) {
        document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightActive);
        document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightNotPossible);
      }
    }
  }

  function highlightDropArea(posX: number, posY: number, width: number, height: number) {
    console.log(6 * gridMultiplier < movingItem.y || 6 * gridMultiplier > movingItem.y + movingItem.height);
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < columnCount; x++) {
        if (y > posY - 1 && x > posX - 1 && y < posY + height && x < posX + width) {
          if (
            dashboardState[y * gridMultiplier][x * gridMultiplier] !== 0 &&
            dashboardState[y * gridMultiplier][x * gridMultiplier] !== movingItem.id
          ) {
            document.getElementById('highlightY' + y + 'X' + x)?.classList.add(dashboardStyles.dashboardBackgroundCellHighlightNotPossible);
          } else {
            document.getElementById('highlightY' + y + 'X' + x)?.classList.add(dashboardStyles.dashboardBackgroundCellHighlightActive);
          }
        } else {
          document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightActive);
          document
            .getElementById('highlightY' + y + 'X' + x)
            ?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightNotPossible);
        }
      }
    }
  }

  useEffect(() => {
    if (dashboardRef.current !== null) {
      setCellSize(dashboardRef.current.offsetWidth / columnCount);
    }
  }, [columnCount, dashboardRef, gridSize]);

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
            {dashboardItems.map((dashboardItem: DashboardItemType) => {
              return dragResizeMode === DragResizeMode.none ? (
                <DashboardItem
                  key={'dashboardItem' + dashboardItem.id}
                  cellSize={cellSize}
                  item={dashboardItem}
                  colCount={columnCount * gridMultiplier}
                  rowCount={rowCount * gridMultiplier}
                  setDragResizeItem={setDragResizeItem}
                  deleteItem={(item) => dispatch(deleteDashboardItem(item))}></DashboardItem>
              ) : (
                <DashboardItemPlaceholder
                  key={'dashboardItem' + dashboardItem.id}
                  cellSize={cellSize}
                  item={dashboardItem}
                  colCount={columnCount * gridMultiplier}
                  rowCount={rowCount * gridMultiplier}></DashboardItemPlaceholder>
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
                      dragIndicatorRef.current.style.top = `calc(${(50.0 / columnCount / gridMultiplier) * (1 - placeableItem.width)}% + 10px)`;
                      dragIndicatorRef.current.style.left = `calc(${(50.0 / columnCount / gridMultiplier) * (1 - placeableItem.height)}% + 10px)`;
                      dragIndicatorRef.current.style.width = `calc(${(100.0 / columnCount / gridMultiplier) * placeableItem.width}% - 20px)`;
                      dragIndicatorRef.current.style.height = `calc(${(100.0 / rowCount / gridMultiplier) * placeableItem.height}% - 20px)`;
                    } else {
                      dragIndicatorRef.current.style.display = 'block';
                      dragIndicatorRef.current.style.top = `calc(${(100.0 / rowCount / gridMultiplier) * movingItem.y}% + 10px)`;
                      dragIndicatorRef.current.style.left = `calc(${(100.0 / columnCount / gridMultiplier) * movingItem.x}% + 10px)`;
                      dragIndicatorRef.current.style.width = `calc(${(100.0 / columnCount / gridMultiplier) * movingItem.width}% - 20px)`;
                      dragIndicatorRef.current.style.height = `calc(${(100.0 / rowCount / gridMultiplier) * movingItem.height}% - 20px)`;
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
                        setTargetWidth(movingItem.width / gridMultiplier);
                        setTargetHeight(movingItem.height / gridMultiplier);
                        break;
                      case DragResizeMode.resizeTop:
                        dragIndicatorRef.current.style.top = dragIndicatorRef.current.offsetTop + event.movementY + 'px';
                        dragIndicatorRef.current.style.height = dragIndicatorRef.current.offsetHeight - event.movementY + 'px';
                        setTargetX(movingItem.x / gridMultiplier);
                        setTargetY(Math.round((dragIndicatorRef.current.offsetTop + event.movementY) / cellSize));
                        setTargetWidth(movingItem.width / gridMultiplier);
                        setTargetHeight(Math.round((dragIndicatorRef.current.offsetHeight + event.movementY) / cellSize));
                        break;
                      case DragResizeMode.resizeRight:
                        dragIndicatorRef.current.style.width = dragIndicatorRef.current.offsetWidth + event.movementX + 'px';
                        setTargetX(movingItem.x / gridMultiplier);
                        setTargetY(movingItem.y / gridMultiplier);
                        setTargetWidth(Math.round((dragIndicatorRef.current.offsetWidth + event.movementX) / cellSize));
                        setTargetHeight(movingItem.height / gridMultiplier);
                        break;
                      case DragResizeMode.resizeBottom:
                        dragIndicatorRef.current.style.height = dragIndicatorRef.current.offsetHeight + event.movementY + 'px';
                        setTargetX(movingItem.x / gridMultiplier);
                        setTargetY(movingItem.y / gridMultiplier);
                        setTargetWidth(movingItem.width / gridMultiplier);
                        setTargetHeight(Math.round((dragIndicatorRef.current.offsetHeight + event.movementX) / cellSize));
                        break;
                      case DragResizeMode.resizeLeft:
                        dragIndicatorRef.current.style.left = dragIndicatorRef.current.offsetLeft + event.movementX + 'px';
                        dragIndicatorRef.current.style.width = dragIndicatorRef.current.offsetWidth - event.movementX + 'px';
                        setTargetX(Math.round((dragIndicatorRef.current.offsetLeft + event.movementX) / cellSize));
                        setTargetY(movingItem.y / gridMultiplier);
                        setTargetWidth(Math.round((dragIndicatorRef.current.offsetWidth + event.movementX) / cellSize));
                        setTargetHeight(movingItem.height / gridMultiplier);
                        break;
                      case DragResizeMode.place:
                        dragIndicatorRef.current.style.left = dragIndicatorRef.current.offsetLeft + event.movementX + 'px';
                        dragIndicatorRef.current.style.top = dragIndicatorRef.current.offsetTop + event.movementY + 'px';
                        setTargetX(Math.round((dragIndicatorRef.current.offsetLeft + event.movementX) / cellSize));
                        setTargetY(Math.round((dragIndicatorRef.current.offsetTop + event.movementY) / cellSize));
                        setTargetWidth(placeableItem.width / gridMultiplier);
                        setTargetHeight(placeableItem.height / gridMultiplier);
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
                      setTargetX(movingItem.x);
                      setTargetY(movingItem.y);
                      setTargetWidth(movingItem.width);
                      setTargetHeight(movingItem.height);
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
                      setTargetX(movingItem.x);
                      setTargetY(movingItem.y);
                      setTargetWidth(movingItem.width);
                      setTargetHeight(movingItem.height);
                      showDialog('Warning!', `Cannot resize to size ${targetWidth},${targetHeight} as its too small`);
                      console.warn(`Cannot resize to size ${targetWidth},${targetHeight} as its too small`);
                      return;
                    }

                    if (dragResizeMode === DragResizeMode.place) {
                      console.log(targetX * gridMultiplier);
                      dispatch(
                        addDashboardItem({
                          id: movingItem.id,
                          x: targetX * gridMultiplier,
                          y: targetY * gridMultiplier,
                          width: targetWidth * gridMultiplier,
                          height: targetHeight * gridMultiplier,
                          pluginName: placeableItem.pluginName,
                        }),
                      );
                    } else {
                      dispatch(
                        moveDashboardItem({
                          id: movingItem.id,
                          x: targetX * gridMultiplier,
                          y: targetY * gridMultiplier,
                          width: targetWidth * gridMultiplier,
                          height: targetHeight * gridMultiplier,
                        }),
                      );
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
