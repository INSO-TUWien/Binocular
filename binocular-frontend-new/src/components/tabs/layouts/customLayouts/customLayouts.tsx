import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import { addCustomLayout } from '../../../../redux/reducer/general/layoutReducer';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { DashboardLayoutCategory } from '../../../../types/general/dashboardLayoutType';

function CustomLayouts() {
  const dispatch: AppDispatch = useAppDispatch();
  const dashboard = useSelector((state: RootState) => state.dashboard.dashboardItems);

  const [showModal, setShowModal] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  const handleSave = () => {
    if (!layoutName.trim()) return;

    const layoutObject = {
      name: layoutName,
      category: DashboardLayoutCategory.BASIC,
      items: dashboard,
    };

    dispatch(addCustomLayout(layoutObject));
    setShowModal(false);
    setLayoutName('');
  };

  return (
    <div className={'text-xs'}>
      <div className="flex flex-col gap-2">
        <button className="btn btn-accent w-fit" onClick={() => setShowModal(true)}>
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
    </div>
  );
}

export default CustomLayouts;
