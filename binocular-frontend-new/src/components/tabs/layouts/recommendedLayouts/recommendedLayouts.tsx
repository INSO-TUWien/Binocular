import recommendedLayoutsStyles from './recommendedLayouts.module.scss';
import VisualizationsIcon from '../../../../assets/visualizations_white.svg';
import { showLayoutOverview } from '../layoutOverview/layoutOverviewHelper';
import { recommendedDashboards } from '../../../dashboard/recommendedDashboards/dashboardRegistry';
import { DashboardLayoutCategory } from '../../../../types/general/dashboardLayoutType';
import { setDashboardState } from '../../../../redux/reducer/general/dashboardReducer';
import { type AppDispatch, useAppDispatch } from '../../../../redux';

function RecommendedLayouts(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const defaultDataPluginItemId: number = 1; // TODO

  return (
    <div
      className={
        recommendedLayoutsStyles.selector +
        ' ' +
        (props.orientation === 'horizontal' ? recommendedLayoutsStyles.selectorHorizontal : recommendedLayoutsStyles.selectorVertical)
      }>
      <div className="flex">
        {recommendedDashboards
          .filter((layout) => layout.category === DashboardLayoutCategory.BASIC)
          .slice(0, 3)
          .map((layout, i) => (
            <div key={`basicDashboard-${i}`} className={recommendedLayoutsStyles.dashboardCard}>
              <span>{layout.name}</span>

              <button
                className="btn btn-accent btn-xs"
                onClick={() => {
                  dispatch(
                    setDashboardState(
                      layout.items.map((item) => ({
                        ...item,
                        dataPluginId: defaultDataPluginItemId,
                      })),
                    ),
                  );
                }}>
                Apply
              </button>
            </div>
          ))}
      </div>
      <button className="btn btn-square btn-accent btn-sm" onClick={(e) => showLayoutOverview(e.clientX, e.clientY)}>
        <img src={VisualizationsIcon} />
      </button>
    </div>
  );
}

export default RecommendedLayouts;
