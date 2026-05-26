import { useEffect, useState } from 'react';
import DatabaseSettings from './databaseSettings/databaseSettings.tsx';
import GeneralSettings from './generalSettings/generalSettings.tsx';
import AuthorManagementView from '../authorManagement/authorManagementView.tsx';
import { Icon } from '../icon';

function SettingsDialog() {
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => {
    const handler = (e: CustomEvent<{ tab: string }>) => {
      setActiveTab(e.detail.tab);
      (document.getElementById('settingsDialog') as HTMLDialogElement)?.showModal();
    };
    window.addEventListener('openSettingsTab', handler as EventListener);
    return () => window.removeEventListener('openSettingsTab', handler as EventListener);
  }, []);

  return (
    <dialog id={'settingsDialog'} className={'modal'}>
      <div className={'modal-box max-w-full flex flex-col'} style={{ height: '95vh' }}>
        <form method={'dialog'}>
          <button className="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost">✕</button>
        </form>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline flex items-center gap-2'}>
          <Icon name="logo" className={'h-6 w-auto'} />
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
