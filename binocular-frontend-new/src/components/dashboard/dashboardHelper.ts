import type { DashboardItemDTO, DashboardItemType } from '../../types/general/dashboardItemType.ts';
import type { MutableRefObject, RefObject } from 'react';
import dashboardStyles from './dashboard.module.scss';
import { DragResizeMode } from './resizeMode.ts';

export function moveResizeDashboardItem(dashboardItem: DashboardItemType, rowCount: number, gridMultiplier: number, columnCount: number) {
  const dashboardItemElm = document.getElementById(`dashboardItem${dashboardItem.id}`);
  const dashboardItemSettingsElm = document.getElementById(`dashboardItem${dashboardItem.id}_settings`)?.children[0] as HTMLElement;
  const dashboardItemHelpElm = document.getElementById(`dashboardItem${dashboardItem.id}_help`)?.children[0] as HTMLElement;
  if (dashboardItemElm) {
    if (dashboardItem.y !== undefined) {
      dashboardItemElm.style.top = `calc(${(100.0 / (rowCount * gridMultiplier)) * dashboardItem.y}% + 10px)`;
    }
    if (dashboardItem.x !== undefined) {
      dashboardItemElm.style.left = `calc(${(100.0 / (columnCount * gridMultiplier)) * dashboardItem.x}% + 10px)`;
    }
    dashboardItemElm.style.height = `calc(${(100.0 / (rowCount * gridMultiplier)) * dashboardItem.height}% - 20px)`;
    dashboardItemElm.style.width = `calc(${(100.0 / (columnCount * gridMultiplier)) * dashboardItem.width}% - 20px)`;
  }
  if (dashboardItemSettingsElm) {
    if (dashboardItem.y !== undefined) {
      dashboardItemSettingsElm.style.top = `calc(${(100.0 / (rowCount * gridMultiplier)) * dashboardItem.y}% + 10px + 1.5rem)`;
    }
    if (dashboardItem.x !== undefined) {
      dashboardItemSettingsElm.style.left = `calc(${(100.0 / (columnCount * gridMultiplier)) * (dashboardItem.x + dashboardItem.width)}% - 10px - 20rem)`;
    }
  }
  if (dashboardItemHelpElm) {
    if (dashboardItem.y !== undefined) {
      dashboardItemHelpElm.style.top = `calc(${(100.0 / (rowCount * gridMultiplier)) * dashboardItem.y}% + 10px + 1.5rem)`;
    }
    if (dashboardItem.x !== undefined) {
      dashboardItemHelpElm.style.left = `calc(${(100.0 / (columnCount * gridMultiplier)) * (dashboardItem.x + dashboardItem.width)}% - 10px - 20rem)`;
    }
  }
}

export function clearHighlightDropArea(dragIndicatorRef: RefObject<HTMLDivElement | null>, columnCount: number, rowCount: number) {
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

export function highlightDropArea(
  movingItem: MutableRefObject<DashboardItemDTO>,
  dashboardState: number[][],
  rowCount: number,
  columnCount: number,
  gridMultiplier: number,
  posX: number,
  posY: number,
  width: number,
  height: number,
): boolean {
  let placeable = true;
  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < columnCount; x++) {
      if (y > posY - 1 && x > posX - 1 && y < posY + height && x < posX + width) {
        if (
          dashboardState[y * gridMultiplier][x * gridMultiplier] !== 0 &&
          dashboardState[y * gridMultiplier][x * gridMultiplier] !== movingItem.current.id
        ) {
          document.getElementById('highlightY' + y + 'X' + x)?.classList.add(dashboardStyles.dashboardBackgroundCellHighlightNotPossible);
          placeable = false;
        } else {
          document.getElementById('highlightY' + y + 'X' + x)?.classList.add(dashboardStyles.dashboardBackgroundCellHighlightActive);
        }
      } else {
        document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightActive);
        document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightNotPossible);
      }
    }
  }
  return placeable;
}

export function setDragResizeMode(
  dragResizeZoneRef: RefObject<HTMLDivElement | null>,
  dragResizeMode: MutableRefObject<DragResizeMode>,
  newDragResizeMode: DragResizeMode,
) {
  dragResizeMode.current = newDragResizeMode;
  if (dragResizeZoneRef.current) {
    if (dragResizeMode.current !== DragResizeMode.none) {
      dragResizeZoneRef.current.style.display = 'block';
    } else {
      dragResizeZoneRef.current.style.display = 'none';
    }
  }
}

