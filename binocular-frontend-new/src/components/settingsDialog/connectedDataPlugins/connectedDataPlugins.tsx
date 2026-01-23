import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';
import { removeDataPlugin, setDataPluginAsDefault } from '../../../redux/reducer/settings/settingsReducer.ts';
import DataPluginStorage from '../../../utils/dataPluginStorage.ts';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../redux';
import { useSelector } from 'react-redux';
import connectedDataPluginStyles from './connectedDataPlugins.module.scss';
import type { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';
import { removeFileList } from '../../../redux/reducer/data/filesReducer.ts';

function ConnectedDataPlugins(props: { interactable: boolean }) {
  const dispatch: AppDispatch = useAppDispatch();

  const dataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  //const data = useSelector((state: RootState) => state);

  return (
    <>
      <h2 className={'font-bold'}>Configured Database Connections:</h2>
      {dataPlugins.length === 0 ? (
        <div>No Database Connections configured! Add one from below.</div>
      ) : (
        <div className={'flex overflow-x-auto'}>
          {dataPlugins.map((settingsDatabaseDataPlugin: DatabaseSettingsDataPluginType) => (
            <div
              className={'card w-96 bg-base-100 shadow-md mb-3 mr-3 border border-base-300 min-w-96'}
              style={{ background: settingsDatabaseDataPlugin.color }}
              key={`settingsDatabasePlugin${settingsDatabaseDataPlugin.id}`}>
              <button
                className="button"
                onClick={() => {
                  DataPluginStorage.getDataPlugin(settingsDatabaseDataPlugin).then((dataPlugin: any) => {
                      dataPlugin.database.export();
                    }
                  );
                }}>
                export
              </button>
              <div className="card-body">
                <div>
                  {settingsDatabaseDataPlugin.name == 'PouchDb' && (
                    <div className="dropdown dropdown-end" style={{ float: 'inline-end' }}>
                      <div tabIndex={0} role="button" className={connectedDataPluginStyles.settingsButton} />
                      <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                        <li>
                          <a
                            onClick={() => {
                              DataPluginStorage.getDataPlugin(settingsDatabaseDataPlugin).then((dataPlugin: DataPlugin | undefined) => {
                                if (dataPlugin && dataPlugin.export) dataPlugin.export(settingsDatabaseDataPlugin.metadata);
                              });
                            }}>
                            Download
                          </a>
                        </li>
                      </ul>
                    </div>
                  )}
                  <h2 className="card-title">
                    {settingsDatabaseDataPlugin.name} #{settingsDatabaseDataPlugin.id}
                    {settingsDatabaseDataPlugin.id === 0 && <div className="badge badge-outline">pre-loaded</div>}
                    {settingsDatabaseDataPlugin.isDefault && <div className="badge badge-accent">Default</div>}
                  </h2>
                </div>
                {settingsDatabaseDataPlugin.parameters.apiKey && (
                  <div>
                    <span className={'font-bold'}>API Key:</span>
                    <span>{settingsDatabaseDataPlugin.parameters.apiKey}</span>
                  </div>
                )}
                {settingsDatabaseDataPlugin.parameters.endpoint && (
                  <div>
                    <span className={'font-bold'}>Endpoint:</span>
                    <span>{settingsDatabaseDataPlugin.parameters.endpoint}</span>
                  </div>
                )}
                {settingsDatabaseDataPlugin.parameters.fileName && (
                  <div>
                    <span className={'font-bold'}>Database:</span>
                    <span>{settingsDatabaseDataPlugin.parameters.fileName}</span>
                  </div>
                )}
                {settingsDatabaseDataPlugin.parameters.progressUpdate && (
                  <div>
                    <span className={'font-bold'}>Progress Update:</span>
                    <span className="badge badge-success ml-1">Configured</span>
                  </div>
                )}
                {settingsDatabaseDataPlugin.parameters.progressUpdate && settingsDatabaseDataPlugin.parameters.progressUpdate.endpoint && (
                  <div>
                    <span className={'font-bold'}>Use Progress Update Endpoint:</span>
                    <span>{settingsDatabaseDataPlugin.parameters.progressUpdate.endpoint}</span>
                  </div>
                )}
                {props.interactable && (
                  <button
                    className={'btn btn-outline'}
                    onClick={() => {
                      if (settingsDatabaseDataPlugin.id !== undefined) {
                        dispatch(setDataPluginAsDefault(settingsDatabaseDataPlugin.id));
                      }
                    }}>
                    Set Default
                  </button>
                )}
                {props.interactable && settingsDatabaseDataPlugin.id !== 0 && (
                  <button
                    className={'btn btn-error btn-outline'}
                    onClick={() => {
                      if (settingsDatabaseDataPlugin.id !== undefined) {
                        if (settingsDatabaseDataPlugin.parameters.fileName) {
                          DataPluginStorage.getDataPlugin(settingsDatabaseDataPlugin)
                            .then((dataPlugin) => {
                              if (dataPlugin) {
                                dataPlugin
                                  .clearRemains()
                                  .then(() => {
                                    console.log(`${settingsDatabaseDataPlugin.name} #${settingsDatabaseDataPlugin.id} cleared`);
                                    if (settingsDatabaseDataPlugin.id !== undefined) {
                                      dispatch(removeDataPlugin(settingsDatabaseDataPlugin.id));
                                      dispatch(removeFileList(settingsDatabaseDataPlugin.id));
                                    }
                                  })
                                  .catch((e) => console.log(e));
                              }
                            })
                            .catch((e) => console.log(e));
                        } else {
                          dispatch(removeDataPlugin(settingsDatabaseDataPlugin.id));
                          dispatch(removeFileList(settingsDatabaseDataPlugin.id));
                        }
                      }
                    }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ConnectedDataPlugins;
