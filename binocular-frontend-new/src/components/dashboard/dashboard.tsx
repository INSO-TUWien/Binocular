import dashboardStyles from './dashboard.module.scss';
import { createRef, useEffect, useRef, useState } from 'react';
import DashboardItem from './dashboardItem/dashboardItem.tsx';
import { DragResizeMode } from './resizeMode.ts';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, store, useAppDispatch } from '../../redux';
import {
  addDashboardItem,
  clearDashboard,
  clearDashboardItem,
  deleteDashboardItem,
  moveDashboardItem,
  placeDashboardItem,
  setDashboardState,
  updateDashboardItem,
} from '../../redux/reducer/general/dashboardReducer.ts';
import { SettingsGeneralGridSize } from '../../types/settings/generalSettingsType.ts';
import type { DashboardItemDTO, DashboardItemType } from '../../types/general/dashboardItemType.ts';
import type { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import { addNotification } from '../../redux/reducer/general/notificationsReducer.ts';
import { AlertType } from '../../types/general/alertType.ts';
import {
  clearHighlightDropArea,
  highlightDropArea,
  moveDragIndicator,
  moveResizeDashboardItem,
  placeDragIndicator,
  setDragResizeMode,
} from './dashboardHelper.ts';
import _ from 'lodash';
import { DragDropElementType } from '../../types/general/dragDropElementType.ts';
import { debounce } from 'throttle-debounce';

function Dashboard() {
  const dispatch: AppDispatch = useAppDispatch();

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

  const lastPlaceCoordinates = useRef<{ x: number; y: number } | undefined>(undefined);

  const columnCount = cellCount;
  const rowCount = cellCount;

  const dashboardRef = createRef<HTMLDivElement>();
  const dragIndicatorRef = createRef<HTMLDivElement>();
  const dragResizeZoneRef = createRef<HTMLDivElement>();
  const [cellSize, setCellSize] = useState(0);
  const movingItem = useRef<DashboardItemDTO>({ id: 0, x: 0, y: 0, width: 0, height: 0 });

  const dragResizeMode = useRef(DragResizeMode.none);
  const rawIndicatorSize = useRef({ width: 0, height: 0, left: 0, top: 0, initialized: false });

  let targetX = 0;
  let targetY = 0;
  let targetWidth = 0;
  let targetHeight = 0;

  // eslint-disable-next-line prefer-const
  let [dashboardItems, setDashboardItems] = useState(store.getState().dashboard.dashboardItems);
  // naming due to duplicate function setDashboardState in reducer
  // eslint-disable-next-line prefer-const
  let [dashboardState1, setDashboardState1] = useState(store.getState().dashboard.dashboardState);

  const [dashboardHeight, setDashboardHeight] = useState(dashboardRef.current?.offsetHeight);
  const [dashboardWidth, setDashboardWidth] = useState(dashboardRef.current?.offsetWidth);

  const placeableItem: DashboardItemType = useSelector((state: RootState) => state.dashboard.placeableItem);

  const configuredDataPlugins: DatabaseSettingsDataPluginType[] = useSelector((state: RootState) => state.settings.database.dataPlugins);

  store.subscribe(() => {
    const newDashboardItems = store.getState().dashboard.dashboardItems;
    const newDashboardState = store.getState().dashboard.dashboardState;
    switch (store.getState().actions.lastAction) {
      case moveDashboardItem.type:
        newDashboardItems.forEach((dashboardItem: DashboardItemType) => {
          moveResizeDashboardItem(dashboardItem, rowCount, gridMultiplier, columnCount);
        });
        setDashboardItems(newDashboardItems);
        setDashboardState1(newDashboardState);
        break;
      case setDashboardState.type:
      case clearDashboard.type:
      case placeDashboardItem.type:
      case addDashboardItem.type:
      case updateDashboardItem.type:
      case deleteDashboardItem.type:
        setDashboardItems(newDashboardItems);
        setDashboardState1(newDashboardState);
        break;
    }
  });

  const defaultDataPlugin = configuredDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.isDefault)[0];

  function setDragResizeItem(itemId: number, mode: DragResizeMode) {
    movingItem.current = dashboardItems.find((dashboardItem: DashboardItemType) => dashboardItem.id === itemId);
    rawIndicatorSize.current.initialized = false;
    setDragResizeMode(dragResizeZoneRef, dragResizeMode, mode);
  }

  useEffect(() => {
    if (placeableItem !== undefined) {
      setDragResizeMode(dragResizeZoneRef, dragResizeMode, DragResizeMode.place);
    } else {
      setDragResizeMode(dragResizeZoneRef, dragResizeMode, DragResizeMode.none);
    }
  }, [placeableItem]);

  function positionDashboardItem() {
    if (movingItem.current.x !== undefined && movingItem.current.y !== undefined) {
      const rightEdge = (movingItem.current.x + movingItem.current.width) / gridMultiplier;
      const bottomEdge = (movingItem.current.y + movingItem.current.height) / gridMultiplier;
      switch (dragResizeMode.current) {
        case DragResizeMode.drag:
        case DragResizeMode.place: {
          targetWidth = Math.max(1, targetWidth);
          targetHeight = Math.max(1, targetHeight);
          targetX = Math.max(0, Math.min(columnCount - targetWidth, targetX));
          targetY = Math.max(0, Math.min(rowCount - targetHeight, targetY));
          break;
        }
        case DragResizeMode.resizeRight:
        case DragResizeMode.resizeBottom:
        case DragResizeMode.resizeBottomRight: {
          targetWidth = Math.max(1, Math.min(columnCount - targetX, targetWidth));
          targetHeight = Math.max(1, Math.min(rowCount - targetY, targetHeight));
          break;
        }
        case DragResizeMode.resizeLeft:
        case DragResizeMode.resizeBottomLeft: {
          targetX = Math.max(0, Math.min(rightEdge - 1, targetX));
          targetWidth = rightEdge - targetX;
          targetHeight = Math.max(1, Math.min(rowCount - targetY, targetHeight));
          break;
        }
        case DragResizeMode.resizeTop:
        case DragResizeMode.resizeTopRight: {
          targetY = Math.max(0, Math.min(bottomEdge - 1, targetY));
          targetHeight = bottomEdge - targetY;
          targetWidth = Math.max(1, Math.min(columnCount - targetX, targetWidth));
          break;
        }
        case DragResizeMode.resizeTopLeft: {
          targetX = Math.max(0, Math.min(rightEdge - 1, targetX));
          targetY = Math.max(0, Math.min(bottomEdge - 1, targetY));
          targetWidth = rightEdge - targetX;
          targetHeight = bottomEdge - targetY;
          break;
        }
      }

      switch (dragResizeMode.current) {
        case DragResizeMode.place:
          if (
            highlightDropArea(
              movingItem,
              dashboardState1,
              rowCount,
              columnCount,
              gridMultiplier,
              targetX,
              targetY,
              targetWidth,
              targetHeight,
            )
          ) {
            dispatch(
              addDashboardItem({
                id: movingItem.current.id,
                x: targetX * gridMultiplier,
                y: targetY * gridMultiplier,
                width: targetWidth * gridMultiplier,
                height: targetHeight * gridMultiplier,
                pluginName: placeableItem.pluginName,
                dataPluginId: defaultDataPlugin ? defaultDataPlugin.id : undefined,
              }),
            );
          } else {
            setDragResizeMode(dragResizeZoneRef, dragResizeMode, DragResizeMode.none);
            clearHighlightDropArea(dragIndicatorRef, columnCount, rowCount);
            dispatch(
              addNotification({
                text: `Cannot place to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as it would overlap with a different item`,
                type: AlertType.warning,
              }),
            );
            dispatch(clearDashboardItem());
            console.warn(
              `Cannot place to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as it would overlap with a different item`,
            );
          }
          break;
        default:
          if (
            highlightDropArea(
              movingItem,
              dashboardState1,
              rowCount,
              columnCount,
              gridMultiplier,
              targetX,
              targetY,
              targetWidth,
              targetHeight,
            )
          ) {
            dispatch(
              moveDashboardItem({
                id: movingItem.current.id,
                x: targetX * gridMultiplier,
                y: targetY * gridMultiplier,
                width: targetWidth * gridMultiplier,
                height: targetHeight * gridMultiplier,
                dataPluginId: defaultDataPlugin ? defaultDataPlugin.id : undefined,
              }),
            );
            dispatch({ type: 'RESIZE_DASHBOARD_ITEM', payload: { dashboardItemId: movingItem.current.id } });
          } else {
            dispatch(
              addNotification({
                text: `Cannot move to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as it would overlap with a different item`,
                type: AlertType.warning,
              }),
            );
            dispatch(clearDashboardItem());
            console.warn(
              `Cannot move to position ${targetX},${targetY} with size ${targetWidth},${targetHeight} as it would overlap with a different item`,
            );
          }
          break;
      }
    }
    clearHighlightDropArea(dragIndicatorRef, columnCount, rowCount);
    movingItem.current = { id: 0, x: 0, y: 0, width: 0, height: 0 };
    rawIndicatorSize.current = { width: 0, height: 0, left: 0, top: 0, initialized: false };
  }

  // Dashboard Resizing
  useEffect(() => {
    if (dashboardRef.current !== null) {
      setCellSize(dashboardRef.current.offsetWidth / columnCount);
    }
  }, [columnCount, gridSize]);

  useEffect(() => {
    if (!dashboardRef.current) return;
    /**
     * Throttle the resize of the dashboard to every 100ms to not overwhelm the renderer.
     * As a general resize action triggers a resize action for every single visualization as well, this can be quite intensive.
     */
    const observer = new ResizeObserver(
      debounce(100, () => {
        requestAnimationFrame(() => {
          if (dashboardRef.current) {
            setCellSize(dashboardRef.current.offsetWidth / columnCount);
            if (dashboardHeight !== dashboardRef.current.offsetHeight || dashboardWidth !== dashboardRef.current.offsetWidth) {
              dispatch({ type: 'RESIZE' });
              setDashboardHeight(dashboardRef.current.offsetHeight);
              setDashboardWidth(dashboardRef.current.offsetWidth);
            }
          }
        });
      }),
    );
    observer.observe(dashboardRef.current);
    return () => observer.disconnect();
  }, [dashboardRef, columnCount]);

  return (
    <>
      <div className={dashboardStyles.dashboard} ref={dashboardRef}>
        <div className={dashboardStyles.dashboardContent}>
          <table className={dashboardStyles.dashboardBackground}>
            <tbody>
              {Array.from({ length: rowCount }, (_, i) => i).map((row) => {
                return (
                  <tr key={'dashboardBackgroundRow' + row}>
                    {Array.from({ length: columnCount }, (_, i) => i).map((col) => {
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
          <>
            {dashboardItems.map((dashboardItem: DashboardItemType) => {
              return (
                <DashboardItem
                  key={'dashboardItem' + dashboardItem.id}
                  cellSize={cellSize}
                  item={dashboardItem}
                  colCount={columnCount * gridMultiplier}
                  rowCount={rowCount * gridMultiplier}
                  setDragResizeItem={setDragResizeItem}
                  deleteItem={(itemId) =>
                    dispatch(deleteDashboardItem(dashboardItems.find((dashboardItem: DashboardItemType) => dashboardItem.id === itemId)))
                  }></DashboardItem>
              );
            })}
          </>
          <div className={dashboardStyles.dragIndicator} ref={dragIndicatorRef} id={'dragIndicator'}></div>
          <>
            <div
              ref={dragResizeZoneRef}
              style={{ display: 'none' }}
              className={dashboardStyles.dragResizeZone}
              onDragEnter={(event) => {
                event.stopPropagation();

                if (dashboardRef.current) {
                  const item: DashboardItemType = _.cloneDeep(placeableItem);
                  if (item) {
                    item.y =
                      _.floor(
                        ((event.clientY + dashboardRef.current.scrollTop - dashboardRef.current.getBoundingClientRect().y) / cellSize) *
                          gridMultiplier,
                      ) -
                      item.height / 2;
                    item.x =
                      _.floor(((event.clientX - dashboardRef.current.getBoundingClientRect().x) / cellSize) * gridMultiplier) -
                      item.width / 2;
                    movingItem.current = item;
                  }
                  movingItem.current = item;
                }
                lastPlaceCoordinates.current = { x: event.clientX, y: event.clientY };
                placeDragIndicator(dragIndicatorRef, movingItem, columnCount, gridMultiplier, rowCount);
              }}
              onMouseEnter={(event) => {
                event.stopPropagation();
                if (placeableItem && dashboardRef.current) {
                  movingItem.current.x =
                    _.floor(((event.clientX - dashboardRef.current.getBoundingClientRect().x) / cellSize) * gridMultiplier) -
                    placeableItem.width / 2;
                  movingItem.current.y =
                    _.floor(
                      ((event.clientY + dashboardRef.current.scrollTop - dashboardRef.current.getBoundingClientRect().y) / cellSize) *
                        gridMultiplier,
                    ) -
                    placeableItem.width / 2;
                }
                placeDragIndicator(dragIndicatorRef, movingItem, columnCount, gridMultiplier, rowCount);
              }}
              onDragOver={(event) => {
                event.stopPropagation();
                event.preventDefault();
                let movement = {
                  movementX: 0,
                  movementY: 0,
                };
                if (lastPlaceCoordinates.current) {
                  movement = {
                    movementX: event.clientX - lastPlaceCoordinates.current.x,
                    movementY: event.clientY - lastPlaceCoordinates.current.y,
                  };
                }

                lastPlaceCoordinates.current = { x: event.clientX, y: event.clientY };
                const __ret = moveDragIndicator(
                  dragIndicatorRef,
                  movingItem,
                  dragResizeMode,
                  movement,
                  targetX,
                  cellSize,
                  targetY,
                  targetWidth,
                  gridMultiplier,
                  targetHeight,
                  placeableItem,
                  dashboardState1,
                  rowCount,
                  columnCount,
                  rawIndicatorSize,
                );
                targetX = __ret.targetX;
                targetY = __ret.targetY;
                targetWidth = __ret.targetWidth;
                targetHeight = __ret.targetHeight;
              }}
              onMouseMove={(event) => {
                event.stopPropagation();
                const __ret = moveDragIndicator(
                  dragIndicatorRef,
                  movingItem,
                  dragResizeMode,
                  { movementY: event.movementY, movementX: event.movementX },
                  targetX,
                  cellSize,
                  targetY,
                  targetWidth,
                  gridMultiplier,
                  targetHeight,
                  placeableItem,
                  dashboardState1,
                  rowCount,
                  columnCount,
                  rawIndicatorSize,
                );
                targetX = __ret.targetX;
                targetY = __ret.targetY;
                targetWidth = __ret.targetWidth;
                targetHeight = __ret.targetHeight;
              }}
              onDrop={(event) => {
                if (JSON.parse(event.dataTransfer.getData('data')).dragDropElementType === DragDropElementType.Visualization) {
                  positionDashboardItem();
                }
                event.dataTransfer.clearData();
              }}
              onMouseUp={() => {
                positionDashboardItem();
                setDragResizeMode(dragResizeZoneRef, dragResizeMode, DragResizeMode.none);
              }}
              onDragLeave={() => {
                setDragResizeMode(dragResizeZoneRef, dragResizeMode, DragResizeMode.none);
                clearHighlightDropArea(dragIndicatorRef, columnCount, rowCount);
              }}
              onMouseLeave={() => {
                rawIndicatorSize.current.initialized = false;
                setDragResizeMode(dragResizeZoneRef, dragResizeMode, DragResizeMode.none);
                clearHighlightDropArea(dragIndicatorRef, columnCount, rowCount);
              }}></div>
          </>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
