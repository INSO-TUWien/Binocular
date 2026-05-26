import layoutSelectorStyles from './layoutSelector.module.scss';
import { Icon } from '../../../icon';
import { showLayoutOverview } from '../layoutOverview/layoutOverviewHelper';
import { recommendLayouts } from '../../../dashboard/recommendedDashboards/dashboardRegistry';
import { DashboardLayoutCategory } from '../../../../types/general/dashboardLayoutType';
import { clearDashboard, setDashboardState } from '../../../../redux/reducer/general/dashboardReducer';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { addCustomLayout } from '../../../../redux/reducer/general/layoutReducer';
import type { DashboardItemType } from '../../../../types/general/dashboardItemType';
import { showConfirmationDialog } from '../../../confirmationDialog/confirmationDialog';

function LayoutSelector(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();
  const defaultDataPluginItemId = useSelector((state: RootState) => state.settings.database.defaultDataPluginItemId);
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

  return (
    <div className="flex gap-2">
      <div
        className={
          layoutSelectorStyles.selector +
          ' ' +
          (props.orientation === 'horizontal' ? layoutSelectorStyles.selectorHorizontal : layoutSelectorStyles.selectorVertical)
        }>
        <div className="flex">
          {[...customLayouts.slice(0, 3), ...recommendLayouts.slice(0, 5 - Math.min(customLayouts.length, 3))]
            .slice(0, 5)
            .map((layout, i) => (
              <button
                key={`basicDashboard-${i}`}
                className={layoutSelectorStyles.dashboardCard}
                onClick={(e) => {
                  const rect = (e.target as HTMLInputElement).getBoundingClientRect();
                  const dialogWidth = 350;
                  const dialogHeight = 90;
                  const x = rect.left + rect.width / 2 - dialogWidth / 2 + window.scrollX;
                  const y = rect.top + rect.height / 2 + dialogHeight / 2 + window.scrollY;
                  showConfirmationDialog(
                    x,
                    y,
                    dialogWidth,
                    `This will remove the current dashboard layout and will replace it with this one! Are you sure?`,
                    [
                      {
                        label: 'Yes',
                        icon: null,
                        function: () => {
                          dispatch(clearDashboard());
                          // set Timeout with 0 delays the execution by one event loop cycle to ensure the dashboard is cleared before setting the new state
                          setTimeout(() => {
                            dispatch(
                              setDashboardState(
                                layout.items.map((item: DashboardItemType) => ({
                                  ...item,
                                  dataPluginId: defaultDataPluginItemId,
                                })),
                              ),
                            );
                          }, 0);
                        },
                      },
                      {
                        label: 'No',
                        icon: null,
                        function: () => {},
                      },
                    ],
                  );
                }}>
                <span>{layout.name}</span>
              </button>
            ))}
        </div>
        <button className="btn btn-square btn-primary btn-sm" onClick={(e) => showLayoutOverview(e.clientX, e.clientY)}>
          <Icon name="visualizations" size="w-6 h-6" />
        </button>
      </div>
      <button className="btn btn-primary w-fit m-auto" onClick={() => setShowModal(true)}>
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
              <button className="btn btn-square btn-primary" onClick={handleSave}>
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

export default LayoutSelector;
