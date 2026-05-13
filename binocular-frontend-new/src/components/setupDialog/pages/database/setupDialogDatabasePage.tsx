import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import type { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';
import { useState } from 'react';
import { addDataPlugin, LocalDatabaseLoadingState } from '../../../../redux/reducer/settings/settingsReducer.ts';
import { dataPlugins } from '../../../../plugins/pluginRegistry.ts';
import type { DataPlugin } from '../../../../plugins/interfaces/dataPlugin.ts';
import AddDataPluginCard from '../../../settingsDialog/addDataPluginCard/addDataPluginCard.tsx';
import ConnectedDataPlugins from '../../../settingsDialog/connectedDataPlugins/connectedDataPlugins.tsx';

function SetupDialogDatabasePage() {
  const dispatch: AppDispatch = useAppDispatch();

  const settingsInitialized = useSelector((state: RootState) => state.settings.initialized);
  const databaseConnections = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [defaultBackendAvaliable, setDefaultBackendAvaliable] = useState(false);

  const localDatabaseLoadingState: LocalDatabaseLoadingState = useSelector((state: RootState) => state.settings.localDatabaseLoadingState);
  const localDatabaseLoadingMessage: string = useSelector((state: RootState) => state.settings.localDatabaseLoadingMessage);

  function searchDefaultBackend() {
    void fetch('/graphQl').then((resp) => {
      if (resp.status === 200) {
        setDefaultBackendAvaliable(true);
      }
    });
  }

  searchDefaultBackend();

  return (
    <>
      <p className="text-xl font-bold mb-2">Setup Data Connection</p>
      {settingsInitialized === true && (
        <div role="alert" className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Database connection already Initialized! It is still possible to add additional database connections.</span>
        </div>
      )}
      {localDatabaseLoadingState === LocalDatabaseLoadingState.loading && (
        <>
          <h2>Currently Loading Local Database</h2>
          <div>
            <span className="loading loading-spinner loading-lg text-accent"></span>
            <br />
            <progress
              className="progress progress-primary w-56"
              value={localDatabaseLoadingMessage.split('/')[0]}
              max={localDatabaseLoadingMessage.includes('/') ? parseInt(localDatabaseLoadingMessage.split('/')[1]) : 0}></progress>
            <br />
            <span>{localDatabaseLoadingMessage}</span>
          </div>
        </>
      )}
      <ConnectedDataPlugins interactable={false}></ConnectedDataPlugins>
      <h2>Connect to new Database:</h2>
      {databaseConnections.find((d: DatabaseSettingsDataPluginType) => d.name === 'Binocular Backend') === undefined && (
        <div className={'mb-2'}>
          {defaultBackendAvaliable ? (
            <div>
              <div role="alert" className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>It seems like you are using the default binocular backend.</span>
                <div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      dispatch(
                        addDataPlugin({
                          name: 'Binocular Backend',
                          color: '#000',
                          parameters: {
                            progressUpdate: undefined,
                          },
                        }),
                      );
                    }}>
                    Connect!
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div role="alert" className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  The default binocular backend was not found. Either it is not started or it is not started with its default port.
                  Alternatively you can connect to a different data connection from the list below.
                </span>
                <div>
                  <button className="btn btn-sm btn-primary" onClick={() => searchDefaultBackend()}>
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={'flex overflow-x-auto'}>
        {dataPlugins
          .map((dataPlugin) => new dataPlugin())
          .map((dataPlugin: DataPlugin) => (
            <AddDataPluginCard key={dataPlugin.name} dataPlugin={dataPlugin}></AddDataPluginCard>
          ))}
      </div>
    </>
  );
}

export default SetupDialogDatabasePage;
