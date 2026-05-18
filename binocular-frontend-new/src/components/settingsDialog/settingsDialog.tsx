import { useState } from 'react';
import DatabaseSettings from './databaseSettings/databaseSettings.tsx';
import GeneralSettings from './generalSettings/generalSettings.tsx';
import AuthorManagementView from '../authorManagement/authorManagementView.tsx';
import LogoIcon from '../../assets/logo_icon.svg';

function SettingsDialog() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <dialog id={'settingsDialog'} className={'modal'}>
      <div className={'modal-box max-w-full flex flex-col'} style={{ height: '95vh' }}>
        <form method={'dialog'}>
          <button className="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost">✕</button>
        </form>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline flex items-center gap-2'}>
          <img src={LogoIcon} alt={'Binocular'} className={'h-6'} />
          Settings
        </h3>
        <div>
          <div role="tablist" className="tabs tabs-box">
            <a
              role={'tab'}
              className={'tab no-underline ' + (activeTab === 'General' ? 'tab-active' : '')}
              onClick={() => setActiveTab('General')}>
              General
            </a>
            <a
              role={'tab'}
              className={'tab no-underline ' + (activeTab === 'Database' ? 'tab-active' : '')}
              onClick={() => setActiveTab('Database')}>
              Database
            </a>
            <a
              role={'tab'}
              className={'tab no-underline ' + (activeTab === 'Authors' ? 'tab-active' : '')}
              onClick={() => setActiveTab('Authors')}>
              Authors
            </a>
          </div>
        </div>
        {activeTab === 'General' && <GeneralSettings></GeneralSettings>}
        {activeTab === 'Database' && <DatabaseSettings></DatabaseSettings>}
        {activeTab === 'Authors' && (
          <div className={'mt-4 flex-1 min-h-0'}>
            <AuthorManagementView></AuthorManagementView>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default SettingsDialog;
