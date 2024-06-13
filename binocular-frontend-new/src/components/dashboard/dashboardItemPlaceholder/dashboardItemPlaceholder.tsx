import dashboardItemPlaceholderStyles from './dashboardItemPlaceholder.module.scss';
import { DashboardItemType } from '../dashboardItem/dashboardItem.tsx';

function DashboardItemPlaceholder(props: { item: DashboardItemType; cellSize: number; colCount: number; rowCount: number }) {
  return (
    <div
      className={dashboardItemPlaceholderStyles.dashboardItemPlaceholder}
      id={'dashboardItem' + props.item.id}
      style={{
        top: `calc(${(100.0 / props.rowCount) * props.item.y}% + 10px)`,
        left: `calc(${(100.0 / props.colCount) * props.item.x}% + 10px)`,
        width: `calc(${(100.0 / props.colCount) * props.item.width}% - 20px)`,
        height: `calc(${(100.0 / props.rowCount) * props.item.height}% - 20px)`,
      }}>
      <span>{`${props.item.pluginName} #${props.item.id}`}</span>
    </div>
  );
}

export default DashboardItemPlaceholder;
