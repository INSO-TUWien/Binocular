import recommendedLayoutsStyles from './recommendedLayouts.module.scss';
import VisualizationsIcon from '../../../../assets/visualizations_white.svg';
import { showLayoutOverview } from '../layoutOverview/layoutOverviewHelper';
import { recommendLayouts } from '../../../dashboard/recommendedDashboards/dashboardRegistry';
import { DashboardLayoutCategory } from '../../../../types/general/dashboardLayoutType';
import { clearDashboardAndSetState } from '../../../../redux/reducer/general/dashboardReducer';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { addCustomLayout } from '../../../../redux/reducer/general/layoutReducer';
import type { DashboardItemType } from '../../../../types/general/dashboardItemType';

function RecommendedLayouts(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();
  const dashboard = useSelector((state: RootState) => state.dashboard.dashboardItems);
  const customLayouts = useSelector((state: RootState) => state.layout.customLayouts);

  const [showModal, setShowModal] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  const handleSave = () => {
    if (!layoutName.trim()) return;

    const layoutObject = {
      name: layoutName,
      category: DashboardLayoutCategory.CUSTOM,
      items: dashboard,
    };

    dispatch(addCustomLayout(layoutObject));
    setShowModal(false);
    setLayoutName('');
  };

  const defaultDataPluginItemId: number = 1; // TODO

  return (
    <div className="flex gap-2">
      <div
        className={
          recommendedLayoutsStyles.selector +
          ' ' +
          (props.orientation === 'horizontal' ? recommendedLayoutsStyles.selectorHorizontal : recommendedLayoutsStyles.selectorVertical)
        }>
        <div className="flex">
          {[...customLayouts.slice(0, 3), ...recommendLayouts.slice(0, 5 - Math.min(customLayouts.length, 3))]
            .slice(0, 5)
            .map((layout, i) => (
              <button
                key={`basicDashboard-${i}`}
                className={recommendedLayoutsStyles.dashboardCard}
                onClick={() => {
                  dispatch(
                    clearDashboardAndSetState(
                      layout.items.map((item: DashboardItemType) => ({
                        ...item,
                        dataPluginId: defaultDataPluginItemId,
                      })),
                    ),
                  );
                }}>
                <span>{layout.name}</span>
              </button>
            ))}
        </div>
        <button className="btn btn-square btn-accent btn-sm" onClick={(e) => showLayoutOverview(e.clientX, e.clientY)}>
          <img src={VisualizationsIcon} />
        </button>
      </div>
      <button className="btn btn-accent w-fit m-auto" onClick={() => setShowModal(true)}>
        Save Dashboard
      </button>

      {/* Modal */}
      {showModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Save Dashboard Layout</h3>
            <p className="py-2">Enter a name for your layout:</p>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Layout name"
              className="input input-bordered w-full"
            />

            <div className="modal-action">
              <button className="btn btn-square btn-accent " onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-fit" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default RecommendedLayouts;
