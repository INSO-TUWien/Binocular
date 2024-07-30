import { useState } from 'react';
import { RootState } from '../../../../redux';
import { useSelector } from 'react-redux';
import AddSprintDialogSingleTab from './addSprintDialogSingleTab/addSprintDialogSingleTab.tsx';
import AddSprintDialogMultipleTabs from './addSprintDialogMultipleTabs/addSprintDialogMultipleTabs.tsx';

function AddSprintDialog() {
  const sprintToEdit = useSelector((state: RootState) => state.sprints.sprintToEdit);

  const [activeTab, setActiveTab] = useState('single');

  return (
    <dialog id={'addSprintDialog'} className={'modal'}>
      <div className={'modal-box'}>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline'}>
          {sprintToEdit ? 'Edit Sprint' : 'Add Sprint'}
        </h3>
        {sprintToEdit ? (
          <AddSprintDialogSingleTab></AddSprintDialogSingleTab>
        ) : (
          <>
            <div role="tablist" className="tabs tabs-bordered">
              <a role={'tab'} className={'tab ' + (activeTab === 'single' ? 'tab-active' : '')} onClick={() => setActiveTab('single')}>
                Single Tab
              </a>
              <a role={'tab'} className={'tab ' + (activeTab === 'multiple' ? 'tab-active' : '')} onClick={() => setActiveTab('multiple')}>
                Multiple Tabs
              </a>
            </div>
            {activeTab === 'single' && <AddSprintDialogSingleTab></AddSprintDialogSingleTab>}
            {activeTab === 'multiple' && <AddSprintDialogMultipleTabs></AddSprintDialogMultipleTabs>}
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default AddSprintDialog;
