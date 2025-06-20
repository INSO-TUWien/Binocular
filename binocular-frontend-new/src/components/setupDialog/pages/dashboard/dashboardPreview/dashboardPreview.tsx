import dashboardPreviewStyles from './dashboardPreview.module.scss';
import { DashboardItemType } from '../../../../../types/general/dashboardItemType.ts';

function DashboardPreview(props: { dashboardItems: DashboardItemType[] }) {
  return (
    <>
      <div className={dashboardPreviewStyles.dashboardPreviewContainer}>
        {props.dashboardItems.map((item, j) => (
          <div
            key={'dashboardItem' + j}
            className={dashboardPreviewStyles.dashboardPreviewItemContainer}
            style={{
              left: (100 / 40) * (item.x ? item.x : 0) + '%',
              top: (100 / 40) * (item.y ? item.y : 0) + '%',
              height: (100 / 40) * (item.height ? item.height : 0) + '%',
              width: (100 / 40) * (item.width ? item.width : 0) + '%',
            }}>
            <div className={dashboardPreviewStyles.dashboardPreviewItem}>
              <span>{item.pluginName}</span>
              <span className={'text-xs'}>
                {item.width}x{item.height}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default DashboardPreview;
