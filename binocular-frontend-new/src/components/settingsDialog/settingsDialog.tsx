import { useState } from 'react';

import { dataPlugins } from '../../plugins/pluginRegistry.ts';
import { setDataPlugin } from '../../redux/settingsReducer.ts';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../redux';

function SettingsDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState('General');

  const currentDataPlugin = useSelector((state: RootState) => state.settings.dataPlugin);

  return (
    <dialog id={'settingsDialog'} className={'modal'}>
      <div className={'modal-box'}>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
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
        {activeTab === 'General' && <div>General Settings</div>}
        {activeTab === 'Database' && (
          <>
            <h2 className={'font-bold'}>Select Database Connection:</h2>
            <div className={'h-80 overflow-x-hidden overflow-y-scroll border-2 border-base-300'}>
              {dataPlugins.map((dataPlugin) => (
                <div
                  className={
                    'card w-96 bg-base-100 shadow-xl mb-3 ml-3 border-2 ' +
                    (currentDataPlugin === dataPlugin.name ? 'border-accent' : 'border-base-100')
                  }
                  key={dataPlugin.name}>
                  <div className="card-body">
                    <h2 className="card-title">{dataPlugin.name}</h2>
                    <p>{dataPlugin.description}</p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-accent" onClick={() => dispatch(setDataPlugin(dataPlugin.name))}>
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className={'modal-action'}>
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
