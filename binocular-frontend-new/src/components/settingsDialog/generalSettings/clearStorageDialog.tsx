import { useState } from 'react';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../redux';
import { clearSettingsStorage, removeDataPlugin } from '../../../redux/reducer/settings/settingsReducer.ts';
import { clearAuthorsStorage } from '../../../redux/reducer/data/authorsReducer.ts';
import { clearDashboardStorage } from '../../../redux/reducer/general/dashboardReducer.ts';
import { clearParametersStorage } from '../../../redux/reducer/parameters/parametersReducer.ts';
import { clearSprintStorage } from '../../../redux/reducer/data/sprintsReducer.ts';
import { clearTabsStorage } from '../../../redux/reducer/general/tabsReducer.ts';
import { clearFileStorage } from '../../../redux/reducer/data/filesReducer.ts';
import { clearAccountsStorage } from '../../../redux/reducer/data/accountsReducer.ts';
import { clearLayoutStorage } from '../../../redux/reducer/general/layoutReducer.ts';
import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType';
import DataPluginStorage from '../../../utils/dataPluginStorage';

function ClearStorageDialog(props: { onCleared: () => void }) {
  const dispatch: AppDispatch = useAppDispatch();
  const dataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [clearIndexedDB, setClearIndexedDB] = useState(true);
  const [clearLayouts, setClearLayouts] = useState(true);
  const [clearParameters, setClearParameters] = useState(true);
  const [clearTabs, setClearTabs] = useState(true);
  const [clearDashboardAndPlugins, setClearDashboardAndPlugins] = useState(true);
  const [reloadPage, setReloadPage] = useState(true);

  function handleClear() {
    (document.getElementById('clearStorageDialog') as HTMLDialogElement).close();

    const effectiveClearDashboard = clearDashboardAndPlugins || clearIndexedDB;

    if (clearIndexedDB && dataPlugins.length > 0) {
      Promise.all(
        dataPlugins
          .filter((p: DatabaseSettingsDataPluginType) => p.id !== undefined)
          .map((plugin: DatabaseSettingsDataPluginType) => {
            if (plugin.parameters.fileName) {
              return DataPluginStorage.getDataPlugin(plugin)
                .then((dataPlugin) => {
                  if (dataPlugin) return dataPlugin.clearRemains();
                })
                .finally(() => {
                  if (effectiveClearDashboard) dispatch(removeDataPlugin(plugin.id!));
                });
            } else {
              if (effectiveClearDashboard) dispatch(removeDataPlugin(plugin.id!));
              return Promise.resolve();
            }
          }),
      ).catch(console.log);
    } else if (effectiveClearDashboard && dataPlugins.length > 0) {
      dataPlugins
        .filter((p: DatabaseSettingsDataPluginType) => p.id !== undefined)
        .forEach((plugin: DatabaseSettingsDataPluginType) => dispatch(removeDataPlugin(plugin.id!)));
    }

    if (effectiveClearDashboard) {
      dispatch(clearAccountsStorage());
      dispatch(clearAuthorsStorage());
      dispatch(clearDashboardStorage());
      dispatch(clearSprintStorage());
      dispatch(clearSettingsStorage());
      dispatch(clearFileStorage());
    }
    if (clearParameters) dispatch(clearParametersStorage());
    if (clearTabs) dispatch(clearTabsStorage());
    if (clearLayouts) dispatch(clearLayoutStorage());

    props.onCleared();
    if (reloadPage) window.location.reload();
  }

  const nothingSelected = !clearIndexedDB && !clearLayouts && !clearParameters && !clearTabs && !clearDashboardAndPlugins;

  return (
    <dialog id="clearStorageDialog" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-1">Clear Storage</h3>
        <p className="text-base-content/60 text-sm mb-4">
          Select what you want to delete. <span className="text-warning font-medium">This cannot be undone!</span>
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              label: 'Dashboard & Data Plugins',
              description: clearIndexedDB
                ? 'Required when clearing IndexedDB Data'
                : 'Plugin configs, authors, accounts, dashboard widgets, sprints, files',
              value: clearIndexedDB ? true : clearDashboardAndPlugins,
              set: setClearDashboardAndPlugins,
              disabled: clearIndexedDB,
            },
            {
              label: 'IndexedDB Data',
              description: 'Loaded database files (PouchDB) — requires Dashboard & Data Plugins',
              value: clearIndexedDB,
              set: setClearIndexedDB,
            },
            { label: 'Layouts', description: 'Custom dashboard layouts', value: clearLayouts, set: setClearLayouts },
            { label: 'Parameters', description: 'Date range and filter settings', value: clearParameters, set: setClearParameters },
            { label: 'Tabs', description: 'Tab configuration', value: clearTabs, set: setClearTabs },
            { label: 'Reload Page', description: 'Reload the application after clearing', value: reloadPage, set: setReloadPage },
          ].map(({ label, description, value, set, disabled }) => (
            <label
              key={label}
              className={`label flex justify-between items-start gap-4 py-0 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <div>
                <div className="text-base-content font-medium">{label}</div>
                <div className="text-xs text-base-content/50">{description}</div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm mt-1"
                checked={value}
                disabled={disabled}
                onChange={(e) => set(e.target.checked)}
              />
            </label>
          ))}
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost">Cancel</button>
          </form>
          <button className="btn btn-error" onClick={handleClear} disabled={nothingSelected}>
            Clear Selected
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default ClearStorageDialog;
