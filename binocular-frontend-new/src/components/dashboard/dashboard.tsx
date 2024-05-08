import dashboardStyles from './dashboard.module.scss';
import { createRef, useEffect, useState } from 'react';
import DashboardItem from './dashboardItem/dashboardItem.tsx';
function StatusBar() {
  const [columnCount] = useState(20);
  const [rowCount] = useState(20);

  const dashboardRef = createRef<HTMLDivElement>();
  const [cellSize, setCellSize] = useState(0);

  useEffect(() => {
    if (dashboardRef.current !== null) {
      setCellSize(dashboardRef.current.clientWidth / columnCount);
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
          <DashboardItem
            name={'Unnamed'}
            cellSize={cellSize}
            x={0}
            y={0}
            width={5}
            height={4}
            colCount={columnCount}
            rowCount={rowCount}
            highlightDropArea={(posX, posY, width, height) => {
              highlightDropArea(posX, posY, width, height, columnCount, rowCount);
            }}
            clearHighlightDropArea={() => {
              clearHighlightDropArea(columnCount, rowCount);
            }}></DashboardItem>
        </div>
      </div>
    </>
  );
}

function highlightDropArea(posX: number, posY: number, width: number, height: number, columnCount: number, rowCount: number) {
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

function clearHighlightDropArea(columnCount: number, rowCount: number) {
  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < columnCount; x++) {
      document.getElementById('highlightY' + y + 'X' + x)?.classList.remove(dashboardStyles.dashboardBackgroundCellHighlightActive);
    }
  }
}

export default StatusBar;
