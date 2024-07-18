import { useState } from 'react';
import DatabaseSettings from './databaseSettings/databaseSettings.tsx';
import GeneralSettings from './generalSettings/generalSettings.tsx';

function SettingsDialog() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <dialog id={'settingsDialog'} className={'modal'}>
      <div className={'modal-box max-w-full h-full relative'}>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline'}>
          Settings
        </h3>
        <div>
          <div role="tablist" className="tabs tabs-bordered">
            <a role={'tab'} className={'tab ' + (activeTab === 'General' ? 'tab-active' : '')} onClick={() => setActiveTab('General')}>
              General
            </a>
            <a role={'tab'} className={'tab ' + (activeTab === 'Database' ? 'tab-active' : '')} onClick={() => setActiveTab('Database')}>
              Database
            </a>
          </div>
        </div>
        {activeTab === 'General' && <GeneralSettings></GeneralSettings>}
        {activeTab === 'Database' && <DatabaseSettings></DatabaseSettings>}
        <div className={'modal-action absolute bottom-4 right-4'}>
          <form method={'dialog'}>
            {/* if there is a button in form, it will close the modal */}
            <button className={'btn btn-sm btn-accent'}>Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default SettingsDialog;
