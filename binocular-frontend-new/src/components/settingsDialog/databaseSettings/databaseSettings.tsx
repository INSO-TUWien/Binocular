import { dataPlugins } from '../../../plugins/pluginRegistry.ts';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';
import { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';
import { createRef } from 'react';
import { addDataPlugin, removeDataPlugin, setDataPluginAsDefault } from '../../../redux/settings/settingsReducer.ts';
import { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';

function DatabaseSettings() {
  const dispatch: AppDispatch = useAppDispatch();

  const settingsDatabaseDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const apiKeyRef = createRef<HTMLInputElement>();
  const endpointRef = createRef<HTMLInputElement>();

  return (
    <>
      <div className={'h-4/5 overflow-x-hidden overflow-y-scroll'}>
        <h2 className={'font-bold'}>Current Configured Database Connections:</h2>
        {settingsDatabaseDataPlugins.length === 0 ? (
          <div>No Database Connections configured! Add one from below.</div>
        ) : (
          <div className={'flex'}>
            {settingsDatabaseDataPlugins.map((settingsDatabaseDataPlugin: DatabaseSettingsDataPluginType) => (
              <div
                className={'card w-96 bg-base-100 shadow-xl mb-3 mr-3 border-2 border-base-300'}
                key={`settingsDatabasePlugin${settingsDatabaseDataPlugin.id}`}>
                <div className="card-body">
                  <h2 className="card-title">
                    {settingsDatabaseDataPlugin.name}
                    {settingsDatabaseDataPlugin.isDefault && <div className="badge badge-accent">Default</div>}
                  </h2>
                  {settingsDatabaseDataPlugin.parameters.apiKey ? (
                    <div>
                      <span className={'font-bold'}>API Key:</span>
                      <span> {settingsDatabaseDataPlugin.parameters.apiKey}</span>
                    </div>
                  ) : (
                    <div>
                      <span className={'font-bold text-base-300'}>API Key:</span>
                      <span className={'text-base-300'}> Not necessary</span>
                    </div>
                  )}
                  {settingsDatabaseDataPlugin.parameters.endpoint ? (
                    <div>
                      <span className={'font-bold'}>Endpoint:</span>
                      <span> {settingsDatabaseDataPlugin.parameters.endpoint}</span>
                    </div>
                  ) : (
                    <div>
                      <span className={'font-bold text-base-300'}>Endpoint:</span>
                      <span className={'text-base-300'}> Not necessary</span>
                    </div>
                  )}
                  <button
                    className={'btn btn-outline'}
                    onClick={() => {
                      if (settingsDatabaseDataPlugin.id !== undefined) {
                        dispatch(setDataPluginAsDefault(settingsDatabaseDataPlugin.id));
                      }
                    }}>
                    Set Default
                  </button>
                  <button
                    className={'btn btn-error btn-outline'}
                    onClick={() => {
                      if (settingsDatabaseDataPlugin.id !== undefined) {
                        dispatch(removeDataPlugin(settingsDatabaseDataPlugin.id));
                      }
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <h2 className={'font-bold'}>Add Database Connection:</h2>
        <div className={'flex'}>
          {dataPlugins.map((dataPlugin: DataPlugin) => (
            <div className={'card w-96 bg-base-100 shadow-xl mb-3 mr-3 border-2 border-base-300'} key={dataPlugin.name}>
              <div className="card-body">
                <h2 className="card-title">
                  {dataPlugin.name}
                  {dataPlugin.experimental && <div className="badge badge-warning">Experimental</div>}
                </h2>
                <div>{dataPlugin.description}</div>
                <h3 className="font-bold">Capabilities:</h3>
                <ul className={'list-disc ml-6'}>
                  {dataPlugin.capabilities.map((capability) => (
                    <li key={`plugin${dataPlugin.name}Capability${capability}`}>{capability}</li>
                  ))}
                </ul>
                {dataPlugin.requirements.apiKey && (
                  <label className="form-control w-full max-w-xs">
                    <div className="label">
                      <span className="font-bold">API Key:</span>
                    </div>
                    <input type="text" placeholder="API Key" className="input input-bordered w-full max-w-xs" ref={apiKeyRef} />
                  </label>
                )}
                {dataPlugin.requirements.endpoint && (
                  <label className="form-control w-full max-w-xs">
                    <div className="label">
                      <span className="font-bold">Endpoint URL:</span>
                    </div>
                    <input type="text" placeholder="Endpoint URL" className="input input-bordered w-full max-w-xs" ref={endpointRef} />
                  </label>
                )}
                <p></p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline"
                    disabled={
                      (dataPlugin.requirements.apiKey && apiKeyRef.current?.value.length === 0) ||
                      (dataPlugin.requirements.endpoint && endpointRef.current?.value.length === 0)
                    }
                    onClick={() => {
                      dispatch(
                        addDataPlugin({
                          name: dataPlugin.name,
                          parameters: { apiKey: apiKeyRef.current?.value, endpoint: endpointRef.current?.value },
                        }),
                      );
                    }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default DatabaseSettings;
