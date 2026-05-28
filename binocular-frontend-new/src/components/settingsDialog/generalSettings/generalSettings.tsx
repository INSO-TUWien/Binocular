import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../redux';
import { importSettingsStorage, setGeneralSettings } from '../../../redux/reducer/settings/settingsReducer.ts';
import { SettingsGeneralGridSize } from '../../../types/settings/generalSettingsType.ts';
import { importAuthorsStorage } from '../../../redux/reducer/data/authorsReducer.ts';
import { importDashboardStorage } from '../../../redux/reducer/general/dashboardReducer.ts';
import { importParametersStorage } from '../../../redux/reducer/parameters/parametersReducer.ts';
import { importSprintStorage } from '../../../redux/reducer/data/sprintsReducer.ts';
import { importTabsStorage } from '../../../redux/reducer/general/tabsReducer.ts';
import Config from '../../../config.ts';
import { useState } from 'react';
import { importAccountsStorage } from '../../../redux/reducer/data/accountsReducer.ts';
import ClearStorageDialog from './clearStorageDialog.tsx';

function GeneralSettings() {
  const dispatch: AppDispatch = useAppDispatch();

  const generalSettings = useSelector((state: RootState) => state.settings.general);
  const storageState = useSelector((state: RootState) => state);

  const [fileImportError, setFileImportError] = useState<string>();
  const [fileImportSuccess, setFileImportSuccess] = useState<string>();

  const [storageCleared, setStorageCleared] = useState(false);

  return (
    <>
      <div className={'card border border-base-300 shadow-md mt-1'}>
        <div className={'card-body'}>
          <label className="form-control w-full max-w-xs">
            <h2>Dashboard</h2>
            <div className="label">
              <span className="label-text">Dashboard Grid Size</span>
            </div>
            <select
              className="select select-bordered"
              value={generalSettings.gridSize}
              onChange={(e) => dispatch(setGeneralSettings({ gridSize: Number(e.target.value) }))}>
              <option value={SettingsGeneralGridSize.small}>Small</option>
              <option value={SettingsGeneralGridSize.medium}>Medium</option>
              <option value={SettingsGeneralGridSize.large}>Large</option>
            </select>
            <h2>Storage</h2>
            <div className={'flex gap-2'}>
              <button
                className={'btn btn-outline w-full'}
                onClick={() => (document.getElementById('clearStorageDialog') as HTMLDialogElement).showModal()}>
                Clear Storage
              </button>
              {storageCleared && (
                <button className={'btn btn-outline'} onClick={() => location.reload()}>
                  Reload Page
                </button>
              )}
            </div>
            <ClearStorageDialog onCleared={() => setStorageCleared(true)} />

            <button
              className={'mt-1 btn btn-outline'}
              onClick={() => {
                const exportJSON = { storageVersion: Config.localStorageVersion, storageState: storageState };
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportJSON));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute('href', dataStr);
                downloadAnchorNode.setAttribute('download', `BinocularStateV${Config.localStorageVersion}.json`);
                document.body.appendChild(downloadAnchorNode); // required for firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}>
              Export Storage
            </button>
            <h3>Import Storage:</h3>
            <input
              type={'file'}
              id={'importStorageFilePicker'}
              className={'mt-1 file-input file-input-bordered w-full max-w-xs'}
              accept={'text/json'}
            />
            <button
              className={`mt-1 btn btn-outline ${fileImportError ? 'btn-error' : fileImportSuccess ? 'btn-success' : ''}`}
              onClick={() => {
                const fileInput = document.getElementById('importStorageFilePicker') as HTMLInputElement;
                if (fileInput && fileInput.files) {
                  const file: File = fileInput.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.readAsText(file, 'UTF-8');
                    reader.onload = function (e) {
                      setFileImportError(undefined);
                      if (e.target) {
                        try {
                          const importJSON: { storageVersion: number; storageState: RootState } = JSON.parse(e.target.result as string);
                          if (importJSON.storageVersion === Config.localStorageVersion) {
                            dispatch(importAccountsStorage(importJSON.storageState.accounts));
                            dispatch(importAuthorsStorage(importJSON.storageState.authors));
                            dispatch(importDashboardStorage(importJSON.storageState.dashboard));
                            dispatch(importParametersStorage(importJSON.storageState.parameters));
                            dispatch(importSprintStorage(importJSON.storageState.sprints));
                            dispatch(importTabsStorage(importJSON.storageState.tabs));
                            dispatch(importSettingsStorage(importJSON.storageState.settings));
                            setFileImportSuccess('Storage loaded successfully! Refresh page to initialize new storage.');
                          } else {
                            setFileImportError('Storage Version not compatible!');
                          }
                        } catch (e) {
                          console.error(e);
                          setFileImportError('Error Reading File!');
                        }
                      }
                    };
                    reader.onerror = () => {
                      setFileImportError('Error Reading File!');
                    };
                  } else {
                    setFileImportError('No File Selected!');
                  }
                } else {
                  setFileImportError('Error Reading File!');
                }
              }}>
              Import
            </button>
            {fileImportError && <div className={'text-error'}>{fileImportError}</div>}
            {fileImportSuccess && <div className={'text-success'}>{fileImportSuccess}</div>}
          </label>
          <h2>Setup Wizard</h2>
          <div>
            <button
              className={'btn btn-outline'}
              onClick={() => {
                (document.getElementById('settingsDialog') as HTMLDialogElement).close();
                (document.getElementById('setupDialog') as HTMLDialogElement).showModal();
              }}>
              Open Setup Wizard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GeneralSettings;