export function placeDragIndicator(
  dragIndicatorRef: RefObject<HTMLDivElement | null>,
  movingItem: MutableRefObject<DashboardItemDTO>,
  columnCount: number,
  gridMultiplier: number,
  rowCount: number,
) {
  if (dragIndicatorRef.current !== null && movingItem.current.x !== undefined && movingItem.current.y !== undefined) {
    dragIndicatorRef.current.style.display = 'block';
    dragIndicatorRef.current.style.top = `calc(${(100.0 / rowCount / gridMultiplier) * movingItem.current.y}% + 10px)`;
    dragIndicatorRef.current.style.left = `calc(${(100.0 / columnCount / gridMultiplier) * movingItem.current.x}% + 10px)`;
    dragIndicatorRef.current.style.width = `calc(${(100.0 / columnCount / gridMultiplier) * movingItem.current.width}% - 20px)`;
    dragIndicatorRef.current.style.height = `calc(${(100.0 / rowCount / gridMultiplier) * movingItem.current.height}% - 20px)`;
  }
}

export function moveDragIndicator(
  dragIndicatorRef: RefObject<HTMLDivElement | null>,
  movingItem: MutableRefObject<DashboardItemDTO>,
  dragResizeMode: MutableRefObject<DragResizeMode>,
  movement: { movementX: number; movementY: number },
  targetX: number,
  cellSize: number,
  targetY: number,
  targetWidth: number,
  gridMultiplier: number,
  targetHeight: number,
  placeableItem: DashboardItemType,
  dashboardState: number[][],
  rowCount: number,
  columnCount: number,
  rawSize: MutableRefObject<{ width: number; height: number; left: number; top: number; initialized: boolean }>,
) {
  if (dragIndicatorRef.current !== null && movingItem.current.x !== undefined && movingItem.current.y !== undefined) {
    // Seed raw size from the DOM on the first move of each drag session. Subsequent frames use
    // the tracked value to avoid browser clamping (offsetWidth can't go below 0) causing drift.
    if (!rawSize.current.initialized) {
      rawSize.current.width = dragIndicatorRef.current.offsetWidth;
      rawSize.current.height = dragIndicatorRef.current.offsetHeight;
      rawSize.current.left = dragIndicatorRef.current.offsetLeft;
      rawSize.current.top = dragIndicatorRef.current.offsetTop;
      rawSize.current.initialized = true;
    }

    const curLeft = rawSize.current.left;
    const curTop = rawSize.current.top;
    const curWidth = rawSize.current.width;
    const curHeight = rawSize.current.height;

    // The drag indicator is placed with `calc(X% + 10px)` for left/top and `calc(W% - 20px)` for
    // width/height to account for panel margins.  Compensate when converting back to grid units so
    // that the snap threshold is exactly half a cell rather than 70 %.
    const MARGIN_LT = 10; // left / top offset added by placeDragIndicator
    const MARGIN_WH = 20; // width / height reduction added by placeDragIndicator

    // Fixed edges (grid units) for resize modes where one edge must stay constant.
    const rightEdge = (movingItem.current.x + movingItem.current.width) / gridMultiplier;
    const bottomEdge = (movingItem.current.y + movingItem.current.height) / gridMultiplier;

    switch (dragResizeMode.current) {
      case DragResizeMode.drag: {
        const newLeft = curLeft + movement.movementX;
        const newTop = curTop + movement.movementY;
        rawSize.current.left = newLeft;
        rawSize.current.top = newTop;
        targetWidth = movingItem.current.width / gridMultiplier;
        targetHeight = movingItem.current.height / gridMultiplier;
        const maxLeft = (columnCount - targetWidth) * cellSize + MARGIN_LT;
        const maxTop = (rowCount - targetHeight) * cellSize + MARGIN_LT;
        dragIndicatorRef.current.style.left = Math.max(MARGIN_LT, Math.min(maxLeft, newLeft)) + 'px';
        dragIndicatorRef.current.style.top = Math.max(MARGIN_LT, Math.min(maxTop, newTop)) + 'px';
        targetX = Math.max(0, Math.min(columnCount - targetWidth, Math.round((newLeft - MARGIN_LT) / cellSize)));
        targetY = Math.max(0, Math.min(rowCount - targetHeight, Math.round((newTop - MARGIN_LT) / cellSize)));
        break;
      }
      case DragResizeMode.resizeTopLeft: {
        const newLeft = curLeft + movement.movementX;
        const newTop = curTop + movement.movementY;
        const newWidth = curWidth - movement.movementX;
        const newHeight = curHeight - movement.movementY;
        rawSize.current.width = newWidth;
        rawSize.current.height = newHeight;
        rawSize.current.left = newLeft;
        rawSize.current.top = newTop;
        const clampedLeft = Math.max(MARGIN_LT, Math.min((rightEdge - 1) * cellSize + MARGIN_LT, newLeft));
        const clampedTop = Math.max(MARGIN_LT, Math.min((bottomEdge - 1) * cellSize + MARGIN_LT, newTop));
        dragIndicatorRef.current.style.left = clampedLeft + 'px';
        dragIndicatorRef.current.style.top = clampedTop + 'px';
        dragIndicatorRef.current.style.width = Math.max(1, newLeft + newWidth - clampedLeft) + 'px';
        dragIndicatorRef.current.style.height = Math.max(1, newTop + newHeight - clampedTop) + 'px';
        targetX = Math.round((newLeft - MARGIN_LT) / cellSize);
        targetY = Math.round((newTop - MARGIN_LT) / cellSize);
        targetX = Math.max(0, Math.min(rightEdge - 1, targetX));
        targetY = Math.max(0, Math.min(bottomEdge - 1, targetY));
        targetWidth = rightEdge - targetX;
        targetHeight = bottomEdge - targetY;
        break;
      }
      case DragResizeMode.resizeTop: {
        const newTop = curTop + movement.movementY;
        const newHeight = curHeight - movement.movementY;
        rawSize.current.height = newHeight;
        rawSize.current.top = newTop;
        const clampedTop = Math.max(MARGIN_LT, Math.min((bottomEdge - 1) * cellSize + MARGIN_LT, newTop));
        dragIndicatorRef.current.style.top = clampedTop + 'px';
        dragIndicatorRef.current.style.height = Math.max(1, newTop + newHeight - clampedTop) + 'px';
        targetX = movingItem.current.x / gridMultiplier;
        targetY = Math.round((newTop - MARGIN_LT) / cellSize);
        targetWidth = movingItem.current.width / gridMultiplier;
        targetHeight = bottomEdge - targetY;
        targetY = Math.max(0, Math.min(bottomEdge - 1, targetY));
        targetHeight = bottomEdge - targetY;
        break;
      }
      case DragResizeMode.resizeTopRight: {
        const newTop = curTop + movement.movementY;
        const newWidth = curWidth + movement.movementX;
        const newHeight = curHeight - movement.movementY;
        rawSize.current.width = newWidth;
        rawSize.current.height = newHeight;
        rawSize.current.top = newTop;
        const clampedTop = Math.max(MARGIN_LT, Math.min((bottomEdge - 1) * cellSize + MARGIN_LT, newTop));
        dragIndicatorRef.current.style.top = clampedTop + 'px';
        dragIndicatorRef.current.style.width = Math.max(1, newWidth) + 'px';
        dragIndicatorRef.current.style.height = Math.max(1, newTop + newHeight - clampedTop) + 'px';
        targetX = movingItem.current.x / gridMultiplier;
        targetY = Math.round((newTop - MARGIN_LT) / cellSize);
        targetWidth = Math.min(columnCount - targetX, Math.round((newWidth + MARGIN_WH) / cellSize));
        targetHeight = bottomEdge - targetY;
        targetY = Math.max(0, Math.min(bottomEdge - 1, targetY));
        targetHeight = bottomEdge - targetY;
        break;
      }
      case DragResizeMode.resizeRight: {
        const newWidth = curWidth + movement.movementX;
        rawSize.current.width = newWidth;
        dragIndicatorRef.current.style.width = Math.max(1, newWidth) + 'px';
        targetX = movingItem.current.x / gridMultiplier;
        targetY = movingItem.current.y / gridMultiplier;
        targetWidth = Math.min(columnCount - targetX, Math.round((newWidth + MARGIN_WH) / cellSize));
        targetHeight = movingItem.current.height / gridMultiplier;
        break;
      }
      case DragResizeMode.resizeBottomRight: {
        const newWidth = curWidth + movement.movementX;
        const newHeight = curHeight + movement.movementY;
        rawSize.current.width = newWidth;
        rawSize.current.height = newHeight;
        dragIndicatorRef.current.style.width = Math.max(1, newWidth) + 'px';
        dragIndicatorRef.current.style.height = Math.max(1, newHeight) + 'px';
        targetX = movingItem.current.x / gridMultiplier;
        targetY = movingItem.current.y / gridMultiplier;
        targetWidth = Math.min(columnCount - targetX, Math.round((newWidth + MARGIN_WH) / cellSize));
        targetHeight = Math.min(rowCount - targetY, Math.round((newHeight + MARGIN_WH) / cellSize));
        break;
      }
      case DragResizeMode.resizeBottom: {
        const newHeight = curHeight + movement.movementY;
        rawSize.current.height = newHeight;
        dragIndicatorRef.current.style.height = Math.max(1, newHeight) + 'px';
        targetX = movingItem.current.x / gridMultiplier;
        targetY = movingItem.current.y / gridMultiplier;
        targetWidth = movingItem.current.width / gridMultiplier;
        targetHeight = Math.min(rowCount - targetY, Math.round((newHeight + MARGIN_WH) / cellSize));
        break;
      }
      case DragResizeMode.resizeBottomLeft: {
        const newLeft = curLeft + movement.movementX;
        const newWidth = curWidth - movement.movementX;
        const newHeight = curHeight + movement.movementY;
        rawSize.current.width = newWidth;
        rawSize.current.height = newHeight;
        rawSize.current.left = newLeft;
        const clampedLeft = Math.max(MARGIN_LT, Math.min((rightEdge - 1) * cellSize + MARGIN_LT, newLeft));
        dragIndicatorRef.current.style.left = clampedLeft + 'px';
        dragIndicatorRef.current.style.width = Math.max(1, newLeft + newWidth - clampedLeft) + 'px';
        dragIndicatorRef.current.style.height = Math.max(1, newHeight) + 'px';
        targetX = Math.round((newLeft - MARGIN_LT) / cellSize);
        targetY = movingItem.current.y / gridMultiplier;
        targetWidth = rightEdge - targetX;
        targetHeight = Math.min(rowCount - targetY, Math.round((newHeight + MARGIN_WH) / cellSize));
        targetX = Math.max(0, Math.min(rightEdge - 1, targetX));
        targetWidth = rightEdge - targetX;
        break;
      }
      case DragResizeMode.resizeLeft: {
        const newLeft = curLeft + movement.movementX;
        const newWidth = curWidth - movement.movementX;
        rawSize.current.width = newWidth;
        rawSize.current.left = newLeft;
        const clampedLeft = Math.max(MARGIN_LT, Math.min((rightEdge - 1) * cellSize + MARGIN_LT, newLeft));
        dragIndicatorRef.current.style.left = clampedLeft + 'px';
        dragIndicatorRef.current.style.width = Math.max(1, newLeft + newWidth - clampedLeft) + 'px';
        targetX = Math.round((newLeft - MARGIN_LT) / cellSize);
        targetY = movingItem.current.y / gridMultiplier;
        targetWidth = rightEdge - targetX;
        targetHeight = movingItem.current.height / gridMultiplier;
        targetX = Math.max(0, Math.min(rightEdge - 1, targetX));
        targetWidth = rightEdge - targetX;
        break;
      }
      case DragResizeMode.place: {
        const newLeft = curLeft + movement.movementX;
        const newTop = curTop + movement.movementY;
        rawSize.current.left = newLeft;
        rawSize.current.top = newTop;
        targetWidth = placeableItem.width / gridMultiplier;
        targetHeight = placeableItem.height / gridMultiplier;
        const maxLeft = (columnCount - targetWidth) * cellSize + MARGIN_LT;
        const maxTop = (rowCount - targetHeight) * cellSize + MARGIN_LT;
        dragIndicatorRef.current.style.left = Math.max(MARGIN_LT, Math.min(maxLeft, newLeft)) + 'px';
        dragIndicatorRef.current.style.top = Math.max(MARGIN_LT, Math.min(maxTop, newTop)) + 'px';
        targetX = Math.max(0, Math.min(columnCount - targetWidth, Math.round((newLeft - MARGIN_LT) / cellSize)));
        targetY = Math.max(0, Math.min(rowCount - targetHeight, Math.round((newTop - MARGIN_LT) / cellSize)));
        break;
      }
      default:
        break;
    }

    targetWidth = Math.max(1, targetWidth);
    targetHeight = Math.max(1, targetHeight);
    highlightDropArea(movingItem, dashboardState, rowCount, columnCount, gridMultiplier, targetX, targetY, targetWidth, targetHeight);
  }
  return { targetX, targetY, targetWidth, targetHeight };
}
