import { dataPlugins } from '../../../plugins/pluginRegistry.ts';
import { setDataPluginParameterApiKey, setDataPluginParameterEndpoint, setDataPluginName } from '../../../redux/settings/settingsReducer.ts';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';

function DatabaseSettings() {
  const dispatch: AppDispatch = useAppDispatch();

  const currentDataPlugin = useSelector((state: RootState) => state.settings.dataPlugin);

  return (
    <>
      <div className={'h-4/5 overflow-x-hidden overflow-y-scroll'}>
        <h2 className={'font-bold'}>Select Database Connection:</h2>
        <div className={'flex'}>
          {dataPlugins.map((dataPlugin) => (
            <div
              className={
                'card w-96 bg-base-100 shadow-xl mb-3 mr-3 border-2 ' +
                (currentDataPlugin.name === dataPlugin.name ? 'border-accent' : 'border-base-300')
              }
              key={dataPlugin.name}>
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
                    <input
                      type="text"
                      placeholder="API Key"
                      className="input input-bordered w-full max-w-xs"
                      value={currentDataPlugin.parameters.apiKey}
                      onChange={(e) => dispatch(setDataPluginParameterApiKey(e.target.value))}
                    />
                  </label>
                )}
                {dataPlugin.requirements.endpoint && (
                  <label className="form-control w-full max-w-xs">
                    <div className="label">
                      <span className="font-bold">Endpoint URL:</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Endpoint URL"
                      className="input input-bordered w-full max-w-xs"
                      value={currentDataPlugin.parameters.endpoint}
                      onChange={(e) => dispatch(setDataPluginParameterEndpoint(e.target.value))}
                    />
                  </label>
                )}
                <p></p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-accent"
                    disabled={
                      (dataPlugin.requirements.apiKey && currentDataPlugin.parameters.apiKey.length === 0) ||
                      (dataPlugin.requirements.endpoint && currentDataPlugin.parameters.endpoint.length === 0)
                    }
                    onClick={() => dispatch(setDataPluginName(dataPlugin.name))}>
                    Select
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
